import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';

async function ensureActivityLogsTable() {
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
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tableName = searchParams.get('table_name');
  const recordId = searchParams.get('record_id');
  const moduleParam = searchParams.get('module');
  const submenuParam = searchParams.get('submenu');

  if (!recordId) {
    return NextResponse.json({ error: 'record_id diperlukan' }, { status: 400 });
  }

  try {
    await ensureActivityLogsTable();
    let query = 'SELECT * FROM activity_logs WHERE record_id = ?';
    const params: any[] = [String(recordId)];

    if (tableName) {
      query += ' AND table_name = ?';
      params.push(tableName);
    } else if (moduleParam && submenuParam) {
      query += ' AND module = ? AND submenu = ?';
      params.push(moduleParam, submenuParam);
    }

    query += ' ORDER BY timestamp DESC';

    const [rows]: any = await pool.query(query, params);

    return NextResponse.json(rows || []);
  } catch (error: any) {
    console.error('Gagal mengambil audit logs:', error);
    return NextResponse.json({ error: 'Gagal memuat log riwayat', detail: error.message }, { status: 500 });
  }
}
