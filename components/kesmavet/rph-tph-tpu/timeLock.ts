export interface LockStatus {
  isLocked: boolean;
  reason?: 'expired' | 'future' | null;
  label: string;
}

/**
  * Menentukan apakah suatu baris tanggal terkunci berdasarkan aturan 3 hari:
  * - Hari ini (H) dan sampai 3 hari ke belakang (H-1, H-2, H-3) dapat diisi.
  * - Lebih dari 3 hari lalu (> 3 hari) terkunci otomatis.
  * - Tanggal masa depan (belum terjadi) terkunci otomatis.
  * - Administrator memiliki akses khusus dan tidak pernah terkunci.
  */
export function isDayLocked(
  year: number,
  month: number, // 1 - 12
  day: number,   // 1 - 31
  isAdmin: boolean
): LockStatus {
  if (isAdmin) {
    return {
      isLocked: false,
      reason: null,
      label: 'Akses Khusus Admin',
    };
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  const today = new Date(currentYear, currentMonth - 1, currentDay, 0, 0, 0, 0);
  const target = new Date(year, month - 1, day, 0, 0, 0, 0);

  // Jika tanggal di masa depan
  if (target.getTime() > today.getTime()) {
    return {
      isLocked: true,
      reason: 'future',
      label: 'Belum Terjadi',
    };
  }

  // Hitung selisih hari
  const diffMs = today.getTime() - target.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 3) {
    return {
      isLocked: true,
      reason: 'expired',
      label: `Terkunci (>3 hari)`,
    };
  }

  return {
    isLocked: false,
    reason: null,
    label: diffDays === 0 ? 'Hari Ini' : `H-${diffDays}`,
  };
}

/**
 * Menghitung jumlah hari dalam bulan dan tahun tertentu.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Mengambil nama hari singkat dalam Bahasa Indonesia untuk suatu tanggal.
 */
export function getDayNameIndo(year: number, month: number, day: number): string {
  const d = new Date(year, month - 1, day);
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  return days[d.getDay()] || '';
}
