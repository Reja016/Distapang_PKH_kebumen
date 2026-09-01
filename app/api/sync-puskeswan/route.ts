import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Koneksi Database
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'simantap_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

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

        // Kodingan SQL Sakti (Insert jika belum ada, Update jika sudah ada)
        const query = `
          INSERT INTO laporan_puskeswan 
          (bulan, no_urut, puskeswan, bef, cacingan, scabies, orf, pmk_diag, lsd_diag, aktif, semi_aktif, pasif, pusling, ib, pkb, pmk_vaks, lsd_vaks, retribusi)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          no_urut = VALUES(no_urut), bef = VALUES(bef), cacingan = VALUES(cacingan), scabies = VALUES(scabies), 
          orf = VALUES(orf), pmk_diag = VALUES(pmk_diag), lsd_diag = VALUES(lsd_diag), aktif = VALUES(aktif), 
          semi_aktif = VALUES(semi_aktif), pasif = VALUES(pasif), pusling = VALUES(pusling), ib = VALUES(ib), 
          pkb = VALUES(pkb), pmk_vaks = VALUES(pmk_vaks), lsd_vaks = VALUES(lsd_vaks), retribusi = VALUES(retribusi)
        `;

        const values = [
          dataRow.bulan, dataRow.no_urut, dataRow.puskeswan, dataRow.bef, dataRow.cacingan, dataRow.scabies, 
          dataRow.orf, dataRow.pmk_diag, dataRow.lsd_diag, dataRow.aktif, dataRow.semi_aktif, dataRow.pasif, 
          dataRow.pusling, dataRow.ib, dataRow.pkb, dataRow.pmk_vaks, dataRow.lsd_vaks, dataRow.retribusi
        ];

        // Eksekusi query ke MySQL
        await connection.execute(query, values);
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