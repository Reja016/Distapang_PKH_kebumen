import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';

function parseExcelDate(val: any): string {
  if (!val) return new Date().toISOString().split('T')[0];

  if (typeof val === 'number') {
    // Excel serial number
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }

  const str = String(val).trim();
  // Format DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Format YYYY-MM-DD
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

  return new Date().toISOString().split('T')[0];
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req as any);
    const userName = session?.nama || session?.nip_username || 'Petugas Keswan';

    const body = await req.json();
    const rows = Array.isArray(body) ? body : body.rows || body.items || [];

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data impor kosong atau format salah.' },
        { status: 400 }
      );
    }

    let insertedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Cari value dengan case-insensitive alias
      const getVal = (aliases: string[]): any => {
        for (const k of Object.keys(row)) {
          const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
          for (const alias of aliases) {
            if (cleanK === alias.toLowerCase().replace(/[^a-z0-9]/g, '')) {
              return row[k];
            }
          }
        }
        return undefined;
      };

      let kategoriRaw = String(getVal(['kategori', 'jenis_lalin']) || 'Pemasukkan').trim();
      let kategori: 'Pemasukkan' | 'Pengeluaran' = 'Pemasukkan';
      if (/keluar|pengeluaran/i.test(kategoriRaw)) {
        kategori = 'Pengeluaran';
      }

      let wilayahRaw = String(getVal(['wilayah', 'pasar_hewan', 'pasar']) || 'Kebumen').trim();
      let wilayah: 'Kebumen' | 'Gombong' = 'Kebumen';
      if (/gombong/i.test(wilayahRaw)) {
        wilayah = 'Gombong';
      }

      const rawTanggal = getVal(['tanggal_pengiriman', 'tanggal', 'tgl']);
      const tanggal_pengiriman = parseExcelDate(rawTanggal);

      const no_skkh_raw = getVal(['no_skkh', 'skkh', 'nomor_skkh']);
      const no_skkh =
        no_skkh_raw && String(no_skkh_raw).trim() !== '' && String(no_skkh_raw).trim() !== '-'
          ? String(no_skkh_raw).trim()
          : null;

      const nama_pemilik = String(getVal(['nama_pemilik', 'nama', 'pemilik']) || '').trim();
      const alamat_pemilik = String(getVal(['alamat_pemilik', 'alamat']) || '').trim();
      const jenis_ternak = String(getVal(['jenis_ternak', 'ternak', 'komoditas']) || 'Sapi').trim();

      if (!nama_pemilik || !alamat_pemilik) {
        errors.push(`Baris ${i + 1}: Nama dan Alamat Pemilik wajib diisi.`);
        continue;
      }

      const rawUmur = getVal(['umur', 'usia']);
      const umur =
        rawUmur !== undefined && rawUmur !== null && String(rawUmur).trim() !== ''
          ? Number(rawUmur) || null
          : null;

      let satuanUmurRaw = String(getVal(['satuan_umur', 'satuan_usia']) || 'tahun').trim().toLowerCase();
      const satuan_umur: 'bulan' | 'tahun' = satuanUmurRaw === 'bulan' ? 'bulan' : 'tahun';

      const jantan = Number(getVal(['jumlah_jantan', 'jantan'])) || 0;
      const betina = Number(getVal(['jumlah_betina', 'betina'])) || 0;
      const rawJumlah = Number(getVal(['jumlah', 'total_ekor', 'ekor'])) || 0;
      const jumlah = jantan > 0 || betina > 0 ? jantan + betina : rawJumlah > 0 ? rawJumlah : 1;

      let satuanJumlahRaw = String(getVal(['satuan_jumlah', 'satuan']) || 'ekor').trim().toLowerCase();
      const satuan_jumlah: 'ekor' | 'kilo' = satuanJumlahRaw === 'kilo' ? 'kilo' : 'ekor';

      const asal_ternak = String(getVal(['asal_ternak', 'asal']) || '').trim() || null;
      const tujuan_ternak = String(getVal(['tujuan_ternak', 'tujuan']) || '').trim() || null;
      const ket = String(getVal(['ket', 'keterangan', 'catatan']) || '').trim() || null;

      try {
        await pool.query(
          `INSERT INTO Lalin_ternak (
            kategori, wilayah, tanggal_pengiriman, no_skkh, nama_pemilik, alamat_pemilik,
            jenis_ternak, umur, satuan_umur, jumlah, jumlah_jantan, jumlah_betina,
            satuan_jumlah, asal_ternak, tujuan_ternak, ket
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            kategori,
            wilayah,
            tanggal_pengiriman,
            no_skkh,
            nama_pemilik,
            alamat_pemilik,
            jenis_ternak,
            umur,
            satuan_umur,
            jumlah,
            jantan,
            betina,
            satuan_jumlah,
            asal_ternak,
            tujuan_ternak,
            ket,
          ]
        );
        insertedCount++;
      } catch (err: any) {
        console.error(`Error importing row ${i + 1}:`, err);
        errors.push(`Baris ${i + 1} (${nama_pemilik}): ${err.message}`);
      }
    }

    if (insertedCount > 0) {
      await logActivity({
        module: 'keswan',
        submenu: 'lalu-lintas-ternak',
        tableName: 'Lalin_ternak',
        recordId: 'BULK_IMPORT',
        action: 'IMPORT',
        userName,
        details: {
          insertedCount,
          totalRows: rows.length,
          errorsCount: errors.length,
        },
      });
    }

    return NextResponse.json({
      success: insertedCount > 0,
      message: `Berhasil mengimpor ${insertedCount} dari ${rows.length} data lalu lintas ternak.`,
      insertedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error POST /api/lalin-ternak/import:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses impor file Excel.' },
      { status: 500 }
    );
  }
}
