import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';

function parseExcelDate(val: any): string {
  if (!val) return new Date().toISOString().split('T')[0];

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

  return new Date().toISOString().split('T')[0];
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    const petugasNama = session?.nama || 'Petugas Pasar Hewan';

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

      const rawTanggal = getVal(['tanggal', 'tgl', 'tanggal_pemeriksaan']);
      const tanggal = parseExcelDate(rawTanggal);

      let pasarRaw = String(getVal(['pasar', 'lokasi_pasar', 'pasar_hewan']) || 'Kebumen').trim();
      let pasar: 'Kebumen' | 'Gombong' = 'Kebumen';
      if (/gombong/i.test(pasarRaw)) {
        pasar = 'Gombong';
      }

      const nama_pemilik = String(getVal(['nama_pemilik', 'nama', 'pemilik', 'pedagang']) || '').trim();
      const jenis_ternak = String(getVal(['jenis_ternak', 'ternak', 'komoditas']) || 'Sapi').trim();
      const warna = String(getVal(['warna', 'warna_ternak', 'ciri']) || '').trim();

      if (!nama_pemilik || !warna) {
        errors.push(`Baris ${i + 1}: Nama Pemilik dan Warna Ternak wajib diisi.`);
        continue;
      }

      let layananRaw = String(getVal(['layanan', 'jenis_layanan', 'form_layanan']) || 'Timbang').trim();
      let layanan: 'Timbang' | 'Timbang + PKB' | 'PKB' = 'Timbang';
      if (/timbang.*pkb|pkb.*timbang/i.test(layananRaw)) {
        layanan = 'Timbang + PKB';
      } else if (/pkb/i.test(layananRaw)) {
        layanan = 'PKB';
      } else {
        layanan = 'Timbang';
      }

      const rawBb = getVal(['bb', 'berat_badan', 'berat', 'timbangan']);
      const bb =
        rawBb !== undefined && rawBb !== null && String(rawBb).trim() !== ''
          ? parseFloat(String(rawBb).replace(',', '.')) || null
          : null;

      const hasPkb = layanan === 'Timbang + PKB' || layanan === 'PKB';
      let rawHasilPkb = String(getVal(['hasil_pkb', 'pkb', 'kebuntingan', 'status_kebuntingan']) || '').trim();
      let hasil_pkb: 'Bunting' | 'Tidak Bunting' | null = null;
      if (hasPkb) {
        if (/tidak|negatif|blm|belum/i.test(rawHasilPkb)) {
          hasil_pkb = 'Tidak Bunting';
        } else if (/bunting|positif|bunt/i.test(rawHasilPkb)) {
          hasil_pkb = 'Bunting';
        }
      }

      let retribusiRaw = String(getVal(['sudah_bayar', 'retribusi', 'status_retribusi', 'status_bayar', 'bayar']) || '1').trim();
      let sudah_bayar = 1;
      if (/belum|blm|tidak|0/i.test(retribusiRaw)) {
        sudah_bayar = 0;
      }

      const keterangan = String(getVal(['keterangan', 'ket', 'catatan']) || '').trim() || null;

      try {
        await pool.query(
          `INSERT INTO pasar_hewan_catat
            (tanggal, pasar, nama_pemilik, jenis_ternak, bb, warna, layanan, status_pkb, hasil_pkb, sudah_bayar, keterangan, petugas_nama)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tanggal,
            pasar,
            nama_pemilik,
            jenis_ternak,
            bb,
            warna,
            layanan,
            hasPkb ? 1 : 0,
            hasil_pkb,
            sudah_bayar,
            keterangan,
            petugasNama,
          ]
        );
        insertedCount++;
      } catch (err: any) {
        console.error(`Error importing pasar hewan row ${i + 1}:`, err);
        errors.push(`Baris ${i + 1} (${nama_pemilik}): ${err.message}`);
      }
    }

    if (insertedCount > 0) {
      await logActivity({
        module: 'kesmavet',
        submenu: 'pasar-hewan',
        tableName: 'pasar_hewan_catat',
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
      message: `Berhasil mengimpor ${insertedCount} dari ${rows.length} catatan pasar hewan.`,
      insertedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error POST /api/pasar-hewan/import:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses impor file Excel.' },
      { status: 500 }
    );
  }
}
