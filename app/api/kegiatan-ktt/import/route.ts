import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';
import { DAFTAR_TIM_PELAKSANA } from '@/components/bitpro/kegiatan-ktt/types';

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
    const petugasNama = session?.nama || session?.nip_username || 'Petugas Bitpro';

    const body = await req.json();
    const rows = Array.isArray(body) ? body : body.rows || body.items || [];

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data impor kosong atau format salah.' },
        { status: 400 }
      );
    }

    // Ambil master KTT untuk pencocokan otomatis nama_ktt -> id_ktt, kecamatan, desa
    let kttMasterList: any[] = [];
    try {
      const [kttRows]: any = await pool.query(
        'SELECT id, namaKelompok, kecamatan, desa FROM ktt_master'
      );
      kttMasterList = Array.isArray(kttRows) ? kttRows : [];
    } catch (e) {
      console.warn('Gagal memuat ktt_master untuk auto-matching:', e);
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
        return '';
      };

      const rawTanggal = getVal(['tanggal', 'tgl', 'date']);
      const tanggal = parseExcelDate(rawTanggal);

      const nama_ktt = String(getVal(['namaktt', 'namakelompok', 'namakelompokktt', 'ktt']) || '').trim();
      let kecamatan = String(getVal(['kecamatan', 'kec']) || '').trim();
      let desa = String(getVal(['desa', 'kelurahan', 'desakelurahan']) || '').trim();

      if (!nama_ktt) {
        errors.push(`Baris ${i + 1}: Nama Kelompok (KTT) wajib diisi.`);
        continue;
      }

      // Auto-match ke ktt_master
      let matchedKttId: number | null = null;
      const matchedKtt = kttMasterList.find(
        (k) =>
          k.namaKelompok &&
          (k.namaKelompok.toLowerCase().trim() === nama_ktt.toLowerCase().trim() ||
            k.namaKelompok.toLowerCase().replace(/^(ktt|kelompok tani ternak)\s*/i, '').trim() ===
              nama_ktt.toLowerCase().replace(/^(ktt|kelompok tani ternak)\s*/i, '').trim())
      );

      if (matchedKtt) {
        matchedKttId = Number(matchedKtt.id) || null;
        if (!kecamatan && matchedKtt.kecamatan) kecamatan = matchedKtt.kecamatan;
        if (!desa && matchedKtt.desa) desa = matchedKtt.desa;
      }

      let tim_pelaksana = String(getVal(['timpelaksana', 'tim', 'pelaksana']) || '').trim();
      const validTim = DAFTAR_TIM_PELAKSANA.find(
        (t) => t.toLowerCase() === tim_pelaksana.toLowerCase()
      );
      if (validTim) {
        tim_pelaksana = validTim;
      } else if (!tim_pelaksana) {
        tim_pelaksana = DAFTAR_TIM_PELAKSANA[0]; // 'Tim Bitpro'
      }

      const nama_kegiatan = String(
        getVal(['namakegiatan', 'kegiatan', 'jeniskegiatan']) || ''
      ).trim();
      if (!nama_kegiatan) {
        errors.push(`Baris ${i + 1} (${nama_ktt}): Nama Kegiatan wajib diisi.`);
        continue;
      }

      const hasil_kegiatan = String(
        getVal(['hasilkegiatan', 'hasilpendampingan', 'hasil', 'uraiankegiatan', 'uraian', 'catatan']) || ''
      ).trim();

      const uniqueActivityId = `ACT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      try {
        await pool.query(
          `INSERT INTO kegiatan_ktt 
           (id_kegiatan, id_ktt, tanggal, nama_ktt, kecamatan, desa, tim_pelaksana, nama_kegiatan, hasil_kegiatan, lat, lng, photo)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uniqueActivityId,
            matchedKttId,
            tanggal,
            nama_ktt,
            kecamatan || '',
            desa || '',
            tim_pelaksana,
            nama_kegiatan,
            hasil_kegiatan || '-',
            null,
            null,
            null,
          ]
        );
        insertedCount++;
      } catch (err: any) {
        console.error(`Error importing kegiatan KTT row ${i + 1}:`, err);
        errors.push(`Baris ${i + 1} (${nama_ktt}): ${err.message}`);
      }
    }

    if (insertedCount > 0) {
      await logActivity({
        module: 'bitpro',
        submenu: 'kegiatan-ktt',
        tableName: 'kegiatan_ktt',
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
      message: `Berhasil mengimpor ${insertedCount} dari ${rows.length} data kegiatan KTT.`,
      insertedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error POST /api/kegiatan-ktt/import:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses impor file Excel.' },
      { status: 500 }
    );
  }
}
