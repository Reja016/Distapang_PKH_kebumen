import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS produksi_2026 (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kategori VARCHAR(50) NOT NULL,
        jenis VARCHAR(100) NOT NULL,
        jan DECIMAL(12,2) DEFAULT 0.00,
        feb DECIMAL(12,2) DEFAULT 0.00,
        mar DECIMAL(12,2) DEFAULT 0.00,
        apr DECIMAL(12,2) DEFAULT 0.00,
        mei DECIMAL(12,2) DEFAULT 0.00,
        jun DECIMAL(12,2) DEFAULT 0.00,
        jul DECIMAL(12,2) DEFAULT 0.00,
        agt DECIMAL(12,2) DEFAULT 0.00,
        sep DECIMAL(12,2) DEFAULT 0.00,
        okt DECIMAL(12,2) DEFAULT 0.00,
        nov DECIMAL(12,2) DEFAULT 0.00,
        des DECIMAL(12,2) DEFAULT 0.00,
        total DECIMAL(12,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    const [rows] = await pool.query('SELECT * FROM produksi_2026 ORDER BY id ASC');
    const allData = rows as any[];

    const dataDaging = allData.filter((row) => (row.kategori || '').toLowerCase() === 'daging');
    const dataTelur = allData.filter((row) => (row.kategori || '').toLowerCase() === 'telur');

    return NextResponse.json({ success: true, dataDaging, dataTelur });
  } catch (error: any) {
    console.error('Error GET produksi_2026:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengambil data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      kategori,
      jenis,
      jan = 0,
      feb = 0,
      mar = 0,
      apr = 0,
      mei = 0,
      jun = 0,
      jul = 0,
      agt = 0,
      sep = 0,
      okt = 0,
      nov = 0,
      des = 0,
    } = body;

    if (!kategori || !jenis) {
      return NextResponse.json({ error: 'Kategori dan jenis ternak wajib diisi' }, { status: 400 });
    }

    const total =
      Number(jan) +
      Number(feb) +
      Number(mar) +
      Number(apr) +
      Number(mei) +
      Number(jun) +
      Number(jul) +
      Number(agt) +
      Number(sep) +
      Number(okt) +
      Number(nov) +
      Number(des);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS produksi_2026 (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kategori VARCHAR(50) NOT NULL,
        jenis VARCHAR(100) NOT NULL,
        jan DECIMAL(12,2) DEFAULT 0.00,
        feb DECIMAL(12,2) DEFAULT 0.00,
        mar DECIMAL(12,2) DEFAULT 0.00,
        apr DECIMAL(12,2) DEFAULT 0.00,
        mei DECIMAL(12,2) DEFAULT 0.00,
        jun DECIMAL(12,2) DEFAULT 0.00,
        jul DECIMAL(12,2) DEFAULT 0.00,
        agt DECIMAL(12,2) DEFAULT 0.00,
        sep DECIMAL(12,2) DEFAULT 0.00,
        okt DECIMAL(12,2) DEFAULT 0.00,
        nov DECIMAL(12,2) DEFAULT 0.00,
        des DECIMAL(12,2) DEFAULT 0.00,
        total DECIMAL(12,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    const [result]: any = await pool.query(
      `INSERT INTO produksi_2026 
       (kategori, jenis, jan, feb, mar, apr, mei, jun, jul, agt, sep, okt, nov, des, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [kategori, jenis, Number(jan) || 0, Number(feb) || 0, Number(mar) || 0, Number(apr) || 0, Number(mei) || 0, Number(jun) || 0, Number(jul) || 0, Number(agt) || 0, Number(sep) || 0, Number(okt) || 0, Number(nov) || 0, Number(des) || 0, total]
    );

    return NextResponse.json({ success: true, insertId: result.insertId, message: 'Data produksi 2026 berhasil ditambahkan' });
  } catch (error: any) {
    console.error('Error POST produksi_2026:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal menyimpan data produksi' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak ditemukan' }, { status: 400 });
    }

    await pool.query('DELETE FROM produksi_2026 WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Data produksi berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}