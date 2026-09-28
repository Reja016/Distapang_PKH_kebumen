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
  const actionParam = searchParams.get('action');
  const searchParam = searchParams.get('search');
  const startDateParam = searchParams.get('start_date');
  const endDateParam = searchParams.get('end_date');
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = parseInt(searchParams.get('limit') || '50', 10);
  const isExport = searchParams.get('export') === 'true';

  try {
    await ensureActivityLogsTable();

    // 1. KASUS A: Dipanggil untuk spesifik Record (UniversalAuditModal)
    if (recordId) {
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
    }

    // 2. KASUS B: Dipanggil untuk Pusat Riwayat Perubahan Admin (Audit Trail Global)
    const session = await getSessionFromRequest(request as any);
    const headerRole = request.headers.get('x-user-role') || '';
    const userRole = (session?.role || headerRole).toLowerCase();

    const isAllowedAdmin =
      userRole === 'administrator' ||
      userRole === 'admin' ||
      userRole === 'superadmin' ||
      userRole.includes('admin');

    if (!isAllowedAdmin) {
      return NextResponse.json({ error: 'Akses ditolak. Khusus Administrator.' }, { status: 403 });
    }

    const conditions: string[] = ['1=1'];
    const queryParams: any[] = [];

    if (moduleParam && moduleParam !== 'all') {
      conditions.push('module = ?');
      queryParams.push(moduleParam);
    }

    if (actionParam && actionParam !== 'all') {
      conditions.push('action = ?');
      queryParams.push(actionParam);
    }

    if (startDateParam) {
      conditions.push('DATE(timestamp) >= ?');
      queryParams.push(startDateParam);
    }

    if (endDateParam) {
      conditions.push('DATE(timestamp) <= ?');
      queryParams.push(endDateParam);
    }

    if (searchParam && searchParam.trim()) {
      const s = `%${searchParam.trim()}%`;
      conditions.push(
        '(user_name LIKE ? OR table_name LIKE ? OR record_id LIKE ? OR details LIKE ? OR module LIKE ? OR submenu LIKE ?)'
      );
      queryParams.push(s, s, s, s, s, s);
    }

    const whereClause = conditions.join(' AND ');

    // Hitung total data untuk pagination
    const [countResult]: any = await pool.query(
      `SELECT COUNT(*) as total FROM activity_logs WHERE ${whereClause}`,
      queryParams
    );
    const total = countResult[0]?.total || 0;

    // Hitung statistik ringkas aktivitas
    const [statsResult]: any = await pool.query(
      `SELECT 
        COUNT(*) as total_logs,
        SUM(CASE WHEN action = 'CREATE' THEN 1 ELSE 0 END) as total_create,
        SUM(CASE WHEN action = 'UPDATE' THEN 1 ELSE 0 END) as total_update,
        SUM(CASE WHEN action = 'DELETE' THEN 1 ELSE 0 END) as total_delete
       FROM activity_logs WHERE ${whereClause}`,
      queryParams
    );
    const stats = statsResult[0] || { total_logs: 0, total_create: 0, total_update: 0, total_delete: 0 };

    // Query data logs dengan urutan terbaru
    let logQuery = `SELECT * FROM activity_logs WHERE ${whereClause} ORDER BY timestamp DESC`;
    const finalParams = [...queryParams];

    if (!isExport) {
      const page = Math.max(1, pageParam);
      const limit = Math.min(200, Math.max(10, limitParam));
      const offset = (page - 1) * limit;
      logQuery += ' LIMIT ? OFFSET ?';
      finalParams.push(limit, offset);
    } else {
      logQuery += ' LIMIT 5000'; // Batas aman export
    }

    const [rows]: any = await pool.query(logQuery, finalParams);

    return NextResponse.json({
      success: true,
      logs: rows || [],
      total,
      page: pageParam,
      limit: limitParam,
      totalPages: Math.ceil(total / (limitParam || 50)),
      stats: {
        total: Number(stats.total_logs) || 0,
        create: Number(stats.total_create) || 0,
        update: Number(stats.total_update) || 0,
        delete: Number(stats.total_delete) || 0,
      }
    });

  } catch (error: any) {
    console.error('Gagal mengambil audit logs:', error);
    return NextResponse.json({ error: 'Gagal memuat log riwayat', detail: error.message }, { status: 500 });
  }
}
