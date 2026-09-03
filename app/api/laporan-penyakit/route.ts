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
        `SELECT DISTINCT tahun FROM keswan_laporan_penyakit ORDER BY tahun ASC`
      );
      let years: number[] = yearRows ? yearRows.map((r: any) => Number(r.tahun)).filter(Boolean) : [];
      if (!years.includes(2025)) years.push(2025);
      if (!years.includes(2026)) years.push(2026);
      years = Array.from(new Set<number>(years)).sort((a, b) => a - b);
      return NextResponse.json({ success: true, years });
    }

    const tahun = Number(searchParams.get('tahun')) || 2025;

    // 2. Ambil seluruh data kasus pada tahun tersebut
    const [rows]: any = await pool.query(
      `SELECT * FROM keswan_laporan_penyakit WHERE tahun = ? ORDER BY id DESC`,
      [tahun]
    );

    // 3. Hitung agregat per kecamatan
    const kecAggregates: Record<string, { total: number; cases: Record<string, number> }> = {};
    const diagnosaTotals: Record<string, number> = {};

    (rows || []).forEach((r: any) => {
      const rawId = (r.kecamatan_id || '').toLowerCase();
      const cleanId = rawId.replace('k_', '');
      const diag = r.diagnosa_nama;
      const count = Number(r.jumlah_kasus) || 0;

      [cleanId, `k_${cleanId}`].forEach((kId) => {
        if (!kecAggregates[kId]) {
          kecAggregates[kId] = { total: 0, cases: {} };
        }
        kecAggregates[kId].total += count;
        kecAggregates[kId].cases[diag] = (kecAggregates[kId].cases[diag] || 0) + count;
      });

      diagnosaTotals[diag] = (diagnosaTotals[diag] || 0) + count;
    });

    return NextResponse.json({
      success: true,
      tahun,
      data: rows || [],
      kecAggregates,
      diagnosaTotals,
      totalKasus: (rows || []).reduce((acc: number, r: any) => acc + (Number(r.jumlah_kasus) || 0), 0),
    });
  } catch (error: any) {
    console.error('Error GET laporan-penyakit:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, tahun, kecamatan_id, kecamatan_nama, puskeswan_id, diagnosa_nama, kategori_penyakit, jumlah_kasus, keterangan } = body;

    // 1. Action Tambah Tahun Baru
    if (action === 'add_year') {
      const newYear = Number(tahun);
      if (!newYear || newYear < 2000) {
        return NextResponse.json({ success: false, error: 'Tahun tidak valid' }, { status: 400 });
      }

      // Salin data default atau masukkan placeholder
      await pool.query(
        `INSERT INTO keswan_laporan_penyakit (tahun, kecamatan_id, kecamatan_nama, puskeswan_id, diagnosa_nama, jumlah_kasus)
         VALUES (?, 'alian', 'Alian', 'alian', 'Scabies', 0)
         ON DUPLICATE KEY UPDATE tahun=VALUES(tahun)`,
        [newYear]
      );
      return NextResponse.json({ success: true, message: `Tahun ${newYear} berhasil ditambahkan!` });
    }

    // 2. Tambah Kasus Penyakit Baru (Admin / Operator)
    if (!kecamatan_id || !diagnosa_nama) {
      return NextResponse.json({ success: false, error: 'Kecamatan dan Diagnosa Penyakit wajib diisi' }, { status: 400 });
    }

    const [insertResult]: any = await pool.query(
      `INSERT INTO keswan_laporan_penyakit (
        tahun, kecamatan_id, kecamatan_nama, puskeswan_id, diagnosa_nama, kategori_penyakit, jumlah_kasus, keterangan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(tahun) || 2025,
        kecamatan_id.toLowerCase().trim(),
        kecamatan_nama || kecamatan_id,
        puskeswan_id || 'kebumen',
        diagnosa_nama,
        kategori_penyakit || 'Umum',
        Number(jumlah_kasus) || 0,
        keterangan || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Data kasus penyakit berhasil ditambahkan',
      id: insertResult.insertId,
    });
  } catch (error: any) {
    console.error('Error POST laporan-penyakit:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
