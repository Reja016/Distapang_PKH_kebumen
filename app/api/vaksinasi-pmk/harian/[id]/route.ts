import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { jumlah, tanggal } = await request.json();

    const fields: string[] = [];
    const values: any[] = [];
    if (jumlah !== undefined) { fields.push('jumlah = ?'); values.push(jumlah); }
    if (tanggal !== undefined) { fields.push('tanggal = ?'); values.push(tanggal); }

    if (fields.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada field untuk diupdate.' }, { status: 400 });
    }
    values.push(id);

    const [result]: any = await pool.execute(
      `UPDATE vaksinasi_harian SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Data tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Data harian berhasil diperbarui.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const [result]: any = await pool.execute('DELETE FROM vaksinasi_harian WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: 'Data tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Data harian berhasil dihapus.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}