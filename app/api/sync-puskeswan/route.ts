import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Fungsi pembantu untuk memecah CSV
function parseCSVLine(line: string) {
  const cols = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      cols.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cols.push(current.trim());
  return cols;
}

export async function POST() {
  try {
    // 1. Sedot CSV dari Google Sheets
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRZwKnGxehlzqmws1fb_OGcgwew5GIv21snMWwMKIr5stGsUxNPrBZdiplEjwYZeBlO_sk0Q7YbNgdq/pub?output=csv";
    
    const response = await fetch(csvUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error('Gagal menyedot data dari link');
    
    const csvText = await response.text();
    const rows = csvText.split('\n');

    let currentMonth = "";
    let totalMasuk = 0;
    
    // 👇 WADAH INI YANG TADI KELUPAAN
    let data_hasil = []; 

    // Buka koneksi ke MySQL
    const connection = await pool.getConnection();

    // 2. Looping membaca data dan memasukkan ke Database
    for (let i = 0; i < rows.length; i++) {
      const cols = parseCSVLine(rows[i]);
      
      // Deteksi nama bulan
      if (cols[0] && ["JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI", "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"].includes(cols[0].toUpperCase())) {
        currentMonth = cols[0].toUpperCase();
      }
      
      // Deteksi baris data Puskeswan
      if (currentMonth && /^[1-8]$/.test(cols[1])) {
        
        const parseIntSafe = (val: string) => {
          if (!val) return 0;
          const cleanVal = val.replace(/,/g, '').replace(/\$/g, '').replace(/Rp/g, '').trim();
          return parseInt(cleanVal) || 0;
        };

        const dataRow = {
          bulan: currentMonth,
          no_urut: parseIntSafe(cols[1]),
          puskeswan: cols[2],
          bef: parseIntSafe(cols[3]),
          cacingan: parseIntSafe(cols[4]),
          scabies: parseIntSafe(cols[5]),
          orf: parseIntSafe(cols[6]),
          pmk_diag: parseIntSafe(cols[7]),
          lsd_diag: parseIntSafe(cols[8]),
          aktif: parseIntSafe(cols[9]),
          semi_aktif: parseIntSafe(cols[10]),
          pasif: parseIntSafe(cols[11]),
          pusling: parseIntSafe(cols[12]),
          ib: parseIntSafe(cols[13]),
          pkb: parseIntSafe(cols[14]),
          pmk_vaks: parseIntSafe(cols[15]),
          lsd_vaks: parseIntSafe(cols[16]),
          retribusi: parseIntSafe(cols[17])
        };

        // 👇 SIMPAN DATA UNTUK DITAMPILKAN DI LAYAR
        data_hasil.push(dataRow);

        // Simpan data pelayanan ke laporan_puskeswan
        const puskIdMap: Record<string, number> = {
          MIRIT: 1, KLIRONG: 2, GOMBONG: 3, BUAYAN: 4,
          ALIAN: 5, PREMBUN: 6, KEBUMEN: 7, KARANGANYAR: 8
        };
        const idPuskeswan = puskIdMap[dataRow.puskeswan.toUpperCase()] || dataRow.no_urut;

        const query = `
          INSERT INTO laporan_puskeswan 
          (tahun, bulan, no_urut, puskeswan, id_puskeswan, aktif, semi_aktif, pasif, pusling, ib, pkb, pmk_vaks, lsd_vaks, retribusi)
          VALUES ('2026', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          no_urut = VALUES(no_urut), id_puskeswan = VALUES(id_puskeswan), aktif = VALUES(aktif), 
          semi_aktif = VALUES(semi_aktif), pasif = VALUES(pasif), pusling = VALUES(pusling), ib = VALUES(ib), 
          pkb = VALUES(pkb), pmk_vaks = VALUES(pmk_vaks), lsd_vaks = VALUES(lsd_vaks), retribusi = VALUES(retribusi)
        `;

        const values = [
          dataRow.bulan, dataRow.no_urut, dataRow.puskeswan, idPuskeswan, dataRow.aktif, dataRow.semi_aktif, dataRow.pasif, 
          dataRow.pusling, dataRow.ib, dataRow.pkb, dataRow.pmk_vaks, dataRow.lsd_vaks, dataRow.retribusi
        ];

        await connection.execute(query, values);

        // Simpan data penyakit ke keswan_laporan_penyakit
        const diseasesToSync = [
          { name: 'BEF', val: dataRow.bef },
          { name: 'Cacingan', val: dataRow.cacingan },
          { name: 'Scabies', val: dataRow.scabies },
          { name: 'ORF', val: dataRow.orf },
          { name: 'PMK', val: dataRow.pmk_diag },
          { name: 'LSD', val: dataRow.lsd_diag },
        ];

        let hasDiagNama = false;
        let pkCol = 'id';
        try {
          const [descRows]: any = await connection.query('DESCRIBE keswan_laporan_penyakit');
          const fields = (descRows || []).map((f: any) => f.Field);
          hasDiagNama = fields.includes('diagnosa_nama');
          if (fields.includes('id_laporan_penyakit')) {
            pkCol = 'id_laporan_penyakit';
          }
        } catch {}

        for (const dis of diseasesToSync) {
          try {
            if (hasDiagNama) {
              const puskKey = dataRow.puskeswan.toLowerCase();
              const [ex]: any = await connection.query(
                `SELECT ${pkCol} as id_row FROM keswan_laporan_penyakit WHERE tahun = 2026 AND UPPER(bulan) = ? AND LOWER(puskeswan_id) = ? AND LOWER(diagnosa_nama) = LOWER(?) LIMIT 1`,
                [dataRow.bulan.toUpperCase(), puskKey, dis.name]
              );
              if (ex && ex.length > 0) {
                await connection.query(
                  `UPDATE keswan_laporan_penyakit SET jumlah_kasus = ?, updated_at = NOW() WHERE ${pkCol} = ?`,
                  [dis.val, ex[0].id_row]
                );
              } else {
                await connection.query(
                  'INSERT INTO keswan_laporan_penyakit (tahun, bulan, puskeswan_id, diagnosa_nama, kategori_penyakit, jumlah_kasus) VALUES (2026, ?, ?, ?, "Umum", ?)',
                  [dataRow.bulan.toUpperCase(), puskKey, dis.name, dis.val]
                );
              }
            } else {
              let idDiag = 1;
              try {
                const [dRows]: any = await connection.query(
                  'SELECT id_diagnosa FROM diagnosa WHERE LOWER(diagnosa_nama) = LOWER(?) LIMIT 1',
                  [dis.name]
                );
                if (dRows && dRows.length > 0) {
                  idDiag = dRows[0].id_diagnosa;
                } else {
                  const [insD]: any = await connection.query(
                    'INSERT INTO diagnosa (diagnosa_nama, kategori_penyakit) VALUES (?, "Umum")',
                    [dis.name]
                  );
                  idDiag = insD.insertId;
                }
              } catch {}

              const [ex]: any = await connection.query(
                `SELECT ${pkCol} as id_row FROM keswan_laporan_penyakit WHERE tahun = 2026 AND UPPER(bulan) = ? AND id_puskeswan = ? AND id_diagnosa = ? LIMIT 1`,
                [dataRow.bulan.toUpperCase(), idPuskeswan, idDiag]
              );

              if (ex && ex.length > 0) {
                await connection.query(
                  `UPDATE keswan_laporan_penyakit SET jumlah_kasus = ?, updated_at = NOW() WHERE ${pkCol} = ?`,
                  [dis.val, ex[0].id_row]
                );
              } else {
                await connection.query(
                  'INSERT INTO keswan_laporan_penyakit (tahun, bulan, id_puskeswan, id_diagnosa, kategori_penyakit, jumlah_kasus) VALUES (2026, ?, ?, ?, "Umum", ?)',
                  [dataRow.bulan.toUpperCase(), idPuskeswan, idDiag, dis.val]
                );
              }
            }
          } catch {}
        }

        totalMasuk++;
      }
    }

    connection.release(); // Tutup koneksi setelah selesai

    return NextResponse.json({ 
      success: true, 
      message: `Mantap! ${totalMasuk} baris data laporan Puskeswan berhasil disinkronkan dari Sheets ke MySQL!`,
      data: data_hasil // 👇 DIKIRIM BALIK KE FRONTEND SUPAYA TIDAK ERROR
    });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ success: false, error: "Gagal menyimpan data ke MySQL." }, { status: 500 });
  }
}