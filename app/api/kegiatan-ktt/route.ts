import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/auditLog';
import { getSessionFromRequest } from '@/lib/session';

export const dynamic = 'force-dynamic';

let isTableChecked = false;
async function ensureTable() {
  if (isTableChecked) return;
  try {
    // 1. Buat tabel jika belum ada sama sekali
    await pool.query(`
      CREATE TABLE IF NOT EXISTS kegiatan_ktt (
        id_kegiatan VARCHAR(50) NOT NULL PRIMARY KEY,
        id_ktt INT(11) DEFAULT NULL,
        tanggal DATE DEFAULT NULL,
        nama_ktt VARCHAR(255) DEFAULT NULL,
        kecamatan VARCHAR(100) DEFAULT NULL,
        desa VARCHAR(100) DEFAULT NULL,
        tim_pelaksana VARCHAR(255) DEFAULT NULL,
        nama_kegiatan VARCHAR(255) DEFAULT NULL,
        hasil_kegiatan TEXT DEFAULT NULL,
        lat VARCHAR(50) DEFAULT NULL,
        lng VARCHAR(50) DEFAULT NULL,
        photo LONGTEXT DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Periksa kolom fisik untuk backward compatibility skema database lama
    const [cols]: any = await pool.query('SHOW COLUMNS FROM kegiatan_ktt');
    const existingCols = new Set(cols.map((c: any) => c.Field.toLowerCase()));

    // Jika tabel lama menggunakan kolom `id` dan belum ada `id_kegiatan`
    if (!existingCols.has('id_kegiatan')) {
      if (existingCols.has('id')) {
        try {
          await pool.query('ALTER TABLE kegiatan_ktt ADD COLUMN id_kegiatan VARCHAR(50) NULL AFTER id');
          await pool.query('UPDATE kegiatan_ktt SET id_kegiatan = CAST(id AS CHAR) WHERE id_kegiatan IS NULL');
        } catch (alterErr) {
          console.warn('Gagal ADD COLUMN id_kegiatan:', alterErr);
        }
      } else {
        await pool.query('ALTER TABLE kegiatan_ktt ADD COLUMN id_kegiatan VARCHAR(50) NOT NULL PRIMARY KEY');
      }
    }

    // Pastikan kolom-kolom opsional lainnya ada
    if (!existingCols.has('photo')) {
      try { await pool.query('ALTER TABLE kegiatan_ktt ADD COLUMN photo LONGTEXT NULL'); } catch {}
    }
    if (!existingCols.has('lat')) {
      try { await pool.query('ALTER TABLE kegiatan_ktt ADD COLUMN lat VARCHAR(50) NULL'); } catch {}
    }
    if (!existingCols.has('lng')) {
      try { await pool.query('ALTER TABLE kegiatan_ktt ADD COLUMN lng VARCHAR(50) NULL'); } catch {}
    }
    if (!existingCols.has('tim_pelaksana')) {
      try { await pool.query('ALTER TABLE kegiatan_ktt ADD COLUMN tim_pelaksana VARCHAR(255) NULL'); } catch {}
    }
    if (!existingCols.has('id_ktt')) {
      try { await pool.query('ALTER TABLE kegiatan_ktt ADD COLUMN id_ktt INT(11) DEFAULT NULL'); } catch {}
    }

    isTableChecked = true;
  } catch (err) {
    console.error('Failed to ensure kegiatan_ktt table:', err);
  }
}

// GET: Ambil semua riwayat log aktivitas KTT
export async function GET() {
  try {
    await ensureTable();
    const [cols]: any = await pool.query('SHOW COLUMNS FROM kegiatan_ktt');
    const existingCols = new Set(cols.map((c: any) => c.Field.toLowerCase()));

    const idField = existingCols.has('id_kegiatan') && existingCols.has('id')
      ? 'COALESCE(id_kegiatan, CAST(id AS CHAR))'
      : (existingCols.has('id_kegiatan') ? 'id_kegiatan' : 'CAST(id AS CHAR)');

    const [rows]: any = await pool.query(`
      SELECT 
        ${idField} AS id,
        ${existingCols.has('id_ktt') ? 'id_ktt' : 'NULL'} AS ktt_id,
        tanggal,
        nama_ktt,
        ${existingCols.has('kecamatan') ? 'kecamatan' : "''"} AS kecamatan,
        ${existingCols.has('desa') ? 'desa' : "''"} AS desa,
        ${existingCols.has('tim_pelaksana') ? 'tim_pelaksana' : "'-'"} AS tim_pelaksana,
        nama_kegiatan,
        hasil_kegiatan,
        ${existingCols.has('lat') ? 'lat' : 'NULL'} AS lat,
        ${existingCols.has('lng') ? 'lng' : 'NULL'} AS lng,
        ${existingCols.has('photo') ? 'photo' : 'NULL'} AS photo,
        created_at
      FROM kegiatan_ktt 
      ORDER BY tanggal DESC
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Gagal mengambil data kegiatan KTT:', error);
    return NextResponse.json({ error: 'Gagal mengambil data dari MySQL' }, { status: 500 });
  }
}

// POST: Tambah atau edit log kegiatan KTT
export async function POST(request: Request) {
  try {
    await ensureTable();
    const session = await getSessionFromRequest(request as any);
    const userName = session ? (session.nama || session.nip_username) : 'Petugas';

    const body = await request.json();
    const { id, tanggal, ktt_id, nama_ktt, kecamatan, desa, tim_pelaksana, nama_kegiatan, hasil_kegiatan, lat, lng, photo, isEdit } = body;

    const finalId = id || `ACT-${Date.now()}`;
    const safeKttId = (ktt_id && !isNaN(Number(ktt_id))) ? Number(ktt_id) : null;

    let verifiedKttId: number | null = null;
    if (safeKttId) {
      try {
        const [kttCheck]: any = await pool.query('SELECT id FROM ktt_master WHERE id = ? OR id_ktt = ? LIMIT 1', [safeKttId, safeKttId]);
        if (kttCheck && kttCheck.length > 0) {
          verifiedKttId = safeKttId;
        }
      } catch {
        verifiedKttId = null;
      }
    }

    const [cols]: any = await pool.query('SHOW COLUMNS FROM kegiatan_ktt');
    const existingCols = new Set(cols.map((c: any) => c.Field.toLowerCase()));

    if (existingCols.has('id_kegiatan')) {
      if (isEdit) {
        await pool.query(
          `UPDATE kegiatan_ktt 
           SET tanggal=?, id_ktt=?, nama_ktt=?, kecamatan=?, desa=?, tim_pelaksana=?, nama_kegiatan=?, hasil_kegiatan=?, lat=?, lng=?, photo=? 
           WHERE id_kegiatan=? OR id=?`,
          [tanggal, verifiedKttId, nama_ktt, kecamatan || '', desa || '', tim_pelaksana, nama_kegiatan, hasil_kegiatan, lat || null, lng || null, photo || null, finalId, finalId]
        );
      } else {
        await pool.query(
          `INSERT INTO kegiatan_ktt 
           (id_kegiatan, tanggal, id_ktt, nama_ktt, kecamatan, desa, tim_pelaksana, nama_kegiatan, hasil_kegiatan, lat, lng, photo) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [finalId, tanggal, verifiedKttId, nama_ktt, kecamatan || '', desa || '', tim_pelaksana, nama_kegiatan, hasil_kegiatan, lat || null, lng || null, photo || null]
        );
      }
    } else {
      // Fallback skema lama (hanya ada kolom id)
      if (isEdit) {
        await pool.query(
          `UPDATE kegiatan_ktt 
           SET tanggal=?, id_ktt=?, nama_ktt=?, kecamatan=?, desa=?, tim_pelaksana=?, nama_kegiatan=?, hasil_kegiatan=?, lat=?, lng=?, photo=? 
           WHERE id=?`,
          [tanggal, verifiedKttId, nama_ktt, kecamatan || '', desa || '', tim_pelaksana, nama_kegiatan, hasil_kegiatan, lat || null, lng || null, photo || null, finalId]
        );
      } else {
        await pool.query(
          `INSERT INTO kegiatan_ktt 
           (tanggal, id_ktt, nama_ktt, kecamatan, desa, tim_pelaksana, nama_kegiatan, hasil_kegiatan, lat, lng, photo) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [tanggal, verifiedKttId, nama_ktt, kecamatan || '', desa || '', tim_pelaksana, nama_kegiatan, hasil_kegiatan, lat || null, lng || null, photo || null]
        );
      }
    }

    await logActivity({
      module: 'bitpro',
      submenu: 'kegiatan-ktt',
      tableName: 'kegiatan_ktt',
      recordId: finalId,
      action: isEdit ? 'UPDATE' : 'CREATE',
      userName,
      details: { nama_ktt, nama_kegiatan, hasil_kegiatan, tanggal, tim_pelaksana, kecamatan, desa },
    });

    return NextResponse.json({ status: 'success', id: finalId });
  } catch (error: any) {
    console.error('Gagal menyimpan kegiatan KTT:', error);
    return NextResponse.json({ error: 'Gagal menyimpan data ke MySQL', detail: error?.message }, { status: 500 });
  }
}

// DELETE: Hapus log kegiatan KTT
export async function DELETE(request: Request) {
  try {
    await ensureTable();
    const session = await getSessionFromRequest(request as any);
    const userName = session ? (session.nama || session.nip_username) : 'Administrator';

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      const [cols]: any = await pool.query('SHOW COLUMNS FROM kegiatan_ktt');
      const existingCols = new Set(cols.map((c: any) => c.Field.toLowerCase()));

      if (existingCols.has('id_kegiatan')) {
        await pool.query('DELETE FROM kegiatan_ktt WHERE id_kegiatan=? OR id=?', [id, id]);
      } else {
        await pool.query('DELETE FROM kegiatan_ktt WHERE id=?', [id]);
      }

      await logActivity({
        module: 'bitpro',
        submenu: 'kegiatan-ktt',
        tableName: 'kegiatan_ktt',
        recordId: id,
        action: 'DELETE',
        userName,
        details: { id },
      });
    }
    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Gagal menghapus kegiatan KTT:', error);
    return NextResponse.json({ error: 'Gagal menghapus data dari MySQL', detail: error?.message }, { status: 500 });
  }
}
