import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak valid' }, { status: 400 });
    }

    const body = await req.json();
    const { tahun, kecamatan_id, kecamatan_nama, puskeswan_id, diagnosa_nama, kategori_penyakit, jumlah_kasus, keterangan } = body;

    await pool.query(
      `UPDATE keswan_laporan_penyakit SET
        tahun = COALESCE(?, tahun),
        kecamatan_id = COALESCE(?, kecamatan_id),
        kecamatan_nama = COALESCE(?, kecamatan_nama),
        puskeswan_id = COALESCE(?, puskeswan_id),
        diagnosa_nama = COALESCE(?, diagnosa_nama),
        kategori_penyakit = COALESCE(?, kategori_penyakit),
        jumlah_kasus = COALESCE(?, jumlah_kasus),
        keterangan = ?
      WHERE id = ?`,
      [
        tahun ? Number(tahun) : null,
        kecamatan_id ? kecamatan_id.toLowerCase().trim() : null,
        kecamatan_nama || null,
        puskeswan_id || null,
        diagnosa_nama || null,
        kategori_penyakit || null,
        jumlah_kasus !== undefined ? Number(jumlah_kasus) : null,
        keterangan !== undefined ? keterangan : null,
        id,
      ]
    );

    return NextResponse.json({ success: true, message: 'Data kasus penyakit berhasil diperbarui' });
  } catch (error: any) {
    console.error('Error PUT laporan-penyakit:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak valid' }, { status: 400 });
    }

    await pool.query(`DELETE FROM keswan_laporan_penyakit WHERE id = ?`, [id]);

    return NextResponse.json({ success: true, message: 'Data kasus penyakit berhasil dihapus' });
  } catch (error: any) {
    console.error('Error DELETE laporan-penyakit:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
