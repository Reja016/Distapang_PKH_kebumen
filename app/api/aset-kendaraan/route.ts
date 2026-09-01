import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

// GET: Ambil semua data kendaraan dari database
export async function GET() {
  try {
    const [rows]: any = await pool.execute(
      'SELECT * FROM aset_kendaraan ORDER BY id_aset ASC'
    );
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Tambah kendaraan baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama_pemegang, merk_type, tahun, nopol_lama, nopol_baru, nomor_mesin, nomor_rangka, keterangan } = body;

    if (!nama_pemegang || !merk_type || !nopol_baru) {
      return NextResponse.json({ success: false, error: 'Data wajib belum lengkap!' }, { status: 400 });
    }

    const [result]: any = await pool.execute(
      `INSERT INTO aset_kendaraan (nama_pemegang, merk_type, tahun, nopol_lama, nopol_baru, nomor_mesin, nomor_rangka)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nama_pemegang, merk_type, tahun || null, nopol_lama || null, nopol_baru, nomor_mesin || '', nomor_rangka || '']
    );

    return NextResponse.json({ success: true, insertId: result.insertId, message: 'Data kendaraan berhasil ditambahkan!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Edit data kendaraan
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id_aset, nama_pemegang, merk_type, tahun, nopol_lama, nopol_baru, nomor_mesin, nomor_rangka, keterangan } = body;

    if (!id_aset || !nama_pemegang || !nopol_baru) {
      return NextResponse.json({ success: false, error: 'Data wajib belum lengkap!' }, { status: 400 });
    }

    await pool.execute(
      `UPDATE aset_kendaraan SET nama_pemegang=?, merk_type=?, tahun=?, nopol_lama=?, nopol_baru=?, nomor_mesin=?, nomor_rangka=?
       WHERE id_aset=?`,
      [nama_pemegang, merk_type, tahun || null, nopol_lama || null, nopol_baru, nomor_mesin || '', nomor_rangka || '', id_aset]
    );

    return NextResponse.json({ success: true, message: 'Data kendaraan berhasil diperbarui!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus data kendaraan
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak ditemukan!' }, { status: 400 });
    }

    await pool.execute('DELETE FROM aset_kendaraan WHERE id_aset = ?', [id]);
    return NextResponse.json({ success: true, message: 'Data kendaraan berhasil dihapus!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
