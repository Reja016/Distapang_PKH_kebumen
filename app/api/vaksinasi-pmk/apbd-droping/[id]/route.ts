import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { tanggal, merk_vaksin, jumlah, keterangan } = await request.json();

    const [result]: any = await pool.execute(
      'UPDATE vaksin_apbd_droping SET tanggal = ?, merk_vaksin = ?, jumlah = ?, keterangan = ? WHERE id = ?',
      [tanggal, merk_vaksin, jumlah, keterangan ?? null, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Data tidak ditemukan.' }, { status: 404 });
    }

    const session = await getSessionFromRequest(request as any);
    const userName = session?.nama || session?.nip_username || request.headers.get('x-user-name') || 'Petugas';

    await logActivity({
      module: 'keswan',
      submenu: 'data-vaksinasi',
      tableName: 'vaksin_apbd_droping',
      recordId: id,
      action: 'UPDATE',
      userName,
      details: { tanggal, merk_vaksin, jumlah, keterangan },
    });

    return NextResponse.json({ success: true, message: 'Droping vaksin berhasil diperbarui.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const [result]: any = await pool.execute('DELETE FROM vaksin_apbd_droping WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Data tidak ditemukan.' }, { status: 404 });
    }

    const session = await getSessionFromRequest(request as any);
    const userName = session?.nama || session?.nip_username || request.headers.get('x-user-name') || 'Petugas';

    await logActivity({
      module: 'keswan',
      submenu: 'data-vaksinasi',
      tableName: 'vaksin_apbd_droping',
      recordId: id,
      action: 'DELETE',
      userName,
      details: { id },
    });

    return NextResponse.json({ success: true, message: 'Data droping berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}