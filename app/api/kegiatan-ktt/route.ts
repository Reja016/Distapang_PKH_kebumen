import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Ambil semua riwayat log aktivitas KTT
export async function GET() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kegiatan_ktt (
        id VARCHAR(50) PRIMARY KEY,
        tanggal DATE,
        ktt_id VARCHAR(50),
        nama_ktt VARCHAR(255),
        kecamatan VARCHAR(100),
        desa VARCHAR(100),
        tim_pelaksana VARCHAR(255),
        nama_kegiatan VARCHAR(255),
        hasil_kegiatan TEXT,
        lat DECIMAL(10, 8) NULL,
        lng DECIMAL(11, 8) NULL,
        photo LONGTEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Pastikan kolom lat, lng, photo ada jika tabel lama belum punya
    try {
      await pool.query('ALTER TABLE kegiatan_ktt ADD COLUMN IF NOT EXISTS lat DECIMAL(10, 8) NULL');
      await pool.query('ALTER TABLE kegiatan_ktt ADD COLUMN IF NOT EXISTS lng DECIMAL(11, 8) NULL');
      await pool.query('ALTER TABLE kegiatan_ktt ADD COLUMN IF NOT EXISTS photo LONGTEXT NULL');
    } catch {
      // Abaikan jika MySQL versi lama tidak support IF NOT EXISTS di ALTER
    }

    const [rows]: any = await pool.query('SELECT * FROM kegiatan_ktt ORDER BY tanggal DESC, id DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Gagal mengambil data kegiatan KTT:', error);
    return NextResponse.json({ error: 'Gagal mengambil data dari MySQL' }, { status: 500 });
  }
}

// POST: Tambah atau edit log kegiatan KTT
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, tanggal, ktt_id, nama_ktt, kecamatan, desa, tim_pelaksana, nama_kegiatan, hasil_kegiatan, lat, lng, photo, isEdit } = body;

    const finalId = id || `ACT-${Date.now()}`;

    if (isEdit) {
      await pool.query(
        `UPDATE kegiatan_ktt 
         SET tanggal=?, ktt_id=?, nama_ktt=?, kecamatan=?, desa=?, tim_pelaksana=?, nama_kegiatan=?, hasil_kegiatan=?, lat=?, lng=?, photo=? 
         WHERE id=?`,
        [tanggal, ktt_id || '', nama_ktt, kecamatan || '', desa || '', tim_pelaksana, nama_kegiatan, hasil_kegiatan, lat || null, lng || null, photo || null, finalId]
      );
    } else {
      await pool.query(
        `INSERT INTO kegiatan_ktt 
         (id, tanggal, ktt_id, nama_ktt, kecamatan, desa, tim_pelaksana, nama_kegiatan, hasil_kegiatan, lat, lng, photo) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [finalId, tanggal, ktt_id || '', nama_ktt, kecamatan || '', desa || '', tim_pelaksana, nama_kegiatan, hasil_kegiatan, lat || null, lng || null, photo || null]
      );
    }

    return NextResponse.json({ status: 'success', id: finalId });
  } catch (error) {
    console.error('Gagal menyimpan kegiatan KTT:', error);
    return NextResponse.json({ error: 'Gagal menyimpan data ke MySQL' }, { status: 500 });
  }
}

// DELETE: Hapus log kegiatan KTT
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      await pool.query('DELETE FROM kegiatan_ktt WHERE id=?', [id]);
    }
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Gagal menghapus kegiatan KTT:', error);
    return NextResponse.json({ error: 'Gagal menghapus data dari MySQL' }, { status: 500 });
  }
}
