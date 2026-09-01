import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS data_farm (
      id INT AUTO_INCREMENT PRIMARY KEY,
      kategori VARCHAR(50) NOT NULL COMMENT 'broiler, petelur, general',
      data_json JSON NOT NULL COMMENT 'Detail data peternak, kapasitas kandang, alamat',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);
}

// GET: Ambil semua data farm
export async function GET() {
  try {
    await ensureTable();
    const [rows] = await pool.query('SELECT * FROM data_farm ORDER BY id ASC');
    
    const dataBroiler: any[] = [];
    const dataPetelur: any[] = [];
    const dataGeneral: any[] = [];

    (rows as any[]).forEach((row) => {
      const parsed = typeof row.data_json === 'string' ? JSON.parse(row.data_json) : (row.data_json || {});
      parsed.db_id = row.id; 

      if (row.kategori === 'broiler') dataBroiler.push(parsed);
      else if (row.kategori === 'petelur') dataPetelur.push(parsed);
      else if (row.kategori === 'general') dataGeneral.push(parsed);
    });

    return NextResponse.json({ success: true, dataBroiler, dataPetelur, dataGeneral });
  } catch (error: any) {
    console.error('Error GET data_farm:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengambil data farm' }, { status: 500 });
  }
}

// POST: Tambah data farm baru
export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const { kategori = 'general', data } = body;

    if (!data) {
      return NextResponse.json({ success: false, error: 'Data farm tidak boleh kosong!' }, { status: 400 });
    }

    const [result]: any = await pool.query(
      'INSERT INTO data_farm (kategori, data_json) VALUES (?, ?)',
      [kategori, JSON.stringify(data)]
    );

    return NextResponse.json({ success: true, insertId: result.insertId, message: 'Data farm berhasil disimpan ke database!' });
  } catch (error: any) {
    console.error('Error POST data_farm:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Edit data farm
export async function PUT(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const { id, kategori, data } = body;

    if (!id || !data) {
      return NextResponse.json({ success: false, error: 'ID dan data farm wajib disertakan!' }, { status: 400 });
    }

    await pool.query(
      'UPDATE data_farm SET kategori = COALESCE(?, kategori), data_json = ? WHERE id = ?',
      [kategori || null, JSON.stringify(data), id]
    );

    return NextResponse.json({ success: true, message: 'Data farm berhasil diperbarui di database!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus data farm
export async function DELETE(request: Request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak ditemukan!' }, { status: 400 });
    }

    await pool.query('DELETE FROM data_farm WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Data farm berhasil dihapus dari database!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}