import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export const dynamic = 'force-dynamic';

// FUNGSI GET: Menampilkan semua data
export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM pemotongan_hewan ORDER BY id DESC');
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// FUNGSI POST: Menambah data baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      nama_usaha,
      jenis = 'RPH',
      pemilik,
      alamat_pemilik = '',
      kontak = '-',
      lokasi = '',
      status_perijinan = 'Belum Berizin',
      sertifikat_halal = 'Tidak',
      sertifikat_nkv = 'Tidak',
      produksi_per_bulan_kg = 0,
      pemotongan_per_hari_ekor = 0,
    } = body;

    if (!nama_usaha || !pemilik) {
      return NextResponse.json({ success: false, error: 'Nama Usaha dan Pemilik wajib diisi!' }, { status: 400 });
    }

    const [result]: any = await pool.query(
      `INSERT INTO pemotongan_hewan 
       (nama_usaha, jenis, pemilik, alamat_pemilik, kontak, lokasi, status_perijinan, sertifikat_halal, sertifikat_nkv, produksi_per_bulan_kg, pemotongan_per_hari_ekor)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nama_usaha,
        jenis || 'RPH',
        pemilik,
        alamat_pemilik,
        kontak || '-',
        lokasi || alamat_pemilik || '-',
        status_perijinan || 'Belum Berizin',
        sertifikat_halal || 'Tidak',
        sertifikat_nkv || 'Tidak',
        Number(produksi_per_bulan_kg) || 0,
        Number(pemotongan_per_hari_ekor) || 0,
      ]
    );

    return NextResponse.json({ success: true, insertId: result.insertId, message: 'Data RPH/TPH berhasil ditambahkan ke database!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// FUNGSI PUT: Edit data
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      nama_usaha,
      jenis = 'RPH',
      pemilik,
      alamat_pemilik = '',
      kontak = '-',
      lokasi = '',
      status_perijinan = 'Belum Berizin',
      sertifikat_halal = 'Tidak',
      sertifikat_nkv = 'Tidak',
      produksi_per_bulan_kg = 0,
      pemotongan_per_hari_ekor = 0,
    } = body;

    if (!id || !nama_usaha || !pemilik) {
      return NextResponse.json({ success: false, error: 'Data wajib belum lengkap!' }, { status: 400 });
    }

    await pool.query(
      `UPDATE pemotongan_hewan 
       SET nama_usaha=?, jenis=?, pemilik=?, alamat_pemilik=?, kontak=?, lokasi=?, status_perijinan=?, sertifikat_halal=?, sertifikat_nkv=?, produksi_per_bulan_kg=?, pemotongan_per_hari_ekor=?
       WHERE id=?`,
      [
        nama_usaha,
        jenis || 'RPH',
        pemilik,
        alamat_pemilik,
        kontak || '-',
        lokasi || alamat_pemilik || '-',
        status_perijinan || 'Belum Berizin',
        sertifikat_halal || 'Tidak',
        sertifikat_nkv || 'Tidak',
        Number(produksi_per_bulan_kg) || 0,
        Number(pemotongan_per_hari_ekor) || 0,
        id,
      ]
    );

    return NextResponse.json({ success: true, message: 'Data RPH/TPH berhasil diperbarui di database!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// FUNGSI DELETE: Hapus data
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak ditemukan!' }, { status: 400 });
    }

    await pool.query('DELETE FROM pemotongan_hewan WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Data RPH/TPH berhasil dihapus dari database!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}