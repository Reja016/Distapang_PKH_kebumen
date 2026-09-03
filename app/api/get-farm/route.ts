import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS data_farm (
      id INT AUTO_INCREMENT PRIMARY KEY,
      kategori VARCHAR(50) DEFAULT 'general',
      hewan VARCHAR(100),
      kecamatan VARCHAR(100),
      no_desa VARCHAR(100),
      desa VARCHAR(100),
      nama_badan_usaha VARCHAR(150),
      nama_unit_farm VARCHAR(150),
      mandiri_kemitraan VARCHAR(50),
      alamat VARCHAR(255),
      lintang VARCHAR(100),
      bujur VARCHAR(100),
      telp_hp VARCHAR(50),
      kapasitas_gudang VARCHAR(100),
      jumlah_populasi VARCHAR(100),
      bobot_rata2_panen VARCHAR(50),
      konsumsi_pakan_fcr VARCHAR(50),
      catatan TEXT,
      status VARCHAR(50),
      tujuan VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

// GET: Ambil semua data farm terstruktur
export async function GET() {
  try {
    await ensureTable();
    const [rows]: any = await pool.query('SELECT * FROM data_farm ORDER BY id ASC');
    
    const dataBroiler: any[] = [];
    const dataPetelur: any[] = [];
    const dataGeneral: any[] = [];

    rows.forEach((row: any) => {
      const item: any = {
        db_id: row.id,
        id: row.id,
        no: row.no_desa || row.id,
        no_desa: row.no_desa || '',
        kecamatan: row.kecamatan || '',
        desa: row.desa || '',
        kelurahan_desa: row.desa || '',
        nama_badan_usaha: row.nama_badan_usaha || '',
        nama_unit_farm: row.nama_unit_farm || '',
        nama_peternak: row.nama_unit_farm || row.nama_badan_usaha || '',
        mandiri_kemitraan: row.mandiri_kemitraan || 'Mandiri',
        status_kemitraan: row.mandiri_kemitraan || 'Mandiri',
        alamat: row.alamat || '',
        lintang: row.lintang || '',
        bujur: row.bujur || '',
        telp_hp: row.telp_hp || '',
        kapasitas_gudang: row.kapasitas_gudang || '',
        kapasitas_kandang: row.kapasitas_gudang || row.jumlah_populasi || '',
        jumlah_populasi: row.jumlah_populasi || row.kapasitas_gudang || '',
        populasi_total: row.jumlah_populasi || row.kapasitas_gudang || '',
        bobot_rata2_panen: row.bobot_rata2_panen || '',
        konsumsi_pakan_fcr: row.konsumsi_pakan_fcr || '',
        fcr: row.konsumsi_pakan_fcr || '',
        catatan: row.catatan || '',
        status: row.status || 'Aktif',
        status_aktif: row.status || 'Aktif',
        tujuan: row.tujuan || '',
        jenis_ternak: row.hewan || 'Lainnya',
        hewan: row.hewan || 'Lainnya',
      };

      const hewanLower = (row.hewan || '').toLowerCase();
      const katLower = (row.kategori || '').toLowerCase();

      if (katLower === 'broiler' || hewanLower.includes('broiler')) {
        dataBroiler.push(item);
      } else if (katLower === 'petelur' || hewanLower.includes('petelur')) {
        dataPetelur.push(item);
      } else {
        dataGeneral.push(item);
      }
    });

    return NextResponse.json({ success: true, dataBroiler, dataPetelur, dataGeneral });
  } catch (error: any) {
    console.error('Error GET data_farm:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengambil data farm' }, { status: 500 });
  }
}

// POST: Tambah data farm baru
export async function POST(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const { kategori = 'general', data } = body;

    if (!data) {
      return NextResponse.json({ success: false, error: 'Data farm tidak boleh kosong!' }, { status: 400 });
    }

    const hewanVal = data.jenis_ternak || data.hewan || (kategori === 'broiler' ? 'Ayam Broiler' : kategori === 'petelur' ? 'Ayam Petelur' : 'Sapi Potong');

    const [result]: any = await pool.query(
      `INSERT INTO data_farm 
       (kategori, hewan, kecamatan, desa, nama_badan_usaha, nama_unit_farm, mandiri_kemitraan, alamat, lintang, bujur, telp_hp, kapasitas_gudang, jumlah_populasi, bobot_rata2_panen, konsumsi_pakan_fcr, catatan, status, tujuan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        kategori,
        hewanVal,
        data.kecamatan || '',
        data.desa || data.kelurahan_desa || '',
        data.nama_badan_usaha || data.nama_peternak || '',
        data.nama_unit_farm || data.nama_peternak || '',
        data.mandiri_kemitraan || data.status_kemitraan || 'Mandiri',
        data.alamat || '',
        data.lintang || '',
        data.bujur || '',
        data.telp_hp || '',
        data.kapasitas_kandang || data.kapasitas_gudang || '0',
        data.jumlah_populasi || data.populasi_total || '0',
        data.bobot_rata2_panen || '',
        data.konsumsi_pakan_fcr || data.fcr || '',
        data.catatan || '',
        data.status || data.status_aktif || 'Aktif',
        data.tujuan || '',
      ]
    );

    return NextResponse.json({ success: true, insertId: result.insertId, message: 'Data farm berhasil disimpan ke database!' });
  } catch (error: any) {
    console.error('Error POST data_farm:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Edit data farm
export async function PUT(request: Request) {
  try {
    await ensureTable();
    const body = await request.json();
    const { id, kategori = 'general', data } = body;

    if (!id || !data) {
      return NextResponse.json({ success: false, error: 'ID dan data farm wajib disertakan!' }, { status: 400 });
    }

    const hewanVal = data.jenis_ternak || data.hewan || (kategori === 'broiler' ? 'Ayam Broiler' : kategori === 'petelur' ? 'Ayam Petelur' : 'Sapi Potong');

    await pool.query(
      `UPDATE data_farm 
       SET kategori=?, hewan=?, kecamatan=?, desa=?, nama_badan_usaha=?, nama_unit_farm=?, mandiri_kemitraan=?, alamat=?, lintang=?, bujur=?, telp_hp=?, kapasitas_gudang=?, jumlah_populasi=?, bobot_rata2_panen=?, konsumsi_pakan_fcr=?, catatan=?, status=?, tujuan=?
       WHERE id=?`,
      [
        kategori,
        hewanVal,
        data.kecamatan || '',
        data.desa || data.kelurahan_desa || '',
        data.nama_badan_usaha || data.nama_peternak || '',
        data.nama_unit_farm || data.nama_peternak || '',
        data.mandiri_kemitraan || data.status_kemitraan || 'Mandiri',
        data.alamat || '',
        data.lintang || '',
        data.bujur || '',
        data.telp_hp || '',
        data.kapasitas_kandang || data.kapasitas_gudang || '0',
        data.jumlah_populasi || data.populasi_total || '0',
        data.bobot_rata2_panen || '',
        data.konsumsi_pakan_fcr || data.fcr || '',
        data.catatan || '',
        data.status || data.status_aktif || 'Aktif',
        data.tujuan || '',
        id,
      ]
    );

    return NextResponse.json({ success: true, message: 'Data farm berhasil diperbarui di database!' });
  } catch (error: any) {
    console.error('Error PUT data_farm:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus data farm
export async function DELETE(request: Request) {
  try {
    await ensureTable();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID data farm wajib disertakan!' }, { status: 400 });
    }

    await pool.query('DELETE FROM data_farm WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Data farm berhasil dihapus dari database!' });
  } catch (error: any) {
    console.error('Error DELETE data_farm:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}