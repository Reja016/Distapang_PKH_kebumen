import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET → ambil rekap bulanan, realisasi/kekurangan/Jan-Des dihitung otomatis
// dari SUM data harian di tabel vaksinasi_harian
export async function GET() {
  try {
    const [rows]: any = await pool.execute(`
      SELECT
        b.id, b.no_urut, b.puskeswan, b.target, b.pengambilan,
        COALESCE(SUM(h.jumlah), 0) AS realisasi,
        b.target - COALESCE(SUM(h.jumlah), 0) AS kekurangan,
        COALESCE(SUM(CASE WHEN MONTH(h.tanggal)=1 THEN h.jumlah END), 0) AS jan,
        COALESCE(SUM(CASE WHEN MONTH(h.tanggal)=2 THEN h.jumlah END), 0) AS feb,
        COALESCE(SUM(CASE WHEN MONTH(h.tanggal)=3 THEN h.jumlah END), 0) AS mar,
        COALESCE(SUM(CASE WHEN MONTH(h.tanggal)=4 THEN h.jumlah END), 0) AS apr,
        COALESCE(SUM(CASE WHEN MONTH(h.tanggal)=5 THEN h.jumlah END), 0) AS mei,
        COALESCE(SUM(CASE WHEN MONTH(h.tanggal)=6 THEN h.jumlah END), 0) AS jun,
        COALESCE(SUM(CASE WHEN MONTH(h.tanggal)=7 THEN h.jumlah END), 0) AS jul,
        COALESCE(SUM(CASE WHEN MONTH(h.tanggal)=8 THEN h.jumlah END), 0) AS agu,
        COALESCE(SUM(CASE WHEN MONTH(h.tanggal)=9 THEN h.jumlah END), 0) AS sep,
        COALESCE(SUM(CASE WHEN MONTH(h.tanggal)=10 THEN h.jumlah END), 0) AS okt,
        COALESCE(SUM(CASE WHEN MONTH(h.tanggal)=11 THEN h.jumlah END), 0) AS nov,
        COALESCE(SUM(CASE WHEN MONTH(h.tanggal)=12 THEN h.jumlah END), 0) AS des
      FROM vaksinasi_bulanan b
      LEFT JOIN vaksinasi_harian h ON h.puskeswan = b.puskeswan
      GROUP BY b.id
      ORDER BY b.no_urut ASC
    `);

    // PENTING: SUM() dari MySQL dikirim sebagai string oleh driver mysql2.
    // Konversi paksa ke Number di sini supaya penjumlahan di frontend tidak "nyambung" jadi teks.
    const data = rows.map((r: any) => ({
      id: r.id,
      no_urut: Number(r.no_urut),
      puskeswan: r.puskeswan,
      target: Number(r.target),
      pengambilan: Number(r.pengambilan),
      realisasi: Number(r.realisasi),
      kekurangan: Number(r.kekurangan),
      jan: Number(r.jan), feb: Number(r.feb), mar: Number(r.mar), apr: Number(r.apr),
      mei: Number(r.mei), jun: Number(r.jun), jul: Number(r.jul), agu: Number(r.agu),
      sep: Number(r.sep), okt: Number(r.okt), nov: Number(r.nov), des: Number(r.des),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST → tambah puskeswan baru (target & pengambilan saja; realisasi dari input harian nanti)
export async function POST(request: Request) {
  try {
    const { no_urut, puskeswan, target = 0, pengambilan = 0 } = await request.json();

    if (!puskeswan || puskeswan.trim() === '') {
      return NextResponse.json({ success: false, error: 'Nama Puskeswan wajib diisi.' }, { status: 400 });
    }

    const [result]: any = await pool.execute(
      'INSERT INTO vaksinasi_bulanan (no_urut, puskeswan, target, pengambilan) VALUES (?,?,?,?)',
      [no_urut, puskeswan.trim(), target, pengambilan]
    );

    return NextResponse.json({ success: true, message: 'Puskeswan berhasil ditambahkan.', id: result.insertId });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, error: 'Nama Puskeswan sudah ada.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}