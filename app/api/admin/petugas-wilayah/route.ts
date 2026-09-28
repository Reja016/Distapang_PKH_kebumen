import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

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
        COALESCE(p.wilayah_puskeswan, wb_utama.nama_puskeswan) AS puskeswan_utama
      FROM petugas_ib p
      LEFT JOIN anggota_users u ON p.id_user = u.id
      LEFT JOIN wilayah_binaan wb_utama ON p.id_wilayah_binaan = wb_utama.id_wilayah_binaan
      ORDER BY p.no_urut ASC, p.id_kompetensi ASC
    `);

    // 2. Ambil master 8 Puskeswan
    const [puskeswanRows]: any = await pool.query(`
      SELECT DISTINCT id_puskeswan, nama_puskeswan, MIN(id_wilayah_binaan) as default_wb_id 
      FROM wilayah_binaan 
      GROUP BY id_puskeswan, nama_puskeswan 
      ORDER BY id_puskeswan ASC
    `);

    // 3. Ambil master wilayah binaan (26 Kecamatan)
    const [wilayahRows]: any = await pool.query(`
      SELECT DISTINCT id_wilayah_binaan, id_puskeswan, id_kecamatan, nama_puskeswan, binaan 
      FROM wilayah_binaan 
      ORDER BY binaan ASC
    `);

    // 4. Ambil daftar user anggota_users untuk opsi linking
    const [userRows]: any = await pool.query(`
      SELECT id, nama, nip_username, role, status 
      FROM anggota_users 
      ORDER BY nama ASC
    `);

    return NextResponse.json({
      success: true,
      petugas: petugasRows || [],
      puskeswan: puskeswanRows || [],
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
      is_restricted,
      puskeswan_utama,
      wilayah_puskeswan,
      wt1,
      wt2,
      wt3,
      wt4,
      wt5,
      kompetensi,
    } = body;

    if (!id_kompetensi) {
      return NextResponse.json({ success: false, error: 'id_kompetensi wajib disertakan.' }, { status: 400 });
    }

    const restricted = is_restricted ?? Boolean(puskeswan_utama || wilayah_puskeswan);

    let finalPuskeswan: string | null = null;
    let finalWbId: number | null = null;
    let finalWtText: string | null = null;
    let finalWt1: number | null = null;
    let finalWt2: number | null = null;
    let finalWt3: number | null = null;
    let finalWt4: number | null = null;
    let finalWt5: number | null = null;

    if (restricted) {
      finalPuskeswan = (puskeswan_utama || wilayah_puskeswan || '').trim();
      if (finalPuskeswan) {
        const [wb]: any = await pool.query(
          `SELECT id_wilayah_binaan FROM wilayah_binaan WHERE LOWER(nama_puskeswan) = LOWER(?) LIMIT 1`,
          [finalPuskeswan]
        );
        if (wb && wb.length > 0) {
          finalWbId = wb[0].id_wilayah_binaan;
        }
      }

      const parseWt = (val: any): number | null => {
        if (val === null || val === undefined || val === '' || val === 0 || val === '0') return null;
        const num = Number(val);
        return isNaN(num) ? null : num;
      };

      finalWt1 = parseWt(wt1);
      finalWt2 = parseWt(wt2);
      finalWt3 = parseWt(wt3);
      finalWt4 = parseWt(wt4);
      finalWt5 = parseWt(wt5);

      const activeKecIds = [finalWt1, finalWt2, finalWt3, finalWt4, finalWt5].filter((id): id is number => id !== null);

      if (activeKecIds.length > 0) {
        const [kecRows]: any = await pool.query(
          `SELECT DISTINCT id_kecamatan, binaan FROM wilayah_binaan WHERE id_kecamatan IN (?)`,
          [activeKecIds]
        );
        const kecMap = new Map<number, string>();
        if (Array.isArray(kecRows)) {
          kecRows.forEach((r: any) => {
            const titleCase = r.binaan.charAt(0).toUpperCase() + r.binaan.slice(1).toLowerCase();
            kecMap.set(Number(r.id_kecamatan), titleCase);
          });
        }
        const kecNames = activeKecIds
          .map((id) => kecMap.get(id))
          .filter(Boolean)
          .map((k) => `Kec. ${k}`);
        finalWtText = Array.from(new Set(kecNames)).join(', ');
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
        finalWbId,
        finalWt1,
        finalWt2,
        finalWt3,
        finalWt4,
        finalWt5,
        finalWtText,
        finalPuskeswan,
        kompetensi || null,
        id_kompetensi,
      ]
    );

    await logActivity({
      module: 'admin',
      submenu: 'petugas-wilayah',
      tableName: 'petugas_ib',
      recordId: id_kompetensi,
      action: 'UPDATE',
      userName: auth.session.nama || 'Administrator',
      details: {
        id_kompetensi,
        id_user,
        wilayah_puskeswan: finalPuskeswan,
        wilayah_kerja_tambahan: finalWtText,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Penugasan wilayah kerja petugas berhasil diperbarui.',
      wilayah_kerja_tambahan: finalWtText,
    });
  } catch (error: any) {
    console.error('Gagal memperbarui wilayah petugas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
