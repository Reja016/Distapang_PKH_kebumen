import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

const listDaging = [
  'Sapi Potong', 'Sapi Perah', 'Kerbau Potong', 'Kuda', 'Kambing Potong', 'Domba', 'Babi',
  'Ayam Ras Petelur Produktif', 'Ayam Ras Pedaging', 'Ayam Buras', 'Itik', 'Kelinci', 'Burung Puyuh', 'Angsa', 'Entog', 'Merpati'
];

const listTelur = [
  'Ayam Ras Petelur Produktif', 'Ayam Buras', 'Itik', 'Burung Puyuh', 'Entog'
];

export async function GET() {
  try {
    // 1. Bikin tabel khusus 2026
    await pool.query(`
      CREATE TABLE IF NOT EXISTS produksi_2026 (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kategori VARCHAR(50),
        jenis VARCHAR(100),
        jan DECIMAL(15,4) DEFAULT 0, feb DECIMAL(15,4) DEFAULT 0, mar DECIMAL(15,4) DEFAULT 0,
        apr DECIMAL(15,4) DEFAULT 0, mei DECIMAL(15,4) DEFAULT 0, jun DECIMAL(15,4) DEFAULT 0,
        jul DECIMAL(15,4) DEFAULT 0, agt DECIMAL(15,4) DEFAULT 0, sep DECIMAL(15,4) DEFAULT 0,
        okt DECIMAL(15,4) DEFAULT 0, nov DECIMAL(15,4) DEFAULT 0, des DECIMAL(15,4) DEFAULT 0,
        total DECIMAL(15,4) DEFAULT 0
      )
    `);

    // 2. Cek apakah masih kosong. Kalau kosong, masukkan template 0.
    const [rows]: any = await pool.query('SELECT COUNT(*) as count FROM produksi_2026');
    
    if (rows[0].count === 0) {
      for (const jenis of listDaging) {
        await pool.query('INSERT INTO produksi_2026 (kategori, jenis) VALUES (?, ?)', ['Daging', jenis]);
      }
      for (const jenis of listTelur) {
        await pool.query('INSERT INTO produksi_2026 (kategori, jenis) VALUES (?, ?)', ['Telur', jenis]);
      }
      return NextResponse.json({ status: 'Mantap! 🚀', pesan: 'Tabel Produksi 2026 berhasil dibuat dengan angka 0!' });
    }

    return NextResponse.json({ status: 'Aman', pesan: 'Tabel 2026 sudah ada isinya, tidak ditimpa.' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 'Gagal', error: 'Cek terminal VS Code' }, { status: 500 });
  }
}