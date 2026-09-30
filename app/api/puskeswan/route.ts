import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

// Fallback data awal jika database belum dibuat oleh rekan user
const fallbackData = [
  { id: 1, bulan: 'JANUARI', no: 1, puskeswan: 'MIRIT', bef: 2, cacingan: 70, scabies: 0, orf: 0, pmk_diag: 0, lsd_diag: 5, aktif: 127, semi_aktif: 5, pasif: 0, pusling: 127, ib: 160, pkb: 12, pmk_vaks: 0, lsd_vaks: 0, retribusi: 1750000 },
  { id: 2, bulan: 'JANUARI', no: 2, puskeswan: 'KLIRONG', bef: 10, cacingan: 60, scabies: 7, orf: 0, pmk_diag: 5, lsd_diag: 3, aktif: 125, semi_aktif: 6, pasif: 4, pusling: 125, ib: 94, pkb: 25, pmk_vaks: 25, lsd_vaks: 0, retribusi: 2500000 },
  { id: 3, bulan: 'JANUARI', no: 3, puskeswan: 'GOMBONG', bef: 0, cacingan: 16, scabies: 5, orf: 0, pmk_diag: 3, lsd_diag: 0, aktif: 140, semi_aktif: 43, pasif: 22, pusling: 30, ib: 196, pkb: 31, pmk_vaks: 75, lsd_vaks: 0, retribusi: 3970000 },
  { id: 4, bulan: 'JANUARI', no: 4, puskeswan: 'BUAYAN', bef: 5, cacingan: 16, scabies: 2, orf: 0, pmk_diag: 0, lsd_diag: 0, aktif: 51, semi_aktif: 3, pasif: 0, pusling: 51, ib: 198, pkb: 23, pmk_vaks: 51, lsd_vaks: 0, retribusi: 670000 },
  { id: 5, bulan: 'JANUARI', no: 5, puskeswan: 'ALIAN', bef: 1, cacingan: 25, scabies: 5, orf: 0, pmk_diag: 1, lsd_diag: 4, aktif: 48, semi_aktif: 5, pasif: 7, pusling: 64, ib: 15, pkb: 2, pmk_vaks: 0, lsd_vaks: 0, retribusi: 0 },
  { id: 6, bulan: 'JANUARI', no: 6, puskeswan: 'PREMBUN', bef: 3, cacingan: 70, scabies: 2, orf: 0, pmk_diag: 0, lsd_diag: 3, aktif: 70, semi_aktif: 18, pasif: 4, pusling: 70, ib: 0, pkb: 0, pmk_vaks: 0, lsd_vaks: 0, retribusi: 1360000 },
  { id: 7, bulan: 'JANUARI', no: 7, puskeswan: 'KEBUMEN', bef: 10, cacingan: 77, scabies: 2, orf: 0, pmk_diag: 0, lsd_diag: 10, aktif: 77, semi_aktif: 20, pasif: 3, pusling: 51, ib: 47, pkb: 47, pmk_vaks: 71, lsd_vaks: 60, retribusi: 1600000 },
  { id: 8, bulan: 'JANUARI', no: 8, puskeswan: 'KARANGANYAR', bef: 8, cacingan: 16, scabies: 9, orf: 7, pmk_diag: 4, lsd_diag: 2, aktif: 38, semi_aktif: 5, pasif: 0, pusling: 38, ib: 72, pkb: 26, pmk_vaks: 30, lsd_vaks: 0, retribusi: 565000 },
];

const VALID_FIELDS = [
  'bef', 'cacingan', 'scabies', 'orf', 'pmk_diag', 'lsd_diag',
  'aktif', 'semi_aktif', 'pasif', 'pusling', 'ib', 'pkb',
  'pmk_vaks', 'lsd_vaks', 'retribusi', 'no_urut', 'puskeswan', 'bulan'
];

const DISEASE_FIELDS = ['bef', 'cacingan', 'scabies', 'orf', 'pmk_diag', 'lsd_diag'];

