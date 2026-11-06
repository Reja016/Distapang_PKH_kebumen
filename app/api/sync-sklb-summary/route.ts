import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS capaian_sklb (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tahun INT DEFAULT 2026,
      no_urut INT,
      grup VARCHAR(100),
      tanggal VARCHAR(50),
      desa VARCHAR(100),
      kecamatan VARCHAR(100),
      target INT DEFAULT 0,
      capaian INT DEFAULT 0,
      selisih INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  try {
    await pool.query(`ALTER TABLE capaian_sklb ADD COLUMN tahun INT DEFAULT 2026`);
  } catch {}
}

// GET: Ambil semua data capaian SKLB (bisa filter tahun)
export async function GET(request: Request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(request.url);
    const tahun = Number(searchParams.get('tahun')) || 2026;

    const [rows]: any = await pool.query(
      'SELECT * FROM capaian_sklb WHERE tahun = ? OR tahun IS NULL ORDER BY no_urut ASC, id ASC',
      [tahun]
    );
    return NextResponse.json({ success: true, tahun, data: rows });
  } catch (error: any) {
    console.error('Error GET sync-sklb-summary:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Tambah data atau Sync
export async function POST(request: Request) {
  try {
    await ensureTable();
    const text = await request.text();
    let body: any = {};
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {}
    }

    const { searchParams } = new URL(request.url);
    const queryTahun = Number(searchParams.get('tahun')) || Number(body.tahun) || 2026;

    const session = await getSessionFromRequest(request as any);
    const userName = session ? (session.nama || session.nip_username || 'Sistem') : 'Sistem';

    // ── 0. BATCH INSERT / IMPORT GELONDONGAN EXCEL ──
    const items = Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : null;
    if (items && items.length > 0) {
      let successCount = 0;
      let skippedCount = 0;

      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const desa = String(item.desa || item['Desa'] || '').trim();
        const kec = String(item.kecamatan || item['Kecamatan'] || '').trim();

        if (!desa && !kec) {
          skippedCount++;
          continue;
        }

        const noUrut = Number(item.no_urut || item['No Urut'] || item['No'] || idx + 1) || (idx + 1);
        const grup = String(item.grup || item['Grup / Tim'] || item['Grup'] || 'Tabel Kiri').trim();
        const tanggal = String(item.tanggal || item['Tanggal Pelaksanaan'] || item['Tanggal'] || '-').trim();
        const target = Number(item.target || item['Target (Ekor)'] || item['Target']) || 0;
        const capaian = Number(item.capaian || item['Capaian (Ekor)'] || item['Capaian']) || 0;
        const selisih = capaian - target;
        const tahun = Number(item.tahun || item['Tahun'] || queryTahun) || queryTahun;

        await pool.query(
          `INSERT INTO capaian_sklb (tahun, no_urut, grup, tanggal, desa, kecamatan, target, capaian, selisih)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [tahun, noUrut, grup, tanggal, desa, kec, target, capaian, selisih]
        );
        successCount++;
      }

      await logActivity({
        module: 'bitpro',
        submenu: 'sklb',
        tableName: 'capaian_sklb',
        recordId: 0,
        action: 'IMPORT_EXCEL',
        userName,
        details: { totalItems: items.length, successCount, skippedCount },
      });

      return NextResponse.json({
        success: true,
        count: successCount,
        skipped: skippedCount,
        message: `Berhasil mengimpor ${successCount} data rekapitulasi capaian SKLB!`,
      });
    }

    // Jika dipanggil tanpa body atau action=sync, return data
    if (!body || Object.keys(body).length === 0 || body.action === 'sync') {
      const [rows]: any = await pool.query(
        'SELECT * FROM capaian_sklb WHERE tahun = ? OR tahun IS NULL ORDER BY no_urut ASC, id ASC',
        [queryTahun]
      );
      return NextResponse.json({ success: true, data: rows, message: 'Data rekapitulasi berhasil disinkronkan!' });
    }

    // Tambah data baru
    const { no_urut, grup, tanggal, desa, kecamatan, target = 0, capaian = 0, selisih = 0, tahun = queryTahun } = body;

    if (!desa || !kecamatan) {
      return NextResponse.json({ success: false, error: 'Desa dan Kecamatan wajib diisi!' }, { status: 400 });
    }

    const calculatedSelisih = Number(capaian) - Number(target);

    const [insertResult]: any = await pool.query(
      `INSERT INTO capaian_sklb (tahun, no_urut, grup, tanggal, desa, kecamatan, target, capaian, selisih)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [Number(tahun) || queryTahun, no_urut || 1, grup || 'Tabel Kiri', tanggal || '-', desa, kecamatan, Number(target), Number(capaian), calculatedSelisih]
    );

    return NextResponse.json({
      success: true,
      message: 'Data capaian SKLB berhasil ditambahkan!',
      id: insertResult.insertId,
    });
  } catch (error: any) {
    console.error('Error POST sync-sklb-summary:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Edit baris capaian SKLB
export async function PUT(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const { id, no_urut, grup, tanggal, desa, kecamatan, target = 0, capaian = 0, tahun } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak ditemukan!' }, { status: 400 });
    }

    const calculatedSelisih = Number(capaian) - Number(target);

    await pool.query(
      `UPDATE capaian_sklb 
       SET no_urut = ?, grup = ?, tanggal = ?, desa = ?, kecamatan = ?, target = ?, capaian = ?, selisih = ? ${tahun ? ', tahun = ?' : ''}
       WHERE id = ?`,
      tahun
        ? [no_urut, grup, tanggal, desa, kecamatan, Number(target), Number(capaian), calculatedSelisih, Number(tahun), id]
        : [no_urut, grup, tanggal, desa, kecamatan, Number(target), Number(capaian), calculatedSelisih, id]
    );

    return NextResponse.json({ success: true, message: 'Data capaian SKLB berhasil diperbarui!' });
  } catch (error: any) {
    console.error('Error PUT sync-sklb-summary:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus baris capaian SKLB
export async function DELETE(request: Request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak ditemukan!' }, { status: 400 });
    }

    await pool.query('DELETE FROM capaian_sklb WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Data capaian berhasil dihapus!' });
  } catch (error: any) {
    console.error('Error DELETE sync-sklb-summary:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}