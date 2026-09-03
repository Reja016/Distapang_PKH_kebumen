const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Manual parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val.replace(/^["'](.*)["']$/, '$1');
    }
  });
}

const BASELINE_SAPI_PO = [
  { id: 'ayah', nama: 'Ayah', populasi: 3070 },
  { id: 'buayan', nama: 'Buayan', populasi: 1137 },
  { id: 'rowokele', nama: 'Rowokele', populasi: 261 },
  { id: 'sempor', nama: 'Sempor', populasi: 631 },
  { id: 'gombong', nama: 'Gombong', populasi: 25 },
  { id: 'kuwarasan', nama: 'Kuwarasan', populasi: 379 },
  { id: 'puring', nama: 'Puring', populasi: 7093 },
  { id: 'petanahan', nama: 'Petanahan', populasi: 3686 },
  { id: 'klirong', nama: 'Klirong', populasi: 5409 },
  { id: 'buluspesantren', nama: 'Buluspesantren', populasi: 7075 },
  { id: 'ambal', nama: 'Ambal', populasi: 5730 },
  { id: 'mirit', nama: 'Mirit', populasi: 4947 },
  { id: 'bonorowo', nama: 'Bonorowo', populasi: 565 },
  { id: 'prembun', nama: 'Prembun', populasi: 593 },
  { id: 'padureso', nama: 'Padureso', populasi: 514 },
  { id: 'kutowinangun', nama: 'Kutowinangun', populasi: 760 },
  { id: 'poncowarno', nama: 'Poncowarno', populasi: 781 },
  { id: 'alian', nama: 'Alian', populasi: 366 },
  { id: 'kebumen', nama: 'Kebumen', populasi: 578 },
  { id: 'pejagoan', nama: 'Pejagoan', populasi: 654 },
  { id: 'sruweng', nama: 'Sruweng', populasi: 253 },
  { id: 'adimulyo', nama: 'Adimulyo', populasi: 707 },
  { id: 'karanganyar', nama: 'Karanganyar', populasi: 491 },
  { id: 'karanggayam', nama: 'Karanggayam', populasi: 3200 },
  { id: 'karangsambung', nama: 'Karangsambung', populasi: 1119 },
  { id: 'sadang', nama: 'Sadang', populasi: 426 },
];

async function init() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'simantap_db',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 5,
  });

  console.log('Connecting to database...');
  const conn = await pool.getConnection();

  try {
    console.log('Creating table bitpro_sklb_populasi_sapi_po if not exists...');
    await conn.query(`
      CREATE TABLE IF NOT EXISTS bitpro_sklb_populasi_sapi_po (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tahun INT NOT NULL,
        kecamatan_id VARCHAR(50) NOT NULL,
        kecamatan_nama VARCHAR(100) NOT NULL,
        populasi INT NOT NULL DEFAULT 0,
        triwulan VARCHAR(50) DEFAULT 'Triwulan 2',
        keterangan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_tahun_kecamatan (tahun, kecamatan_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Check existing count for 2026 and 2025
    const [rows2026] = await conn.query(
      `SELECT COUNT(*) as cnt FROM bitpro_sklb_populasi_sapi_po WHERE tahun = 2026`
    );

    if (rows2026[0].cnt === 0) {
      console.log('Seeding baseline 2026 Sapi PO data...');
      for (const item of BASELINE_SAPI_PO) {
        await conn.query(
          `INSERT INTO bitpro_sklb_populasi_sapi_po (tahun, kecamatan_id, kecamatan_nama, populasi, triwulan)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE populasi = VALUES(populasi), kecamatan_nama = VALUES(kecamatan_nama)`,
          [2026, item.id, item.nama, item.populasi, 'Triwulan 2']
        );
      }
    }

    const [rows2025] = await conn.query(
      `SELECT COUNT(*) as cnt FROM bitpro_sklb_populasi_sapi_po WHERE tahun = 2025`
    );

    if (rows2025[0].cnt === 0) {
      console.log('Seeding baseline 2025 Sapi PO data...');
      for (const item of BASELINE_SAPI_PO) {
        await conn.query(
          `INSERT INTO bitpro_sklb_populasi_sapi_po (tahun, kecamatan_id, kecamatan_nama, populasi, triwulan)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE populasi = VALUES(populasi), kecamatan_nama = VALUES(kecamatan_nama)`,
          [2025, item.id, item.nama, item.populasi, 'Triwulan 2']
        );
      }
    }

    console.log('Successfully initialized bitpro_sklb_populasi_sapi_po!');
  } catch (err) {
    console.error('Error init:', err);
  } finally {
    conn.release();
    pool.end();
  }
}

init();
