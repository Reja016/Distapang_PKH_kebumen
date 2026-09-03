const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Manual parse .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  lines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val.replace(/^["'](.*)["']$/, '$1');
    }
  });
}

const INITIAL_CASES_2025 = [
  // Alian
  { tahun: 2025, kecamatan_id: 'alian', kecamatan_nama: 'Alian', puskeswan_id: 'alian', diagnosa_nama: 'BEF', jumlah_kasus: 4 },
  { tahun: 2025, kecamatan_id: 'alian', kecamatan_nama: 'Alian', puskeswan_id: 'alian', diagnosa_nama: 'Scabies', jumlah_kasus: 24 },
  { tahun: 2025, kecamatan_id: 'alian', kecamatan_nama: 'Alian', puskeswan_id: 'alian', diagnosa_nama: 'Cacingan', jumlah_kasus: 36 },
  { tahun: 2025, kecamatan_id: 'alian', kecamatan_nama: 'Alian', puskeswan_id: 'alian', diagnosa_nama: 'Pink Eye', jumlah_kasus: 2 },
  { tahun: 2025, kecamatan_id: 'alian', kecamatan_nama: 'Alian', puskeswan_id: 'alian', diagnosa_nama: 'LSD', jumlah_kasus: 36 },
  { tahun: 2025, kecamatan_id: 'alian', kecamatan_nama: 'Alian', puskeswan_id: 'alian', diagnosa_nama: 'PMK', jumlah_kasus: 7 },
  { tahun: 2025, kecamatan_id: 'alian', kecamatan_nama: 'Alian', puskeswan_id: 'alian', diagnosa_nama: 'Distokia', jumlah_kasus: 6 },
  { tahun: 2025, kecamatan_id: 'alian', kecamatan_nama: 'Alian', puskeswan_id: 'alian', diagnosa_nama: 'Abortus', jumlah_kasus: 1 },
  { tahun: 2025, kecamatan_id: 'alian', kecamatan_nama: 'Alian', puskeswan_id: 'alian', diagnosa_nama: 'Retensi Plasenta', jumlah_kasus: 4 },
  { tahun: 2025, kecamatan_id: 'alian', kecamatan_nama: 'Alian', puskeswan_id: 'alian', diagnosa_nama: 'Prolaps Uteri', jumlah_kasus: 2 },
  { tahun: 2025, kecamatan_id: 'alian', kecamatan_nama: 'Alian', puskeswan_id: 'alian', diagnosa_nama: 'Prolaps Vagina', jumlah_kasus: 2 },
  { tahun: 2025, kecamatan_id: 'alian', kecamatan_nama: 'Alian', puskeswan_id: 'alian', diagnosa_nama: 'Delay Pubertas', jumlah_kasus: 1 },
  { tahun: 2025, kecamatan_id: 'alian', kecamatan_nama: 'Alian', puskeswan_id: 'alian', diagnosa_nama: 'Silent Heat', jumlah_kasus: 2 },
  { tahun: 2025, kecamatan_id: 'alian', kecamatan_nama: 'Alian', puskeswan_id: 'alian', diagnosa_nama: 'Endometriosis', jumlah_kasus: 10 },
  { tahun: 2025, kecamatan_id: 'alian', kecamatan_nama: 'Alian', puskeswan_id: 'alian', diagnosa_nama: 'Hipofungsi Ovari', jumlah_kasus: 2 },
  { tahun: 2025, kecamatan_id: 'alian', kecamatan_nama: 'Alian', puskeswan_id: 'alian', diagnosa_nama: 'Abses', jumlah_kasus: 1 },
  
  // Kebumen
  { tahun: 2025, kecamatan_id: 'kebumen', kecamatan_nama: 'Kebumen', puskeswan_id: 'kebumen', diagnosa_nama: 'Scabies', jumlah_kasus: 18 },
  { tahun: 2025, kecamatan_id: 'kebumen', kecamatan_nama: 'Kebumen', puskeswan_id: 'kebumen', diagnosa_nama: 'Cacingan', jumlah_kasus: 25 },
  { tahun: 2025, kecamatan_id: 'kebumen', kecamatan_nama: 'Kebumen', puskeswan_id: 'kebumen', diagnosa_nama: 'PMK', jumlah_kasus: 5 },
  { tahun: 2025, kecamatan_id: 'kebumen', kecamatan_nama: 'Kebumen', puskeswan_id: 'kebumen', diagnosa_nama: 'LSD', jumlah_kasus: 12 },
  { tahun: 2025, kecamatan_id: 'kebumen', kecamatan_nama: 'Kebumen', puskeswan_id: 'kebumen', diagnosa_nama: 'Mastitis', jumlah_kasus: 8 },

  // Gombong
  { tahun: 2025, kecamatan_id: 'gombong', kecamatan_nama: 'Gombong', puskeswan_id: 'gombong', diagnosa_nama: 'BEF', jumlah_kasus: 6 },
  { tahun: 2025, kecamatan_id: 'gombong', kecamatan_nama: 'Gombong', puskeswan_id: 'gombong', diagnosa_nama: 'Scabies', jumlah_kasus: 14 },
  { tahun: 2025, kecamatan_id: 'gombong', kecamatan_nama: 'Gombong', puskeswan_id: 'gombong', diagnosa_nama: 'Bloat', jumlah_kasus: 9 },
  { tahun: 2025, kecamatan_id: 'gombong', kecamatan_nama: 'Gombong', puskeswan_id: 'gombong', diagnosa_nama: 'LSD', jumlah_kasus: 15 },
  
  // Karanganyar
  { tahun: 2025, kecamatan_id: 'karanganyar', kecamatan_nama: 'Karanganyar', puskeswan_id: 'karanganyar', diagnosa_nama: 'Cacingan', jumlah_kasus: 22 },
  { tahun: 2025, kecamatan_id: 'karanganyar', kecamatan_nama: 'Karanganyar', puskeswan_id: 'karanganyar', diagnosa_nama: 'Distokia', jumlah_kasus: 7 },
  { tahun: 2025, kecamatan_id: 'karanganyar', kecamatan_nama: 'Karanganyar', puskeswan_id: 'karanganyar', diagnosa_nama: 'Hipofungsi Ovari', jumlah_kasus: 11 },

  // Buayan
  { tahun: 2025, kecamatan_id: 'buayan', kecamatan_nama: 'Buayan', puskeswan_id: 'buayan', diagnosa_nama: 'Scabies', jumlah_kasus: 15 },
  { tahun: 2025, kecamatan_id: 'buayan', kecamatan_nama: 'Buayan', puskeswan_id: 'buayan', diagnosa_nama: 'LSD', jumlah_kasus: 8 },
  { tahun: 2025, kecamatan_id: 'buayan', kecamatan_nama: 'Buayan', puskeswan_id: 'buayan', diagnosa_nama: 'Cacingan', jumlah_kasus: 19 },

  // Prembun
  { tahun: 2025, kecamatan_id: 'prembun', kecamatan_nama: 'Prembun', puskeswan_id: 'prembun', diagnosa_nama: 'PMK', jumlah_kasus: 4 },
  { tahun: 2025, kecamatan_id: 'prembun', kecamatan_nama: 'Prembun', puskeswan_id: 'prembun', diagnosa_nama: 'Cacingan', jumlah_kasus: 16 },
  { tahun: 2025, kecamatan_id: 'prembun', kecamatan_nama: 'Prembun', puskeswan_id: 'prembun', diagnosa_nama: 'BEF', jumlah_kasus: 5 },

  // Klirong
  { tahun: 2025, kecamatan_id: 'klirong', kecamatan_nama: 'Klirong', puskeswan_id: 'klirong', diagnosa_nama: 'Endometriosis', jumlah_kasus: 6 },
  { tahun: 2025, kecamatan_id: 'klirong', kecamatan_nama: 'Klirong', puskeswan_id: 'klirong', diagnosa_nama: 'Scabies', jumlah_kasus: 12 },
  { tahun: 2025, kecamatan_id: 'klirong', kecamatan_nama: 'Klirong', puskeswan_id: 'klirong', diagnosa_nama: 'Pink Eye', jumlah_kasus: 3 },

  // Mirit
  { tahun: 2025, kecamatan_id: 'mirit', kecamatan_nama: 'Mirit', puskeswan_id: 'mirit', diagnosa_nama: 'Cacingan', jumlah_kasus: 14 },
  { tahun: 2025, kecamatan_id: 'mirit', kecamatan_nama: 'Mirit', puskeswan_id: 'mirit', diagnosa_nama: 'LSD', jumlah_kasus: 7 },
  { tahun: 2025, kecamatan_id: 'mirit', kecamatan_nama: 'Mirit', puskeswan_id: 'mirit', diagnosa_nama: 'Bloat', jumlah_kasus: 4 },
];

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'distapang_pkh',
    waitForConnections: true,
    connectionLimit: 10,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS keswan_laporan_penyakit (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tahun INT NOT NULL DEFAULT 2025,
      bulan INT NOT NULL DEFAULT 0,
      kecamatan_id VARCHAR(50) NOT NULL,
      kecamatan_nama VARCHAR(100) NOT NULL,
      puskeswan_id VARCHAR(50) NOT NULL,
      diagnosa_nama VARCHAR(100) NOT NULL,
      kategori_penyakit VARCHAR(100) DEFAULT 'Umum',
      jumlah_kasus INT NOT NULL DEFAULT 0,
      keterangan TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_tahun_kec (tahun, kecamatan_id),
      INDEX idx_diagnosa (diagnosa_nama)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  const [existing] = await pool.query('SELECT COUNT(*) as cnt FROM keswan_laporan_penyakit');
  if (existing[0].cnt === 0) {
    for (const c of INITIAL_CASES_2025) {
      await pool.query(`
        INSERT INTO keswan_laporan_penyakit (
          tahun, kecamatan_id, kecamatan_nama, puskeswan_id, diagnosa_nama, jumlah_kasus
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [c.tahun, c.kecamatan_id, c.kecamatan_nama, c.puskeswan_id, c.diagnosa_nama, c.jumlah_kasus]);
    }
    console.log('SUCCESS: Inserted default initial cases for 2025!');
  } else {
    console.log('SUCCESS: keswan_laporan_penyakit already has ' + existing[0].cnt + ' records.');
  }

  process.exit(0);
}

run().catch(e => {
  console.error('Migration error:', e);
  process.exit(1);
});
