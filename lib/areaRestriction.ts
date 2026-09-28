import pool from '@/lib/db';
import { getSessionFromRequest, SessionPayload } from '@/lib/session';
import { NextResponse } from 'next/server';

export interface UserAreaAccess {
  isAdmin: boolean;
  allowedKecamatan: string[]; // Uppercase, e.g. ['BUAYAN', 'ROWOKELE']
  allowedPuskeswan: string[]; // e.g. ['Puskeswan Buayan']
  allowedPuskeswanIds: number[];
  officerName?: string;
  mainKecamatan?: string;
  additionalKecamatan?: string[];
}

/**
 * Normalizes text to uppercase without "KEC." or "KECAMATAN" prefix
 */
export function normalizeKecamatanName(name: string): string {
  if (!name) return '';
  return name
    .trim()
    .toUpperCase()
    .replace(/^KECAMATAN\s+/i, '')
    .replace(/^KEC\.\s+/i, '')
    .replace(/^KEC\s+/i, '')
    .trim();
}

/**
 * Normalizes Puskeswan name
 */
export function normalizePuskeswanName(name: string): string {
  if (!name) return '';
  let clean = name.trim().toUpperCase();
  if (!clean.startsWith('PUSKESWAN')) {
    clean = `PUSKESWAN ${clean}`;
  }
  return clean;
}

/**
 * Mendapatkan daftar wilayah tugas (Kecamatan & Puskeswan) untuk user tertentu
 */
export async function getUserAreaAccess(session: SessionPayload | null): Promise<UserAreaAccess> {
  if (!session) {
    return {
      isAdmin: false,
      allowedKecamatan: [],
      allowedPuskeswan: [],
      allowedPuskeswanIds: [],
    };
  }

  // Jika Administrator atau Super Admin -> Akses Penuh tanpa batas
  const role = (session.role || '').toLowerCase();
  if (role === 'administrator' || role === 'admin' || role === 'superadmin' || role.includes('admin')) {
    return {
      isAdmin: true,
      allowedKecamatan: [], // Empty means ALL for admin
      allowedPuskeswan: [],
      allowedPuskeswanIds: [],
      officerName: session.nama,
    };
  }

  const userId = session.id;
  const userName = session.nama || session.nip_username || '';

  const allowedKecamatanSet = new Set<string>();
  const allowedPuskeswanSet = new Set<string>();
  const allowedPuskeswanIdSet = new Set<number>();

  let officerName = userName;
  let mainKecamatan = '';
  const additionalKecamatan: string[] = [];

  try {
    // 1. Cek apakah user terdaftar di tabel `petugas_ib`
    const [officerRows]: any = await pool.query(
      `SELECT * FROM petugas_ib WHERE id_user = ? OR LOWER(nama_petugas) = LOWER(?) LIMIT 1`,
      [userId, userName]
    );

    if (officerRows && officerRows.length > 0) {
      const officer = officerRows[0];
      officerName = officer.nama_petugas || userName;

      // Ambil Wilayah Binaan Utama
      if (officer.id_wilayah_binaan) {
        const [mainRows]: any = await pool.query(
          `SELECT id_wilayah_binaan, id_puskeswan, id_kecamatan, nama_puskeswan, binaan 
           FROM wilayah_binaan WHERE id_wilayah_binaan = ?`,
          [officer.id_wilayah_binaan]
        );
        if (mainRows && mainRows.length > 0) {
          const m = mainRows[0];
          const normKec = normalizeKecamatanName(m.binaan);
          allowedKecamatanSet.add(normKec);
          allowedPuskeswanSet.add(m.nama_puskeswan);
          allowedPuskeswanIdSet.add(Number(m.id_puskeswan));
          mainKecamatan = normKec;
        }
      }

      // Ambil Wilayah Kerja Tambahan dari wt1 - wt5
      const wtIds = [officer.wt1, officer.wt2, officer.wt3, officer.wt4, officer.wt5].filter(Boolean);
      if (wtIds.length > 0) {
        const [wtRows]: any = await pool.query(
          `SELECT DISTINCT id_wilayah_binaan, id_puskeswan, id_kecamatan, nama_puskeswan, binaan 
           FROM wilayah_binaan WHERE id_kecamatan IN (?) OR id_wilayah_binaan IN (?)`,
          [wtIds, wtIds]
        );
        for (const row of wtRows) {
          const normKec = normalizeKecamatanName(row.binaan);
          allowedKecamatanSet.add(normKec);
          allowedPuskeswanSet.add(row.nama_puskeswan);
          allowedPuskeswanIdSet.add(Number(row.id_puskeswan));
          additionalKecamatan.push(normKec);
        }
      }

      // Parse teks `wilayah_kerja_tambahan` jika ada (contoh: "Kec. Rowokele, Kec. Buayan")
      if (officer.wilayah_kerja_tambahan) {
        const parts = officer.wilayah_kerja_tambahan.split(/[,;\/]/);
        for (const p of parts) {
          const clean = normalizeKecamatanName(p);
          if (clean) {
            allowedKecamatanSet.add(clean);
            if (!additionalKecamatan.includes(clean)) additionalKecamatan.push(clean);
          }
        }
      }
    }

    // 2. Cek apakah nama akun / username mengindikasikan Puskeswan tertentu (misal akun 'Puskeswan Buayan')
    const [allWb]: any = await pool.query(`SELECT DISTINCT nama_puskeswan, id_puskeswan, binaan FROM wilayah_binaan`);
    for (const wb of allWb) {
      const pName = wb.nama_puskeswan.toUpperCase();
      if (userName.toUpperCase().includes(pName) || pName.includes(userName.toUpperCase())) {
        allowedPuskeswanSet.add(wb.nama_puskeswan);
        allowedPuskeswanIdSet.add(Number(wb.id_puskeswan));
        allowedKecamatanSet.add(normalizeKecamatanName(wb.binaan));
      }
    }

  } catch (err: any) {
    console.error('[AreaRestriction Error] Gagal memuat wilayah tugas:', err.message);
  }

  return {
    isAdmin: false,
    allowedKecamatan: Array.from(allowedKecamatanSet),
    allowedPuskeswan: Array.from(allowedPuskeswanSet),
    allowedPuskeswanIds: Array.from(allowedPuskeswanIdSet),
    officerName,
    mainKecamatan,
    additionalKecamatan,
  };
}

