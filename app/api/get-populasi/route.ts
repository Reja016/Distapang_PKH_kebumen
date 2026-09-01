import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Coba ambil dari tabel `populasi` (skema dari file simantap_db.sql)
    try {
      const [rows]: any = await pool.query(
        'SELECT * FROM populasi WHERE triwulan = 4 OR triwulan = 1 OR triwulan IS NULL ORDER BY id_populasi ASC'
      );

      if (rows && rows.length > 0) {
        const data = rows.map((row: any) => ({
          kec: row.kecamatan,
          no: row.no,
          desa: row.desa,
          v: [
            row.aj_sapi_potong ?? 0, row.ab_sapi_potong ?? 0, row.mj_sapi_potong ?? 0, row.mb_sapi_potong ?? 0, row.dj_sapi_potong ?? 0, row.db_sapi_potong ?? 0, row.total_sapi_potong ?? 0,
            row.aj_sapi_perah ?? 0, row.ab_sapi_perah ?? 0, row.mj_sapi_perah ?? 0, row.mb_sapi_perah ?? 0, row.dj_sapi_perah ?? 0, row.db_sapi_perah ?? 0, row.total_sapi_perah ?? 0,
            row.aj_kerbau ?? 0, row.ab_kerbau ?? 0, row.mj_kerbau ?? 0, row.mb_kerbau ?? 0, row.dj_kerbau ?? 0, row.db_kerbau ?? 0, row.total_kerbau ?? 0,
            row.aj_kuda ?? 0, row.ab_kuda ?? 0, row.mj_kuda ?? 0, row.mb_kuda ?? 0, row.dj_kuda ?? 0, row.db_kuda ?? 0, row.total_kuda ?? 0,
            row.aj_kambing ?? 0, row.ab_kambing ?? 0, row.mj_kambing ?? 0, row.mb_kambing ?? 0, row.dj_kambing ?? 0, row.db_kambing ?? 0, row.total_kambing ?? 0,
            row.aj_domba ?? 0, row.ab_domba ?? 0, row.mj_domba ?? 0, row.mb_domba ?? 0, row.dj_domba ?? 0, row.db_domba ?? 0, row.total_domba ?? 0,
            row.aj_babi ?? 0, row.ab_babi ?? 0, row.mj_babi ?? 0, row.mb_babi ?? 0, row.dj_babi ?? 0, row.db_babi ?? 0, row.total_babi ?? 0,
            row.ayam_kampung ?? 0, row.ayam_petelur ?? 0, row.ayam_broiller ?? 0, row.puyuh ?? 0, row.itik ?? 0, row.entog ?? 0, row.angsa ?? 0, row.merpati ?? 0,
            row.j_kelinci ?? 0, row.b_kelinci ?? 0, row.kelinci ?? 0
          ]
        }));
        return NextResponse.json(data);
      }
    } catch {}

    // 2. Fallback jika masih memakai tabel populasi_tw4_2025
    const [rows]: any = await pool.query(
      'SELECT kecamatan, no_desa, desa, data_v FROM populasi_tw4_2025 ORDER BY id ASC'
    );

    const data = rows.map((row: any) => ({
      kec: row.kecamatan,
      no: row.no_desa,
      desa: row.desa,
      v: typeof row.data_v === 'string' ? JSON.parse(row.data_v) : row.data_v,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal mengambil data' }, { status: 500 });
  }
}