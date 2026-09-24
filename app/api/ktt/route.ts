import { NextResponse, NextRequest } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

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
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request as any);
    const userName = session ? (session.nama || session.nip_username) : 'Sistem';

    const body = await request.json();
    const { 
      id, kecamatan, desa, gapoktanInduk, kelas, namaKelompok, nomorRegister, 
      jenisKelompok, kelasKelompok, luasLahanHa, 
      anggotaLaki, anggotaPerempuan, namaKetuaKelompok 
    } = body;

    const kelasFinal = kelas || kelasKelompok || 'Pemula';

    const dbPayload = {
      kecamatan, desa, gapoktan_induk: gapoktanInduk, kelas: kelasFinal, 
      nama_kelompok: namaKelompok, nomor_register: nomorRegister, jenis_kelompok: jenisKelompok,
      kelas_kelompok: kelasFinal, luas_lahan_ha: Number(luasLahanHa) || 0, 
      anggota_laki: Number(anggotaLaki) || 0, anggota_perempuan: Number(anggotaPerempuan) || 0, 
      nama_ketua: namaKetuaKelompok
    };

    if (id) {
      // EDIT DATA LAMA
      await pool.query(
        `UPDATE ktt_master 
         SET kecamatan=?, desa=?, gapoktan_induk=?, kelas=?, nama_kelompok=?, nomor_register=?, 
             jenis_kelompok=?, kelas_kelompok=?, luas_lahan_ha=?, 
             anggota_laki=?, anggota_perempuan=?, nama_ketua=? 
         WHERE id_ktt=? OR id=?`,
        [dbPayload.kecamatan, dbPayload.desa, dbPayload.gapoktan_induk || null, dbPayload.kelas, dbPayload.nama_kelompok, dbPayload.nomor_register, dbPayload.jenis_kelompok, 
         dbPayload.kelas_kelompok, dbPayload.luas_lahan_ha, dbPayload.anggota_laki, dbPayload.anggota_perempuan, 
         dbPayload.nama_ketua, id, id]
      );

      await logActivity({
        module: 'bitpro',
        submenu: 'database-ktt',
        tableName: 'ktt_master',
        recordId: id,
        action: 'UPDATE',
        userName,
        details: dbPayload,
      });

    } else {
      // TAMBAH DATA BARU
      const [res]: any = await pool.query(
        `INSERT INTO ktt_master 
         (kecamatan, desa, gapoktan_induk, kelas, nama_kelompok, nomor_register, jenis_kelompok, 
          kelas_kelompok, luas_lahan_ha, anggota_laki, anggota_perempuan, nama_ketua) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dbPayload.kecamatan, dbPayload.desa, dbPayload.gapoktan_induk || null, dbPayload.kelas, dbPayload.nama_kelompok, dbPayload.nomor_register, dbPayload.jenis_kelompok, 
         dbPayload.kelas_kelompok, dbPayload.luas_lahan_ha, dbPayload.anggota_laki, dbPayload.anggota_perempuan, dbPayload.nama_ketua]
      );
      
      await logActivity({
        module: 'bitpro',
        submenu: 'database-ktt',
        tableName: 'ktt_master',
        recordId: res.insertId,
        action: 'CREATE',
        userName,
        details: dbPayload,
      });
    }
    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Gagal POST data KTT:', error);
    return NextResponse.json({ error: 'Gagal menyimpan data ke MySQL', detail: error?.message }, { status: 500 });
  }
}

// ==========================================
// 3. FUNGSI HAPUS DATA (DELETE)
// ==========================================
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request as any);
    const userName = session ? (session.nama || session.nip_username) : 'Sistem';

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      await pool.query('DELETE FROM ktt_master WHERE id_ktt=? OR id=?', [id, id]);
      await logActivity({
        module: 'bitpro',
        submenu: 'database-ktt',
        tableName: 'ktt_master',
        recordId: id,
        action: 'DELETE',
        userName,
        details: { id },
      });
    }
    
    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Gagal DELETE data KTT:', error);
    return NextResponse.json({ error: 'Gagal menghapus data dari MySQL', detail: error?.message }, { status: 500 });
  }
}