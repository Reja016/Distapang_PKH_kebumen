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

    // Resolusi id_diagnosa jika diagnosa_nama diberikan
    let idDiagnosa: number | null = null;
    let finalKategori = kategori_penyakit || 'Umum';
    if (diagnosa_nama) {
      const [diagRows]: any = await pool.query(
        'SELECT id_diagnosa, kategori_penyakit FROM diagnosa WHERE LOWER(diagnosa_nama) = LOWER(?) LIMIT 1',
        [diagnosa_nama.trim()]
      );
      if (diagRows && diagRows.length > 0) {
        idDiagnosa = diagRows[0].id_diagnosa;
        if (diagRows[0].kategori_penyakit) finalKategori = diagRows[0].kategori_penyakit;
      }
    }

    // Resolusi id_kecamatan jika nama/kode kecamatan diberikan
    let idKecamatan: number | null = null;
    if (kecamatan_nama || kecamatan_id) {
      const cleanKec = (kecamatan_nama || kecamatan_id || '').replace(/^k_/, '').trim();
      const [kecRows]: any = await pool.query(
        'SELECT id_kecamatan FROM kecamatan WHERE LOWER(kecamatan) = LOWER(?) LIMIT 1',
        [cleanKec]
      );
      if (kecRows && kecRows.length > 0) {
        idKecamatan = kecRows[0].id_kecamatan;
      }
    }

    // Resolusi id_puskeswan
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
      WHERE id_laporan_penyakit = ?`,
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

    const session = await getSessionFromRequest(req as any);
    const userName = session?.nama || session?.nip_username || 'Sistem';

    await logActivity({
      module: 'keswan',
      submenu: 'laporan-penyakit',
      tableName: 'keswan_laporan_penyakit',
      recordId: id,
      action: 'UPDATE',
      userName,
      details: { tahun, kecamatan_nama, puskeswan_id, diagnosa_nama, jumlah_kasus, keterangan },
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

    await pool.query(`DELETE FROM keswan_laporan_penyakit WHERE id_laporan_penyakit = ?`, [id]);

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
