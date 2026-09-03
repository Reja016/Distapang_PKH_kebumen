import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ success: false, error: 'ID tidak valid' }, { status: 400 });

    const body = await req.json();
    const { populasi, triwulan, keterangan } = body;

    await pool.query(
      `UPDATE bitpro_sklb_populasi_sapi_po 
       SET populasi = ?, triwulan = ?, keterangan = ? 
       WHERE id = ?`,
      [Number(populasi) || 0, triwulan || 'Triwulan 2', keterangan || null, id]
    );

    return NextResponse.json({ success: true, message: 'Data berhasil diperbarui' });
  } catch (error: any) {
    console.error('Error PUT sklb-sapi-po:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ success: false, error: 'ID tidak valid' }, { status: 400 });

    await pool.query(`DELETE FROM bitpro_sklb_populasi_sapi_po WHERE id = ?`, [id]);
    return NextResponse.json({ success: true, message: 'Data berhasil dihapus' });
  } catch (error: any) {
    console.error('Error DELETE sklb-sapi-po:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