/**
 * Validasi hak akses wilayah untuk operasi API (Backend Guard)
 */
export async function validateAreaAccess(
  req: Request,
  targetKecamatan?: string | null,
  targetPuskeswan?: string | null
): Promise<{ allowed: boolean; errorResponse?: NextResponse }> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return {
      allowed: false,
      errorResponse: NextResponse.json(
        { success: false, error: 'Akses Ditolak: Anda belum login atau sesi telah berakhir.' },
        { status: 401 }
      ),
    };
  }

  const access = await getUserAreaAccess(session);
  if (access.isAdmin) {
    return { allowed: true };
  }

  // Jika tidak memiliki wilayah binaan terdaftar
  if (access.allowedKecamatan.length === 0 && access.allowedPuskeswan.length === 0) {
    return {
      allowed: false,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: 'Akses Ditolak: Akun Anda belum memiliki penugasan wilayah kerja. Silakan hubungi Administrator.',
        },
        { status: 403 }
      ),
    };
  }

  // Validasi Kecamatan jika parameter targetKecamatan diberikan
  if (targetKecamatan) {
    const normTarget = normalizeKecamatanName(targetKecamatan);
    const isKecAllowed = access.allowedKecamatan.some(
      (k) => normalizeKecamatanName(k) === normTarget
    );

    if (!isKecAllowed) {
      return {
        allowed: false,
        errorResponse: NextResponse.json(
          {
            success: false,
            error: `Akses Ditolak: Anda tidak memiliki wewenang untuk menginput/mengubah data di wilayah Kecamatan ${targetKecamatan}. Wilayah wewenang Anda: ${access.allowedKecamatan.join(', ')}.`,
          },
          { status: 403 }
        ),
      };
    }
  }

  // Validasi Puskeswan jika parameter targetPuskeswan diberikan
  if (targetPuskeswan) {
    const normTargetPuskeswan = normalizePuskeswanName(targetPuskeswan);
    const isPuskeswanAllowed = access.allowedPuskeswan.some(
      (p) => normalizePuskeswanName(p) === normTargetPuskeswan
    );

    if (!isPuskeswanAllowed) {
      return {
        allowed: false,
        errorResponse: NextResponse.json(
          {
            success: false,
            error: `Akses Ditolak: Anda tidak memiliki wewenang untuk menginput data di ${targetPuskeswan}. Puskeswan wewenang Anda: ${access.allowedPuskeswan.join(', ')}.`,
          },
          { status: 403 }
        ),
      };
    }
  }

  return { allowed: true };
}
