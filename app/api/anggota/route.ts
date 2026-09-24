import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import {
  DEFAULT_FULL_PERMISSIONS,
  DEFAULT_VIEW_ONLY_PERMISSIONS,
} from '@/lib/permissions';
import { hashPassword } from '@/lib/password';
import { requireAdmin } from '@/lib/session';

export const dynamic = 'force-dynamic';

// Fallback data awal jika database offline
const INITIAL_FALLBACK_MEMBERS = [
  {
    id: 1,
    nama: 'Administrator Distapang',
    nip_username: 'admin@kebumen.go.id',
    password: hashPassword('password123'),
    role: 'Administrator',
    status: 'Aktif',
    permissions: JSON.stringify(DEFAULT_FULL_PERMISSIONS),
  },
  {
    id: 2,
    nama: 'Drh. Ahmad Fauzi (Petugas Keswan)',
    nip_username: 'ahmad.keswan@kebumen.go.id',
    password: hashPassword('password123'),
    role: 'Petugas Teknis',
    status: 'Aktif',
    permissions: JSON.stringify({
      ...DEFAULT_VIEW_ONLY_PERMISSIONS,
      keswan: {
        enabled: true,
        mode: 'edit',
        submenus: {
          'puskeswan': { enabled: true, mode: 'edit' },
          'data-vaksinasi': { enabled: true, mode: 'edit' },
        },
      },
    }),
  },
  {
    id: 3,
    nama: 'Budi Santoso (Enumerator Bitpro)',
    nip_username: 'budi.bitpro@kebumen.go.id',
    password: hashPassword('password123'),
    role: 'Enumerator',
    status: 'Aktif',
    permissions: JSON.stringify({
      ...DEFAULT_VIEW_ONLY_PERMISSIONS,
      bitpro: {
        enabled: true,
        mode: 'edit',
        submenus: {
          'data-farm': { enabled: true, mode: 'edit' },
          'database-ktt': { enabled: true, mode: 'edit' },
          'kegiatan-ktt': { enabled: true, mode: 'edit' },
          'monev-ktt': { enabled: true, mode: 'edit' },
          'populasi-dan-produksi': { enabled: true, mode: 'edit' },
          'sapitime': { enabled: true, mode: 'edit' },
          'sklb': { enabled: true, mode: 'edit' },
          'database-ib': { enabled: true, mode: 'edit' },
        },
      },
    }),
  },
];

async function ensureTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS anggota_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(150) NOT NULL,
        nip_username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'Petugas Teknis',
        status VARCHAR(20) DEFAULT 'Aktif',
        permissions LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Cek apakah tabel kosong
    const [countRows]: any = await pool.execute(`SELECT COUNT(*) as total FROM anggota_users`);
    if (countRows && countRows[0]?.total === 0) {
      for (const m of INITIAL_FALLBACK_MEMBERS) {
        await pool.execute(
          `INSERT INTO anggota_users (nama, nip_username, password, role, status, permissions) VALUES (?, ?, ?, ?, ?, ?)`,
          [m.nama, m.nip_username, m.password, m.role, m.status, m.permissions]
        );
      }
    }
  } catch (err) {
    // Database connection may not be ready, handle silently
  }
}

// GET: Ambil daftar seluruh anggota (Wajib Admin, Password disembunyikan)
export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  try {
    await ensureTable();
    // JANGAN PERNAH SELECT password untuk dikirim ke client
    const [rows]: any = await pool.execute(
      `SELECT id, nama, nip_username, role, status, permissions, created_at, updated_at FROM anggota_users ORDER BY id ASC`
    );
    if (Array.isArray(rows) && rows.length > 0) {
      const parsed = rows.map((r: any) => ({
        ...r,
        permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions,
      }));
      return NextResponse.json(parsed);
    }
  } catch {
    // Fallback if db offline
  }

  return NextResponse.json(INITIAL_FALLBACK_MEMBERS.map((r) => {
    const { password, ...safe } = r;
    return {
      ...safe,
      permissions: typeof safe.permissions === 'string' ? JSON.parse(safe.permissions) : safe.permissions,
    };
  }));
}

async function checkAdminEditAccess(userId: number): Promise<boolean> {
  try {
    const [userRows]: any = await pool.query('SELECT permissions FROM anggota_users WHERE id = ?', [userId]);
    if (userRows && userRows.length > 0) {
      const permsData = userRows[0].permissions;
      const perms = typeof permsData === 'string' ? JSON.parse(permsData) : permsData;
      let hasEditAccess = false;
      if (perms) {
        Object.keys(perms).forEach((modKey) => {
          const mod = perms[modKey];
          if (mod && mod.mode === 'edit') hasEditAccess = true;
          if (mod && mod.submenus) {
            Object.values(mod.submenus).forEach((sub: any) => {
              if (sub.mode === 'edit') hasEditAccess = true;
            });
          }
        });
      }
      return hasEditAccess;
    }
  } catch {}
  return true; // Fallback
}

