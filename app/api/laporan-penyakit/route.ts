import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';
import { getZoneByKecamatanId } from '@/lib/penyakitData';

export const dynamic = 'force-dynamic';

const PUSKESWAN_HOST_NAMES: Record<number, { id: string; nama: string; code: string }> = {
  1: { id: 'mirit', nama: 'Mirit', code: 'k_mirit' },
  2: { id: 'klirong', nama: 'Klirong', code: 'k_klirong' },
  3: { id: 'gombong', nama: 'Gombong', code: 'k_gombong' },
  4: { id: 'buayan', nama: 'Buayan', code: 'k_buayan' },
  5: { id: 'alian', nama: 'Alian', code: 'k_alian' },
  6: { id: 'prembun', nama: 'Prembun', code: 'k_prembun' },
  7: { id: 'kebumen', nama: 'Kebumen', code: 'k_kebumen' },
  8: { id: 'karanganyar', nama: 'Karanganyar', code: 'k_karanganyar' },
};

const PUSKESWAN_ID_MAP: Record<string, number> = {
  mirit: 1,
  klirong: 2,
  gombong: 3,
  buayan: 4,
  alian: 5,
  prembun: 6,
  kebumen: 7,
  karanganyar: 8,
};

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

    const tahun = Number(searchParams.get('tahun')) || 2026;

    // 2. Ambil seluruh data kasus pada tahun tersebut (termasuk dari lembar kerja puskeswan)
    const [rawRows]: any = await pool.query(
      `SELECT 
        lp.id_laporan_penyakit,
        lp.tahun,
        lp.bulan,
        lp.id_puskeswan,
        lp.id_kecamatan,
        lp.id_diagnosa,
        COALESCE(d.diagnosa_nama, 'Penyakit Hewan') as diagnosa_nama,
        COALESCE(d.kategori_penyakit, lp.kategori_penyakit, 'Umum') as kategori_penyakit,
        lp.jumlah_kasus,
        lp.keterangan,
        COALESCE(k.kecamatan, '') as db_kecamatan_nama,
        lp.created_at,
        lp.updated_at
      FROM keswan_laporan_penyakit lp
      LEFT JOIN diagnosa d ON lp.id_diagnosa = d.id_diagnosa
      LEFT JOIN kecamatan k ON lp.id_kecamatan = k.id_kecamatan
      WHERE lp.tahun = ?
      ORDER BY lp.id_laporan_penyakit DESC`,
      [tahun]
    );

    // 3. Format dan agregasikan kasus
    const kecAggregates: Record<string, { total: number; cases: Record<string, number> }> = {};
    const diagnosaTotals: Record<string, number> = {};

    const formattedData = (rawRows || []).map((r: any) => {
      let kecNama = r.db_kecamatan_nama;
      let rawCode = '';

      if (kecNama) {
        rawCode = `k_${kecNama.toLowerCase().replace(/\s+/g, '')}`;
      } else {
        // Jika tidak tercatat per kecamatan spesifik, petakan ke kecamatan induk Puskeswan bersangkutan
        const host = PUSKESWAN_HOST_NAMES[Number(r.id_puskeswan)] || PUSKESWAN_HOST_NAMES[7];
        kecNama = host.nama;
        rawCode = host.code;
      }

      const cleanId = rawCode.replace(/^k_/, '');
      const diag = r.diagnosa_nama;
      const count = Number(r.jumlah_kasus) || 0;
      const zone = getZoneByKecamatanId(rawCode);

      // Agregasi untuk peta visual spasial
      [cleanId, `k_${cleanId}`].forEach((kId) => {
        if (!kecAggregates[kId]) {
          kecAggregates[kId] = { total: 0, cases: {} };
        }
        kecAggregates[kId].total += count;
        kecAggregates[kId].cases[diag] = (kecAggregates[kId].cases[diag] || 0) + count;
      });

      diagnosaTotals[diag] = (diagnosaTotals[diag] || 0) + count;

      return {
        id: r.id_laporan_penyakit,
        id_laporan_penyakit: r.id_laporan_penyakit,
        tahun: Number(r.tahun),
        bulan: r.bulan,
        kecamatan_id: rawCode,
        kecamatan_nama: kecNama,
        puskeswan_id: zone ? zone.id : (PUSKESWAN_HOST_NAMES[Number(r.id_puskeswan)]?.id || 'kebumen'),
        diagnosa_nama: diag,
        kategori_penyakit: r.kategori_penyakit,
        jumlah_kasus: count,
        keterangan: r.keterangan || '',
        created_at: r.created_at,
        updated_at: r.updated_at,
      };
    });

    return NextResponse.json({
      success: true,
      tahun,
      data: formattedData,
      kecAggregates,
      diagnosaTotals,
      totalKasus: formattedData.reduce((acc: number, r: any) => acc + (Number(r.jumlah_kasus) || 0), 0),
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

      await pool.query(
        `INSERT INTO keswan_laporan_penyakit (tahun, id_puskeswan, id_kecamatan, id_diagnosa, kategori_penyakit, jumlah_kasus)
         VALUES (?, 5, 13, 12, 'Umum', 0)`,
        [newYear]
      );
      return NextResponse.json({ success: true, message: `Tahun ${newYear} berhasil ditambahkan!` });
    }

    // 2. Tambah Kasus Penyakit Baru
    if (!kecamatan_id || !diagnosa_nama) {
      return NextResponse.json({ success: false, error: 'Kecamatan dan Diagnosa Penyakit wajib diisi' }, { status: 400 });
    }

    // Validasi Pembatasan Wilayah Kerja Petugas (Role-Based Area Restriction)
    const targetKec = kecamatan_nama || kecamatan_id;
    const { validateAreaAccess } = await import('@/lib/areaRestriction');
    const areaCheck = await validateAreaAccess(req, targetKec, puskeswan_id);
    if (!areaCheck.allowed && areaCheck.errorResponse) {
      return areaCheck.errorResponse;
    }

    // Cari / buat id_diagnosa
    let idDiagnosa = 1;
    let finalKategori = kategori_penyakit || 'Umum';
    const [diagRows]: any = await pool.query(
      'SELECT id_diagnosa, kategori_penyakit FROM diagnosa WHERE LOWER(diagnosa_nama) = LOWER(?) LIMIT 1',
      [diagnosa_nama.trim()]
    );
    if (diagRows && diagRows.length > 0) {
      idDiagnosa = diagRows[0].id_diagnosa;
      if (diagRows[0].kategori_penyakit) finalKategori = diagRows[0].kategori_penyakit;
    } else {
      const [insDiag]: any = await pool.query(
        'INSERT INTO diagnosa (diagnosa_nama, kategori_penyakit) VALUES (?, ?)',
        [diagnosa_nama.trim(), finalKategori]
      );
      idDiagnosa = insDiag.insertId;
    }

    // Cari id_kecamatan dari nama atau kode kecamatan
    let idKecamatan: number | null = null;
    const cleanKec = (kecamatan_nama || kecamatan_id || '').replace(/^k_/, '').trim();
    const [kecRows]: any = await pool.query(
      'SELECT id_kecamatan FROM kecamatan WHERE LOWER(kecamatan) = LOWER(?) LIMIT 1',
      [cleanKec]
    );
    if (kecRows && kecRows.length > 0) {
      idKecamatan = kecRows[0].id_kecamatan;
    }

    // Cari id_puskeswan
    let idPuskeswan = PUSKESWAN_ID_MAP[(puskeswan_id || '').toLowerCase()];
    if (!idPuskeswan && idKecamatan) {
      const zone = getZoneByKecamatanId(`k_${cleanKec}`);
      idPuskeswan = PUSKESWAN_ID_MAP[zone.id] || 7;
    }
    if (!idPuskeswan) idPuskeswan = 7;

    const [insertResult]: any = await pool.query(
      `INSERT INTO keswan_laporan_penyakit (
        tahun, id_puskeswan, id_kecamatan, id_diagnosa, kategori_penyakit, jumlah_kasus, keterangan
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(tahun) || 2026,
        idPuskeswan,
        idKecamatan,
        idDiagnosa,
        finalKategori,
        Number(jumlah_kasus) || 0,
        keterangan || null,
      ]
    );

    const session = await getSessionFromRequest(req as any);
    const userName = session?.nama || session?.nip_username || 'Sistem';

    await logActivity({
      module: 'keswan',
      submenu: 'laporan-penyakit',
      tableName: 'keswan_laporan_penyakit',
      recordId: insertResult.insertId,
      action: 'CREATE',
      userName,
      details: { tahun, kecamatan_nama: cleanKec, puskeswan_id, diagnosa_nama, jumlah_kasus },
    });

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
