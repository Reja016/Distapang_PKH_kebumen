import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/session';

export const dynamic = 'force-dynamic';

// GET: Ambil daftar seluruh petugas dan wilayah binaan untuk panel admin
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    // 1. Ambil seluruh data petugas_ib disertai relasi anggota_users
    const [petugasRows]: any = await pool.query(`
      SELECT 
        p.*,
        u.nama AS user_nama,
        u.nip_username,
        u.role AS user_role,
        wb_utama.binaan AS kecamatan_utama,
        wb_utama.nama_puskeswan AS puskeswan_utama
      FROM petugas_ib p
      LEFT JOIN anggota_users u ON p.id_user = u.id
      LEFT JOIN wilayah_binaan wb_utama ON p.id_wilayah_binaan = wb_utama.id_wilayah_binaan
      ORDER BY p.no_urut ASC, p.id_kompetensi ASC
    `);

    // 2. Ambil master wilayah binaan (26 Kecamatan)
    const [wilayahRows]: any = await pool.query(`
      SELECT DISTINCT id_wilayah_binaan, id_puskeswan, id_kecamatan, nama_puskeswan, binaan 
      FROM wilayah_binaan 
      ORDER BY binaan ASC
    `);

    // 3. Ambil daftar user anggota_users untuk opsi linking
    const [userRows]: any = await pool.query(`
      SELECT id, nama, nip_username, role, status 
      FROM anggota_users 
      ORDER BY nama ASC
    `);

    return NextResponse.json({
      success: true,
      petugas: petugasRows || [],
      wilayah: wilayahRows || [],
      users: userRows || [],
    });
  } catch (error: any) {
    console.error('Gagal mengambil data wilayah petugas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Perbarui penugasan wilayah kerja petugas oleh Admin
export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    const body = await req.json();
    const {
      id_kompetensi,
      id_user,
      id_wilayah_binaan,
      wt1,
      wt2,
      wt3,
      wt4,
      wt5,
      kompetensi,
      wilayah_puskeswan,
    } = body;

    if (!id_kompetensi) {
      return NextResponse.json({ success: false, error: 'id_kompetensi wajib disertakan.' }, { status: 400 });
    }

    // Bangun string ringkasan wilayah_kerja_tambahan dari wt1-wt5
    const wtIds = [wt1, wt2, wt3, wt4, wt5].filter(Boolean);
    let wilayahKerjaTambahanText = '';

    if (wtIds.length > 0) {
      const [names]: any = await pool.query(
        `SELECT DISTINCT binaan FROM wilayah_binaan WHERE id_kecamatan IN (?) OR id_wilayah_binaan IN (?)`,
        [wtIds, wtIds]
      );
      if (names && names.length > 0) {
        wilayahKerjaTambahanText = names.map((n: any) => `Kec. ${n.binaan.charAt(0) + n.binaan.slice(1).toLowerCase()}`).join(', ');
      }
    }

    // Ambil nama puskeswan jika id_wilayah_binaan berubah
    let finalPuskeswan = wilayah_puskeswan || '';
    if (id_wilayah_binaan) {
      const [wb]: any = await pool.query(
        `SELECT nama_puskeswan FROM wilayah_binaan WHERE id_wilayah_binaan = ? LIMIT 1`,
        [id_wilayah_binaan]
      );
      if (wb && wb.length > 0) {
        finalPuskeswan = wb[0].nama_puskeswan;
      }
    }

    await pool.query(
      `UPDATE petugas_ib SET 
        id_user = ?,
        id_wilayah_binaan = ?,
        wt1 = ?,
        wt2 = ?,
        wt3 = ?,
        wt4 = ?,
        wt5 = ?,
        wilayah_kerja_tambahan = ?,
        wilayah_puskeswan = ?,
        kompetensi = COALESCE(?, kompetensi)
      WHERE id_kompetensi = ?`,
      [
        id_user || null,
        id_wilayah_binaan || null,
        wt1 || null,
        wt2 || null,
        wt3 || null,
        wt4 || null,
        wt5 || null,
        wilayahKerjaTambahanText || null,
        finalPuskeswan || null,
        kompetensi || null,
        id_kompetensi,
      ]
    );

    return NextResponse.json({
      success: true,
      message: 'Penugasan wilayah kerja petugas berhasil diperbarui.',
      wilayah_kerja_tambahan: wilayahKerjaTambahanText,
    });
  } catch (error: any) {
    console.error('Gagal memperbarui wilayah petugas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
