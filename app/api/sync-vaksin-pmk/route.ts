import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'simantap_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

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

export async function GET() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM capaian_vaksin_pmk_2026 ORDER BY no_urut ASC'
    );
    connection.release();
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTfK0DTguHIQ2YxRQT2SQ4SGBcBTcmyaqEuO72a9sOlj0bMnLfJRAcW3fqO9BnIyw/pub?output=csv';

    const response = await fetch(csvUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error('Gagal mengakses link Google Sheets.');

    const csvText = await response.text();
    const lines = csvText.split(/\r?\n/);

    const connection = await pool.getConnection();

    const parseIntSafe = (val: string) => {
      if (!val) return 0;
      const cleanVal = val.replace(/,/g, '').replace(/\./g, '').trim();
      return parseInt(cleanVal) || 0;
    };

    const validPuskeswan = ['MIRIT', 'PREMBUN', 'KEBUMEN', 'ALIAN', 'KLIRONG', 'KARANGANYAR', 'GOMBONG', 'BUAYAN'];
    const dataMap = new Map();

    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const cols = parseCSVLine(lines[i]);
      let puskeswanName = '';
      let targetVal = 0;
      let capaianVal = 0;

      const colB = cols[1] ? cols[1].toUpperCase().trim() : '';
      const colC = cols[2] ? cols[2].toUpperCase().trim() : '';

      if (validPuskeswan.includes(colB)) {
        puskeswanName = cols[1].trim();
        targetVal = parseIntSafe(cols[2]); 
        capaianVal = parseIntSafe(cols[4]); 
      } 
      else if (validPuskeswan.includes(colC)) {
        puskeswanName = cols[2].trim();
        targetVal = parseIntSafe(cols[3]); 
        capaianVal = parseIntSafe(cols[5]); 
      }

      if (puskeswanName !== '') {
        const key = puskeswanName.toUpperCase();
        if (!dataMap.has(key)) {
          dataMap.set(key, { kecamatan: puskeswanName, target: targetVal, capaian: capaianVal });
        } else {
          const existing = dataMap.get(key);
          existing.target = Math.max(existing.target, targetVal); 
          existing.capaian += capaianVal; 
        }
      }
    }

    if (dataMap.size === 0) {
        connection.release();
        return NextResponse.json({ success: false, error: 'Format CSV tidak dikenali.' });
    }

    let no_urut = 1;
    const dataHasil = [];

    for (const [key, data] of Array.from(dataMap.entries())) {
        const persentase = data.target > 0 ? Number(((data.capaian / data.target) * 100).toFixed(2)) : 0;
        dataHasil.push({ ...data, persentase, no_urut, desa: '-' });

        const query = `
          INSERT INTO capaian_vaksin_pmk_2026 (no_urut, kecamatan, desa, target, capaian, persentase, keterangan)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          target = VALUES(target),
          capaian = VALUES(capaian),
          persentase = VALUES(persentase)
        `;

        await connection.execute(query, [
          no_urut, data.kecamatan, '-', data.target, data.capaian, persentase, '-'
        ]);
        no_urut++;
    }

    connection.release();

    return NextResponse.json({
      success: true,
      message: `Mantap! Berhasil menyinkronkan data ${dataMap.size} Puskeswan ke Database MySQL!`,
      data: dataHasil,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}