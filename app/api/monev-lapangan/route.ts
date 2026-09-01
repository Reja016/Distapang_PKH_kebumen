import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Buat tabel otomatis jika belum ada (tipe LONGTEXT untuk menampung foto kamera)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS monev_lapangan (
        id VARCHAR(50) PRIMARY KEY,
        tahun VARCHAR(10),
        kec VARCHAR(100),
        desa VARCHAR(100),
        namaKtt VARCHAR(255),
        alamat TEXT,
        kegiatan VARCHAR(255),
        jenis VARCHAR(100),
        waktuMonev VARCHAR(50),
        kondisi JSON,
        lat DOUBLE,
        lng DOUBLE,
        photo LONGTEXT,
        catatan TEXT
      )
    `);

    const [rows]: any = await pool.query('SELECT * FROM monev_lapangan ORDER BY id DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal menarik data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, tahun, kec, desa, namaKtt, alamat, kegiatan, jenis, waktuMonev, kondisi, lat, lng, photo, catatan, isEdit } = body;

    if (isEdit) {
      await pool.query(
        `UPDATE monev_lapangan SET tahun=?, kec=?, desa=?, namaKtt=?, alamat=?, kegiatan=?, jenis=?, waktuMonev=?, kondisi=?, lat=?, lng=?, photo=?, catatan=? WHERE id=?`,
        [tahun, kec, desa, namaKtt, alamat, kegiatan, jenis, waktuMonev, JSON.stringify(kondisi), lat, lng, photo, catatan, id]
      );
    } else {
      await pool.query(
        `INSERT INTO monev_lapangan (id, tahun, kec, desa, namaKtt, alamat, kegiatan, jenis, waktuMonev, kondisi, lat, lng, photo, catatan) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, tahun, kec, desa, namaKtt, alamat, kegiatan, jenis, waktuMonev, JSON.stringify(kondisi), lat, lng, photo, catatan]
      );
    }
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal menyimpan' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) await pool.query('DELETE FROM monev_lapangan WHERE id=?', [id]);
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus' }, { status: 500 });
  }
}