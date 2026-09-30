import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';
import { DIAGNOSA_LIST } from '@/lib/penyakitData';

// Fallback data awal jika database belum siap
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
  MIRIT: 1, mirit: 1,
  KLIRONG: 2, klirong: 2,
  GOMBONG: 3, gombong: 3,
  BUAYAN: 4, buayan: 4,
  ALIAN: 5, alian: 5,
  PREMBUN: 6, prembun: 6,
  KEBUMEN: 7, kebumen: 7,
  KARANGANYAR: 8, karanganyar: 8,
};

const KECAMATAN_CODE_TO_ID: Record<string, number> = {
  k_ayah: 1, ayah: 1,
  k_buayan: 2, buayan: 2,
  k_puring: 3, puring: 3,
  k_petanahan: 4, petanahan: 4,
  k_klirong: 5, klirong: 5,
  k_buluspesantren: 6, buluspesantren: 6,
  k_ambal: 7, ambal: 7,
  k_mirit: 8, mirit: 8,
  k_bonorowo: 9, bonorowo: 9,
  k_prembun: 10, prembun: 10,
  k_padureso: 11, padureso: 11,
  k_kutowinangun: 12, kutowinangun: 12,
  k_alian: 13, alian: 13,
  k_poncowarno: 14, poncowarno: 14,
  k_kebumen: 15, kebumen: 15,
  k_pejagoan: 16, pejagoan: 16,
  k_sruweng: 17, sruweng: 17,
  k_adimulyo: 18, adimulyo: 18,
  k_kuwarasan: 19, kuwarasan: 19,
  k_rowokele: 20, rowokele: 20,
  k_sempor: 21, sempor: 21,
  k_gombong: 22, gombong: 22,
  k_karanganyar: 23, karanganyar: 23,
  k_karanggayam: 24, karanggayam: 24,
  k_sadang: 25, sadang: 25,
  k_karangsambung: 26, karangsambung: 26,
};

const DIAG_ID_TO_NAME: Record<number, string> = {
  1: 'Anthrax',
  2: 'Brucellosis',
  3: 'Rabies',
  4: 'Avian Influenza',
  5: 'Surra',
  6: 'Salmonellosis',
  7: 'BVD',
  8: 'IBR',
  9: 'PMK',
  10: 'LSD',
  11: 'PPR',
  12: 'BEF',
  13: 'Cacingan',
  14: 'Scabies',
  15: 'ORF',
};

function normalizeDiseaseKey(name: string): string {
  const s = (name || '').toLowerCase();
  if (s.includes('bef')) return 'bef';
  if (s.includes('cacing')) return 'cacingan';
  if (s.includes('scabies')) return 'scabies';
  if (s.includes('orf')) return 'orf';
  if (s.includes('pmk') || s.includes('mulut')) return 'pmk';
  if (s.includes('lsd') || s.includes('lumpy')) return 'lsd';
  return s;
}

