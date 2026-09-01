import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Mencegah Next.js melakukan caching agar data selalu real-time
export const dynamic = 'force-dynamic';

// ==========================================
// 1. FUNGSI MENYEDOT DATA (GET)
// ==========================================
export async function GET() {
  try {
    // Tarik semua data dari tabel ktt_master, urutkan dari ID terbesar (terbaru)
    const [rows]: any = await pool.query('SELECT * FROM ktt_master ORDER BY id DESC');
    
    // Ubah format penulisan MySQL (snake_case) ke format React (camelCase)
    const formatted = rows.map((row: any) => ({
      id: row.id,
      kecamatan: row.kecamatan,
      desa: row.desa,
      namaKelompok: row.nama_kelompok,
      nomorRegister: row.nomor_register,
      jenisKelompok: row.jenis_kelompok,
      kelasKelompok: row.kelas_kelompok,
      luasLahanHa: Number(row.luas_lahan_ha),
      anggotaLaki: Number(row.anggota_laki),
      anggotaPerempuan: Number(row.anggota_perempuan),
      namaKetuaKelompok: row.nama_ketua
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
      id, kecamatan, desa, namaKelompok, nomorRegister, 
      jenisKelompok, kelasKelompok, luasLahanHa, 
      anggotaLaki, anggotaPerempuan, namaKetuaKelompok 
    } = body;

    if (id) {
      // JIKA ADA ID = EDIT DATA LAMA
      await pool.query(
        `UPDATE ktt_master 
         SET kecamatan=?, desa=?, nama_kelompok=?, nomor_register=?, 
             jenis_kelompok=?, kelas_kelompok=?, luas_lahan_ha=?, 
             anggota_laki=?, anggota_perempuan=?, nama_ketua=? 
         WHERE id=?`,
        [kecamatan, desa, namaKelompok, nomorRegister, jenisKelompok, 
         kelasKelompok, luasLahanHa, anggotaLaki, anggotaPerempuan, 
         namaKetuaKelompok, id]
      );
    } else {
      // JIKA TIDAK ADA ID = TAMBAH DATA BARU
      await pool.query(
        `INSERT INTO ktt_master 
         (kecamatan, desa, nama_kelompok, nomor_register, jenis_kelompok, 
          kelas_kelompok, luas_lahan_ha, anggota_laki, anggota_perempuan, nama_ketua) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [kecamatan, desa, namaKelompok, nomorRegister, jenisKelompok, 
         kelasKelompok, luasLahanHa, anggotaLaki, anggotaPerempuan, namaKetuaKelompok]
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