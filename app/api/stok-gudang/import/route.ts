import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';

function parseExcelDate(val: any): string | null {
  if (!val) return null;

  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }

  const str = String(val).trim();
  const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  const ymdMatch = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req as any);
    const petugasNama = session?.nama || session?.nip_username || 'Petugas Gudang Keswan';

    const body = await req.json();
    const rows = Array.isArray(body) ? body : body.rows || body.items || [];

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data impor kosong atau format salah.' },
        { status: 400 }
      );
    }

    // Ambil master barang terkini
    const [barangRows]: any = await pool.query('SELECT id_barang, nama_barang, merk, kategori, satuan_kemasan FROM barang');
    const masterBarangMap = new Map<string, number>();

    (barangRows || []).forEach((b: any) => {
      const name = (b.nama_barang || b.merk || '').toLowerCase().trim();
      if (name) masterBarangMap.set(name, Number(b.id_barang));
    });

    let insertedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const getVal = (aliases: string[]): any => {
        for (const k of Object.keys(row)) {
          const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          for (const alias of aliases) {
            if (cleanK === alias.toLowerCase().replace(/[^a-z0-9]/g, '')) {
              return row[k];
            }
          }
        }
        return '';
      };

      const nama_barang = String(
        getVal(['namabarang', 'namaprodukobat', 'namaproduk', 'namaobat', 'produk', 'obat']) || ''
      ).trim();

      if (!nama_barang) {
        errors.push(`Baris ${i + 1}: Nama Produk / Obat wajib diisi.`);
        continue;
      }

      let tahun = parseInt(String(getVal(['tahunanggaran', 'tahun', 'th']) || new Date().getFullYear()), 10);
      if (isNaN(tahun) || tahun < 2000) tahun = new Date().getFullYear();

      let bulan = String(getVal(['bulan', 'bln']) || 'November').trim();
      if (!bulan) bulan = 'November';

      let kategori = String(getVal(['kategori', 'jenis', 'jenisbarang']) || 'Obat').trim();
      let satuan_kemasan = String(getVal(['satuankemasan', 'satuan', 'kemasan']) || 'Botol').trim();
      let nomor_batch = String(getVal(['nomorbatch', 'nobatch', 'batch', 'lot', 'nomorlot']) || '').trim();

      const rawExp = getVal(['tanggalkadaluarsaexp', 'tanggalkadaluarsa', 'kadaluarsa', 'exp', 'tglkadaluarsa']);
      const tanggal_kadaluarsa = parseExcelDate(rawExp);

      let sumber_anggaran = String(getVal(['sumberanggaran', 'sumber', 'anggaran']) || 'APBD Kabupaten').trim();
      if (!sumber_anggaran) sumber_anggaran = 'APBD Kabupaten';

      const jumlah = parseInt(String(getVal(['jumlahmasuk', 'jumlah', 'qty']) || '0'), 10);
      if (isNaN(jumlah) || jumlah <= 0) {
        errors.push(`Baris ${i + 1} (${nama_barang}): Jumlah barang masuk harus angka lebih besar dari 0.`);
        continue;
      }

      const harga_satuan = parseInt(String(getVal(['hargasatuanrp', 'hargasatuan', 'harga']) || '0'), 10) || 0;
      const harga_total = jumlah * harga_satuan;

      const yang_menerima = String(getVal(['petugaspenerima', 'yangmenerima', 'penerima']) || petugasNama).trim();
      const yang_menyerahkan = String(getVal(['distributorpenyerah', 'distributor', 'yangmenyerahkan', 'penyerah']) || '').trim();

      // Cari atau buat id_barang
      let id_barang = masterBarangMap.get(nama_barang.toLowerCase());

      if (!id_barang) {
        try {
          const [insBarang]: any = await pool.execute(
            `INSERT INTO barang (nama_barang, merk, kategori, jenis_barang, satuan_kemasan, satuan, min_stok_dinas) 
             VALUES (?, ?, ?, ?, ?, ?, 10)`,
            [nama_barang, nama_barang, kategori, kategori, satuan_kemasan, satuan_kemasan]
          );
          id_barang = Number(insBarang.insertId);
          masterBarangMap.set(nama_barang.toLowerCase(), id_barang);
        } catch (err: any) {
          console.error(`Gagal membuat master barang baru (${nama_barang}):`, err);
          errors.push(`Baris ${i + 1}: Gagal meregistrasi barang "${nama_barang}".`);
          continue;
        }
      }

      try {
        await pool.execute(
          `INSERT INTO dropping_dinas 
           (tahun, bulan, id_barang, nomor_batch, tanggal_kadaluarsa, sumber_anggaran, satuan_kemasan, jumlah, harga_satuan, harga_total, yang_menerima, yang_menyerahkan)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tahun,
            bulan,
            id_barang,
            nomor_batch || null,
            tanggal_kadaluarsa,
            sumber_anggaran,
            satuan_kemasan,
            jumlah,
            harga_satuan,
            harga_total,
            yang_menerima,
            yang_menyerahkan,
          ]
        );
        insertedCount++;
      } catch (err: any) {
        console.error(`Error inserting dropping_dinas baris ${i + 1}:`, err);
        errors.push(`Baris ${i + 1} (${nama_barang}): ${err.message}`);
      }
    }

    if (insertedCount > 0) {
      await logActivity({
        module: 'keswan',
        submenu: 'stok-gudang',
        tableName: 'dropping_dinas',
        recordId: 'BULK_IMPORT',
        action: 'IMPORT',
        userName: petugasNama,
        details: {
          insertedCount,
          totalRows: rows.length,
          errorsCount: errors.length,
        },
      });
    }

    return NextResponse.json({
      success: insertedCount > 0,
      message: `Berhasil mengimpor ${insertedCount} dari ${rows.length} data dropping logistik gudang dinas.`,
      insertedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error POST /api/stok-gudang/import:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses impor file Excel.' },
      { status: 500 }
    );
  }
}
