import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

// Pastikan tabel ktt_documents ada di MySQL
let tableEnsured = false;
async function ensureDocumentsTable() {
  if (tableEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ktt_documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ktt_id INT NOT NULL,
        category VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        file_path VARCHAR(255) NOT NULL,
        file_size INT DEFAULT 0,
        file_type VARCHAR(100),
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        uploaded_by VARCHAR(100) DEFAULT 'Petugas',
        INDEX idx_ktt_id (ktt_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    tableEnsured = true;
  } catch (e) {
    console.error('Gagal memastikan tabel ktt_documents:', e);
  }
}

// Auto-deteksi kategori dokumen dari nama file
function detectCategory(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('keaktifan') || lower.includes('aktif')) return 'Surat Keaktifan';
  if (lower.includes('skt') || lower.includes('terdaftar') || lower.includes('register')) return 'SKT';
  if (lower.includes('simluhtan') || lower.includes('simluh')) return 'SIMLUHTAN';
  if (lower.includes('perkembangan') || lower.includes('populasi') || lower.includes('ternak')) return 'Perkembangan Ternak';
  if (lower.includes('monev') || lower.includes('monitoring') || lower.includes('evaluasi')) return 'Lampiran Monev';
  if (lower.includes('pembentukan') || lower.includes('pendirian') || lower.includes('berita acara pembentukan')) return 'Dokumen Pembentukan KTT';
  if (lower.includes('reorganisasi') || lower.includes('pengurus') || lower.includes('perubahan')) return 'Dokumen Reorganisasi KTT';
  if (lower.includes('gaduhan') || lower.includes('perjanjian') || lower.includes('mou')) return 'Perjanjian Gaduhan';
  return 'Dokumen Lainnya';
}

// ============================================================
// 1. GET: Ambil berkas KTT (atau statistik jumlah berkas semua KTT)
// ============================================================
export async function GET(request: NextRequest) {
  await ensureDocumentsTable();
  const { searchParams } = new URL(request.url);
  const kttId = searchParams.get('ktt_id');
  const stats = searchParams.get('stats');

  try {
    // Mode statistik: hitung jumlah berkas per KTT untuk tabel utama
    if (stats === 'true') {
      const [rows]: any = await pool.query(`
        SELECT ktt_id, COUNT(*) as doc_count 
        FROM ktt_documents 
        GROUP BY ktt_id
      `);
      const counts: Record<number, number> = {};
      if (Array.isArray(rows)) {
        rows.forEach((r: any) => {
          counts[r.ktt_id] = Number(r.doc_count) || 0;
        });
      }
      return NextResponse.json({ success: true, counts });
    }

    // Mode detail: ambil dokumen untuk KTT tertentu
    if (!kttId) {
      return NextResponse.json({ error: 'Parameter ktt_id diperlukan' }, { status: 400 });
    }

    const [rows]: any = await pool.query(
      `SELECT * FROM ktt_documents WHERE ktt_id = ? ORDER BY uploaded_at DESC, id DESC`,
      [kttId]
    );

    return NextResponse.json({ success: true, documents: rows || [] });
  } catch (error: any) {
    console.error('Gagal mengambil data dokumen KTT:', error);
    return NextResponse.json({ error: 'Gagal memuat dokumen KTT', detail: error.message }, { status: 500 });
  }
}

