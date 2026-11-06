import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

// Helper untuk memastikan kolom foto tersedia di database MySQL
let isColumnChecked = false;
async function ensureFotoColumn() {
  if (isColumnChecked) return;
  try {
    await pool.query('ALTER TABLE pembinaan_nkv ADD COLUMN foto LONGTEXT NULL');
  } catch {
    // Abaikan error jika kolom sudah ada
  }
  isColumnChecked = true;
}

// GET: Ambil semua data pembinaan NKV dari database
export async function GET() {
  try {
    await ensureFotoColumn();
    const [rows]: any = await pool.execute(
      'SELECT * FROM pembinaan_nkv ORDER BY id_pembinaan ASC'
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Tambah data NKV baru
export async function POST(request: Request) {
  try {
    await ensureFotoColumn();
    const session = await getSessionFromRequest(request as any);
    const userName = session ? (session.nama || session.nip_username || 'Sistem') : 'Sistem';

    const body = await request.json();

    // ── 0. BATCH INSERT / IMPORT GELONDONGAN EXCEL ──
    const items = Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : null;
    if (items && items.length > 0) {
      let successCount = 0;
      let skippedCount = 0;

      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const namaUsaha = String(item.nama_usaha || item.namaUsaha || item['Nama Usaha / Unit Usaha'] || item['Nama Usaha'] || '').trim();

        if (!namaUsaha) {
          skippedCount++;
          continue;
        }

        const jenisUsaha = String(item.jenis_usaha || item.jenisUsaha || item['Jenis Usaha'] || '').trim();
        const proses = String(item.proses || item['Proses / Tahapan Sertifikasi'] || item['Proses'] || '').trim();
        const pembinaan1 = String(item.pembinaan_1 || item.pembinaan1 || item['Tanggal Pembinaan 1'] || item['Pembinaan 1'] || '').trim();
        const hasil1 = String(item.hasil_1 || item.hasil1 || item['Hasil Pembinaan 1'] || item['Hasil 1'] || '').trim();
        const pembinaan2 = String(item.pembinaan_2 || item.pembinaan2 || item['Tanggal Pembinaan 2'] || item['Pembinaan 2'] || '').trim();
        const hasil2 = String(item.hasil_2 || item.hasil2 || item['Hasil Pembinaan 2'] || item['Hasil 2'] || '').trim();
        const pelatihanHigiene = String(item.pelatihan_higiene || item.pelatihanHigiene || item['Pelatihan Higiene Sanitasi'] || item['Pelatihan Higiene'] || '').trim();
        const pengeluaranRekomendasi = String(item.pengeluaran_rekomendasi || item.pengeluaranRekomendasi || item['Pengeluaran Rekomendasi'] || '').trim();
        const keterangan = String(item.keterangan || item['Keterangan'] || '').trim();

        await pool.execute(
          `INSERT INTO pembinaan_nkv 
           (nama_usaha, jenis_usaha, proses, pembinaan_1, hasil_1, pembinaan_2, hasil_2, pelatihan_higiene, pengeluaran_rekomendasi, keterangan)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            namaUsaha,
            jenisUsaha,
            proses,
            pembinaan1,
            hasil1,
            pembinaan2,
            hasil2,
            pelatihanHigiene,
            pengeluaranRekomendasi,
            keterangan,
          ]
        );
        successCount++;
      }

      await logActivity({
        module: 'kesmavet',
        submenu: 'nkv',
        tableName: 'pembinaan_nkv',
        recordId: 0,
        action: 'IMPORT_EXCEL',
        userName,
        details: { totalItems: items.length, successCount, skippedCount },
      });

      return NextResponse.json({
        success: true,
        count: successCount,
        skipped: skippedCount,
        message: `Berhasil mengimpor ${successCount} data unit usaha pembinaan NKV!`,
      });
    }

    const {
      nama_usaha,
      jenis_usaha,
      proses,
      pembinaan_1,
      hasil_1,
      pembinaan_2,
      hasil_2,
      pelatihan_higiene,
      pengeluaran_rekomendasi,
      keterangan,
      foto,
    } = body;

    if (!nama_usaha) {
      return NextResponse.json({ success: false, error: 'Nama usaha wajib diisi!' }, { status: 400 });
    }

    // Anti-duplikasi: Cek apakah data persis sama baru saja dibuat dalam kurun waktu 1 menit terakhir
    const [existing]: any = await pool.execute(
      `SELECT id_pembinaan FROM pembinaan_nkv 
       WHERE nama_usaha = ? AND jenis_usaha = ? AND created_at >= NOW() - INTERVAL 1 MINUTE
       ORDER BY id_pembinaan DESC LIMIT 1`,
      [nama_usaha, jenis_usaha || '']
    );

    if (existing.length > 0) {
      return NextResponse.json({ 
        success: true, 
        insertId: existing[0].id_pembinaan, 
        message: 'Data NKV sudah tersimpan sebelumnya (anti-duplikasi aktif).' 
      });
    }

    const [result]: any = await pool.execute(
      `INSERT INTO pembinaan_nkv (nama_usaha, jenis_usaha, proses, pembinaan_1, hasil_1, pembinaan_2, hasil_2, pelatihan_higiene, pengeluaran_rekomendasi, keterangan, foto)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nama_usaha,
        jenis_usaha || '',
        proses || '',
        pembinaan_1 || '',
        hasil_1 || '',
        pembinaan_2 || '',
        hasil_2 || '',
        pelatihan_higiene || '',
        pengeluaran_rekomendasi || '',
        keterangan || '',
        foto || null,
      ]
    );

    await logActivity({
      module: 'kesmavet',
      submenu: 'nkv',
      tableName: 'pembinaan_nkv',
      recordId: result.insertId,
      action: 'CREATE',
      userName,
      details: body,
    });

    return NextResponse.json({ success: true, insertId: result.insertId, message: 'Data NKV berhasil ditambahkan!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Edit data NKV
export async function PUT(request: Request) {
  try {
    await ensureFotoColumn();
    const session = await getSessionFromRequest(request as any);
    const userName = session ? (session.nama || session.nip_username) : 'Sistem';

    const body = await request.json();
    const {
      id_pembinaan,
      nama_usaha,
      jenis_usaha,
      proses,
      pembinaan_1,
      hasil_1,
      pembinaan_2,
      hasil_2,
      pelatihan_higiene,
      pengeluaran_rekomendasi,
      keterangan,
      foto,
    } = body;

    if (!id_pembinaan || !nama_usaha) {
      return NextResponse.json({ success: false, error: 'Data wajib belum lengkap!' }, { status: 400 });
    }

    await pool.execute(
      `UPDATE pembinaan_nkv SET nama_usaha=?, jenis_usaha=?, proses=?, pembinaan_1=?, hasil_1=?, pembinaan_2=?, hasil_2=?, pelatihan_higiene=?, pengeluaran_rekomendasi=?, keterangan=?, foto=?
       WHERE id_pembinaan=?`,
      [
        nama_usaha,
        jenis_usaha || '',
        proses || '',
        pembinaan_1 || '',
        hasil_1 || '',
        pembinaan_2 || '',
        hasil_2 || '',
        pelatihan_higiene || '',
        pengeluaran_rekomendasi || '',
        keterangan || '',
        foto || null,
        id_pembinaan,
      ]
    );

    await logActivity({
      module: 'kesmavet',
      submenu: 'nkv',
      tableName: 'pembinaan_nkv',
      recordId: id_pembinaan,
      action: 'UPDATE',
      userName,
      details: body,
    });

    return NextResponse.json({ success: true, message: 'Data NKV berhasil diperbarui!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus data NKV
export async function DELETE(request: Request) {
  try {
    const session = await getSessionFromRequest(request as any);
    const userName = session ? (session.nama || session.nip_username) : 'Sistem';

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak ditemukan!' }, { status: 400 });
    }

    await pool.execute('DELETE FROM pembinaan_nkv WHERE id_pembinaan = ?', [id]);

    await logActivity({
      module: 'kesmavet',
      submenu: 'nkv',
      tableName: 'pembinaan_nkv',
      recordId: id,
      action: 'DELETE',
      userName,
      details: { id_pembinaan: id },
    });

    return NextResponse.json({ success: true, message: 'Data NKV berhasil dihapus!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
