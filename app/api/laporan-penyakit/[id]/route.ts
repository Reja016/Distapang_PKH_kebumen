import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';
import { getZoneByKecamatanId } from '@/lib/penyakitData';

export const dynamic = 'force-dynamic';

const PUSKESWAN_ID_MAP: Record<string, number> = {
  mirit: 1,
  klirong: 2,
  gombong: 3,
  buayan: 4,
  alian: 5,
  prembun: 6,
  kebumen: 7,
  karanganyar: 8,
};

const KECAMATAN_CODE_TO_ID: Record<string, number> = {
  k_ayah: 1, ayah: 1,
  k_buayan: 2, buayan: 2,
  k_puring: 3, puring: 3,
  k_petanahan: 4, petanahan: 4,
  k_klirong: 5, klirong: 5,
  k_buluspesantren: 6, buluspesantren: 6,
  k_ambal: 7, ambal: 7,
  k_mirit: 8, mirit: 8,
  k_bonorowo: 9, bonorowo: 9,
  k_prembun: 10, prembun: 10,
  k_padureso: 11, padureso: 11,
  k_kutowinangun: 12, kutowinangun: 12,
  k_alian: 13, alian: 13,
  k_poncowarno: 14, poncowarno: 14,
  k_kebumen: 15, kebumen: 15,
  k_pejagoan: 16, pejagoan: 16,
  k_sruweng: 17, sruweng: 17,
  k_adimulyo: 18, adimulyo: 18,
  k_kuwarasan: 19, kuwarasan: 19,
  k_rowokele: 20, rowokele: 20,
  k_sempor: 21, sempor: 21,
  k_gombong: 22, gombong: 22,
  k_karanganyar: 23, karanganyar: 23,
  k_karanggayam: 24, karanggayam: 24,
  k_sadang: 25, sadang: 25,
  k_karangsambung: 26, karangsambung: 26,
};

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

    // Validasi Pembatasan Wilayah Kerja Petugas (Role-Based Area Restriction)
    if (kecamatan_nama || kecamatan_id || puskeswan_id) {
      const { validateAreaAccess } = await import('@/lib/areaRestriction');
      const targetKec = kecamatan_nama || kecamatan_id;
      const areaCheck = await validateAreaAccess(req, targetKec, puskeswan_id);
      if (!areaCheck.allowed && areaCheck.errorResponse) {
        return areaCheck.errorResponse;
      }
    }

    // Deteksi skema database (Flat vs Relasional)
    let pkCol = 'id';
    let hasDiagNama = false;
    let hasKecId = false;
    try {
      const [descRows]: any = await pool.query('DESCRIBE keswan_laporan_penyakit');
      const fields = (descRows || []).map((f: any) => f.Field);
      if (fields.includes('id_laporan_penyakit')) {
        pkCol = 'id_laporan_penyakit';
      }
      hasDiagNama = fields.includes('diagnosa_nama');
      hasKecId = fields.includes('kecamatan_id');
    } catch {}

    const cleanKec = (kecamatan_nama || kecamatan_id || '').replace(/^k_/, '').trim();
    const kecCode = cleanKec ? `k_${cleanKec.toLowerCase()}` : null;
    const puskCode = puskeswan_id ? String(puskeswan_id).toLowerCase() : null;

    if (hasDiagNama && hasKecId) {
      // Skema Flat (Online cPanel default)
      await pool.query(
        `UPDATE keswan_laporan_penyakit SET
          tahun = COALESCE(?, tahun),
          puskeswan_id = COALESCE(?, puskeswan_id),
          kecamatan_id = COALESCE(?, kecamatan_id),
          kecamatan_nama = COALESCE(?, kecamatan_nama),
          diagnosa_nama = COALESCE(?, diagnosa_nama),
          kategori_penyakit = COALESCE(?, kategori_penyakit),
          jumlah_kasus = COALESCE(?, jumlah_kasus),
          keterangan = ?
        WHERE ${pkCol} = ?`,
        [
          tahun ? Number(tahun) : null,
          puskCode,
          kecCode,
          cleanKec || null,
          diagnosa_nama || null,
          kategori_penyakit || null,
          jumlah_kasus !== undefined ? Number(jumlah_kasus) : null,
          keterangan !== undefined ? keterangan : null,
          id,
        ]
      );
    } else {
      // Skema Relasional (Offline local)
      let idDiagnosa: number | null = null;
      let finalKategori = kategori_penyakit || 'Umum';
      if (diagnosa_nama) {
        try {
          const [diagRows]: any = await pool.query(
            'SELECT id_diagnosa, kategori_penyakit FROM diagnosa WHERE LOWER(diagnosa_nama) = LOWER(?) LIMIT 1',
            [diagnosa_nama.trim()]
          );
          if (diagRows && diagRows.length > 0) {
            idDiagnosa = diagRows[0].id_diagnosa;
            if (diagRows[0].kategori_penyakit) finalKategori = diagRows[0].kategori_penyakit;
          }
        } catch {}
      }

      let idKecamatan: number | null = null;
      if (kecCode) {
        idKecamatan = KECAMATAN_CODE_TO_ID[kecCode] || null;
      }

      let idPuskeswan: number | null = null;
      if (puskeswan_id) {
        idPuskeswan = PUSKESWAN_ID_MAP[puskeswan_id.toLowerCase()] || null;
      }

      await pool.query(
        `UPDATE keswan_laporan_penyakit SET
          tahun = COALESCE(?, tahun),
          id_puskeswan = COALESCE(?, id_puskeswan),
          id_kecamatan = COALESCE(?, id_kecamatan),
          id_diagnosa = COALESCE(?, id_diagnosa),
          kategori_penyakit = COALESCE(?, kategori_penyakit),
          jumlah_kasus = COALESCE(?, jumlah_kasus),
          keterangan = ?
        WHERE ${pkCol} = ?`,
        [
          tahun ? Number(tahun) : null,
          idPuskeswan,
          idKecamatan,
          idDiagnosa,
          finalKategori,
          jumlah_kasus !== undefined ? Number(jumlah_kasus) : null,
          keterangan !== undefined ? keterangan : null,
          id,
        ]
      );
    }

    const session = await getSessionFromRequest(req as any);
    const userName = session?.nama || session?.nip_username || 'Sistem';

    await logActivity({
      module: 'keswan',
      submenu: 'laporan-penyakit',
      tableName: 'keswan_laporan_penyakit',
      recordId: id,
      action: 'UPDATE',
      userName,
      details: { tahun, kecamatan_nama: cleanKec, puskeswan_id, diagnosa_nama, jumlah_kasus, keterangan },
    });

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

    const session = await getSessionFromRequest(req as any);
    const userName = session?.nama || session?.nip_username || 'Sistem';

    let pkCol = 'id';
    try {
      const [descRows]: any = await pool.query('DESCRIBE keswan_laporan_penyakit');
      const fields = (descRows || []).map((f: any) => f.Field);
      if (fields.includes('id_laporan_penyakit')) {
        pkCol = 'id_laporan_penyakit';
      }
    } catch {}

    try {
      await pool.query(`DELETE FROM keswan_laporan_penyakit WHERE ${pkCol} = ?`, [id]);
    } catch {
      const altPk = pkCol === 'id' ? 'id_laporan_penyakit' : 'id';
      await pool.query(`DELETE FROM keswan_laporan_penyakit WHERE ${altPk} = ?`, [id]);
    }

    await logActivity({
      module: 'keswan',
      submenu: 'laporan-penyakit',
      tableName: 'keswan_laporan_penyakit',
      recordId: id,
      action: 'DELETE',
      userName,
      details: { deleted_id: id },
    });

    return NextResponse.json({ success: true, message: 'Data kasus penyakit berhasil dihapus' });
  } catch (error: any) {
    console.error('Error DELETE laporan-penyakit:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