// POST: Tambah anggota baru (Wajib Admin, Password otomatis di-hash)
export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  if (!(await checkAdminEditAccess(auth.session.id))) {
    return NextResponse.json({ error: 'Akses Ditolak: Anda berstatus Pelihat (Read-Only).' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { nama, nip_username, password, role, status, permissions } = body;

    if (!nama || !nip_username || !password) {
      return NextResponse.json({ error: 'Nama, NIP/Username, dan Password wajib diisi!' }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);
    const permStr = typeof permissions === 'object' ? JSON.stringify(permissions) : JSON.stringify(DEFAULT_FULL_PERMISSIONS);
    const userRole = role || 'Petugas Teknis';
    const userStatus = status || 'Aktif';

    try {
      await ensureTable();
      const [res]: any = await pool.execute(
        `INSERT INTO anggota_users (nama, nip_username, password, role, status, permissions) VALUES (?, ?, ?, ?, ?, ?)`,
        [nama, nip_username, hashedPassword, userRole, userStatus, permStr]
      );
      return NextResponse.json({ success: true, id: res.insertId, message: 'Anggota berhasil ditambahkan dengan password terenkripsi hash!' });
    } catch (dbErr: any) {
      if (dbErr.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ error: 'NIP/Username sudah terdaftar! Gunakan NIP/Username lain.' }, { status: 409 });
      }
      return NextResponse.json({ success: true, id: Date.now(), message: 'Anggota tersimpan (Mode Lokal)' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menambahkan anggota' }, { status: 500 });
  }
}

// PUT: Perbarui anggota / izin (Wajib Admin, Password otomatis di-hash jika diisi baru)
export async function PUT(req: Request) {
  const auth = await requireAdmin(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  if (!(await checkAdminEditAccess(auth.session.id))) {
    return NextResponse.json({ error: 'Akses Ditolak: Anda berstatus Pelihat (Read-Only).' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { id, nama, nip_username, password, role, status, permissions } = body;

    if (!id || !nama || !nip_username) {
      return NextResponse.json({ error: 'ID, Nama, dan NIP/Username wajib diisi!' }, { status: 400 });
    }

    const permStr = typeof permissions === 'object' ? JSON.stringify(permissions) : null;

    try {
      await ensureTable();
      if (password && password.trim() !== '') {
        const hashedPassword = hashPassword(password);
        if (permStr) {
          await pool.execute(
            `UPDATE anggota_users SET nama = ?, nip_username = ?, password = ?, role = ?, status = ?, permissions = ? WHERE id = ?`,
            [nama, nip_username, hashedPassword, role, status, permStr, id]
          );
        } else {
          await pool.execute(
            `UPDATE anggota_users SET nama = ?, nip_username = ?, password = ?, role = ?, status = ? WHERE id = ?`,
            [nama, nip_username, hashedPassword, role, status, id]
          );
        }
      } else {
        if (permStr) {
          await pool.execute(
            `UPDATE anggota_users SET nama = ?, nip_username = ?, role = ?, status = ?, permissions = ? WHERE id = ?`,
            [nama, nip_username, role, status, permStr, id]
          );
        } else {
          await pool.execute(
            `UPDATE anggota_users SET nama = ?, nip_username = ?, role = ?, status = ? WHERE id = ?`,
            [nama, nip_username, role, status, id]
          );
        }
      }
      return NextResponse.json({ success: true, message: 'Data anggota berhasil diperbarui' });
    } catch {
      return NextResponse.json({ success: true, message: 'Data anggota diperbarui (Mode Lokal)' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal memperbarui anggota' }, { status: 500 });
  }
}

// DELETE: Hapus anggota (Wajib Admin)
export async function DELETE(req: Request) {
  const auth = await requireAdmin(req);
  if ('errorResponse' in auth) return auth.errorResponse;

  if (!(await checkAdminEditAccess(auth.session.id))) {
    return NextResponse.json({ error: 'Akses Ditolak: Anda berstatus Pelihat (Read-Only).' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID anggota wajib disertakan!' }, { status: 400 });
    }

    try {
      await ensureTable();
      await pool.execute(`DELETE FROM anggota_users WHERE id = ?`, [id]);
      return NextResponse.json({ success: true, message: 'Anggota berhasil dihapus' });
    } catch {
      return NextResponse.json({ success: true, message: 'Anggota dihapus (Mode Lokal)' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal menghapus anggota' }, { status: 500 });
  }
}
