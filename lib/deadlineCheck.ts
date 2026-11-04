/**
 * Utilitas Pemeriksaan Batas Waktu Pengisian Data (Grace Period 3 Hari)
 * 
 * Aturan Sistem SIMANTAP:
 * 1. Administrator memiliki wewenang penuh (Bypass), dapat menginput dan mengubah data kapan saja tanpa batas waktu.
 * 2. Petugas hanya dapat mengisi data periode/tanggal yang aktif atau masih dalam masa toleransi 3 hari.
 *    - Untuk Laporan Bulanan (misal: Bulan JANUARI 2026):
 *      Batas waktu pengisian toleransi adalah tanggal 3 bulan berikutnya (3 FEBRUARI 2026) pukul 23:59:59 WIB.
 *    - Untuk Laporan Harian (misal: Tanggal 2026-09-26):
 *      Batas waktu pengisian toleransi adalah 3 hari kalender setelah tanggal tersebut (2026-09-29 pukul 23:59:59 WIB).
 *    - Periode atau tanggal di masa depan (belum berlangsung) belum dapat diisi oleh petugas.
 * 3. Setelah batas waktu berakhir, form/sel tabel otomatis terkunci (Read-Only) bagi petugas
 *    dengan pesan peringatan untuk menghubungi Administrator.
 */

export const BULAN_MAP: Record<string, number> = {
  JANUARI: 1,
  FEBRUARI: 2,
  MARET: 3,
  APRIL: 4,
  MEI: 5,
  JUNI: 6,
  JULI: 7,
  AGUSTUS: 8,
  SEPTEMBER: 9,
  OKTOBER: 10,
  NOVEMBER: 11,
  DESEMBER: 12,
};

export const BULAN_NAMES = [
  '',
  'JANUARI',
  'FEBRUARI',
  'MARET',
  'APRIL',
  'MEI',
  'JUNI',
  'JULI',
  'AGUSTUS',
  'SEPTEMBER',
  'OKTOBER',
  'NOVEMBER',
  'DESEMBER',
];

/**
 * Validasi batas waktu laporan bulanan
 */
export function checkMonthlyDeadline(
  bulan: string | number,
  tahun: string | number,
  isAdmin: boolean = false,
  isMasterUnlocked: boolean = false
): { isLocked: boolean; reason?: string } {
  if (isAdmin || isMasterUnlocked) {
    return { isLocked: false };
  }

  const yearNum = typeof tahun === 'string' ? parseInt(tahun, 10) : tahun;
  let monthNum: number;

  if (typeof bulan === 'number') {
    monthNum = bulan;
  } else {
    monthNum = BULAN_MAP[(bulan || '').toUpperCase().trim()] || 0;
  }

  if (!monthNum || isNaN(yearNum)) {
    return { isLocked: false };
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed

  // 1. Cek periode di masa depan
  if (yearNum > currentYear || (yearNum === currentYear && monthNum > currentMonth)) {
    return {
      isLocked: true,
      reason: `Periode ${bulan} ${yearNum} belum dimulai. Petugas hanya dapat mengisi data periode yang sedang berjalan.`,
    };
  }

  // 2. Batas toleransi 3 hari setelah bulan berakhir: Tanggal 3 bulan M+1 pukul 23:59:59.999
  const nextMonthYear = monthNum === 12 ? yearNum + 1 : yearNum;
  const nextMonthIndex = monthNum === 12 ? 0 : monthNum; // 0-indexed for Date constructor
  const lockDate = new Date(nextMonthYear, nextMonthIndex, 3, 23, 59, 59, 999);

  if (now.getTime() > lockDate.getTime()) {
    const nextMonthName = BULAN_NAMES[monthNum === 12 ? 1 : monthNum + 1];
    return {
      isLocked: true,
      reason: `Periode ${bulan} ${yearNum} telah dikunci (Batas waktu toleransi 3 hari telah berakhir pada 3 ${nextMonthName} ${nextMonthYear}). Silakan hubungi Administrator untuk membuka kunci atau memperbarui data.`,
    };
  }

  return { isLocked: false };
}

/**
 * Validasi batas waktu laporan harian (format: YYYY-MM-DD)
 * CATATAN REVISI: Pembatasan toleransi 3 hari telah dicabut agar petugas lapangan
 * dapat melakukan input atau perbaikan data harian kapan saja tanpa terkunci.
 */
export function checkDailyDeadline(
  _dateStr: string,
  _isAdmin: boolean = false,
  _isMasterUnlocked: boolean = false
): { isLocked: boolean; reason?: string } {
  // Selalu buka kunci pengisian harian (tanpa batasan 3 hari)
  return { isLocked: false };
}
