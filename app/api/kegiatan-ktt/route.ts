import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { logActivity } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';

// GET: Ambil semua riwayat log aktivitas KTT
export async function GET() {
  try {
    const [rows]: any = await pool.query('SELECT id_kegiatan AS id, id_ktt AS ktt_id, tanggal, nama_ktt, kecamatan, desa, tim_pelaksana, nama_kegiatan, hasil_kegiatan, lat, lng, photo, created_at FROM kegiatan_ktt ORDER BY tanggal DESC, id_kegiatan DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Gagal mengambil data kegiatan KTT:', error);
    return NextResponse.json({ error: 'Gagal mengambil data dari MySQL' }, { status: 500 });
  }
}

// POST: Tambah atau edit log kegiatan KTT
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, tanggal, ktt_id, nama_ktt, kecamatan, desa, tim_pelaksana, nama_kegiatan, hasil_kegiatan, lat, lng, photo, isEdit } = body;

    const finalId = id || `ACT-${Date.now()}`;
    const safeKttId = (ktt_id && !isNaN(Number(ktt_id))) ? Number(ktt_id) : null;

    if (isEdit) {
      await pool.query(
        `UPDATE kegiatan_ktt 
         SET tanggal=?, id_ktt=?, nama_ktt=?, kecamatan=?, desa=?, tim_pelaksana=?, nama_kegiatan=?, hasil_kegiatan=?, lat=?, lng=?, photo=? 
         WHERE id_kegiatan=?`,
        [tanggal, safeKttId, nama_ktt, kecamatan || '', desa || '', tim_pelaksana, nama_kegiatan, hasil_kegiatan, lat || null, lng || null, photo || null, finalId]
      );
      
      await logActivity({
        module: 'bitpro',
        submenu: 'kegiatan-ktt',
        tableName: 'kegiatan_ktt',
        recordId: finalId,
        action: 'UPDATE',
        userName: 'Petugas',
        details: { nama_kegiatan, hasil_kegiatan },
      });

    } else {
      await pool.query(
        `INSERT INTO kegiatan_ktt 
         (id_kegiatan, tanggal, id_ktt, nama_ktt, kecamatan, desa, tim_pelaksana, nama_kegiatan, hasil_kegiatan, lat, lng, photo) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [finalId, tanggal, safeKttId, nama_ktt, kecamatan || '', desa || '', tim_pelaksana, nama_kegiatan, hasil_kegiatan, lat || null, lng || null, photo || null]
      );
      
      await logActivity({
        module: 'bitpro',
        submenu: 'kegiatan-ktt',
        tableName: 'kegiatan_ktt',
        recordId: finalId,
        action: 'CREATE',
        userName: 'Petugas',
        details: { nama_kegiatan, hasil_kegiatan },
      });
    }

    return NextResponse.json({ status: 'success', id: finalId });
  } catch (error: any) {
    console.error('Gagal menyimpan kegiatan KTT:', error);
    return NextResponse.json({ error: 'Gagal menyimpan data ke MySQL', detail: error?.message }, { status: 500 });
  }
}

// DELETE: Hapus log kegiatan KTT
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (id) {
      await pool.query('DELETE FROM kegiatan_ktt WHERE id_kegiatan=?', [id]);
      await logActivity({
        module: 'bitpro',
        submenu: 'kegiatan-ktt',
        tableName: 'kegiatan_ktt',
        recordId: id,
        action: 'DELETE',
        userName: 'Administrator',
        details: { id },
      });
    }
    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Gagal menghapus kegiatan KTT:', error);
    return NextResponse.json({ error: 'Gagal menghapus data dari MySQL', detail: error?.message }, { status: 500 });
  }
}
