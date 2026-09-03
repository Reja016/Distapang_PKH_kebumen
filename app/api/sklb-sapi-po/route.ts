import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // 1. Ambil daftar tahun unik
    if (action === 'years') {
      const [yearRows]: any = await pool.query(
        `SELECT DISTINCT tahun FROM bitpro_sklb_populasi_sapi_po ORDER BY tahun ASC`
      );
      let years: number[] = yearRows ? yearRows.map((r: any) => Number(r.tahun)).filter(Boolean) : [];
      if (!years.includes(2025)) years.push(2025);
      if (!years.includes(2026)) years.push(2026);
      years = Array.from(new Set<number>(years)).sort((a, b) => a - b);
      return NextResponse.json({ success: true, years });
    }

    const tahun = Number(searchParams.get('tahun')) || 2026;

    // 2. Ambil data populasi Sapi PO pada tahun tersebut
    const [rows]: any = await pool.query(
      `SELECT * FROM bitpro_sklb_populasi_sapi_po WHERE tahun = ? ORDER BY populasi DESC, kecamatan_nama ASC`,
      [tahun]
    );

    const kecMap: Record<string, number> = {};
    let totalPopulasi = 0;
    let triwulan = 'Triwulan 2';

    (rows || []).forEach((r: any) => {
      const cleanId = (r.kecamatan_id || '').toLowerCase().replace('k_', '');
      const pop = Number(r.populasi) || 0;
      kecMap[cleanId] = pop;
      kecMap[`k_${cleanId}`] = pop;
      totalPopulasi += pop;
      if (r.triwulan) triwulan = r.triwulan;
    });

    return NextResponse.json({
      success: true,
      tahun,
      triwulan,
      totalPopulasi,
      kecMap,
      data: rows || [],
    });
  } catch (error: any) {
    console.error('Error GET sklb-sapi-po:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Aksi Tambah Tahun Baru
    if (body.action === 'add_year') {
      const newYear = Number(body.tahun);
      if (!newYear || newYear < 2000) {
        return NextResponse.json({ success: false, error: 'Tahun tidak valid' }, { status: 400 });
      }

      // Ambil template dari tahun terdekat (misal 2026 atau data terbaru)
      const [templateRows]: any = await pool.query(
        `SELECT kecamatan_id, kecamatan_nama, populasi, triwulan FROM bitpro_sklb_populasi_sapi_po WHERE tahun = 2026`
      );

      if (templateRows && templateRows.length > 0) {
        for (const row of templateRows) {
          await pool.query(
            `INSERT INTO bitpro_sklb_populasi_sapi_po (tahun, kecamatan_id, kecamatan_nama, populasi, triwulan)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE populasi = VALUES(populasi)`,
            [newYear, row.kecamatan_id, row.kecamatan_nama, row.populasi, row.triwulan || 'Triwulan 2']
          );
        }
      }

      return NextResponse.json({ success: true, message: `Periode Tahun ${newYear} berhasil ditambahkan` });
    }

    // Aksi Tambah / Update Satuan Kasus Populasi Sapi PO
    const { tahun, kecamatan_id, kecamatan_nama, populasi, triwulan, keterangan } = body;
    if (!tahun || !kecamatan_id) {
      return NextResponse.json({ success: false, error: 'Tahun dan Kecamatan wajib diisi' }, { status: 400 });
    }

    const cleanKecId = String(kecamatan_id).toLowerCase().replace('k_', '');
    const cleanPop = Number(populasi) || 0;

    await pool.query(
      `INSERT INTO bitpro_sklb_populasi_sapi_po (tahun, kecamatan_id, kecamatan_nama, populasi, triwulan, keterangan)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE populasi = VALUES(populasi), kecamatan_nama = VALUES(kecamatan_nama), triwulan = VALUES(triwulan), keterangan = VALUES(keterangan)`,
      [Number(tahun), cleanKecId, kecamatan_nama || cleanKecId, cleanPop, triwulan || 'Triwulan 2', keterangan || null]
    );

    return NextResponse.json({ success: true, message: 'Data populasi Sapi PO berhasil disimpan' });
  } catch (error: any) {
    console.error('Error POST sklb-sapi-po:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
