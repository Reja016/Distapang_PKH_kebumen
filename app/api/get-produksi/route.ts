import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Coba dari tabel `produksi`
    try {
      const [rows]: any = await pool.query('SELECT * FROM produksi ORDER BY id ASC');
      if (rows && rows.length > 0) {
        const dataDaging = rows.filter((r: any) => r.kategori?.toLowerCase() === 'daging');
        const dataTelur = rows.filter((r: any) => r.kategori?.toLowerCase() === 'telur');
        return NextResponse.json({ dataDaging, dataTelur });
      }
    } catch {}

    // 2. Coba dari tabel `produksi_2025`
    try {
      const [rows]: any = await pool.query('SELECT * FROM produksi_2025 ORDER BY id ASC');
      if (rows && rows.length > 0) {
        const dataDaging = rows.filter((r: any) => r.kategori?.toLowerCase() === 'daging');
        const dataTelur = rows.filter((r: any) => r.kategori?.toLowerCase() === 'telur');
        return NextResponse.json({ dataDaging, dataTelur });
      }
    } catch {}

    return NextResponse.json({ dataDaging: [], dataTelur: [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal mengambil data produksi dari MySQL' }, { status: 500 });
  }
}