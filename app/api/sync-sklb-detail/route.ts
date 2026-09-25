import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import * as xlsx from 'xlsx';

export const dynamic = 'force-dynamic';

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS master_detail_ternak (
      id VARCHAR(100) PRIMARY KEY,
      desa_lokasi VARCHAR(100),
      no INT,
      nama_pemilik VARCHAR(255),
      rt VARCHAR(20),
      rw VARCHAR(20),
      dusun VARCHAR(100),
      nama_sapi VARCHAR(100),
      jenis_kelamin VARCHAR(50),
      kode_bapak VARCHAR(50),
      kode_induk VARCHAR(50),
      umur_bulan DECIMAL(10,2) DEFAULT 0,
      tinggi_pundak DECIMAL(10,2) DEFAULT 0,
      panjang_badan DECIMAL(10,2) DEFAULT 0,
      lingkar_dada DECIMAL(10,2) DEFAULT 0,
      berat_badan DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  try {
    const [cols]: any = await pool.query(`SHOW COLUMNS FROM master_detail_ternak`);
    const existing = (cols || []).map((c: any) => c.Field.toLowerCase());

    const neededCols = [
      { name: 'id', def: 'VARCHAR(100)' },
      { name: 'desa_lokasi', def: 'VARCHAR(100)' },
      { name: 'no', def: 'INT DEFAULT 1' },
      { name: 'nama_pemilik', def: 'VARCHAR(255)' },
      { name: 'rt', def: 'VARCHAR(20)' },
      { name: 'rw', def: 'VARCHAR(20)' },
      { name: 'dusun', def: 'VARCHAR(100)' },
      { name: 'nama_sapi', def: 'VARCHAR(100)' },
      { name: 'jenis_kelamin', def: 'VARCHAR(50)' },
      { name: 'kode_bapak', def: 'VARCHAR(50)' },
      { name: 'kode_induk', def: 'VARCHAR(50)' },
      { name: 'umur_bulan', def: 'DECIMAL(10,2) DEFAULT 0' },
      { name: 'tinggi_pundak', def: 'DECIMAL(10,2) DEFAULT 0' },
      { name: 'panjang_badan', def: 'DECIMAL(10,2) DEFAULT 0' },
      { name: 'lingkar_dada', def: 'DECIMAL(10,2) DEFAULT 0' },
      { name: 'berat_badan', def: 'DECIMAL(10,2) DEFAULT 0' },
      { name: 'created_at', def: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
    ];

    for (const c of neededCols) {
      if (!existing.includes(c.name.toLowerCase())) {
        try {
          await pool.query(`ALTER TABLE master_detail_ternak ADD COLUMN ${c.name} ${c.def}`);
        } catch {}
      }
    }

    // Jika ada kolom lama 'desa' tapi 'desa_lokasi' masih kosong, salin otomatis
    if (existing.includes('desa') && existing.includes('desa_lokasi')) {
      try {
        await pool.query(`UPDATE master_detail_ternak SET desa_lokasi = desa WHERE (desa_lokasi IS NULL OR desa_lokasi = '') AND desa IS NOT NULL`);
      } catch {}
    }
    // Jika ada kolom lama 'peternak' tapi 'nama_pemilik' masih kosong, salin otomatis
    if (existing.includes('peternak') && existing.includes('nama_pemilik')) {
      try {
        await pool.query(`UPDATE master_detail_ternak SET nama_pemilik = peternak WHERE (nama_pemilik IS NULL OR nama_pemilik = '') AND peternak IS NOT NULL`);
      } catch {}
    }
  } catch (err: any) {
    console.warn('ensureTable migration warning:', err.message);
  }
}

// GET: Ambil semua data detail sapi dari MySQL
export async function GET() {
  try {
    await ensureTable();
    const [cols]: any = await pool.query(`SHOW COLUMNS FROM master_detail_ternak`);
    const existing = (cols || []).map((c: any) => c.Field.toLowerCase());

    const orderDesa = existing.includes('desa_lokasi') ? 'desa_lokasi' : (existing.includes('desa') ? 'desa' : 'id');
    const orderNo = existing.includes('no') ? 'no' : (existing.includes('id_sapi') ? 'id_sapi' : 'id');

    const [rows] = await pool.query(`SELECT * FROM master_detail_ternak ORDER BY ${orderDesa} ASC, ${orderNo} ASC`);
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error('Error GET sync-sklb-detail:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Sinkronisasi dari Google Sheets atau Tambah Manual
export async function POST(request: Request) {
  try {
    await ensureTable();
    const text = await request.text();
    let body: any = {};
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {}
    }

    // Jika ada body spesifik (tambah data manual)
    if (body && body.nama_pemilik && !body.isGoogleSync) {
      const id = body.id || `SAPI-${Date.now()}`;
      await pool.query(
        `INSERT INTO master_detail_ternak 
         (id, desa_lokasi, no, nama_pemilik, rt, rw, dusun, nama_sapi, jenis_kelamin, kode_bapak, kode_induk, umur_bulan, tinggi_pundak, panjang_badan, lingkar_dada, berat_badan)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          body.desa_lokasi || '',
          Number(body.no) || 1,
          body.nama_pemilik,
          body.rt || '',
          body.rw || '',
          body.dusun || '',
          body.nama_sapi || '-',
          body.jenis_kelamin || '-',
          body.kode_bapak || '-',
          body.kode_induk || '-',
          Number(body.umur_bulan) || 0,
          Number(body.tinggi_pundak) || 0,
          Number(body.panjang_badan) || 0,
          Number(body.lingkar_dada) || 0,
          Number(body.berat_badan) || 0,
        ]
      );
      return NextResponse.json({ success: true, message: 'Data sapi berhasil ditambahkan ke database!' });
    }

    // Default: Sinkronisasi dari Google Sheets
    const liveExcelUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSsiU4jFcAULI3Rth6XmJ2lrj6GgZIHvXQg4p8f8YrbhUrR1yd96oVVfjqZO5mTUdotAo46qTHFIO0p/pub?output=xlsx";
    
    const response = await fetch(liveExcelUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error('Gagal menyedot data dari Google Sheets');
    
    const arrayBuffer = await response.arrayBuffer();
    const workbook = xlsx.read(arrayBuffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    
    let totalDataTersedot = 0;
    let data_semua_desa: any[] = [];

    for (const sheetName of sheetNames) {
      if (sheetName === "TOTAL CAPAIAN 2026") continue;

      const sheet = workbook.Sheets[sheetName];
      const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

      for (let i = 5; i < rawData.length; i++) {
        const row = rawData[i];
        if (row[0] && row[1]) {
          const item = {
            id: `${sheetName}-${row[0]}`,
            desa_lokasi: sheetName,
            no: Number(row[0]) || 0,
            nama_pemilik: String(row[1] || ''),
            rt: String(row[2] || ''),
            rw: String(row[3] || ''),
            dusun: String(row[4] || ''),
            nama_sapi: String(row[7] || "-"),
            jenis_kelamin: String(row[9] || "-"),
            kode_bapak: String(row[11] || "-"),
            kode_induk: String(row[12] || "-"),
            umur_bulan: Number(row[20]) || 0,
            tinggi_pundak: Number(row[21]) || 0,
            panjang_badan: Number(row[22]) || 0,
            lingkar_dada: Number(row[24]) || 0,
            berat_badan: Number(row[25]) || 0,
          };
          data_semua_desa.push(item);
          totalDataTersedot++;

          // Simpan / update ke database MySQL
          await pool.query(
            `REPLACE INTO master_detail_ternak 
             (id, desa_lokasi, no, nama_pemilik, rt, rw, dusun, nama_sapi, jenis_kelamin, kode_bapak, kode_induk, umur_bulan, tinggi_pundak, panjang_badan, lingkar_dada, berat_badan)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              item.id,
              item.desa_lokasi,
              item.no,
              item.nama_pemilik,
              item.rt,
              item.rw,
              item.dusun,
              item.nama_sapi,
              item.jenis_kelamin,
              item.kode_bapak,
              item.kode_induk,
              item.umur_bulan,
              item.tinggi_pundak,
              item.panjang_badan,
              item.lingkar_dada,
              item.berat_badan,
            ]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: data_semua_desa,
      message: `Berhasil sinkronisasi ${totalDataTersedot} data sapi dari Google Sheets dan tersimpan ke MySQL!`,
    });
  } catch (error: any) {
    console.error('Error sync-sklb-detail:', error);
    // Jika gagal fetch online, coba ambil data offline yang sudah ada di database
    try {
      const [rows] = await pool.query('SELECT * FROM master_detail_ternak ORDER BY desa_lokasi ASC, no ASC');
      if (rows && (rows as any[]).length > 0) {
        return NextResponse.json({
          success: true,
          data: rows,
          message: 'Memuat data dari database MySQL lokal.',
        });
      }
    } catch {}

    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses data.' },
      { status: 500 }
    );
  }
}

// PUT: Edit data sapi
export async function PUT(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const { id, desa_lokasi, no, nama_pemilik, rt, rw, dusun, nama_sapi, jenis_kelamin, kode_bapak, kode_induk, umur_bulan, tinggi_pundak, panjang_badan, lingkar_dada, berat_badan } = body;

    if (!id || !nama_pemilik) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap!' }, { status: 400 });
    }

    await pool.query(
      `UPDATE master_detail_ternak 
       SET desa_lokasi = ?, no = ?, nama_pemilik = ?, rt = ?, rw = ?, dusun = ?, nama_sapi = ?, jenis_kelamin = ?, kode_bapak = ?, kode_induk = ?, umur_bulan = ?, tinggi_pundak = ?, panjang_badan = ?, lingkar_dada = ?, berat_badan = ?
       WHERE id = ?`,
      [
        desa_lokasi || '',
        Number(no) || 1,
        nama_pemilik,
        rt || '',
        rw || '',
        dusun || '',
        nama_sapi || '-',
        jenis_kelamin || '-',
        kode_bapak || '-',
        kode_induk || '-',
        Number(umur_bulan) || 0,
        Number(tinggi_pundak) || 0,
        Number(panjang_badan) || 0,
        Number(lingkar_dada) || 0,
        Number(berat_badan) || 0,
        id,
      ]
    );

    return NextResponse.json({ success: true, message: 'Data sapi berhasil diperbarui di database!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus data sapi
export async function DELETE(request: Request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID tidak ditemukan!' }, { status: 400 });
    }

    await pool.query('DELETE FROM master_detail_ternak WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Data sapi berhasil dihapus dari database!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}