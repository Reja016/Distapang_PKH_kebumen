import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';
import { KONDISI_KOSONG } from '@/components/bitpro/monev-ktt/types';

export const dynamic = 'force-dynamic';

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS monev_lapangan (
      id VARCHAR(50) PRIMARY KEY,
      tahun VARCHAR(10) NOT NULL DEFAULT '2026',
      kec VARCHAR(100) NOT NULL DEFAULT '-',
      desa VARCHAR(100) NOT NULL DEFAULT '-',
      namaKtt VARCHAR(255) NOT NULL DEFAULT 'KTT',
      alamat TEXT,
      kegiatan VARCHAR(255),
      jenis VARCHAR(100),
      waktuMonev VARCHAR(50),
      kondisi LONGTEXT,
      lat DOUBLE,
      lng DOUBLE,
      photo LONGTEXT,
      pdfBA LONGTEXT,
      pdfBAName VARCHAR(255),
      catatan TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

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

  return str;
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();

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

    // Ambil master KTT untuk pencocokan otomatis jika kec/desa/ketua belum terisi
    let kttMasterList: any[] = [];
    try {
      const [kttRows]: any = await pool.query(
        'SELECT id, namaKelompok, kecamatan, desa, namaKetuaKelompok FROM ktt_master'
      );
      kttMasterList = Array.isArray(kttRows) ? kttRows : [];
    } catch (e) {
      console.warn('Gagal memuat ktt_master untuk auto-matching monev:', e);
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

      const namaKtt = String(
        getVal(['namaktt', 'ktt', 'namakelompok', 'namakelompokktt', 'kelompok']) || ''
      ).trim();

      if (!namaKtt) {
        errors.push(`Baris ${i + 1}: Nama KTT wajib diisi.`);
        continue;
      }

      let tahun = String(getVal(['tahunbantuan', 'tahun', 'thbantuan', 'th']) || '').trim();
      if (!tahun) tahun = String(new Date().getFullYear());

      let namaKetua = String(getVal(['namaketua', 'ketua', 'namaketuakelompok']) || '').trim();
      let kecamatan = String(getVal(['kecamatan', 'kec']) || '').trim().toUpperCase();
      let desa = String(getVal(['desa', 'kelurahan', 'desakelurahan']) || '').trim().toUpperCase();

      // Auto-match ke master KTT jika ada informasi yang kosong
      const matchedKtt = kttMasterList.find(
        (k) =>
          k.namaKelompok &&
          (k.namaKelompok.toLowerCase().trim() === namaKtt.toLowerCase().trim() ||
            k.namaKelompok.toLowerCase().replace(/^(ktt|kelompok tani ternak)\s*/i, '').trim() ===
              namaKtt.toLowerCase().replace(/^(ktt|kelompok tani ternak)\s*/i, '').trim())
      );

      if (matchedKtt) {
        if (!kecamatan && matchedKtt.kecamatan) kecamatan = String(matchedKtt.kecamatan).toUpperCase();
        if (!desa && matchedKtt.desa) desa = String(matchedKtt.desa).toUpperCase();
        if (!namaKetua && matchedKtt.namaKetuaKelompok) namaKetua = String(matchedKtt.namaKetuaKelompok);
      }

      const jenis = String(getVal(['jenisternak', 'jenis', 'komoditas']) || 'Sapi').trim();

      // Angka bantuan awal
      const awalB = parseInt(String(getVal(['betinab', 'betina', 'b', 'awalbetina']) || '0'), 10) || 0;
      const awalJ = parseInt(String(getVal(['jantanj', 'jantan', 'j', 'awaljantan']) || '0'), 10) || 0;
      const bibitOdot = parseInt(String(getVal(['bibitodotstek', 'bibitodot', 'odot']) || '0'), 10) || 0;
      const obatPaket = parseInt(String(getVal(['obatpaket', 'obatobatanpaket', 'obat']) || '0'), 10) || 0;

      // Angka dinamika mutasi ternak
      const anakLahir = parseInt(String(getVal(['anaklahir', 'lahiranak', 'lahir']) || '0'), 10) || 0;
      const anakMati = parseInt(String(getVal(['anakmati', 'matianak']) || '0'), 10) || 0;
      const anakDijual = parseInt(String(getVal(['anakdijual', 'jualanak', 'anakjual']) || '0'), 10) || 0;
      const pokokMati = parseInt(String(getVal(['pokokmati', 'matipokok', 'matibangkai']) || '0'), 10) || 0;
      const pokokPotongPaksa = parseInt(String(getVal(['pokokpotongpaksa', 'potongpaksa', 'matipotong']) || '0'), 10) || 0;
      const pokokDijual = parseInt(String(getVal(['pokokdijual', 'pokokjual', 'jualpokok']) || '0'), 10) || 0;
      const beliPengganti = parseInt(String(getVal(['belipengganti', 'pengganti', 'beli']) || '0'), 10) || 0;

      const rawWaktu = getVal(['kondisiwaktumonev', 'waktumonev', 'kondisitahun', 'waktu', 'tanggal']);
      const waktuMonev = rawWaktu ? parseExcelDate(rawWaktu) : new Date().toISOString().split('T')[0];

      const keterangan = String(getVal(['keterangansumberdana', 'keterangan', 'sumberdana', 'catatan', 'ket']) || '').trim();

      const rawLat = getVal(['latitude', 'lat']);
      const rawLng = getVal(['longitude', 'lng', 'long']);
      const lat = rawLat !== '' && !isNaN(Number(rawLat)) ? Number(rawLat) : null;
      const lng = rawLng !== '' && !isNaN(Number(rawLng)) ? Number(rawLng) : null;

      const kondisiObj = {
        ...KONDISI_KOSONG,
        namaKetua,
        sumberDana: keterangan,
        awalBetina: awalB,
        awalJantan: awalJ,
        bibitOdot,
        obatPaket,
        lahirBetina: anakLahir,
        matiAnakBetina: anakMati,
        jualAnakBetina: anakDijual,
        matiBangkaiBetina: pokokMati,
        matiPotongBetina: pokokPotongPaksa,
        jualBetina: pokokDijual,
        beliBetina: beliPengganti,
        dokumenHasilPdf: null,
        dokumenHasilPdfName: null,
        kategori: 'Ruminansia',
      };

      const recordId = `MONEV-${Date.now()}-${i}-${Math.floor(1000 + Math.random() * 9000)}`;
      const alamat = desa && kecamatan ? `Desa ${desa}, Kec. ${kecamatan}` : '';

      try {
        await pool.query(
          `INSERT INTO monev_lapangan 
           (id, tahun, kec, desa, namaKtt, alamat, kegiatan, jenis, waktuMonev, kondisi, lat, lng, photo, catatan)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            recordId,
            tahun,
            kecamatan || '-',
            desa || '-',
            namaKtt,
            alamat,
            'Monev Hibah Ternak',
            jenis,
            waktuMonev,
            JSON.stringify(kondisiObj),
            lat,
            lng,
            null,
            keterangan || '-',
          ]
        );
        insertedCount++;
      } catch (err: any) {
        console.error(`Error importing monev row ${i + 1}:`, err);
        errors.push(`Baris ${i + 1} (${namaKtt}): ${err.message}`);
      }
    }

    if (insertedCount > 0) {
      await logActivity({
        module: 'bitpro',
        submenu: 'monev-ktt',
        tableName: 'monev_lapangan',
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
      message: `Berhasil mengimpor ${insertedCount} dari ${rows.length} data monitoring & evaluasi KTT.`,
      insertedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error POST /api/monev-ktt/import:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses impor file Excel.' },
      { status: 500 }
    );
  }
}
