import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface SignatureConfig {
  enabled: boolean;
  kota: string;
  jabatanLine1: string;
  jabatanLine2: string;
  namaPejabat: string;
  pangkat: string;
  nip: string;
}

const DEFAULT_SIGNATURE_CONFIG: SignatureConfig = {
  enabled: true,
  kota: 'Kebumen',
  jabatanLine1: 'Kepala Bidang Peternakan dan Kesehatan',
  jabatanLine2: 'Hewan',
  namaPejabat: 'drh. MARTI IKE W. E., MP.',
  pangkat: 'Pembina',
  nip: 'NIP. 19770225 200212 2 006',
};

async function ensureSettingsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS system_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

// GET: Ambil konfigurasi tanda tangan dinas (bisa diakses saat download Excel)
export async function GET() {
  try {
    await ensureSettingsTable();
    const [rows]: any = await pool.query(
      `SELECT setting_value FROM system_settings WHERE setting_key = 'signature_config' LIMIT 1`
    );

    if (rows && rows.length > 0 && rows[0].setting_value) {
      const config = JSON.parse(rows[0].setting_value);
      return NextResponse.json({
        success: true,
        data: { ...DEFAULT_SIGNATURE_CONFIG, ...config },
      });
    }

    return NextResponse.json({
      success: true,
      data: DEFAULT_SIGNATURE_CONFIG,
    });
  } catch (error: any) {
    console.error('Error GET /api/admin/signature-config:', error);
    return NextResponse.json({
      success: true,
      data: DEFAULT_SIGNATURE_CONFIG,
    });
  }
}

// POST: Simpan konfigurasi tanda tangan (khusus Admin)
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    await ensureSettingsTable();
    const body = await req.json().catch(() => ({}));
    const newConfig: SignatureConfig = {
      enabled: body.enabled !== false,
      kota: body.kota || 'Kebumen',
      jabatanLine1: body.jabatanLine1 || '',
      jabatanLine2: body.jabatanLine2 || '',
      namaPejabat: body.namaPejabat || '',
      pangkat: body.pangkat || '',
      nip: body.nip || '',
    };

    await pool.query(
      `INSERT INTO system_settings (setting_key, setting_value)
       VALUES ('signature_config', ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [JSON.stringify(newConfig)]
    );

    await logActivity({
      module: 'admin',
      submenu: 'anggota',
      tableName: 'system_settings',
      recordId: 1,
      action: 'UPDATE',
      userName: auth.session?.nama || 'Administrator',
      details: {
        setting_key: 'signature_config',
        config: newConfig,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Konfigurasi tanda tangan dinas berhasil disimpan!',
      data: newConfig,
    });
  } catch (error: any) {
    console.error('Error POST /api/admin/signature-config:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
