import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

// ==========================================
// 1. FUNGSI MENYEDOT DATA (GET)
// ==========================================
export async function GET() {
  try {
    const [rows]: any = await pool.query('SELECT * FROM ktt_master ORDER BY id ASC');
    
    const formatted = rows.map((row: any) => ({
      id: row.id,
      kecamatan: row.kecamatan,
      desa: row.desa,
      gapoktanInduk: row.gapoktan_induk || '-',
      kelas: row.kelas || row.kelas_kelompok || '-',
      namaKelompok: row.nama_kelompok,
      nomorRegister: row.nomor_register || '-',
      jenisKelompok: row.jenis_kelompok || 'Sapi Potong',
      kelasKelompok: row.kelas_kelompok || row.kelas || 'Pemula',
      luasLahanHa: Number(row.luas_lahan_ha) || 0,
      anggotaLaki: Number(row.anggota_laki) || 0,
      anggotaPerempuan: Number(row.anggota_perempuan) || 0,
      namaKetuaKelompok: row.nama_ketua || '-'
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Gagal GET data KTT:', error);
    return NextResponse.json({ error: 'Gagal mengambil data dari MySQL' }, { status: 500 });
  }
}

// ==========================================
// 2. FUNGSI SIMPAN & EDIT DATA (POST)
// ==========================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      id, kecamatan, desa, gapoktanInduk, kelas, namaKelompok, nomorRegister, 
      jenisKelompok, kelasKelompok, luasLahanHa, 
      anggotaLaki, anggotaPerempuan, namaKetuaKelompok 
    } = body;

    const kelasFinal = kelas || kelasKelompok || 'Pemula';

    if (id) {
      // EDIT DATA LAMA
      await pool.query(
        `UPDATE ktt_master 
         SET kecamatan=?, desa=?, gapoktan_induk=?, kelas=?, nama_kelompok=?, nomor_register=?, 
             jenis_kelompok=?, kelas_kelompok=?, luas_lahan_ha=?, 
             anggota_laki=?, anggota_perempuan=?, nama_ketua=? 
         WHERE id=?`,
        [kecamatan, desa, gapoktanInduk || null, kelasFinal, namaKelompok, nomorRegister, jenisKelompok, 
         kelasFinal, Number(luasLahanHa) || 0, Number(anggotaLaki) || 0, Number(anggotaPerempuan) || 0, 
         namaKetuaKelompok, id]
      );
    } else {
      // TAMBAH DATA BARU
      await pool.query(
        `INSERT INTO ktt_master 
         (kecamatan, desa, gapoktan_induk, kelas, nama_kelompok, nomor_register, jenis_kelompok, 
          kelas_kelompok, luas_lahan_ha, anggota_laki, anggota_perempuan, nama_ketua) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [kecamatan, desa, gapoktanInduk || null, kelasFinal, namaKelompok, nomorRegister, jenisKelompok, 
         kelasFinal, Number(luasLahanHa) || 0, Number(anggotaLaki) || 0, Number(anggotaPerempuan) || 0, namaKetuaKelompok]
      );
    }
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Gagal POST data KTT:', error);
    return NextResponse.json({ error: 'Gagal menyimpan data ke MySQL' }, { status: 500 });
  }
}

// ==========================================
// 3. FUNGSI HAPUS DATA (DELETE)
// ==========================================
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      await pool.query('DELETE FROM ktt_master WHERE id=?', [id]);
    }
    
    return NextResponse.json({ status: 'success' });
  } catch (error) {
    console.error('Gagal DELETE data KTT:', error);
    return NextResponse.json({ error: 'Gagal menghapus data dari MySQL' }, { status: 500 });
  }
}