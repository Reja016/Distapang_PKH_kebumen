import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS populasi_2026 (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tw VARCHAR(20) NOT NULL DEFAULT 'TW 1',
      kecamatan VARCHAR(100) NOT NULL,
      desa VARCHAR(100) NOT NULL,
      data_v JSON,
      grand_total INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);
}

// GET: Ambil semua data populasi 2026
export async function GET(request: Request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(request.url);
    const tw = searchParams.get('tw');

    let query = 'SELECT * FROM populasi_2026';
    const params: any[] = [];

    if (tw) {
      query += ' WHERE tw = ?';
      params.push(tw);
    }

    query += ' ORDER BY kecamatan ASC, desa ASC';

    const [rows]: any = await pool.query(query, params);

    const formatted = rows.map((r: any) => ({
      id: r.id,
      tw: r.tw,
      kec: r.kecamatan,
      desa: r.desa,
      values: typeof r.data_v === 'string' ? JSON.parse(r.data_v) : (r.data_v || {}),
      grandTotal: r.grand_total || 0,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('Error GET populasi_2026:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Simpan 1 desa atau banyak desa (Bulk)
export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();

    // Mode Bulk / Array
    if (Array.isArray(body)) {
      for (const item of body) {
        const { tw = 'TW 1', kec, desa, values = {}, grandTotal = 0 } = item;
        if (kec && desa) {
          await pool.query(
            `INSERT INTO populasi_2026 (tw, kecamatan, desa, data_v, grand_total)
             VALUES (?, ?, ?, ?, ?)`,
            [tw, kec, desa, JSON.stringify(values), grandTotal]
          );
        }
      }
      return NextResponse.json({ success: true, message: `Berhasil menyimpan ${body.length} data desa ke database!` });
    }

    // Mode Single Desa
    const { tw = 'TW 1', kec, desa, values = {}, grandTotal = 0, id } = body;

    if (!kec || !desa) {
      return NextResponse.json({ success: false, error: 'Kecamatan dan Desa wajib diisi!' }, { status: 400 });
    }

    if (id) {
      // Edit data lama
      await pool.query(
        `UPDATE populasi_2026 SET tw = ?, kecamatan = ?, desa = ?, data_v = ?, grand_total = ? WHERE id = ?`,
        [tw, kec, desa, JSON.stringify(values), grandTotal, id]
      );
      return NextResponse.json({ success: true, message: 'Data populasi desa berhasil diperbarui!' });
    } else {
      // Tambah baru
      const [result]: any = await pool.query(
        `INSERT INTO populasi_2026 (tw, kecamatan, desa, data_v, grand_total)
         VALUES (?, ?, ?, ?, ?)`,
        [tw, kec, desa, JSON.stringify(values), grandTotal]
      );
      return NextResponse.json({ success: true, insertId: result.insertId, message: 'Data populasi desa berhasil disimpan ke database!' });
    }
  } catch (error: any) {
    console.error('Error POST populasi_2026:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus data populasi desa
export async function DELETE(request: Request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak ditemukan!' }, { status: 400 });
    }

    await pool.query('DELETE FROM populasi_2026 WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Data populasi berhasil dihapus dari database!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
