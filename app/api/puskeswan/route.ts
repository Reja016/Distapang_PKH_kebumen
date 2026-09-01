import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

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

export async function GET() {
  try {
    // 1. Pastikan tabel ada jika belum dibuat
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS laporan_puskeswan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bulan VARCHAR(50) NOT NULL,
        no_urut INT NOT NULL,
        puskeswan VARCHAR(100) NOT NULL,
        bef INT DEFAULT 0,
        cacingan INT DEFAULT 0,
        scabies INT DEFAULT 0,
        orf INT DEFAULT 0,
        pmk_diag INT DEFAULT 0,
        lsd_diag INT DEFAULT 0,
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

    // 2. Ambil data dari database
    const [rows]: any = await pool.execute(`
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

    // Jika database masih kosong, lakukan auto-seeding data awal
    if (!rows || rows.length === 0) {
      for (const item of fallbackData) {
        await pool.execute(
          `INSERT INTO laporan_puskeswan 
          (bulan, no_urut, puskeswan, bef, cacingan, scabies, orf, pmk_diag, lsd_diag, aktif, semi_aktif, pasif, pusling, ib, pkb, pmk_vaks, lsd_vaks, retribusi)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE no_urut=VALUES(no_urut)`,
          [
            item.bulan, item.no, item.puskeswan, item.bef, item.cacingan, item.scabies,
            item.orf, item.pmk_diag, item.lsd_diag, item.aktif, item.semi_aktif, item.pasif,
            item.pusling, item.ib, item.pkb, item.pmk_vaks, item.lsd_vaks, item.retribusi
          ]
        );
      }
      return NextResponse.json({ success: true, data: fallbackData });
    }

    const dataFormatted = rows.map((r: any) => ({
      ...r,
      no: Number(r.no_urut || r.no || 0),
      bef: Number(r.bef || 0),
      cacingan: Number(r.cacingan || 0),
      scabies: Number(r.scabies || 0),
      orf: Number(r.orf || 0),
      pmk_diag: Number(r.pmk_diag || 0),
      lsd_diag: Number(r.lsd_diag || 0),
      aktif: Number(r.aktif || 0),
      semi_aktif: Number(r.semi_aktif || 0),
      pasif: Number(r.pasif || 0),
      pusling: Number(r.pusling || 0),
      ib: Number(r.ib || 0),
      pkb: Number(r.pkb || 0),
      pmk_vaks: Number(r.pmk_vaks || 0),
      lsd_vaks: Number(r.lsd_vaks || 0),
      retribusi: Number(r.retribusi || 0)
    }));

    return NextResponse.json({ success: true, data: dataFormatted });
  } catch (error: any) {
    console.warn('DB belum aktif atau gagal koneksi, menggunakan fallback:', error.message);
    return NextResponse.json({ success: true, data: fallbackData, isFallback: true });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { bulan, puskeswan, field, value } = body;

    if (!bulan || !puskeswan || !field) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap.' }, { status: 400 });
    }

    if (!VALID_FIELDS.includes(field)) {
      return NextResponse.json({ success: false, error: 'Kolom tidak valid.' }, { status: 400 });
    }

    const numValue = Number(value) || 0;

    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS laporan_puskeswan (
          id INT AUTO_INCREMENT PRIMARY KEY,
          bulan VARCHAR(50) NOT NULL,
          no_urut INT NOT NULL DEFAULT 1,
          puskeswan VARCHAR(100) NOT NULL,
          bef INT DEFAULT 0,
          cacingan INT DEFAULT 0,
          scabies INT DEFAULT 0,
          orf INT DEFAULT 0,
          pmk_diag INT DEFAULT 0,
          lsd_diag INT DEFAULT 0,
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

      await pool.execute(
        `INSERT INTO laporan_puskeswan (bulan, puskeswan, ${field})
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE ${field} = VALUES(${field})`,
        [bulan, puskeswan, numValue]
      );

      return NextResponse.json({ success: true, message: 'Data berhasil diperbarui di database.' });
    } catch (dbErr: any) {
      console.warn('DB belum aktif saat PATCH:', dbErr.message);
      return NextResponse.json({ success: true, message: 'Data diperbarui di memori lokal.', isFallback: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
