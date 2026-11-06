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

    // ── 0. BATCH INSERT / IMPORT GELONDONGAN EXCEL ──
    const items = Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : null;
    if (items && items.length > 0) {
      const { validateAreaAccess } = await import('@/lib/areaRestriction');

      let successCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];

      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];
        const rawKec = item.kecamatan || item.Kecamatan || '';
        const rawDesa = item.desa || item.Desa || '';
        const rawNamaKelompok = item.namaKelompok || item.nama_kelompok || item['Nama Kelompok'] || '';
        const rawKetua = item.namaKetuaKelompok || item.nama_ketua || item['Nama Ketua'] || item['Ketua Kelompok'] || '';
        const rawJenis = item.jenisKelompok || item.jenis_kelompok || item['Jenis Kelompok'] || 'Sapi Potong';
        const rawKelas = item.kelasKelompok || item.kelas_kelompok || item.kelas || item['Kelas Kelompok'] || 'Pemula';
        const rawReg = item.nomorRegister || item.nomor_register || item['Nomor Register'] || '-';
        const rawGapoktan = item.gapoktanInduk || item.gapoktan_induk || item['Gapoktan Induk'] || '-';
        const rawLuas = Number(item.luasLahanHa || item.luas_lahan_ha || item['Luas Lahan (Ha)']) || 0;
        const rawLaki = parseInt(String(item.anggotaLaki || item.anggota_laki || item['Anggota Laki-laki'] || 0), 10) || 0;
        const rawPerempuan = parseInt(String(item.anggotaPerempuan || item.anggota_perempuan || item['Anggota Perempuan'] || 0), 10) || 0;

        if (!rawNamaKelompok || !rawKec) {
          skippedCount++;
          continue;
        }

        // Area restriction check
        const areaCheck = await validateAreaAccess(request as any, String(rawKec), null);
        if (!areaCheck.allowed) {
          errors.push(`Baris ${idx + 1}: Wilayah Kecamatan ${rawKec} di luar kewenangan tugas Anda.`);
          continue;
        }

        await pool.query(
          `INSERT INTO ktt_master 
           (kecamatan, desa, gapoktan_induk, kelas, nama_kelompok, nomor_register, jenis_kelompok, 
            kelas_kelompok, luas_lahan_ha, anggota_laki, anggota_perempuan, nama_ketua) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            String(rawKec).trim(),
            String(rawDesa).trim() || '-',
            String(rawGapoktan).trim() || null,
            String(rawKelas).trim() || 'Pemula',
            String(rawNamaKelompok).trim(),
            String(rawReg).trim() || null,
            String(rawJenis).trim() || 'Sapi Potong',
            String(rawKelas).trim() || 'Pemula',
            rawLuas,
            rawLaki,
            rawPerempuan,
            String(rawKetua).trim() || '-'
          ]
        );
        successCount++;
      }

      await logActivity({
        module: 'bitpro',
        submenu: 'database-ktt',
        tableName: 'ktt_master',
        recordId: 0,
        action: 'BULK_IMPORT',
        userName,
        details: { totalItems: items.length, successCount, skippedCount, errorsCount: errors.length },
      });

      return NextResponse.json({
        success: true,
        message: `Berhasil mengimpor ${successCount} data Kelompok Tani Ternak (KTT).${errors.length > 0 ? ` Catatan: ${errors.length} baris di luar kewenangan wilayah.` : ''}`,
        importedCount: successCount,
        errors: errors.length > 0 ? errors : undefined,
      });
    }

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