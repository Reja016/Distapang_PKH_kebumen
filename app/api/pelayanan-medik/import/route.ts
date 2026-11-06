import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';
import { DAFTAR_PUSKESWAN } from '@/components/keswan/puskeswan/types';

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
    const session = await getSessionFromRequest(req as any);
    const petugasNama = session?.nama || session?.nip_username || 'Petugas Puskeswan';

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

      const rawTanggal = getVal(['tanggal', 'tgl', 'tanggal_pelayanan']);
      const tanggal = parseExcelDate(rawTanggal);

      let rawPuskeswan = String(getVal(['puskeswan', 'pos_puskeswan', 'lokasi']) || 'KEBUMEN').trim().toUpperCase();
      let matchedPuskeswan = DAFTAR_PUSKESWAN.find((p) => rawPuskeswan.includes(p)) || 'KEBUMEN';

      const nama_pemilik = String(getVal(['nama_pemilik', 'nama', 'pemilik', 'peternak']) || '').trim();
      const alamat = String(getVal(['alamat', 'alamat_pemilik', 'desa', 'lokasi']) || '').trim();
      const jenis_hewan = String(getVal(['jenis_hewan', 'hewan', 'spesies', 'komoditas']) || 'Sapi').trim();

      if (!nama_pemilik || !alamat || !jenis_hewan) {
        errors.push(`Baris ${i + 1}: Nama Pemilik, Alamat, dan Jenis Hewan wajib diisi.`);
        continue;
      }

      let rawKelamin = String(getVal(['jenis_kelamin', 'kelamin', 'sex']) || 'Jantan').trim();
      const jenis_kelamin = /betina|female/i.test(rawKelamin) ? 'Betina' : 'Jantan';

      const umur = String(getVal(['umur', 'usia']) || '').trim();
      const diagnosa_nama = String(getVal(['diagnosa_nama', 'diagnosa', 'penyakit', 'kasus']) || 'Sehat').trim();

      const rawLayanan = getVal(['layanan_terpilih', 'layanan', 'tindakan', 'karcis']);
      let layananArr: string[] = [];
      if (Array.isArray(rawLayanan)) {
        layananArr = rawLayanan;
      } else if (typeof rawLayanan === 'string' && rawLayanan.trim()) {
        layananArr = rawLayanan.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
      }
      const layanan_terpilih = JSON.stringify(layananArr);

      const rawRetribusi = getVal(['total_retribusi', 'retribusi', 'tarif', 'biaya']);
      const total_retribusi =
        rawRetribusi !== undefined && rawRetribusi !== null && String(rawRetribusi).trim() !== ''
          ? parseFloat(String(rawRetribusi).replace(/[^0-9.]/g, '')) || 0
          : 0;

      let rawLuarJam = String(getVal(['is_luar_jam_kerja', 'luar_jam_kerja', 'darurat']) || '0').trim();
      const is_luar_jam_kerja = /ya|true|1/i.test(rawLuarJam) ? 1 : 0;
      const catatan_harga_luar_jam = is_luar_jam_kerja ? 'Pelayanan panggilan darurat luar jam kerja' : null;

      const catatan = String(getVal(['catatan', 'anamnesa', 'keterangan']) || '').trim() || null;

      try {
        await pool.query(
          `INSERT INTO pelayanan_medik_veteriner 
            (tanggal, puskeswan, nama_pemilik, alamat, jenis_hewan, jenis_kelamin, umur, layanan_terpilih, total_retribusi, is_luar_jam_kerja, catatan_harga_luar_jam, diagnosa_nama, catatan, petugas_nama)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tanggal,
            matchedPuskeswan,
            nama_pemilik,
            alamat,
            jenis_hewan,
            jenis_kelamin,
            umur,
            layanan_terpilih,
            total_retribusi,
            is_luar_jam_kerja,
            catatan_harga_luar_jam,
            diagnosa_nama,
            catatan,
            petugasNama,
          ]
        );
        insertedCount++;
      } catch (err: any) {
        console.error(`Error importing pelayanan medik row ${i + 1}:`, err);
        errors.push(`Baris ${i + 1} (${nama_pemilik}): ${err.message}`);
      }
    }

    if (insertedCount > 0) {
      await logActivity({
        module: 'keswan',
        submenu: 'puskeswan',
        tableName: 'pelayanan_medik_veteriner',
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
      message: `Berhasil mengimpor ${insertedCount} dari ${rows.length} data pelayanan medik puskeswan.`,
      insertedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error POST /api/pelayanan-medik/import:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses impor file Excel.' },
      { status: 500 }
    );
  }
}
