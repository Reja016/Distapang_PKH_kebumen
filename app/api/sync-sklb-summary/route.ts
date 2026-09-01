import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS capaian_sklb (
      id INT AUTO_INCREMENT PRIMARY KEY,
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
}

// GET: Ambil semua data capaian SKLB
export async function GET() {
  try {
    await ensureTable();
    const [rows] = await pool.query('SELECT * FROM capaian_sklb ORDER BY no_urut ASC, id ASC');
    return NextResponse.json({ success: true, data: rows });
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

    // Jika dipanggil tanpa body atau action=sync, return data
    if (!body || Object.keys(body).length === 0 || body.action === 'sync') {
      const [rows] = await pool.query('SELECT * FROM capaian_sklb ORDER BY no_urut ASC, id ASC');
      return NextResponse.json({ success: true, data: rows, message: 'Data rekapitulasi berhasil disinkronkan!' });
    }

    // Tambah data baru
    const { no_urut, grup, tanggal, desa, kecamatan, target = 0, capaian = 0, selisih = 0 } = body;

    if (!desa || !kecamatan) {
      return NextResponse.json({ success: false, error: 'Desa dan Kecamatan wajib diisi!' }, { status: 400 });
    }

    const calculatedSelisih = Number(capaian) - Number(target);

    const [result]: any = await pool.query(
      `INSERT INTO capaian_sklb (no_urut, grup, tanggal, desa, kecamatan, target, capaian, selisih)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [Number(no_urut) || 1, grup || 'Tabel Kiri', tanggal || '', desa, kecamatan, Number(target) || 0, Number(capaian) || 0, calculatedSelisih]
    );

    return NextResponse.json({ success: true, insertId: result.insertId, message: 'Data rekapitulasi SKLB berhasil disimpan!' });
  } catch (error: any) {
    console.error('Error POST sync-sklb-summary:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Edit data
export async function PUT(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const { id, no_urut, grup, tanggal, desa, kecamatan, target = 0, capaian = 0 } = body;

    if (!id || !desa) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap!' }, { status: 400 });
    }

    const calculatedSelisih = Number(capaian) - Number(target);

    await pool.query(
      `UPDATE capaian_sklb SET no_urut = ?, grup = ?, tanggal = ?, desa = ?, kecamatan = ?, target = ?, capaian = ?, selisih = ?
       WHERE id = ?`,
      [Number(no_urut) || 1, grup || 'Tabel Kiri', tanggal || '', desa, kecamatan, Number(target) || 0, Number(capaian) || 0, calculatedSelisih, id]
    );

    return NextResponse.json({ success: true, message: 'Data rekapitulasi SKLB berhasil diperbarui!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus data
export async function DELETE(request: Request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak ditemukan!' }, { status: 400 });
    }

    await pool.query('DELETE FROM capaian_sklb WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Data rekapitulasi SKLB berhasil dihapus!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}