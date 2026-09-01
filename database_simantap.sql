-- ============================================================================
-- DATABASE SKEMA: SiMantap (Sistem Informasi Peternakan & Kesehatan Hewan)
-- Dinas Pertanian dan Pangan (Distapang) Kabupaten Kebumen
-- ============================================================================

CREATE DATABASE IF NOT EXISTS simantap_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE simantap_db;

-- ----------------------------------------------------------------------------
-- 1. MODUL BITPRO: Master Kelompok Tani Ternak (KTT)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ktt_master (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kecamatan VARCHAR(100) NOT NULL,
  desa VARCHAR(100) NOT NULL,
  nama_kelompok VARCHAR(255) NOT NULL,
  nomor_register VARCHAR(100),
  jenis_kelompok VARCHAR(100) DEFAULT 'Sapi Potong',
  kelas_kelompok VARCHAR(100) DEFAULT 'Pemula',
  luas_lahan_ha DECIMAL(10,2) DEFAULT 0.00,
  anggota_laki INT DEFAULT 0,
  anggota_perempuan INT DEFAULT 0,
  nama_ketua VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. MODUL BITPRO: Sensus Populasi Ternak (2025 & 2026)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS populasi_tw4_2025 (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kecamatan VARCHAR(100) NOT NULL,
  no_desa INT DEFAULT 1,
  desa VARCHAR(100) NOT NULL,
  data_v JSON COMMENT 'Array 60 kolom angka sensus komoditas ternak',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS populasi_2026 (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tw VARCHAR(20) NOT NULL DEFAULT 'TW 1',
  kecamatan VARCHAR(100) NOT NULL,
  desa VARCHAR(100) NOT NULL,
  data_v JSON COMMENT 'Array 60 kolom angka sensus komoditas ternak 2026',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. MODUL BITPRO: Laporan Produksi Daging & Telur (2025 & 2026)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produksi_2025 (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kategori ENUM('daging', 'telur') NOT NULL,
  jenis VARCHAR(100) NOT NULL,
  jan DECIMAL(12,2) DEFAULT 0.00,
  feb DECIMAL(12,2) DEFAULT 0.00,
  mar DECIMAL(12,2) DEFAULT 0.00,
  apr DECIMAL(12,2) DEFAULT 0.00,
  mei DECIMAL(12,2) DEFAULT 0.00,
  jun DECIMAL(12,2) DEFAULT 0.00,
  jul DECIMAL(12,2) DEFAULT 0.00,
  agt DECIMAL(12,2) DEFAULT 0.00,
  sep DECIMAL(12,2) DEFAULT 0.00,
  okt DECIMAL(12,2) DEFAULT 0.00,
  nov DECIMAL(12,2) DEFAULT 0.00,
  des DECIMAL(12,2) DEFAULT 0.00,
  total DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS produksi_2026 (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kategori ENUM('daging', 'telur') NOT NULL,
  jenis VARCHAR(100) NOT NULL,
  jan DECIMAL(12,2) DEFAULT 0.00,
  feb DECIMAL(12,2) DEFAULT 0.00,
  mar DECIMAL(12,2) DEFAULT 0.00,
  apr DECIMAL(12,2) DEFAULT 0.00,
  mei DECIMAL(12,2) DEFAULT 0.00,
  jun DECIMAL(12,2) DEFAULT 0.00,
  jul DECIMAL(12,2) DEFAULT 0.00,
  agt DECIMAL(12,2) DEFAULT 0.00,
  sep DECIMAL(12,2) DEFAULT 0.00,
  okt DECIMAL(12,2) DEFAULT 0.00,
  nov DECIMAL(12,2) DEFAULT 0.00,
  des DECIMAL(12,2) DEFAULT 0.00,
  total DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. MODUL BITPRO: Data Farm Peternakan (Broiler, Petelur, Ruminansia)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS data_farm (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kategori VARCHAR(50) NOT NULL COMMENT 'broiler, petelur, general',
  data_json JSON NOT NULL COMMENT 'Detail data peternak, kapasitas kandang, alamat',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. MODUL BITPRO: SapiTime & Database Pelacakan Reproduksi IB
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sapitime_master (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ownerName VARCHAR(255) NOT NULL,
  breed VARCHAR(100) DEFAULT 'PO Kebumen',
  birthDate DATE,
  kecamatan VARCHAR(100),
  desa VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Dara',
  lastEstrus DATE,
  pregnancyDate DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sapitime_ib (
  id VARCHAR(50) PRIMARY KEY,
  cattle_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  time VARCHAR(20),
  kecamatan VARCHAR(100),
  desa VARCHAR(100),
  inseminatorName VARCHAR(255),
  strawCode VARCHAR(100),
  bullName VARCHAR(255),
  bullBreed VARCHAR(100),
  rekomendasiPkb VARCHAR(50),
  pkbStatus VARCHAR(50) DEFAULT 'Menunggu Jadwal',
  pkbDateActual DATE,
  pkbResult VARCHAR(50),
  pkbOfficer VARCHAR(255),
  pkbNotes TEXT,
  pkbSkipDate DATE,
  pkbSkipReason TEXT,
  birthDate DATE,
  calfGender VARCHAR(20),
  birthNotes TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cattle (cattle_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sapitime_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(50),
  cattle VARCHAR(255),
  cattleId VARCHAR(50),
  description TEXT,
  icon VARCHAR(20),
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. MODUL BITPRO: SKLB (Standarisasi Kinerja Laktasi & Bibit)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS capaian_sklb (
  id INT AUTO_INCREMENT PRIMARY KEY,
  no_urut INT,
  grup VARCHAR(100),
  tanggal VARCHAR(50),
  desa VARCHAR(100),
  kecamatan VARCHAR(100),
  target INT DEFAULT 0,
  capaian INT DEFAULT 0,
  selisih INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 7. MODUL ASET: Monev Aset Kelompok Tani Ternak (KTT) & Berita Acara
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS monev_lapangan (
  id VARCHAR(50) PRIMARY KEY,
  tahun VARCHAR(10) NOT NULL,
  kec VARCHAR(100) NOT NULL,
  desa VARCHAR(100) NOT NULL,
  namaKtt VARCHAR(255) NOT NULL,
  alamat TEXT,
  kegiatan VARCHAR(255),
  jenis VARCHAR(100),
  waktuMonev VARCHAR(50),
  kondisi JSON COMMENT 'Rincian mutasi jantan, betina, lahir, mati, jual',
  lat DOUBLE,
  lng DOUBLE,
  photo LONGTEXT COMMENT 'Base64 atau URL foto dokumentasi fisik',
  pdfBA LONGTEXT COMMENT 'Base64 atau URL berkas dokumen PDF Berita Acara',
  pdfBAName VARCHAR(255) COMMENT 'Nama file PDF Berita Acara',
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS monev_excel (
  tahun VARCHAR(10) PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  html_table LONGTEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 8. MODUL KESMAVET: Pengawasan RPH, TPU, TPH & Sertifikasi Halal
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pemotongan_hewan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_usaha VARCHAR(255) NOT NULL,
  jenis ENUM('RPH', 'TPH', 'RPU', 'TPU') NOT NULL DEFAULT 'RPH',
  pemilik VARCHAR(255) NOT NULL,
  kontak VARCHAR(100) DEFAULT '-',
  lokasi TEXT NOT NULL,
  sertifikat_halal ENUM('Ada', 'Tidak', 'Proses') DEFAULT 'Tidak',
  sertifikat_nkv ENUM('Ada', 'Tidak', 'Proses') DEFAULT 'Tidak',
  kapasitas_ekor_hari INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 9. MODUL KESWAN: Laporan Kinerja & Retribusi Puskeswan
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 10. MODUL KESWAN: Log Vaksinasi PMK & LSD (Bulanan, Harian, APBD)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vaksinasi_bulanan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  no_urut INT NOT NULL,
  puskeswan VARCHAR(100) NOT NULL UNIQUE,
  target INT DEFAULT 0,
  pengambilan INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vaksinasi_harian (
  id INT AUTO_INCREMENT PRIMARY KEY,
  puskeswan VARCHAR(100) NOT NULL,
  tanggal DATE NOT NULL,
  jumlah INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_harian (puskeswan, tanggal)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vaksin_apbd_target (
  id INT AUTO_INCREMENT PRIMARY KEY,
  no_urut INT NOT NULL,
  puskeswan VARCHAR(100) NOT NULL UNIQUE,
  target_lsd INT DEFAULT 0,
  target_ndai INT DEFAULT 0,
  target_rabies INT DEFAULT 0,
  target_aphtovaks INT DEFAULT 0,
  pengambilan_ndai INT,
  pengambilan_aphtovaks INT,
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vaksin_apbd_droping (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tanggal DATE NOT NULL,
  merk_vaksin VARCHAR(100) NOT NULL,
  jumlah INT NOT NULL DEFAULT 0,
  keterangan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================================================
-- SEED DATA AWAL: 8 Unit Puskeswan Kabupaten Kebumen
-- ============================================================================
INSERT INTO vaksinasi_bulanan (no_urut, puskeswan, target, pengambilan) VALUES
(1, 'PUSKESWAN BULUSPESANTREN', 12000, 8500),
(2, 'PUSKESWAN PETANAHAN', 11500, 7800),
(3, 'PUSKESWAN KLIRONG', 9500, 6200),
(4, 'PUSKESWAN KUTOWINANGUN', 10000, 7100),
(5, 'PUSKESWAN PREMBUN', 9000, 6400),
(6, 'PUSKESWAN AMBAL', 13000, 9200),
(7, 'PUSKESWAN GOMBONG', 11000, 8000),
(8, 'PUSKESWAN AYAH', 8500, 5600)
ON DUPLICATE KEY UPDATE target = VALUES(target), pengambilan = VALUES(pengambilan);

INSERT INTO vaksin_apbd_target (no_urut, puskeswan, target_lsd, target_ndai, target_rabies, target_aphtovaks) VALUES
(1, 'PUSKESWAN BULUSPESANTREN', 1500, 2000, 500, 3000),
(2, 'PUSKESWAN PETANAHAN', 1400, 1800, 400, 2800),
(3, 'PUSKESWAN KLIRONG', 1200, 1500, 300, 2200),
(4, 'PUSKESWAN KUTOWINANGUN', 1300, 1600, 350, 2500),
(5, 'PUSKESWAN PREMBUN', 1100, 1400, 300, 2100),
(6, 'PUSKESWAN AMBAL', 1600, 2200, 600, 3200),
(7, 'PUSKESWAN GOMBONG', 1400, 1900, 450, 2900),
(8, 'PUSKESWAN AYAH', 1000, 1300, 250, 1900)
ON DUPLICATE KEY UPDATE target_lsd = VALUES(target_lsd);
