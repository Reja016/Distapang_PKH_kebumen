import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { KapasitasPakanKecamatan, INITIAL_KAPASITAS_PAKAN } from '@/lib/pakanData';

async function ensureTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS kesmavet_kapasitas_pakan (
        id VARCHAR(50) PRIMARY KEY,
        corelId VARCHAR(100) NOT NULL,
        nama VARCHAR(100) NOT NULL,
        potensi_pakan_kg DOUBLE NOT NULL DEFAULT 0,
        kapasitas_tampung_ekor DOUBLE NOT NULL DEFAULT 0,
        jumlah_ternak_st DOUBLE NOT NULL DEFAULT 0,
        potensi_penambahan_st DOUBLE NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'Surplus',
        centerX INT NOT NULL DEFAULT 500,
        centerY INT NOT NULL DEFAULT 500,
        tagName VARCHAR(20) NOT NULL DEFAULT 'polygon',
        points LONGTEXT,
        d LONGTEXT,
        keterangan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
  } catch (e: any) {
    console.warn('Gagal membuat tabel kesmavet_kapasitas_pakan:', e.message);
  }
}

export async function GET() {
  try {
    await ensureTable();
    const [rows]: any = await pool.execute(`SELECT * FROM kesmavet_kapasitas_pakan ORDER BY id ASC`);

    if (!rows || rows.length === 0) {
      // Auto seed 26 kecamatan data dari tabel PDF 2025
      for (const item of INITIAL_KAPASITAS_PAKAN) {
        await pool.execute(
          `INSERT INTO kesmavet_kapasitas_pakan 
           (id, corelId, nama, potensi_pakan_kg, kapasitas_tampung_ekor, jumlah_ternak_st, potensi_penambahan_st, status, centerX, centerY, tagName, points, d, keterangan)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             nama=VALUES(nama), 
             potensi_pakan_kg=VALUES(potensi_pakan_kg),
             kapasitas_tampung_ekor=VALUES(kapasitas_tampung_ekor),
             jumlah_ternak_st=VALUES(jumlah_ternak_st),
             potensi_penambahan_st=VALUES(potensi_penambahan_st),
             status=VALUES(status),
             points=VALUES(points), 
             d=VALUES(d)`,
          [
            item.id,
            item.corelId,
            item.nama,
            item.potensi_pakan_kg,
            item.kapasitas_tampung_ekor,
            item.jumlah_ternak_st,
            item.potensi_penambahan_st,
            item.status,
            item.centerX,
            item.centerY,
            item.tagName,
            item.points || '',
            item.d || '',
            item.keterangan || '',
          ]
        );
      }
      return NextResponse.json({ success: true, data: INITIAL_KAPASITAS_PAKAN });
    }

    const formatted: KapasitasPakanKecamatan[] = rows.map((r: any) => ({
      id: String(r.id),
      corelId: r.corelId,
      nama: r.nama,
      potensi_pakan_kg: Number(r.potensi_pakan_kg) || 0,
      kapasitas_tampung_ekor: Number(r.kapasitas_tampung_ekor) || 0,
      jumlah_ternak_st: Number(r.jumlah_ternak_st) || 0,
      potensi_penambahan_st: Number(r.potensi_penambahan_st) || 0,
      status: (Number(r.potensi_penambahan_st) || 0) >= 0 ? 'Surplus' : 'Defisit',
      centerX: Number(r.centerX) || 500,
      centerY: Number(r.centerY) || 500,
      tagName: r.tagName || 'polygon',
      points: r.points || null,
      d: r.d || null,
      keterangan: r.keterangan || '',
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error: any) {
    console.warn('DB belum aktif, menggunakan fallback INITIAL_KAPASITAS_PAKAN:', error.message);
    return NextResponse.json({ success: true, data: INITIAL_KAPASITAS_PAKAN, isFallback: true });
  }
}

// Update Data Kapasitas Pakan Kecamatan
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, potensi_pakan_kg, kapasitas_tampung_ekor, jumlah_ternak_st, keterangan }: Partial<KapasitasPakanKecamatan> = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID Kecamatan wajib diisi.' }, { status: 400 });
    }

    const potPakan = Number(potensi_pakan_kg) || 0;
    const kapTampung = Number(kapasitas_tampung_ekor) || 0;
    const jmlTernak = Number(jumlah_ternak_st) || 0;
    const potPenambahan = Number((kapTampung - jmlTernak).toFixed(2));
    const status = potPenambahan >= 0 ? 'Surplus' : 'Defisit';

    await ensureTable();

    await pool.execute(
      `UPDATE kesmavet_kapasitas_pakan SET 
       potensi_pakan_kg=?, kapasitas_tampung_ekor=?, jumlah_ternak_st=?, potensi_penambahan_st=?, status=?, keterangan=? 
       WHERE id=?`,
      [potPakan, kapTampung, jmlTernak, potPenambahan, status, keterangan || '', id]
    );

    return NextResponse.json({
      success: true,
      data: { id, potensi_pakan_kg: potPakan, kapasitas_tampung_ekor: kapTampung, jumlah_ternak_st: jmlTernak, potensi_penambahan_st: potPenambahan, status },
      message: 'Data kapasitas pakan berhasil diperbarui.'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Tambah / Reset Data Kecamatan
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, corelId, nama, potensi_pakan_kg, kapasitas_tampung_ekor, jumlah_ternak_st, keterangan } = body;

    if (!nama) {
      return NextResponse.json({ success: false, error: 'Nama Kecamatan wajib diisi.' }, { status: 400 });
    }

    const potPakan = Number(potensi_pakan_kg) || 0;
    const kapTampung = Number(kapasitas_tampung_ekor) || 0;
    const jmlTernak = Number(jumlah_ternak_st) || 0;
    const potPenambahan = Number((kapTampung - jmlTernak).toFixed(2));
    const status = potPenambahan >= 0 ? 'Surplus' : 'Defisit';
    const itemId = id || `k_${nama.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    await ensureTable();

    await pool.execute(
      `INSERT INTO kesmavet_kapasitas_pakan 
       (id, corelId, nama, potensi_pakan_kg, kapasitas_tampung_ekor, jumlah_ternak_st, potensi_penambahan_st, status, keterangan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         potensi_pakan_kg=VALUES(potensi_pakan_kg),
         kapasitas_tampung_ekor=VALUES(kapasitas_tampung_ekor),
         jumlah_ternak_st=VALUES(jumlah_ternak_st),
         potensi_penambahan_st=VALUES(potensi_penambahan_st),
         status=VALUES(status),
         keterangan=VALUES(keterangan)`,
      [itemId, corelId || nama, nama, potPakan, kapTampung, jmlTernak, potPenambahan, status, keterangan || '']
    );

    return NextResponse.json({ success: true, message: 'Data kapasitas pakan berhasil disimpan.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
