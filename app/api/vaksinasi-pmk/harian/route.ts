import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET → ambil semua data harian, bisa difilter ?bulan=1-12&tahun=2026
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bulan = searchParams.get('bulan');
    const tahun = searchParams.get('tahun') || '2027';

    let query = 'SELECT * FROM vaksinasi_harian WHERE YEAR(tanggal) = ?';
    const params: any[] = [tahun];

    if (bulan) {
      query += ' AND MONTH(tanggal) = ?';
      params.push(bulan);
    }
    query += ' ORDER BY puskeswan ASC, tanggal ASC';

    const [rows] = await pool.execute(query, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST → tambah/update input harian (upsert berdasarkan puskeswan + tanggal)
// Dipakai baik untuk tambah baru maupun edit dari klik sel tabel
export async function POST(request: Request) {
  try {
    const { puskeswan, tanggal, jumlah } = await request.json();

    if (!puskeswan || !tanggal) {
      return NextResponse.json({ success: false, error: 'Puskeswan dan tanggal wajib diisi.' }, { status: 400 });
    }

    const jumlahVal = Number(jumlah) || 0;

    if (jumlahVal <= 0) {
      // jumlah 0/kosong → anggap user mau hapus entri tanggal itu (kalau ada)
      await pool.execute('DELETE FROM vaksinasi_harian WHERE puskeswan = ? AND tanggal = ?', [puskeswan, tanggal]);
      return NextResponse.json({ success: true, message: 'Data tanggal tersebut dikosongkan.' });
    }

    const [result]: any = await pool.execute(
      `INSERT INTO vaksinasi_harian (puskeswan, tanggal, jumlah) VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE jumlah = VALUES(jumlah)`,
      [puskeswan, tanggal, jumlahVal]
    );

    return NextResponse.json({ success: true, message: 'Data harian berhasil disimpan.', id: result.insertId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}