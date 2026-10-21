import pool from '@/lib/db';
import { DIAGNOSA_LIST } from '@/lib/penyakitData';

const BULAN_NAMES = [
  'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
  'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
];

const PUSKESWAN_MAP: Record<string, { id: string; nama: string; kecCode: string; kecNama: string }> = {
  mirit: { id: 'mirit', nama: 'Mirit', kecCode: 'k_mirit', kecNama: 'Mirit' },
  klirong: { id: 'klirong', nama: 'Klirong', kecCode: 'k_klirong', kecNama: 'Klirong' },
  gombong: { id: 'gombong', nama: 'Gombong', kecCode: 'k_gombong', kecNama: 'Gombong' },
  buayan: { id: 'buayan', nama: 'Buayan', kecCode: 'k_buayan', kecNama: 'Buayan' },
  alian: { id: 'alian', nama: 'Alian', kecCode: 'k_alian', kecNama: 'Alian' },
  prembun: { id: 'prembun', nama: 'Prembun', kecCode: 'k_prembun', kecNama: 'Prembun' },
  kebumen: { id: 'kebumen', nama: 'Kebumen', kecCode: 'k_kebumen', kecNama: 'Kebumen' },
  karanganyar: { id: 'karanganyar', nama: 'Karanganyar', kecCode: 'k_karanganyar', kecNama: 'Karanganyar' },
};

export function normalizePuskeswanKey(pusk: string): string {
  const clean = (pusk || '').toLowerCase().replace(/puskeswan\s*/g, '').trim();
  return clean || 'kebumen';
}

export async function ensureDiagnosaTables() {
  try {
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

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS keswan_laporan_penyakit (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tahun INT DEFAULT 2026,
        bulan VARCHAR(50) NOT NULL DEFAULT 'JANUARI',
        puskeswan_id VARCHAR(50) DEFAULT 'kebumen',
        kecamatan_id VARCHAR(50) DEFAULT 'k_kebumen',
        kecamatan_nama VARCHAR(100) DEFAULT 'Kebumen',
        diagnosa_nama VARCHAR(100) DEFAULT 'Pink Eye',
        kategori_penyakit VARCHAR(100) DEFAULT 'Umum',
        jumlah_kasus INT DEFAULT 0,
        keterangan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Seed diagnosa jika masih kosong
    const [diagRows]: any = await pool.query('SELECT COUNT(*) as c FROM diagnosa');
    if (!diagRows || diagRows[0]?.c === 0) {
      for (const d of DIAGNOSA_LIST) {
        await pool.query(
          'INSERT IGNORE INTO diagnosa (diagnosa_nama, kategori_penyakit) VALUES (?, ?)',
          [d.nama, d.kategori || 'Umum']
        );
      }
    }
  } catch (e: any) {
    console.warn('Gagal ensureDiagnosaTables:', e.message);
  }
}

export interface SyncDiseaseParams {
  tanggal?: string;
  puskeswan: string;
  diagnosa_nama: string;
  jumlah_kasus?: number;
  keterangan?: string;
}

export async function syncDiseaseCaseToLaporanPenyakit({
  tanggal,
  puskeswan,
  diagnosa_nama,
  jumlah_kasus = 1,
  keterangan = '',
}: SyncDiseaseParams): Promise<number | null> {
  if (!diagnosa_nama || !diagnosa_nama.trim()) return null;

  await ensureDiagnosaTables();

  const d = tanggal ? new Date(tanggal) : new Date();
  const tahun = isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
  const monthIdx = isNaN(d.getMonth()) ? new Date().getMonth() : d.getMonth();
  const bulan = BULAN_NAMES[monthIdx] || 'JANUARI';

  const puskKey = normalizePuskeswanKey(puskeswan);
  const info = PUSKESWAN_MAP[puskKey] || PUSKESWAN_MAP['kebumen'];

  const cleanDiagnosa = diagnosa_nama.trim();

  // 1. Simpan ke tabel master `diagnosa` jika belum ada (agar langsung muncul di dropdown diagnosa)
  try {
    await pool.query(
      'INSERT IGNORE INTO diagnosa (diagnosa_nama, kategori_penyakit) VALUES (?, ?)',
      [cleanDiagnosa, 'Umum']
    );
  } catch (err: any) {
    console.warn('Gagal insert master diagnosa:', err.message);
  }

  // 2. Simpan catatan kasus ke tabel `keswan_laporan_penyakit`
  try {
    const [res]: any = await pool.query(
      `INSERT INTO keswan_laporan_penyakit (
        tahun, bulan, puskeswan_id, kecamatan_id, kecamatan_nama, diagnosa_nama, kategori_penyakit, jumlah_kasus, keterangan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tahun,
        bulan,
        info.id,
        info.kecCode,
        info.kecNama,
        cleanDiagnosa,
        'Umum',
        Number(jumlah_kasus) || 1,
        keterangan || `Sinkronisasi Otomatis (${puskeswan})`,
      ]
    );
    return res.insertId || null;
  } catch (err: any) {
    console.warn('Gagal sinkronisasi keswan_laporan_penyakit:', err.message);
    return null;
  }
}

export async function updateDiseaseCaseInLaporanPenyakit(
  idLaporan: number | null | undefined,
  params: SyncDiseaseParams
): Promise<number | null> {
  if (!idLaporan) {
    return syncDiseaseCaseToLaporanPenyakit(params);
  }

  await ensureDiagnosaTables();

  const d = params.tanggal ? new Date(params.tanggal) : new Date();
  const tahun = isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
  const monthIdx = isNaN(d.getMonth()) ? new Date().getMonth() : d.getMonth();
  const bulan = BULAN_NAMES[monthIdx] || 'JANUARI';

  const puskKey = normalizePuskeswanKey(params.puskeswan);
  const info = PUSKESWAN_MAP[puskKey] || PUSKESWAN_MAP['kebumen'];
  const cleanDiagnosa = (params.diagnosa_nama || '').trim();

  if (!cleanDiagnosa) {
    await deleteDiseaseCaseFromLaporanPenyakit(idLaporan);
    return null;
  }

  // Insert master diagnosa if new
  try {
    await pool.query(
      'INSERT IGNORE INTO diagnosa (diagnosa_nama, kategori_penyakit) VALUES (?, ?)',
      [cleanDiagnosa, 'Umum']
    );
  } catch {}

  try {
    await pool.query(
      `UPDATE keswan_laporan_penyakit 
       SET tahun = ?, bulan = ?, puskeswan_id = ?, kecamatan_id = ?, kecamatan_nama = ?, 
           diagnosa_nama = ?, jumlah_kasus = ?, keterangan = ?
       WHERE id = ?`,
      [
        tahun,
        bulan,
        info.id,
        info.kecCode,
        info.kecNama,
        cleanDiagnosa,
        Number(params.jumlah_kasus) || 1,
        params.keterangan || `Diperbarui Otomatis (${params.puskeswan})`,
        idLaporan,
      ]
    );
    return idLaporan;
  } catch (err: any) {
    console.warn('Gagal update keswan_laporan_penyakit:', err.message);
    return null;
  }
}

export async function deleteDiseaseCaseFromLaporanPenyakit(idLaporan: number | null | undefined): Promise<void> {
  if (!idLaporan) return;
  try {
    await pool.query('DELETE FROM keswan_laporan_penyakit WHERE id = ?', [idLaporan]);
  } catch (err: any) {
    console.warn('Gagal hapus baris keswan_laporan_penyakit:', err.message);
  }
}
