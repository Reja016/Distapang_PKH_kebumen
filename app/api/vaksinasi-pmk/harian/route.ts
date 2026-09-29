import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

const BULAN_NAMES = [
  '',
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const BULAN_TO_NUM: Record<string, string> = {
  januari: '01',
  februari: '02',
  maret: '03',
  april: '04',
  mei: '05',
  juni: '06',
  juli: '07',
  agustus: '08',
  september: '09',
  oktober: '10',
  november: '11',
  desember: '12',
};

// GET → ambil data harian dari tabel `vaksinasi`, difilter tahun & bulan
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bulan = searchParams.get('bulan');
    const tahun = searchParams.get('tahun') || '2026';

    let query = 'SELECT id_vaksinasi, puskeswan, tanggal, bulan, tahun, jumlah FROM vaksinasi WHERE tahun = ?';
    const params: any[] = [String(tahun)];

    if (bulan) {
      const monthNum = parseInt(bulan, 10);
      const monthName = BULAN_NAMES[monthNum] || bulan;
      query += ' AND (LOWER(bulan) = LOWER(?) OR bulan = ?)';
      params.push(monthName, String(monthNum));
    }
    query += ' ORDER BY puskeswan ASC, id_vaksinasi ASC';

    const [rows]: any = await pool.query(query, params);

    const formattedData = (rows || []).map((r: any) => {
      let dateStr = '';
      const rawTgl = String(r.tanggal || '').trim();

      if (rawTgl.includes('-')) {
        dateStr = rawTgl.slice(0, 10);
      } else {
        const blnKey = (r.bulan || '').toLowerCase().trim();
        const mm = BULAN_TO_NUM[blnKey] || (bulan ? String(bulan).padStart(2, '0') : '01');
        const dd = rawTgl.padStart(2, '0');
        const yy = r.tahun || tahun;
        dateStr = `${yy}-${mm}-${dd}`;
      }

      const puskClean = (r.puskeswan || '')
        .toUpperCase()
        .replace(/^PUSKESWAN\s+/i, '')
        .trim();

      return {
        id: r.id_vaksinasi,
        puskeswan: puskClean,
        tanggal: dateStr,
        jumlah: Number(r.jumlah) || 0,
      };
    });

    return NextResponse.json({ success: true, data: formattedData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST → tambah/update input harian langsung ke tabel `vaksinasi`
export async function POST(request: Request) {
  try {
    const { puskeswan, tanggal, jumlah } = await request.json();

    if (!puskeswan || !tanggal) {
      return NextResponse.json({ success: false, error: 'Puskeswan dan tanggal wajib diisi.' }, { status: 400 });
    }

    // Validasi Pembatasan Wilayah Kerja Petugas & Batas Waktu 3 Hari (Grace Period)
    const { validateAreaAccess } = await import('@/lib/areaRestriction');
    const areaCheck = await validateAreaAccess(request, null, puskeswan, { tanggal });
    if (!areaCheck.allowed && areaCheck.errorResponse) {
      return areaCheck.errorResponse;
    }

    const jumlahVal = Number(jumlah) || 0;
    const parts = tanggal.slice(0, 10).split('-');
    const tahunStr = parts[0];
    const bulanIndex = parseInt(parts[1], 10);
    const bulanName = BULAN_NAMES[bulanIndex] || '';
    const dayStr = parseInt(parts[2], 10).toString();
    const cleanPusk = puskeswan.toUpperCase().replace(/^PUSKESWAN\s+/i, '').trim();
    const standardPuskName = `Puskeswan ${cleanPusk.charAt(0).toUpperCase() + cleanPusk.slice(1).toLowerCase()}`;

    // Cek record eksis di tabel vaksinasi
    const [existingRows]: any = await pool.query(
      `SELECT id_vaksinasi, jumlah FROM vaksinasi 
       WHERE (puskeswan = ? OR puskeswan = ? OR UPPER(TRIM(REPLACE(puskeswan, 'Puskeswan ', ''))) = ?)
         AND tahun = ? 
         AND (LOWER(bulan) = LOWER(?) OR bulan = ?)
         AND (tanggal = ? OR tanggal = ?)
       LIMIT 1`,
      [standardPuskName, puskeswan, cleanPusk, tahunStr, bulanName, String(bulanIndex), dayStr, tanggal]
    );

    const session = await getSessionFromRequest(request as any);
    const userName = session?.nama || session?.nip_username || 'System';

    if (jumlahVal <= 0) {
      if (existingRows && existingRows.length > 0) {
        const recordId = existingRows[0].id_vaksinasi;
        await pool.execute('DELETE FROM vaksinasi WHERE id_vaksinasi = ?', [recordId]);

        await logActivity({
          module: 'keswan',
          submenu: 'data-vaksinasi',
          tableName: 'vaksinasi',
          recordId,
          action: 'DELETE',
          userName,
          details: existingRows[0],
        });
      }
      return NextResponse.json({ success: true, message: 'Data tanggal tersebut dikosongkan.' });
    }

    let recordId: number;
    let action = 'CREATE';

    if (existingRows && existingRows.length > 0) {
      recordId = existingRows[0].id_vaksinasi;
      action = 'UPDATE';
      await pool.execute(
        `UPDATE vaksinasi SET jumlah = ?, updated_at = NOW() WHERE id_vaksinasi = ?`,
        [jumlahVal, recordId]
      );
    } else {
      const [puskWb]: any = await pool.query(
        `SELECT DISTINCT id_puskeswan FROM wilayah_binaan WHERE LOWER(nama_puskeswan) LIKE LOWER(?) LIMIT 1`,
        [`%${cleanPusk}%`]
      );
      const idPuskeswan = puskWb && puskWb.length > 0 ? puskWb[0].id_puskeswan : null;

      const [resInsert]: any = await pool.execute(
        `INSERT INTO vaksinasi (id_puskeswan, puskeswan, tanggal, bulan, tahun, id_vaksin, jumlah)
         VALUES (?, ?, ?, ?, ?, 1, ?)`,
        [idPuskeswan, standardPuskName, dayStr, bulanName, tahunStr, jumlahVal]
      );
      recordId = resInsert.insertId;
    }

    await logActivity({
      module: 'keswan',
      submenu: 'data-vaksinasi',
      tableName: 'vaksinasi',
      recordId,
      action,
      userName,
      details: { puskeswan: standardPuskName, tanggal: dayStr, bulan: bulanName, tahun: tahunStr, jumlah: jumlahVal },
    });

    return NextResponse.json({ success: true, message: 'Data harian berhasil disimpan.', id: recordId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}