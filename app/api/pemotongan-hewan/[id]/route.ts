import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'simantap_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// FUNGSI PUT: Edit/Update data berdasarkan ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { nama_usaha, jenis, pemilik, kontak, lokasi, sertifikat_halal } = body;

    const connection = await pool.getConnection();
    const query = `
      UPDATE pemotongan_hewan 
      SET nama_usaha=?, jenis=?, pemilik=?, kontak=?, lokasi=?, sertifikat_halal=? 
      WHERE id=?
    `;
    
    await connection.execute(query, [
      nama_usaha, 
      jenis, 
      pemilik, 
      kontak || '-', 
      lokasi, 
      sertifikat_halal, 
      id
    ]);
    connection.release();

    return NextResponse.json({ success: true, message: 'Data berhasil diupdate!' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// FUNGSI DELETE: Hapus data berdasarkan ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const connection = await pool.getConnection();
    await connection.execute('DELETE FROM pemotongan_hewan WHERE id=?', [id]);
    connection.release();

    return NextResponse.json({ success: true, message: 'Data berhasil dihapus!' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}