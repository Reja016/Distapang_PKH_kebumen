import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const twParam = searchParams.get('tw') || '4';
    const tw = parseInt(twParam, 10) || 4;

    // Ambil data langsung dari tabel `populasi`
    const [rows]: any = await pool.query(
      'SELECT * FROM populasi WHERE tahun = 2025 AND triwulan = ? ORDER BY id_populasi ASC',
      [tw]
    );

    // Jika triwulan spesifik tidak ditemukan, ambil data tahun 2025 apa pun yang ada
    let dataRows = rows;
    if (!dataRows || dataRows.length === 0) {
      const [fallbackRows]: any = await pool.query(
        'SELECT * FROM populasi WHERE tahun = 2025 ORDER BY id_populasi ASC'
      );
      dataRows = fallbackRows;
    }

    const data = dataRows.map((row: any) => ({
      kec: row.kecamatan,
      no: row.no,
      desa: row.desa,
      v: [
        Number(row.aj_sapi_potong) || 0,
        Number(row.ab_sapi_potong) || 0,
        Number(row.mj_sapi_potong) || 0,
        Number(row.mb_sapi_potong) || 0,
        Number(row.dj_sapi_potong) || 0,
        Number(row.db_sapi_potong) || 0,
        Number(row.total_sapi_potong) || 0,
        Number(row.aj_sapi_perah) || 0,
        Number(row.ab_sapi_perah) || 0,
        Number(row.mj_sapi_perah) || 0,
        Number(row.mb_sapi_perah) || 0,
        Number(row.dj_sapi_perah) || 0,
        Number(row.db_sapi_perah) || 0,
        Number(row.total_sapi_perah) || 0,
        Number(row.aj_kerbau) || 0,
        Number(row.ab_kerbau) || 0,
        Number(row.mj_kerbau) || 0,
        Number(row.mb_kerbau) || 0,
        Number(row.dj_kerbau) || 0,
        Number(row.db_kerbau) || 0,
        Number(row.total_kerbau) || 0,
        Number(row.aj_kuda) || 0,
        Number(row.ab_kuda) || 0,
        Number(row.mj_kuda) || 0,
        Number(row.mb_kuda) || 0,
        Number(row.dj_kuda) || 0,
        Number(row.db_kuda) || 0,
        Number(row.total_kuda) || 0,
        Number(row.aj_kambing) || 0,
        Number(row.ab_kambing) || 0,
        Number(row.mj_kambing) || 0,
        Number(row.mb_kambing) || 0,
        Number(row.dj_kambing) || 0,
        Number(row.db_kambing) || 0,
        Number(row.total_kambing) || 0,
        Number(row.aj_domba) || 0,
        Number(row.ab_domba) || 0,
        Number(row.mj_domba) || 0,
        Number(row.mb_domba) || 0,
        Number(row.dj_domba) || 0,
        Number(row.db_domba) || 0,
        Number(row.total_domba) || 0,
        Number(row.aj_babi) || 0,
        Number(row.ab_babi) || 0,
        Number(row.mj_babi) || 0,
        Number(row.mb_babi) || 0,
        Number(row.dj_babi) || 0,
        Number(row.db_babi) || 0,
        Number(row.total_babi) || 0,
        Number(row.ayam_kampung) || 0,
        Number(row.ayam_petelur) || 0,
        Number(row.ayam_broiller) || 0,
        Number(row.puyuh) || 0,
        Number(row.itik) || 0,
        Number(row.entog) || 0,
        Number(row.angsa) || 0,
        Number(row.merpati) || 0,
        Number(row.j_kelinci) || 0,
        Number(row.b_kelinci) || 0,
        Number(row.kelinci) || 0,
      ],
    }));

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error GET get-populasi:', error);
    return NextResponse.json({ error: 'Gagal mengambil data dari tabel populasi' }, { status: 500 });
  }
}