import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';
import {
  syncDiseaseCaseToLaporanPenyakit,
  updateDiseaseCaseInLaporanPenyakit,
  deleteDiseaseCaseFromLaporanPenyakit,
  ensureDiagnosaTables,
  repairMismatchedCases,
} from '@/lib/penyakitSync';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let hasRepaired = false;

async function ensureTable() {
  await ensureDiagnosaTables();
  if (!hasRepaired) {
    hasRepaired = true;
    repairMismatchedCases().catch(() => {});
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS puskeswanling (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tanggal DATE NOT NULL,
      puskeswan VARCHAR(100) NOT NULL,
      nama VARCHAR(255) NOT NULL,
      alamat TEXT NOT NULL,
      jenis VARCHAR(100) NOT NULL,
      jumlah_pad DECIMAL(12,2) DEFAULT 0,
      setara_sapi_kerbau DECIMAL(8,2) DEFAULT 0,
      diagnosa_nama VARCHAR(150) NULL,
      jumlah_kasus INT DEFAULT 1,
      id_laporan_penyakit INT NULL,
      keterangan TEXT NULL,
      petugas_nama VARCHAR(150) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

export async function GET(req: Request) {
  try {
    await ensureTable();

    const { searchParams } = new URL(req.url);
    const puskeswan = searchParams.get('puskeswan');
    const search = searchParams.get('search');
    const tahun = searchParams.get('tahun');
    const bulan = searchParams.get('bulan');

    let sql = `SELECT * FROM puskeswanling WHERE 1=1`;
    const params: any[] = [];

    if (puskeswan && puskeswan !== 'all' && puskeswan.toLowerCase() !== 'semua') {
      sql += ` AND LOWER(puskeswan) LIKE ?`;
      params.push(`%${puskeswan.toLowerCase()}%`);
    }

    if (tahun && tahun !== 'all') {
      sql += ` AND YEAR(tanggal) = ?`;
      params.push(Number(tahun));
    }

    if (bulan && bulan !== 'all') {
      sql += ` AND MONTH(tanggal) = ?`;
      params.push(Number(bulan));
    }

    if (search && search.trim()) {
      const q = `%${search.trim().toLowerCase()}%`;
      sql += ` AND (
        LOWER(nama) LIKE ? OR 
        LOWER(alamat) LIKE ? OR 
        LOWER(jenis) LIKE ? OR 
        LOWER(diagnosa_nama) LIKE ? OR
        LOWER(puskeswan) LIKE ?
      )`;
      params.push(q, q, q, q, q);
    }

    sql += ` ORDER BY tanggal DESC, id DESC`;

    const [rows]: any = await pool.query(sql, params);

    // Ambil daftar diagnosa penyakit untuk dropdown
    const [diagRows]: any = await pool.query(
      `SELECT diagnosa_nama as nama, kategori_penyakit as kategori FROM diagnosa ORDER BY diagnosa_nama ASC`
    );

    const data = (rows || []).map((r: any) => ({
      ...r,
      tanggal: r.tanggal ? new Date(r.tanggal).toISOString().split('T')[0] : '',
      jumlah_pad: Number(r.jumlah_pad) || 0,
      setara_sapi_kerbau: Number(r.setara_sapi_kerbau) || 0,
      jumlah_kasus: Number(r.jumlah_kasus) || 1,
    }));

    const totalPAD = data.reduce((acc: number, item: any) => acc + (item.jumlah_pad || 0), 0);
    const totalSetaraTernak = data.reduce((acc: number, item: any) => acc + (item.setara_sapi_kerbau || 0), 0);

    return NextResponse.json({
      success: true,
      data,
      diagnosaList: (diagRows || []).map((d: any) => d.nama),
      stats: {
        totalKegiatan: data.length,
        totalPAD,
        totalSetaraTernak,
      },
    });
  } catch (err: any) {
    console.error('Error GET puskeswanling:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureTable();
    const session = await getSessionFromRequest(req as any);
    const body = await req.json();

    const {
      tanggal,
      puskeswan,
      kecamatan,
      desa,
      nama,
      alamat,
      jenis,
      jumlah_pad,
      setara_sapi_kerbau,
      diagnosa_nama,
      jumlah_kasus,
      keterangan,
    } = body;

    if (!nama || !puskeswan) {
      return NextResponse.json(
        { success: false, error: 'Nama peternak/pemilik dan puskeswan wajib diisi.' },
        { status: 400 }
      );
    }

    const tgl = tanggal || new Date().toISOString().split('T')[0];
    const petugasNama = session?.nama || 'Petugas Keswan';

    // 1. Sinkronisasi Diagnosa Penyakit ke tabel `keswan_laporan_penyakit` (dengan kecamatan pasien)
    let idLaporan: number | null = null;
    if (diagnosa_nama && diagnosa_nama.trim()) {
      idLaporan = await syncDiseaseCaseToLaporanPenyakit({
        tanggal: tgl,
        puskeswan,
        kecamatan,
        desa,
        alamat,
        diagnosa_nama: diagnosa_nama.trim(),
        jumlah_kasus: Number(jumlah_kasus) || 1,
        keterangan: `Puskeswan Keliling (Puskeswanling) - Peternak: ${nama} (${jenis || 'Ternak'})`,
      });
    }

    const [res]: any = await pool.query(
      `INSERT INTO puskeswanling (
        tanggal, puskeswan, nama, alamat, jenis, jumlah_pad, setara_sapi_kerbau,
        diagnosa_nama, jumlah_kasus, id_laporan_penyakit, keterangan, petugas_nama
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tgl,
        puskeswan,
        nama,
        alamat || '',
        jenis || 'Sapi',
        Number(jumlah_pad) || 0,
        Number(setara_sapi_kerbau) || 0,
        diagnosa_nama ? diagnosa_nama.trim() : null,
        Number(jumlah_kasus) || 1,
        idLaporan,
        keterangan || '',
        petugasNama,
      ]
    );

    const insertedId = res.insertId;

    await logActivity({
      module: 'keswan',
      submenu: 'puskeswanling',
      tableName: 'puskeswanling',
      recordId: insertedId,
      action: 'CREATE',
      userName: petugasNama,
      details: {
        nama,
        puskeswan,
        jenis,
        jumlah_pad,
        setara_sapi_kerbau,
        diagnosa_nama,
        id_laporan_penyakit: idLaporan,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data Puskeswanling berhasil disimpan!',
      id: insertedId,
      id_laporan_penyakit: idLaporan,
    });
  } catch (err: any) {
    console.error('Error POST puskeswanling:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await ensureTable();
    const session = await getSessionFromRequest(req as any);
    const body = await req.json();

    const {
      id,
      tanggal,
      puskeswan,
      kecamatan,
      desa,
      nama,
      alamat,
      jenis,
      jumlah_pad,
      setara_sapi_kerbau,
      diagnosa_nama,
      jumlah_kasus,
      id_laporan_penyakit,
      keterangan,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID data tidak ditemukan.' }, { status: 400 });
    }

    const tgl = tanggal || new Date().toISOString().split('T')[0];
    const petugasNama = session?.nama || 'Petugas Keswan';

    // Update / Sinkronisasi Kasus Penyakit (dengan kecamatan pasien)
    let updatedIdLaporan = id_laporan_penyakit;
    if (diagnosa_nama && diagnosa_nama.trim()) {
      updatedIdLaporan = await updateDiseaseCaseInLaporanPenyakit(id_laporan_penyakit, {
        tanggal: tgl,
        puskeswan,
        kecamatan,
        desa,
        alamat,
        diagnosa_nama: diagnosa_nama.trim(),
        jumlah_kasus: Number(jumlah_kasus) || 1,
        keterangan: `Puskeswan Keliling (Puskeswanling) - Peternak: ${nama} (${jenis || 'Ternak'})`,
      });
    } else if (id_laporan_penyakit) {
      await deleteDiseaseCaseFromLaporanPenyakit(id_laporan_penyakit);
      updatedIdLaporan = null;
    }

    await pool.query(
      `UPDATE puskeswanling SET
        tanggal = ?, puskeswan = ?, nama = ?, alamat = ?, jenis = ?,
        jumlah_pad = ?, setara_sapi_kerbau = ?, diagnosa_nama = ?,
        jumlah_kasus = ?, id_laporan_penyakit = ?, keterangan = ?
       WHERE id = ?`,
      [
        tgl,
        puskeswan,
        nama,
        alamat || '',
        jenis || 'Sapi',
        Number(jumlah_pad) || 0,
        Number(setara_sapi_kerbau) || 0,
        diagnosa_nama ? diagnosa_nama.trim() : null,
        Number(jumlah_kasus) || 1,
        updatedIdLaporan,
        keterangan || '',
        id,
      ]
    );

    await logActivity({
      module: 'keswan',
      submenu: 'puskeswanling',
      tableName: 'puskeswanling',
      recordId: id,
      action: 'UPDATE',
      userName: petugasNama,
      details: {
        nama,
        puskeswan,
        jumlah_pad,
        setara_sapi_kerbau,
        diagnosa_nama,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Data Puskeswanling berhasil diperbarui!',
      id_laporan_penyakit: updatedIdLaporan,
    });
  } catch (err: any) {
    console.error('Error PUT puskeswanling:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await ensureTable();
    const session = await getSessionFromRequest(req as any);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak valid' }, { status: 400 });
    }

    const [rows]: any = await pool.query('SELECT * FROM puskeswanling WHERE id = ?', [id]);
    const existing = rows && rows[0];

    if (existing?.id_laporan_penyakit) {
      await deleteDiseaseCaseFromLaporanPenyakit(existing.id_laporan_penyakit);
    }

    await pool.query('DELETE FROM puskeswanling WHERE id = ?', [id]);

    await logActivity({
      module: 'keswan',
      submenu: 'puskeswanling',
      tableName: 'puskeswanling',
      recordId: id,
      action: 'DELETE',
      userName: session?.nama || 'Petugas Keswan',
      details: existing,
    });

    return NextResponse.json({ success: true, message: 'Data Puskeswanling berhasil dihapus!' });
  } catch (err: any) {
    console.error('Error DELETE puskeswanling:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
