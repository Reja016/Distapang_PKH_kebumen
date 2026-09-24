import pool from '@/lib/db';

export interface LogActivityParams {
  module: string;
  submenu: string;
  tableName: string;
  recordId: string | number;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CORRECTION_APPROVED' | 'CORRECTION_REJECTED' | string;
  userName?: string;
  details?: any;
}

/**
 * Helper terpusat untuk mencatat aktivitas log ke tabel `activity_logs`.
 * Bersifat NON-BLOCKING: Jika logging gagal, fungsi ini tidak akan menggagalkan
 * operasi utama (CRUD) formulir.
 */
export async function logActivity({
  module,
  submenu,
  tableName,
  recordId,
  action,
  userName = 'Sistem',
  details = {},
}: LogActivityParams): Promise<void> {
  try {
    const detailsStr = typeof details === 'string' ? details : JSON.stringify(details || {});
    await pool.query(
      `INSERT INTO activity_logs (module, submenu, table_name, record_id, action, user_name, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        String(module || 'bitpro'),
        String(submenu || 'general'),
        String(tableName),
        String(recordId ?? '0'),
        String(action),
        String(userName || 'Sistem'),
        detailsStr,
      ]
    );
  } catch (err: any) {
    // Non-blocking log agar error field tidak menghentikan penyimpanan data
    console.warn(`[AuditLog Warning] Gagal menyimpan log aktivitas (${tableName}:${recordId}):`, err.message);
  }
}