// Pemetaan 26 Kecamatan Binaan Resmi per Puskeswan di Kebumen
const PUSKESWAN_BINAAN_MAP: Record<number, { id_kecamatan: number; nama_kecamatan: string; code: string }[]> = {
  1: [ // Puskeswan Mirit
    { id_kecamatan: 8, nama_kecamatan: 'Mirit', code: 'k_mirit' },
    { id_kecamatan: 7, nama_kecamatan: 'Ambal', code: 'k_ambal' },
    { id_kecamatan: 9, nama_kecamatan: 'Bonorowo', code: 'k_bonorowo' },
  ],
  2: [ // Puskeswan Klirong
    { id_kecamatan: 5, nama_kecamatan: 'Klirong', code: 'k_klirong' },
    { id_kecamatan: 4, nama_kecamatan: 'Petanahan', code: 'k_petanahan' },
    { id_kecamatan: 18, nama_kecamatan: 'Adimulyo', code: 'k_adimulyo' },
  ],
  3: [ // Puskeswan Gombong
    { id_kecamatan: 22, nama_kecamatan: 'Gombong', code: 'k_gombong' },
    { id_kecamatan: 21, nama_kecamatan: 'Sempor', code: 'k_sempor' },
    { id_kecamatan: 19, nama_kecamatan: 'Kuwarasan', code: 'k_kuwarasan' },
    { id_kecamatan: 3, nama_kecamatan: 'Puring', code: 'k_puring' },
  ],
  4: [ // Puskeswan Buayan
    { id_kecamatan: 2, nama_kecamatan: 'Buayan', code: 'k_buayan' },
    { id_kecamatan: 1, nama_kecamatan: 'Ayah', code: 'k_ayah' },
    { id_kecamatan: 20, nama_kecamatan: 'Rowokele', code: 'k_rowokele' },
  ],
  5: [ // Puskeswan Alian
    { id_kecamatan: 13, nama_kecamatan: 'Alian', code: 'k_alian' },
    { id_kecamatan: 25, nama_kecamatan: 'Sadang', code: 'k_sadang' },
    { id_kecamatan: 26, nama_kecamatan: 'Karangsambung', code: 'k_karangsambung' },
  ],
  6: [ // Puskeswan Prembun
    { id_kecamatan: 10, nama_kecamatan: 'Prembun', code: 'k_prembun' },
    { id_kecamatan: 11, nama_kecamatan: 'Padureso', code: 'k_padureso' },
    { id_kecamatan: 12, nama_kecamatan: 'Kutowinangun', code: 'k_kutowinangun' },
  ],
  7: [ // Puskeswan Kebumen
    { id_kecamatan: 15, nama_kecamatan: 'Kebumen', code: 'k_kebumen' },
    { id_kecamatan: 6, nama_kecamatan: 'Buluspesantren', code: 'k_buluspesantren' },
    { id_kecamatan: 14, nama_kecamatan: 'Poncowarno', code: 'k_poncowarno' },
  ],
  8: [ // Puskeswan Karanganyar
    { id_kecamatan: 23, nama_kecamatan: 'Karanganyar', code: 'k_karanganyar' },
    { id_kecamatan: 24, nama_kecamatan: 'Karanggayam', code: 'k_karanggayam' },
    { id_kecamatan: 16, nama_kecamatan: 'Pejagoan', code: 'k_pejagoan' },
    { id_kecamatan: 17, nama_kecamatan: 'Sruweng', code: 'k_sruweng' },
  ],
};

