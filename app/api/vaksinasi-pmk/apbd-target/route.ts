import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

export async function GET() {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM vaksin_apbd_target ORDER BY no_urut ASC'
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      no_urut, puskeswan,
      target_lsd = 0, target_ndai = 0, target_rabies = 0, target_aphtovaks = 0,
      pengambilan_ndai = null, pengambilan_aphtovaks = null, catatan = null,
    } = body;

    if (!puskeswan || puskeswan.trim() === '') {
      return NextResponse.json({ success: false, error: 'Nama Puskeswan wajib diisi.' }, { status: 400 });
    }

    const [result]: any = await pool.execute(
      `INSERT INTO vaksin_apbd_target
        (no_urut, puskeswan, target_lsd, target_ndai, target_rabies, target_aphtovaks, pengambilan_ndai, pengambilan_aphtovaks, catatan)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [no_urut, puskeswan.trim(), target_lsd, target_ndai, target_rabies, target_aphtovaks, pengambilan_ndai, pengambilan_aphtovaks, catatan]
    );

    const session = await getSessionFromRequest(request as any);
    const userName = session?.nama || session?.nip_username || request.headers.get('x-user-name') || 'Petugas';

    await logActivity({
      module: 'keswan',
      submenu: 'data-vaksinasi',
      tableName: 'vaksin_apbd_target',
      recordId: result.insertId,
      action: 'CREATE',
      userName,
      details: {
        puskeswan: puskeswan.trim(),
        target_lsd,
        target_ndai,
        target_rabies,
        target_aphtovaks,
      },
    });

    return NextResponse.json({ success: true, message: 'Target APBD Puskeswan berhasil ditambahkan.', id: result.insertId });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ success: false, error: 'Nama Puskeswan sudah ada di data target APBD.' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}