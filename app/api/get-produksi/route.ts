import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

function formatAnimalName(name: string) {
  if (!name) return '-';
  return name
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function GET() {
  try {
    // 1. Ambil agregat per jenis komoditas hewan dari tabel produksi (10.334 desa)
    const [rows]: any = await pool.query(`
      SELECT 
        jenis,
        hewan,
        ROUND(SUM(jan), 2) AS jan,
        ROUND(SUM(feb), 2) AS feb,
        ROUND(SUM(mar), 2) AS mar,
        ROUND(SUM(apr), 2) AS apr,
        ROUND(SUM(mei), 2) AS mei,
        ROUND(SUM(jun), 2) AS jun,
        ROUND(SUM(jul), 2) AS jul,
        ROUND(SUM(agt), 2) AS agt,
        ROUND(SUM(sept), 2) AS sep,
        ROUND(SUM(okt), 2) AS okt,
        ROUND(SUM(nov), 2) AS nov,
        ROUND(SUM(des), 2) AS des,
        ROUND(SUM(total), 2) AS total
      FROM produksi
      GROUP BY jenis, hewan
      ORDER BY total DESC
    `);

    const dataDaging: any[] = [];
    const dataTelur: any[] = [];

    if (rows && rows.length > 0) {
      rows.forEach((r: any) => {
        const item = {
          jenis: formatAnimalName(r.hewan || r.jenis),
          jan: Number(r.jan) || 0,
          feb: Number(r.feb) || 0,
          mar: Number(r.mar) || 0,
          apr: Number(r.apr) || 0,
          mei: Number(r.mei) || 0,
          jun: Number(r.jun) || 0,
          jul: Number(r.jul) || 0,
          agt: Number(r.agt) || 0,
          sep: Number(r.sep) || 0,
          okt: Number(r.okt) || 0,
          nov: Number(r.nov) || 0,
          des: Number(r.des) || 0,
          total: Number(r.total) || 0,
        };

        const cat = (r.jenis || '').toLowerCase();
        if (cat === 'pemotongan' || cat === 'daging') {
          dataDaging.push(item);
        } else if (cat === 'telur') {
          dataTelur.push(item);
        }
      });
    }

    return NextResponse.json({ success: true, dataDaging, dataTelur });
  } catch (error: any) {
    console.error('Error GET get-produksi:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}