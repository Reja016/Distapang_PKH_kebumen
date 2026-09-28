import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

const EDITABLE_FIELDS = [
  'no_urut', 'puskeswan', 'target_lsd', 'target_ndai', 'target_rabies',
  'target_aphtovaks', 'pengambilan_ndai', 'pengambilan_aphtovaks', 'catatan',
];

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    const fieldsToUpdate = Object.keys(body).filter((key) => EDITABLE_FIELDS.includes(key));
    if (fieldsToUpdate.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada field valid untuk diupdate.' }, { status: 400 });
    }

    const setClause = fieldsToUpdate.map((f) => `${f} = ?`).join(', ');
    const values = fieldsToUpdate.map((f) => body[f]);
    values.push(id);

    const [result]: any = await pool.execute(
      `UPDATE vaksin_apbd_target SET ${setClause} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Data tidak ditemukan.' }, { status: 404 });
    }

    const session = await getSessionFromRequest(request as any);
    const userName = session?.nama || session?.nip_username || request.headers.get('x-user-name') || 'Petugas';

    await logActivity({
      module: 'keswan',
      submenu: 'data-vaksinasi',
      tableName: 'vaksin_apbd_target',
      recordId: id,
      action: 'UPDATE',
      userName,
      details: body,
    });

    return NextResponse.json({ success: true, message: 'Target APBD berhasil diperbarui.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const [result]: any = await pool.execute('DELETE FROM vaksin_apbd_target WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Data tidak ditemukan.' }, { status: 404 });
    }

    const session = await getSessionFromRequest(request as any);
    const userName = session?.nama || session?.nip_username || request.headers.get('x-user-name') || 'Petugas';

    await logActivity({
      module: 'keswan',
      submenu: 'data-vaksinasi',
      tableName: 'vaksin_apbd_target',
      recordId: id,
      action: 'DELETE',
      userName,
      details: { id },
    });

    return NextResponse.json({ success: true, message: 'Data target APBD berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}