// ============================================================
// 2. POST: Upload berkas dokumen KTT
// ============================================================
export async function POST(request: NextRequest) {
  await ensureDocumentsTable();

  try {
    const formData = await request.formData();
    const kttId = formData.get('ktt_id');
    const categoryCustom = formData.get('category')?.toString();
    const titleCustom = formData.get('title')?.toString();
    const uploadedBy = formData.get('uploaded_by')?.toString() || 'Petugas';
    
    // Bisa single file atau multiple files
    const files = formData.getAll('files') as File[];
    if ((!files || files.length === 0) && formData.get('file')) {
      files.push(formData.get('file') as File);
    }

    if (!kttId || files.length === 0) {
      return NextResponse.json({ error: 'ktt_id dan file wajib diisi' }, { status: 400 });
    }

    // Folder tujuan penyimpanan fisik
    const targetDir = path.join(process.cwd(), 'public', 'uploads', 'ktt_documents', String(kttId));
    await fs.mkdir(targetDir, { recursive: true });

    const insertedDocs: any[] = [];

    for (const file of files) {
      if (!file || typeof file === 'string') continue;

      const originalName = file.name;
      const fileBytes = await file.arrayBuffer();
      const buffer = Buffer.from(fileBytes);

      // Kategori dokumen (otomatis dari nama file jika tidak ditentukan)
      const category = categoryCustom && categoryCustom !== 'auto' ? categoryCustom : detectCategory(originalName);
      const title = titleCustom && files.length === 1 ? titleCustom : originalName.replace(/\.[^/.]+$/, '');
      const ext = path.extname(originalName) || '';
      
      // Buat nama file aman dengan timestamp
      const safeBasename = originalName
        .replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 50);
      const safeFilename = `${Date.now()}_${safeBasename}${ext}`;
      const filePathOnDisk = path.join(targetDir, safeFilename);

      // Tulis file ke disk
      await fs.writeFile(filePathOnDisk, buffer);

      // URL publik file
      const webPath = `/uploads/ktt_documents/${kttId}/${safeFilename}`;

      // Simpan ke MySQL
      const [result]: any = await pool.query(
        `INSERT INTO ktt_documents 
         (ktt_id, category, title, original_filename, file_path, file_size, file_type, uploaded_at, uploaded_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [
          kttId,
          category,
          title,
          originalName,
          webPath,
          buffer.length,
          file.type || 'application/octet-stream',
          uploadedBy,
        ]
      );

      insertedDocs.push({
        id: result.insertId,
        ktt_id: Number(kttId),
        category,
        title,
        original_filename: originalName,
        file_path: webPath,
        file_size: buffer.length,
        file_type: file.type || 'application/octet-stream',
      });
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengunggah ${insertedDocs.length} berkas`,
      documents: insertedDocs,
    });
  } catch (error: any) {
    console.error('Gagal upload dokumen KTT:', error);
    return NextResponse.json({ error: 'Gagal mengunggah berkas', detail: error.message }, { status: 500 });
  }
}

// ============================================================
// 3. DELETE: Hapus berkas KTT (HANYA ADMINISTRATOR)
// ============================================================
export async function DELETE(request: NextRequest) {
  await ensureDocumentsTable();

  try {
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('id');
    const userRole = request.headers.get('x-user-role') || searchParams.get('role');

    if (!docId) {
      return NextResponse.json({ error: 'Parameter id dokumen diperlukan' }, { status: 400 });
    }

    // Double-Lock Security: Validasi role Administrator
    const isAdmin =
      userRole?.toLowerCase() === 'administrator' ||
      userRole?.toLowerCase() === 'admin';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Administrator yang diizinkan menghapus dokumen arsip KTT' },
        { status: 403 }
      );
    }

    // Ambil info file untuk menghapus file fisik di disk
    const [rows]: any = await pool.query('SELECT * FROM ktt_documents WHERE id = ?', [docId]);
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Dokumen tidak ditemukan' }, { status: 404 });
    }

    const doc = rows[0];
    if (doc.file_path) {
      try {
        const fullDiskPath = path.join(process.cwd(), 'public', doc.file_path);
        await fs.unlink(fullDiskPath);
      } catch (err: any) {
        // Abaikan jika file fisik sudah tidak ada di disk
        console.warn('File fisik tidak ditemukan saat dihapus:', err.message);
      }
    }

    // Hapus dari database
    await pool.query('DELETE FROM ktt_documents WHERE id = ?', [docId]);

    return NextResponse.json({
      success: true,
      message: 'Dokumen berhasil dihapus oleh Administrator',
      deleted_id: Number(docId),
    });
  } catch (error: any) {
    console.error('Gagal menghapus dokumen KTT:', error);
    return NextResponse.json({ error: 'Gagal menghapus berkas', detail: error.message }, { status: 500 });
  }
}