async function ensureTable() {
  try {
    // 1. Pastikan tabel laporan_puskeswan ada
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
        id_kecamatan INT NULL,
        id_diagnosa INT NOT NULL,
        kategori_penyakit VARCHAR(100) DEFAULT 'Umum',
        jumlah_kasus INT DEFAULT 0,
        keterangan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    try {
      await pool.execute('ALTER TABLE keswan_laporan_penyakit ADD COLUMN id_kecamatan INT NULL AFTER id_puskeswan');
    } catch {}

    // 3. Pastikan tabel laporan_puskeswan_kecamatan ada (menyimpan rincian layanan per kecamatan)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS laporan_puskeswan_kecamatan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tahun VARCHAR(10) DEFAULT '2026',
        bulan VARCHAR(50) NOT NULL,
        id_puskeswan INT NOT NULL,
        id_kecamatan INT NOT NULL DEFAULT 0,
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
        UNIQUE KEY uq_bln_pusk_kec (tahun, bulan, id_puskeswan, id_kecamatan)
      ) ENGINE=InnoDB;
    `);

    // 4. Pastikan tabel diagnosa ada dan berisi seluruh jenis diagnosa standar
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS diagnosa (
        id_diagnosa INT AUTO_INCREMENT PRIMARY KEY,
        diagnosa_nama VARCHAR(100) NOT NULL,
        kategori_penyakit VARCHAR(100) DEFAULT 'Umum',
        keterangan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_diag_nama (diagnosa_nama)
      ) ENGINE=InnoDB;
    `);

    try {
      const [diagCount]: any = await pool.query('SELECT COUNT(*) as c FROM diagnosa');
      if (!diagCount || diagCount[0]?.c === 0) {
        for (const d of DIAGNOSA_LIST) {
          await pool.query(
            'INSERT IGNORE INTO diagnosa (diagnosa_nama, kategori_penyakit) VALUES (?, ?)',
            [d.nama, d.kategori || 'Umum']
          );
        }
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

    // 1. Ambil data induk laporan_puskeswan
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

    // 2. Ambil data rincian pelayanan per kecamatan dari laporan_puskeswan_kecamatan
    let kecServiceMap: Record<string, any> = {};
    try {
      const [kecServRows]: any = await pool.query('SELECT * FROM laporan_puskeswan_kecamatan');
      if (kecServRows && kecServRows.length > 0) {
        for (const ks of kecServRows) {
          const yr = String(ks.tahun || '2026');
          const bln = String(ks.bulan || '').toUpperCase().trim();
          const idP = Number(ks.id_puskeswan) || 0;
          const idK = Number(ks.id_kecamatan) || 0;
          kecServiceMap[`${yr}_${bln}_${idP}_${idK}`] = ks;
        }
      }
    } catch (e) {
      console.warn('Gagal membaca laporan_puskeswan_kecamatan:', e);
    }

    // 3. Ambil data penyakit dari tabel keswan_laporan_penyakit (Adaptive skema Flat dan Relasional)
    let diseaseMap: Record<string, number> = {};
    try {
      const [disRows]: any = await pool.query(`SELECT * FROM keswan_laporan_penyakit`);
      if (disRows && disRows.length > 0) {
        for (const r of disRows) {
          const yr = String(r.tahun || '2026');
          const bln = String(r.bulan || '').toUpperCase().trim();

          // Tentukan id puskeswan (angka 1-8)
          let idP = Number(r.id_puskeswan) || 0;
          if (!idP && r.puskeswan_id) {
            idP = PUSKESWAN_ID_MAP[String(r.puskeswan_id).toUpperCase()] || 0;
          }

          // Tentukan id kecamatan (angka 1-26 atau 0)
          let idK = Number(r.id_kecamatan) || 0;
          if (!idK && r.kecamatan_id) {
            const rawKec = String(r.kecamatan_id).toLowerCase().trim();
            idK = KECAMATAN_CODE_TO_ID[rawKec] || KECAMATAN_CODE_TO_ID[`k_${rawKec.replace(/^k_/, '')}`] || 0;
          }

          // Tentukan diagnosa
          let rawDiag = '';
          if (r.diagnosa_nama) {
            rawDiag = String(r.diagnosa_nama).trim();
          } else if (r.id_diagnosa) {
            rawDiag = DIAG_ID_TO_NAME[Number(r.id_diagnosa)] || '';
          }

          if (rawDiag) {
            const normDiag = normalizeDiseaseKey(rawDiag);
            const key = `${yr}_${bln}_${idP}_${idK}_${normDiag}`;
            diseaseMap[key] = (diseaseMap[key] || 0) + (Number(r.jumlah_kasus) || 0);
          }
        }
      }
    } catch (e) {
      console.warn('Gagal membaca keswan_laporan_penyakit:', e);
    }

    // 4. Bangun data terintegrasi: Puskeswan Parent + Rincian Kecamatan (Accordion)
    const dataFormatted = (allRows || []).map((r: any) => {
      const rowYear = String(r.tahun || '2026');
      const rowMonth = String(r.bulan || '').toUpperCase().trim();
      const cleanPusk = String(r.puskeswan || '').toUpperCase().trim();
      const idPusk = Number(r.id_puskeswan || PUSKESWAN_ID_MAP[cleanPusk] || r.no_urut || 0);

      // Ambil daftar wilayah binaan resmi untuk puskeswan ini
      const binaanList = PUSKESWAN_BINAAN_MAP[idPusk] || [];

      // Sub-baris untuk tiap kecamatan binaan
      const subRows = binaanList.map((kec) => {
        const ks = kecServiceMap[`${rowYear}_${rowMonth}_${idPusk}_${kec.id_kecamatan}`] || {};
        const getKecDiag = (diagKey: string) => {
          return diseaseMap[`${rowYear}_${rowMonth}_${idPusk}_${kec.id_kecamatan}_${diagKey}`] || 0;
        };

        return {
          id_kecamatan: kec.id_kecamatan,
          nama_kecamatan: `Kec. ${kec.nama_kecamatan}`,
          code: kec.code,
          isUnassigned: false,
          bef: getKecDiag('bef'),
          cacingan: getKecDiag('cacingan'),
          scabies: getKecDiag('scabies'),
          orf: getKecDiag('orf'),
          pmk_diag: getKecDiag('pmk'),
          lsd_diag: getKecDiag('lsd'),
          aktif: Number(ks.aktif || 0),
          semi_aktif: Number(ks.semi_aktif || 0),
          pasif: Number(ks.pasif || 0),
          pusling: Number(ks.pusling || 0),
          ib: Number(ks.ib || 0),
          pkb: Number(ks.pkb || 0),
          pmk_vaks: Number(ks.pmk_vaks || 0),
          lsd_vaks: Number(ks.lsd_vaks || 0),
          retribusi: Number(ks.retribusi || 0),
        };
      });

      // Sub-baris untuk Tanpa Kecamatan / Umum (id_kecamatan = 0)
      const unassignedKs = kecServiceMap[`${rowYear}_${rowMonth}_${idPusk}_0`] || {};
      const getUnassignedDiag = (diagKey: string) => {
        return diseaseMap[`${rowYear}_${rowMonth}_${idPusk}_0_${diagKey}`] || 0;
      };

      // Cek apakah ada data legacy di parent row laporan_puskeswan saat belum dipecah ke kecamatan
      const subRowsSumBef = subRows.reduce((a, b) => a + b.bef, 0);
      const subRowsSumAktif = subRows.reduce((a, b) => a + b.aktif, 0);

      const unassignedBef = getUnassignedDiag('bef') || (subRowsSumBef === 0 ? Number(r.bef || 0) : 0);
      const unassignedCacing = getUnassignedDiag('cacingan') || (subRows.reduce((a, b) => a + b.cacingan, 0) === 0 ? Number(r.cacingan || 0) : 0);
      const unassignedScabies = getUnassignedDiag('scabies') || (subRows.reduce((a, b) => a + b.scabies, 0) === 0 ? Number(r.scabies || 0) : 0);
      const unassignedOrf = getUnassignedDiag('orf') || (subRows.reduce((a, b) => a + b.orf, 0) === 0 ? Number(r.orf || 0) : 0);
      const unassignedPmk = getUnassignedDiag('pmk') || (subRows.reduce((a, b) => a + b.pmk_diag, 0) === 0 ? Number(r.pmk_diag || 0) : 0);
      const unassignedLsd = getUnassignedDiag('lsd') || (subRows.reduce((a, b) => a + b.lsd_diag, 0) === 0 ? Number(r.lsd_diag || 0) : 0);

      const unassignedRow = {
        id_kecamatan: 0,
        nama_kecamatan: 'Tanpa Kecamatan / Umum',
        code: '',
        isUnassigned: true,
        bef: unassignedBef,
        cacingan: unassignedCacing,
        scabies: unassignedScabies,
        orf: unassignedOrf,
        pmk_diag: unassignedPmk,
        lsd_diag: unassignedLsd,
        aktif: Number(unassignedKs.aktif ?? (subRowsSumAktif === 0 ? (r.aktif ?? r.sispel_aktif ?? 0) : 0)),
        semi_aktif: Number(unassignedKs.semi_aktif ?? (subRows.reduce((a, b) => a + b.semi_aktif, 0) === 0 ? (r.semi_aktif ?? r.sispel_semi_aktif ?? 0) : 0)),
        pasif: Number(unassignedKs.pasif ?? (subRows.reduce((a, b) => a + b.pasif, 0) === 0 ? (r.pasif ?? r.sispel_pasif ?? 0) : 0)),
        pusling: Number(unassignedKs.pusling ?? (subRows.reduce((a, b) => a + b.pusling, 0) === 0 ? (r.pusling || 0) : 0)),
        ib: Number(unassignedKs.ib ?? (subRows.reduce((a, b) => a + b.ib, 0) === 0 ? (r.ib || 0) : 0)),
        pkb: Number(unassignedKs.pkb ?? (subRows.reduce((a, b) => a + b.pkb, 0) === 0 ? (r.pkb || 0) : 0)),
        pmk_vaks: Number(unassignedKs.pmk_vaks ?? (subRows.reduce((a, b) => a + b.pmk_vaks, 0) === 0 ? (r.pmk_vaks || 0) : 0)),
        lsd_vaks: Number(unassignedKs.lsd_vaks ?? (subRows.reduce((a, b) => a + b.lsd_vaks, 0) === 0 ? (r.lsd_vaks || 0) : 0)),
        retribusi: Number(unassignedKs.retribusi ?? (subRows.reduce((a, b) => a + b.retribusi, 0) === 0 ? (r.retribusi || 0) : 0)),
      };

      // Total akumulasi Puskeswan = Penjumlahan seluruh sub-baris kecamatan binaan + umum
      const sumSub = (key: keyof typeof unassignedRow) => {
        const subSum = subRows.reduce((acc, s) => acc + (Number(s[key]) || 0), 0);
        return subSum + (Number(unassignedRow[key]) || 0);
      };

      return {
        ...r,
        no: Number(r.no_urut || r.no || 0),
        id_puskeswan: idPusk,
        subRows: subRows, // HANYA kecamatan binaan resmi (tanpa Tanpa Kecamatan/Umum)
        unassigned: unassignedRow,
        bef: sumSub('bef'),
        cacingan: sumSub('cacingan'),
        scabies: sumSub('scabies'),
        orf: sumSub('orf'),
        pmk_diag: sumSub('pmk_diag'),
        lsd_diag: sumSub('lsd_diag'),
        aktif: sumSub('aktif'),
        semi_aktif: sumSub('semi_aktif'),
        pasif: sumSub('pasif'),
        pusling: sumSub('pusling'),
        ib: sumSub('ib'),
        pkb: sumSub('pkb'),
        pmk_vaks: sumSub('pmk_vaks'),
        lsd_vaks: sumSub('lsd_vaks'),
        retribusi: sumSub('retribusi'),
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
    const { bulan, puskeswan, field, value, tahun, id_kecamatan } = body;

    if (!bulan || !puskeswan || !field) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap.' }, { status: 400 });
    }

    const tahunStr = String(tahun || '2026');
    const cleanBulan = String(bulan).toUpperCase().trim();
    const cleanPusk = String(puskeswan).toUpperCase().trim();
    const kecIdNum = Number(id_kecamatan) || 0; // 0 = Tanpa Kecamatan / Umum
    const idPuskeswan = PUSKESWAN_ID_MAP[cleanPusk] || 1;

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

    // ── KONDISI 1: JIKA YANG DIEDIT ADALAH KASUS PENYAKIT (BEF, Cacingan, Scabies, ORF, PMK, LSD) ──
    // Simpan ke tabel keswan_laporan_penyakit dengan id_kecamatan (Adaptive skema Flat dan Relasional)
    if (DISEASE_FIELDS.includes(field)) {
      const diagNamaTarget = DIAG_NAME_MAP[field] || field;

      let hasDiagNama = false;
      let pkCol = 'id';
      try {
        const [descRows]: any = await pool.query('DESCRIBE keswan_laporan_penyakit');
        const fields = (descRows || []).map((f: any) => f.Field);
        hasDiagNama = fields.includes('diagnosa_nama');
        if (fields.includes('id_laporan_penyakit')) {
          pkCol = 'id_laporan_penyakit';
        }
      } catch {}

      const puskCode = cleanPusk.toLowerCase();
      const kecEntry = PUSKESWAN_BINAAN_MAP[idPuskeswan]?.find(k => k.id_kecamatan === kecIdNum);
      const kecCode = kecEntry ? kecEntry.code : (kecIdNum > 0 ? `k_${kecIdNum}` : null);
      const kecNama = kecEntry ? kecEntry.nama_kecamatan : (kecIdNum > 0 ? `Kecamatan ${kecIdNum}` : null);

      if (hasDiagNama) {
        // Skema flat (Online cPanel)
        let existing: any = [];
        if (kecIdNum > 0) {
          const [rows]: any = await pool.query(
            `SELECT ${pkCol} as id_row FROM keswan_laporan_penyakit 
             WHERE tahun = ? AND UPPER(bulan) = ? 
               AND LOWER(puskeswan_id) = ? 
               AND (kecamatan_id = ? OR kecamatan_id = ?) 
               AND (LOWER(diagnosa_nama) = LOWER(?) OR LOWER(diagnosa_nama) LIKE ?) LIMIT 1`,
            [Number(tahunStr), cleanBulan, puskCode, kecCode, kecCode?.replace(/^k_/, ''), diagNamaTarget, `%${diagNamaTarget.toLowerCase()}%`]
          );
          existing = rows;
        } else {
          const [rows]: any = await pool.query(
            `SELECT ${pkCol} as id_row FROM keswan_laporan_penyakit 
             WHERE tahun = ? AND UPPER(bulan) = ? 
               AND LOWER(puskeswan_id) = ? 
               AND (kecamatan_id IS NULL OR kecamatan_id = '' OR kecamatan_id = '0') 
               AND (LOWER(diagnosa_nama) = LOWER(?) OR LOWER(diagnosa_nama) LIKE ?) LIMIT 1`,
            [Number(tahunStr), cleanBulan, puskCode, diagNamaTarget, `%${diagNamaTarget.toLowerCase()}%`]
          );
          existing = rows;
        }

        if (existing && existing.length > 0) {
          await pool.query(
            `UPDATE keswan_laporan_penyakit SET jumlah_kasus = ?, updated_at = NOW() WHERE ${pkCol} = ?`,
            [numValue, existing[0].id_row]
          );
        } else {
          await pool.query(
            `INSERT INTO keswan_laporan_penyakit (tahun, bulan, puskeswan_id, kecamatan_id, kecamatan_nama, diagnosa_nama, kategori_penyakit, jumlah_kasus) 
             VALUES (?, ?, ?, ?, ?, ?, 'Umum', ?)`,
            [Number(tahunStr), cleanBulan, puskCode, kecCode, kecNama, diagNamaTarget, numValue]
          );
        }
      } else {
        // Skema relasional (Offline local)
        let idDiagnosa = 1;
        try {
          const [diagRows]: any = await pool.query(
            'SELECT id_diagnosa FROM diagnosa WHERE LOWER(diagnosa_nama) = LOWER(?) OR LOWER(diagnosa_nama) LIKE ? LIMIT 1',
            [diagNamaTarget, `%${diagNamaTarget.toLowerCase()}%`]
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
        } catch {}

        let existing: any = [];
        if (kecIdNum > 0) {
          const [rows]: any = await pool.query(
            `SELECT ${pkCol} as id_row FROM keswan_laporan_penyakit 
             WHERE tahun = ? AND UPPER(bulan) = ? AND id_puskeswan = ? AND id_kecamatan = ? AND id_diagnosa = ? LIMIT 1`,
            [Number(tahunStr), cleanBulan, idPuskeswan, kecIdNum, idDiagnosa]
          );
          existing = rows;
        } else {
          const [rows]: any = await pool.query(
            `SELECT ${pkCol} as id_row FROM keswan_laporan_penyakit 
             WHERE tahun = ? AND UPPER(bulan) = ? AND id_puskeswan = ? AND (id_kecamatan IS NULL OR id_kecamatan = 0) AND id_diagnosa = ? LIMIT 1`,
            [Number(tahunStr), cleanBulan, idPuskeswan, idDiagnosa]
          );
          existing = rows;
        }

        if (existing && existing.length > 0) {
          await pool.query(
            `UPDATE keswan_laporan_penyakit SET jumlah_kasus = ?, updated_at = NOW() WHERE ${pkCol} = ?`,
            [numValue, existing[0].id_row]
          );
        } else {
          await pool.query(
            `INSERT INTO keswan_laporan_penyakit (tahun, bulan, id_puskeswan, id_kecamatan, id_diagnosa, kategori_penyakit, jumlah_kasus) 
             VALUES (?, ?, ?, ?, ?, 'Umum', ?)`,
            [Number(tahunStr), cleanBulan, idPuskeswan, kecIdNum > 0 ? kecIdNum : null, idDiagnosa, numValue]
          );
        }
      }

      await logActivity({
        module: 'keswan',
        submenu: 'puskeswan',
        tableName: 'keswan_laporan_penyakit',
        recordId: `${cleanBulan}-${cleanPusk}-${diagNamaTarget}-kec${kecIdNum}`,
        action: 'UPDATE',
        userName,
        details: {
          bulan: cleanBulan,
          puskeswan: cleanPusk,
          id_kecamatan: kecIdNum,
          diagnosa: diagNamaTarget,
          nilai_baru: numValue,
          keterangan: `Pembaruan kasus ${diagNamaTarget} untuk ${cleanPusk} (Kecamatan ID: ${kecIdNum || 'Umum'}) (${cleanBulan} ${tahunStr})`,
        },
      });

      return NextResponse.json({ success: true, message: 'Data diagnosis penyakit berhasil diperbarui.' });
    }

    // ── KONDISI 2: JIKA YANG DIEDIT ADALAH INDIKATOR PELAYANAN ──
    // Simpan ke tabel laporan_puskeswan_kecamatan
    await pool.execute(
      `INSERT INTO laporan_puskeswan_kecamatan (tahun, bulan, id_puskeswan, id_kecamatan, ${field})
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE ${field} = VALUES(${field})`,
      [tahunStr, cleanBulan, idPuskeswan, kecIdNum, numValue]
    );

    // Hitung ulang total akumulasi seluruh kecamatan untuk puskeswan ini pada bulan tersebut
    try {
      const [sumRows]: any = await pool.query(
        `SELECT SUM(${field}) as total_val FROM laporan_puskeswan_kecamatan WHERE tahun = ? AND UPPER(bulan) = ? AND id_puskeswan = ?`,
        [tahunStr, cleanBulan, idPuskeswan]
      );
      const newTotal = Number(sumRows?.[0]?.total_val) || numValue;

      await pool.execute(
        `INSERT INTO laporan_puskeswan (tahun, bulan, puskeswan, id_puskeswan, ${field})
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE ${field} = VALUES(${field}), id_puskeswan = VALUES(id_puskeswan)`,
        [tahunStr, cleanBulan, cleanPusk, idPuskeswan, newTotal]
      );
    } catch (e) {
      console.warn('Gagal sync total laporan_puskeswan:', e);
    }

    await logActivity({
      module: 'keswan',
      submenu: 'puskeswan',
      tableName: 'laporan_puskeswan_kecamatan',
      recordId: `${cleanBulan}-${cleanPusk}-kec${kecIdNum}`,
      action: 'UPDATE',
      userName,
      details: {
        bulan: cleanBulan,
        puskeswan: cleanPusk,
        id_kecamatan: kecIdNum,
        field,
        nilai_baru: numValue,
        keterangan: `Pembaruan data indikator ${field.toUpperCase()} untuk ${cleanPusk} (Kecamatan ID: ${kecIdNum || 'Umum'}) (${cleanBulan})`,
      },
    });

    return NextResponse.json({ success: true, message: 'Data pelayanan berhasil diperbarui.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