const DIAG_NAME_MAP: Record<string, string> = {
  bef: 'BEF',
  cacingan: 'Cacingan',
  scabies: 'Scabies',
  orf: 'ORF',
  pmk_diag: 'PMK',
  lsd_diag: 'LSD',
};

const PUSKESWAN_ID_MAP: Record<string, number> = {
  MIRIT: 1,
  KLIRONG: 2,
  GOMBONG: 3,
  BUAYAN: 4,
  ALIAN: 5,
  PREMBUN: 6,
  KEBUMEN: 7,
  KARANGANYAR: 8,
};

async function ensureTable() {
  try {
    // 1. Pastikan tabel laporan_puskeswan ada dengan kolom-kolom pelayanan
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS laporan_puskeswan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tahun VARCHAR(10) DEFAULT '2026',
        bulan VARCHAR(50) NOT NULL,
        no_urut INT NOT NULL DEFAULT 1,
        puskeswan VARCHAR(100) NOT NULL,
        id_puskeswan INT,
        aktif INT DEFAULT 0,
        semi_aktif INT DEFAULT 0,
        pasif INT DEFAULT 0,
        pusling INT DEFAULT 0,
        ib INT DEFAULT 0,
        pkb INT DEFAULT 0,
        pmk_vaks INT DEFAULT 0,
        lsd_vaks INT DEFAULT 0,
        retribusi BIGINT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_bulan_puskeswan (bulan, puskeswan)
      ) ENGINE=InnoDB;
    `);

    // Pastikan kolom id_puskeswan ada di laporan_puskeswan
    try {
      await pool.execute('ALTER TABLE laporan_puskeswan ADD COLUMN id_puskeswan INT');
    } catch {}

    // 2. Pastikan tabel keswan_laporan_penyakit ada
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS keswan_laporan_penyakit (
        id_laporan_penyakit INT AUTO_INCREMENT PRIMARY KEY,
        tahun INT DEFAULT 2026,
        bulan VARCHAR(50) NOT NULL,
        id_puskeswan INT NOT NULL,
        id_diagnosa INT NOT NULL,
        kategori_penyakit VARCHAR(100) DEFAULT 'Umum',
        jumlah_kasus INT DEFAULT 0,
        keterangan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 3. Pastikan diagnosa ORF terdaftar di tabel diagnosa
    try {
      const [orfRows]: any = await pool.query("SELECT id_diagnosa FROM diagnosa WHERE LOWER(diagnosa_nama) = 'orf'");
      if (!orfRows || orfRows.length === 0) {
        await pool.query("INSERT INTO diagnosa (diagnosa_nama, kategori_penyakit) VALUES ('ORF', 'Umum')");
      }
    } catch {}
  } catch (e: any) {
    console.warn('Gagal memastikan tabel laporan_puskeswan / keswan_laporan_penyakit:', e.message);
  }
}

export async function GET() {
  try {
    await ensureTable();

    // Cek apakah laporan_puskeswan memiliki data, jika 0 baris, isi template awal
    const [countRows]: any = await pool.query('SELECT COUNT(*) as c FROM laporan_puskeswan');
    if (!countRows || countRows[0].c === 0) {
      // Seed data awal non-penyakit
      for (const item of fallbackData) {
        const idPusk = PUSKESWAN_ID_MAP[item.puskeswan?.toUpperCase()] || item.no;
        try {
          await pool.execute(
            `INSERT INTO laporan_puskeswan 
            (tahun, bulan, no_urut, puskeswan, id_puskeswan, aktif, semi_aktif, pasif, pusling, ib, pkb, pmk_vaks, lsd_vaks, retribusi)
            VALUES ('2026', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
              no_urut = VALUES(no_urut), 
              id_puskeswan = VALUES(id_puskeswan),
              aktif = VALUES(aktif), 
              semi_aktif = VALUES(semi_aktif), 
              pasif = VALUES(pasif), 
              pusling = VALUES(pusling), 
              ib = VALUES(ib), 
              pkb = VALUES(pkb), 
              pmk_vaks = VALUES(pmk_vaks), 
              lsd_vaks = VALUES(lsd_vaks), 
              retribusi = VALUES(retribusi)`,
            [
              item.bulan, item.no, item.puskeswan, idPusk,
              item.aktif, item.semi_aktif, item.pasif,
              item.pusling, item.ib, item.pkb, item.pmk_vaks, item.lsd_vaks, item.retribusi
            ]
          );
        } catch {}
      }

      // Seed 12 bulan template untuk 8 puskeswan
      const ALL_MONTHS = [
        'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
        'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
      ];
      const DAFTAR_PUSKESWAN_8 = [
        'MIRIT', 'KLIRONG', 'GOMBONG', 'BUAYAN',
        'ALIAN', 'PREMBUN', 'KEBUMEN', 'KARANGANYAR'
      ];

      for (const bln of ALL_MONTHS) {
        for (let i = 0; i < DAFTAR_PUSKESWAN_8.length; i++) {
          const pusk = DAFTAR_PUSKESWAN_8[i];
          const idPusk = PUSKESWAN_ID_MAP[pusk] || (i + 1);
          try {
            await pool.execute(
              `INSERT INTO laporan_puskeswan (tahun, bulan, no_urut, puskeswan, id_puskeswan)
               VALUES ('2026', ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE no_urut = VALUES(no_urut), id_puskeswan = VALUES(id_puskeswan)`,
              [bln, i + 1, pusk, idPusk]
            );
          } catch {}
        }
      }
    }

    // Ambil data rekapitulasi pelayanan dari laporan_puskeswan
    const [allRows]: any = await pool.execute(`
      SELECT * FROM laporan_puskeswan 
      ORDER BY 
        CASE 
          WHEN bulan = 'JANUARI' THEN 1
          WHEN bulan = 'FEBRUARI' THEN 2
          WHEN bulan = 'MARET' THEN 3
          WHEN bulan = 'APRIL' THEN 4
          WHEN bulan = 'MEI' THEN 5
          WHEN bulan = 'JUNI' THEN 6
          WHEN bulan = 'JULI' THEN 7
          WHEN bulan = 'AGUSTUS' THEN 8
          WHEN bulan = 'SEPTEMBER' THEN 9
          WHEN bulan = 'OKTOBER' THEN 10
          WHEN bulan = 'NOVEMBER' THEN 11
          WHEN bulan = 'DESEMBER' THEN 12
          ELSE 13
        END,
        no_urut ASC
    `);

    // Ambil data penyakit dari tabel keswan_laporan_penyakit
    let diseaseMap: Record<string, number> = {};
    try {
      const [disRows]: any = await pool.query(`
        SELECT 
          lp.tahun,
          UPPER(TRIM(lp.bulan)) as bulan,
          lp.id_puskeswan,
          LOWER(TRIM(d.diagnosa_nama)) as diagnosa_nama,
          SUM(lp.jumlah_kasus) as total_kasus
        FROM keswan_laporan_penyakit lp
        JOIN diagnosa d ON lp.id_diagnosa = d.id_diagnosa
        GROUP BY lp.tahun, UPPER(TRIM(lp.bulan)), lp.id_puskeswan, LOWER(TRIM(d.diagnosa_nama))
      `);

      if (disRows && disRows.length > 0) {
        for (const r of disRows) {
          const yr = String(r.tahun || '2026');
          const bln = String(r.bulan || '').toUpperCase();
          const idP = Number(r.id_puskeswan) || 0;
          const diag = String(r.diagnosa_nama || '').toLowerCase();
          diseaseMap[`${yr}_${bln}_${idP}_${diag}`] = Number(r.total_kasus) || 0;
        }
      }
    } catch (e) {
      console.warn('Gagal membaca keswan_laporan_penyakit:', e);
    }

    // Gabungkan data pelayanan dan data penyakit
    const dataFormatted = (allRows || []).map((r: any) => {
      const rowYear = String(r.tahun || '2026');
      const rowMonth = String(r.bulan || '').toUpperCase();
      const cleanPusk = String(r.puskeswan || '').toUpperCase().trim();
      const idPusk = Number(r.id_puskeswan || PUSKESWAN_ID_MAP[cleanPusk] || r.no_urut || 0);

      const getDiagVal = (diagKey: string, alias: string) => {
        const fromRel = diseaseMap[`${rowYear}_${rowMonth}_${idPusk}_${diagKey}`];
        if (fromRel !== undefined) return fromRel;
        return Number(r[alias] || 0);
      };

      return {
        ...r,
        no: Number(r.no_urut || r.no || 0),
        bef: getDiagVal('bef', 'bef'),
        cacingan: getDiagVal('cacingan', 'cacingan'),
        scabies: getDiagVal('scabies', 'scabies'),
        orf: getDiagVal('orf', 'orf'),
        pmk_diag: getDiagVal('pmk', 'pmk_diag'),
        lsd_diag: getDiagVal('lsd', 'lsd_diag'),
        aktif: Number(r.aktif ?? r.sispel_aktif ?? 0),
        semi_aktif: Number(r.semi_aktif ?? r.sispel_semi_aktif ?? 0),
        pasif: Number(r.pasif ?? r.sispel_pasif ?? 0),
        pusling: Number(r.pusling || 0),
        ib: Number(r.ib || 0),
        pkb: Number(r.pkb || 0),
        pmk_vaks: Number(r.pmk_vaks || 0),
        lsd_vaks: Number(r.lsd_vaks || 0),
        retribusi: Number(r.retribusi || 0)
      };
    });

    return NextResponse.json({ success: true, data: dataFormatted });
  } catch (error: any) {
    console.warn('DB belum aktif atau gagal koneksi, menggunakan fallback:', error.message);
    return NextResponse.json({ success: true, data: fallbackData, isFallback: true });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { bulan, puskeswan, field, value, tahun } = body;

    if (!bulan || !puskeswan || !field) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap.' }, { status: 400 });
    }

    const tahunStr = String(tahun || '2026');
    const cleanBulan = String(bulan).toUpperCase().trim();
    const cleanPusk = String(puskeswan).toUpperCase().trim();

    // Validasi Pembatasan Wilayah Kerja Petugas & Batas Waktu 3 Hari (Grace Period)
    const { validateAreaAccess } = await import('@/lib/areaRestriction');
    const areaCheck = await validateAreaAccess(request, null, puskeswan, {
      bulan: cleanBulan,
      tahun: tahunStr,
    });
    if (!areaCheck.allowed && areaCheck.errorResponse) {
      return areaCheck.errorResponse;
    }

    if (!VALID_FIELDS.includes(field)) {
      return NextResponse.json({ success: false, error: 'Kolom tidak valid.' }, { status: 400 });
    }

    const numValue = Number(value) || 0;

    await ensureTable();

    const session = await getSessionFromRequest(request as any);
    const userName = session?.nama || session?.nip_username || request.headers.get('x-user-name') || 'Petugas';

    // ── KONDISI 1: JIKA YANG DIEDIT ADALAH KASUS PENYAKIT ──
    // Simpan ke tabel keswan_laporan_penyakit
    if (DISEASE_FIELDS.includes(field)) {
      const idPuskeswan = PUSKESWAN_ID_MAP[cleanPusk] || 1;
      const diagNamaTarget = DIAG_NAME_MAP[field] || field;

      // Cari atau buat id_diagnosa
      let idDiagnosa = 1;
      const [diagRows]: any = await pool.query(
        'SELECT id_diagnosa FROM diagnosa WHERE LOWER(diagnosa_nama) = LOWER(?) LIMIT 1',
        [diagNamaTarget]
      );
      if (diagRows && diagRows.length > 0) {
        idDiagnosa = diagRows[0].id_diagnosa;
      } else {
        const [insDiag]: any = await pool.query(
          'INSERT INTO diagnosa (diagnosa_nama, kategori_penyakit) VALUES (?, "Umum")',
          [diagNamaTarget]
        );
        idDiagnosa = insDiag.insertId;
      }

      // Cek apakah record sudah ada di keswan_laporan_penyakit
      const [existing]: any = await pool.query(
        'SELECT id_laporan_penyakit FROM keswan_laporan_penyakit WHERE tahun = ? AND UPPER(bulan) = ? AND id_puskeswan = ? AND id_diagnosa = ? LIMIT 1',
        [Number(tahunStr), cleanBulan, idPuskeswan, idDiagnosa]
      );

      if (existing && existing.length > 0) {
        await pool.query(
          'UPDATE keswan_laporan_penyakit SET jumlah_kasus = ?, updated_at = NOW() WHERE id_laporan_penyakit = ?',
          [numValue, existing[0].id_laporan_penyakit]
        );
      } else {
        await pool.query(
          'INSERT INTO keswan_laporan_penyakit (tahun, bulan, id_puskeswan, id_diagnosa, kategori_penyakit, jumlah_kasus) VALUES (?, ?, ?, ?, "Umum", ?)',
          [Number(tahunStr), cleanBulan, idPuskeswan, idDiagnosa, numValue]
        );
      }

      // Opsional: jika kolom di laporan_puskeswan masih ada di beberapa DB, update juga agar selaras
      try {
        await pool.execute(
          `UPDATE laporan_puskeswan SET ${field} = ? WHERE UPPER(bulan) = ? AND UPPER(puskeswan) = ?`,
          [numValue, cleanBulan, cleanPusk]
        );
      } catch {}

      await logActivity({
        module: 'keswan',
        submenu: 'puskeswan',
        tableName: 'keswan_laporan_penyakit',
        recordId: `${cleanBulan}-${cleanPusk}-${diagNamaTarget}`,
        action: 'UPDATE',
        userName,
        details: {
          bulan: cleanBulan,
          puskeswan: cleanPusk,
          diagnosa: diagNamaTarget,
          nilai_baru: numValue,
          keterangan: `Pembaruan kasus ${diagNamaTarget} untuk Puskeswan ${cleanPusk} (${cleanBulan} ${tahunStr})`,
        },
      });

      return NextResponse.json({ success: true, message: 'Data diagnosis penyakit berhasil diperbarui di database.' });
    }

    // ── KONDISI 2: JIKA YANG DIEDIT ADALAH INDIKATOR PELAYANAN ──
    // Simpan ke tabel laporan_puskeswan
    const idPuskeswan = PUSKESWAN_ID_MAP[cleanPusk] || 1;
    await pool.execute(
      `INSERT INTO laporan_puskeswan (tahun, bulan, puskeswan, id_puskeswan, ${field})
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE ${field} = VALUES(${field}), id_puskeswan = VALUES(id_puskeswan)`,
      [tahunStr, cleanBulan, cleanPusk, idPuskeswan, numValue]
    );

    await logActivity({
      module: 'keswan',
      submenu: 'puskeswan',
      tableName: 'laporan_puskeswan',
      recordId: `${cleanBulan}-${cleanPusk}`,
      action: 'UPDATE',
      userName,
      details: {
        bulan: cleanBulan,
        puskeswan: cleanPusk,
        field,
        nilai_baru: numValue,
        keterangan: `Pembaruan data indikator ${field.toUpperCase()} untuk Puskeswan ${cleanPusk} (${cleanBulan})`,
      },
    });

    return NextResponse.json({ success: true, message: 'Data pelayanan puskeswan berhasil diperbarui di database.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

