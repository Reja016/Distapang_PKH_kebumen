import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Buat tabel untuk menyimpan string HTML dari Excel
    await pool.query(`
      CREATE TABLE IF NOT EXISTS monev_excel (
        tahun VARCHAR(10) PRIMARY KEY,
        file_name VARCHAR(255),
        html_table LONGTEXT
      )
    `);
    const [rows]: any = await pool.query('SELECT * FROM monev_excel');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menarik data excel' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { tahun, fileName, htmlTable } = await request.json();
    
    // Fitur ON DUPLICATE: Kalau tahunnya sama, otomatis di-update file lamanya
    await pool.query(
      `INSERT INTO monev_excel (tahun, file_name, html_table) VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE file_name = VALUES(file_name), html_table = VALUES(html_table)`,
      [tahun, fileName, htmlTable]
    );
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan excel' }, { status: 500 });
  }
}