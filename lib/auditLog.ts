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

let tableInitialized = false;

async function ensureActivityLogsTable() {
  if (tableInitialized) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        module VARCHAR(100) NOT NULL,
        submenu VARCHAR(100) NOT NULL,
        table_name VARCHAR(100) NOT NULL,
        record_id VARCHAR(100) NOT NULL,
        action VARCHAR(50) NOT NULL,
        user_name VARCHAR(255) NOT NULL DEFAULT 'Sistem',
        details LONGTEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    tableInitialized = true;
  } catch (e: any) {
    console.warn('[AuditLog Warning] Could not ensure activity_logs table:', e.message);
  }
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
    await ensureActivityLogsTable();
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
