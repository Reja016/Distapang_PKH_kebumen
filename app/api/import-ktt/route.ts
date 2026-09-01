import { NextResponse } from 'next/server';
import pool from '@/lib/db';
// Pastikan alamat import ini mengarah ke file ktt-data.ts Mas
import kttData from '@/app/bitpro/database-ktt/data/ktt-data'; 

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Buat tabel ktt_master (struktur kolom profesional)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ktt_master (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kecamatan VARCHAR(100),
        desa VARCHAR(100),
        nama_kelompok VARCHAR(255),
        nomor_register VARCHAR(100),
        jenis_kelompok VARCHAR(100),
        kelas_kelompok VARCHAR(50),
        luas_lahan_ha DECIMAL(10,2),
        anggota_laki INT,
        anggota_perempuan INT,
        nama_ketua VARCHAR(150)
      )
    `);

    // 2. Kosongkan tabel jika sebelumnya pernah diisi (mencegah double)
    await pool.query('TRUNCATE TABLE ktt_master');

    // 3. Masukkan 2.873 data ke MySQL
    for (const row of kttData) {
      await pool.query(
        `INSERT INTO ktt_master 
        (kecamatan, desa, nama_kelompok, nomor_register, jenis_kelompok, kelas_kelompok, luas_lahan_ha, anggota_laki, anggota_perempuan, nama_ketua) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [row.kecamatan, row.desa, row.namaKelompok, row.nomorRegister, row.jenisKelompok, row.kelasKelompok, row.luasLahanHa, row.anggotaLaki, row.anggotaPerempuan, row.namaKetuaKelompok]
      );
    }

    return NextResponse.json({ 
      status: 'Super Sukses! 🚀', 
      pesan: `${kttData.length} Kelompok Tani berhasil mendarat di MySQL!` 
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ status: 'Gagal', error: 'Cek terminal VS Code' }, { status: 500 });
  }
}