import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

// GET: Ambil semua data kendaraan dari database
export async function GET() {
  try {
    const [rows]: any = await pool.execute(
      'SELECT * FROM aset_kendaraan ORDER BY id_aset ASC'
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Tambah kendaraan baru
export async function POST(request: Request) {
  try {
    const session = await getSessionFromRequest(request as any);
    const userName = session ? (session.nama || session.nip_username) : 'Sistem';

    const body = await request.json();

    // ── 0. BATCH INSERT / IMPORT GELONDONGAN EXCEL ──
    const items = Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : null;
    if (items && items.length > 0) {
      let successCount = 0;
      let skippedCount = 0;

      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const namaPemegang = String(item.nama_pemegang || item.namaPemegang || item['Nama Pemegang / Penanggung Jawab'] || item['Nama Pemegang'] || '').trim();
        const merkType = String(item.merk_type || item.merkType || item['Merk / Type Kendaraan'] || item['Merk / Type'] || item['Merk'] || '').trim();
        const nopolBaru = String(item.nopol_baru || item.nopolBaru || item['Nomor Polisi Baru (Plat Aktif)'] || item['Nomor Polisi (Baru)'] || item['Nopol Baru'] || '').trim();

        if (!namaPemegang || !nopolBaru) {
          skippedCount++;
          continue;
        }

        const tahun = item.tahun || item['Tahun Pembuatan / Perolehan'] || item['Tahun'] || null;
        const nopolLama = String(item.nopol_lama || item.nopolLama || item['Nomor Polisi Lama'] || item['Nomor Polisi (Lama)'] || item['Nopol Lama'] || '').trim() || null;
        const nomorMesin = String(item.nomor_mesin || item.nomorMesin || item['Nomor Mesin'] || '').trim();
        const nomorRangka = String(item.nomor_rangka || item.nomorRangka || item['Nomor Rangka'] || '').trim();

        await pool.execute(
          `INSERT INTO aset_kendaraan (nama_pemegang, merk_type, tahun, nopol_lama, nopol_baru, nomor_mesin, nomor_rangka)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [namaPemegang, merkType || '-', tahun, nopolLama, nopolBaru, nomorMesin, nomorRangka]
        );
        successCount++;
      }

      await logActivity({
        module: 'aset',
        submenu: 'inventaris-kendaraan',
        tableName: 'aset_kendaraan',
        recordId: 0,
        action: 'IMPORT_EXCEL',
        userName,
        details: { totalItems: items.length, successCount, skippedCount },
      });

      return NextResponse.json({
        success: true,
        count: successCount,
        skipped: skippedCount,
        message: `Berhasil mengimpor ${successCount} data kendaraan dinas operasional!`,
      });
    }

    const { nama_pemegang, merk_type, tahun, nopol_lama, nopol_baru, nomor_mesin, nomor_rangka, keterangan } = body;

    if (!nama_pemegang || !merk_type || !nopol_baru) {
      return NextResponse.json({ success: false, error: 'Data wajib belum lengkap!' }, { status: 400 });
    }

    // Anti-duplikasi: Cek apakah kendaraan dengan plat nomor yang sama baru saja ditambahkan dalam 1 menit terakhir
    const [existing]: any = await pool.execute(
      `SELECT id_aset FROM aset_kendaraan 
       WHERE nopol_baru = ? AND created_at >= NOW() - INTERVAL 1 MINUTE
       ORDER BY id_aset DESC LIMIT 1`,
      [nopol_baru]
    );

    if (existing.length > 0) {
      return NextResponse.json({ 
        success: true, 
        insertId: existing[0].id_aset, 
        message: 'Data kendaraan sudah tersimpan sebelumnya (anti-duplikasi aktif).' 
      });
    }

    const [result]: any = await pool.execute(
      `INSERT INTO aset_kendaraan (nama_pemegang, merk_type, tahun, nopol_lama, nopol_baru, nomor_mesin, nomor_rangka)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nama_pemegang, merk_type, tahun || null, nopol_lama || null, nopol_baru, nomor_mesin || '', nomor_rangka || '']
    );

    await logActivity({
      module: 'aset',
      submenu: 'inventaris-kendaraan',
      tableName: 'aset_kendaraan',
      recordId: result.insertId,
      action: 'CREATE',
      userName,
      details: body,
    });

    return NextResponse.json({ success: true, insertId: result.insertId, message: 'Data kendaraan berhasil ditambahkan!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Edit data kendaraan
export async function PUT(request: Request) {
  try {
    const session = await getSessionFromRequest(request as any);
    const userName = session ? (session.nama || session.nip_username) : 'Sistem';

    const body = await request.json();
    const { id_aset, nama_pemegang, merk_type, tahun, nopol_lama, nopol_baru, nomor_mesin, nomor_rangka, keterangan } = body;

    if (!id_aset || !nama_pemegang || !nopol_baru) {
      return NextResponse.json({ success: false, error: 'Data wajib belum lengkap!' }, { status: 400 });
    }

    await pool.execute(
      `UPDATE aset_kendaraan SET nama_pemegang=?, merk_type=?, tahun=?, nopol_lama=?, nopol_baru=?, nomor_mesin=?, nomor_rangka=?
       WHERE id_aset=?`,
      [nama_pemegang, merk_type, tahun || null, nopol_lama || null, nopol_baru, nomor_mesin || '', nomor_rangka || '', id_aset]
    );

    await logActivity({
      module: 'aset',
      submenu: 'inventaris-kendaraan',
      tableName: 'aset_kendaraan',
      recordId: id_aset,
      action: 'UPDATE',
      userName,
      details: body,
    });

    return NextResponse.json({ success: true, message: 'Data kendaraan berhasil diperbarui!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus data kendaraan
export async function DELETE(request: Request) {
  try {
    const session = await getSessionFromRequest(request as any);
    const userName = session ? (session.nama || session.nip_username) : 'Sistem';

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak ditemukan!' }, { status: 400 });
    }

    await pool.execute('DELETE FROM aset_kendaraan WHERE id_aset = ?', [id]);

    await logActivity({
      module: 'aset',
      submenu: 'inventaris-kendaraan',
      tableName: 'aset_kendaraan',
      recordId: id,
      action: 'DELETE',
      userName,
      details: { id_aset: id },
    });

    return NextResponse.json({ success: true, message: 'Data kendaraan berhasil dihapus!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
