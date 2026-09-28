import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { getUserAreaAccess } from '@/lib/areaRestriction';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSessionFromRequest(request as any);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Belum login' }, { status: 401 });
    }

    const access = await getUserAreaAccess(session);

    // Ambil juga master seluruh kecamatan dan puskeswan untuk referensi
    const [allWb]: any = await pool.query(
      `SELECT DISTINCT id_wilayah_binaan, id_puskeswan, id_kecamatan, nama_puskeswan, binaan 
       FROM wilayah_binaan ORDER BY binaan ASC`
    );

    const masterKecamatan = Array.from(new Set(allWb.map((r: any) => r.binaan.toUpperCase())));
    const masterPuskeswan = Array.from(new Set(allWb.map((r: any) => r.nama_puskeswan)));

    return NextResponse.json({
      success: true,
      ...access,
      masterKecamatan,
      masterPuskeswan,
    });
  } catch (error: any) {
    console.error('Gagal mengambil wilayah tugas user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
