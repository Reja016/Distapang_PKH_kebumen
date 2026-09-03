import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

const DEFAULT_KOMODITAS = ['Sapi Potong', 'Kuda', 'Babi', 'Kambing', 'Domba'];
const DEFAULT_LOKASI = ['RPH Kebumen', 'Luar RPH Kebumen', 'RPH Gombong', 'Luar RPH Gombong'];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'years') {
      const [yearRows]: any = await pool.query(
        `SELECT DISTINCT tahun FROM pemotongan_komoditas_bulanan ORDER BY tahun ASC`
      );
      let years: number[] = yearRows ? yearRows.map((r: any) => Number(r.tahun)).filter(Boolean) : [];
      if (!years.includes(2025)) years.push(2025);
      if (!years.includes(2026)) years.push(2026);
      years = Array.from(new Set<number>(years)).sort((a, b) => a - b);
      return NextResponse.json({ success: true, years });
    }

    const tahun = Number(searchParams.get('tahun')) || 2025;

    const [rows]: any = await pool.query(
      `SELECT * FROM pemotongan_komoditas_bulanan WHERE tahun = ? ORDER BY id ASC`,
      [tahun]
    );

    let result: any[] = [];
    if (rows && rows.length > 0) {
      result = rows;
    } else {
      DEFAULT_LOKASI.forEach((lokasi) => {
        DEFAULT_KOMODITAS.forEach((komoditas) => {
          result.push({
            tahun,
            nama_pemotongan: lokasi,
            komoditas,
            jan_jantan: 0, jan_betina: 0,
            feb_jantan: 0, feb_betina: 0,
            mar_jantan: 0, mar_betina: 0,
            apr_jantan: 0, apr_betina: 0,
            mei_jantan: 0, mei_betina: 0,
            jun_jantan: 0, jun_betina: 0,
            jul_jantan: 0, jul_betina: 0,
            agu_jantan: 0, agu_betina: 0,
            sep_jantan: 0, sep_betina: 0,
            okt_jantan: 0, okt_betina: 0,
            nov_jantan: 0, nov_betina: 0,
            des_jantan: 0, des_betina: 0,
          });
        });
      });
    }

    return NextResponse.json({ success: true, tahun, data: result });
  } catch (error: any) {
    console.error('Error GET pemotongan-komoditas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, tahun, data } = body;

    // Tambah tahun baru
    if (action === 'add_year') {
      const newYear = Number(tahun);
      if (!newYear || newYear < 2000) {
        return NextResponse.json({ success: false, error: 'Tahun tidak valid' }, { status: 400 });
      }

      for (const lokasi of DEFAULT_LOKASI) {
        for (const komoditas of DEFAULT_KOMODITAS) {
          await pool.query(
            `INSERT INTO pemotongan_komoditas_bulanan (tahun, nama_pemotongan, komoditas)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE tahun=VALUES(tahun)`,
            [newYear, lokasi, komoditas]
          );
        }
      }
      return NextResponse.json({ success: true, message: `Tahun ${newYear} berhasil ditambahkan!` });
    }

    if (!tahun || !Array.isArray(data)) {
      return NextResponse.json({ success: false, error: 'Tahun dan array data wajib diisi' }, { status: 400 });
    }

    // Delete existing rows for this year to sync with additions/removals
    await pool.query(`DELETE FROM pemotongan_komoditas_bulanan WHERE tahun = ?`, [tahun]);

    for (const item of data) {
      await pool.query(
        `INSERT INTO pemotongan_komoditas_bulanan (
          tahun, nama_pemotongan, komoditas,
          jan_jantan, jan_betina,
          feb_jantan, feb_betina,
          mar_jantan, mar_betina,
          apr_jantan, apr_betina,
          mei_jantan, mei_betina,
          jun_jantan, jun_betina,
          jul_jantan, jul_betina,
          agu_jantan, agu_betina,
          sep_jantan, sep_betina,
          okt_jantan, okt_betina,
          nov_jantan, nov_betina,
          des_jantan, des_betina
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tahun,
          item.nama_pemotongan || 'RPH Kebumen',
          item.komoditas || 'Sapi Potong',
          Number(item.jan_jantan) || 0, Number(item.jan_betina) || 0,
          Number(item.feb_jantan) || 0, Number(item.feb_betina) || 0,
          Number(item.mar_jantan) || 0, Number(item.mar_betina) || 0,
          Number(item.apr_jantan) || 0, Number(item.apr_betina) || 0,
          Number(item.mei_jantan) || 0, Number(item.mei_betina) || 0,
          Number(item.jun_jantan) || 0, Number(item.jun_betina) || 0,
          Number(item.jul_jantan) || 0, Number(item.jul_betina) || 0,
          Number(item.agu_jantan) || 0, Number(item.agu_betina) || 0,
          Number(item.sep_jantan) || 0, Number(item.sep_betina) || 0,
          Number(item.okt_jantan) || 0, Number(item.okt_betina) || 0,
          Number(item.nov_jantan) || 0, Number(item.nov_betina) || 0,
          Number(item.des_jantan) || 0, Number(item.des_betina) || 0,
        ]
      );
    }

    return NextResponse.json({ success: true, message: 'Data rekap komoditas bulanan berhasil disimpan' });
  } catch (error: any) {
    console.error('Error POST pemotongan-komoditas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
