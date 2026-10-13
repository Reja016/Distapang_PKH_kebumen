import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';

async function ensureSettingTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bitpro_sklb_setting_tahun (
        tahun INT PRIMARY KEY,
        total_populasi INT NULL,
        triwulan VARCHAR(50) DEFAULT 'Triwulan 2',
        is_manual_total TINYINT(1) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err: any) {
    console.warn('ensureSettingTable warning:', err.message);
  }
}

export async function GET(req: Request) {
  try {
    await ensureSettingTable();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // 1. Ambil daftar tahun unik
    if (action === 'years') {
      const [yearRows]: any = await pool.query(
        `SELECT DISTINCT tahun FROM bitpro_sklb_populasi_sapi_po ORDER BY tahun ASC`
      );
      let years: number[] = yearRows ? yearRows.map((r: any) => Number(r.tahun)).filter(Boolean) : [];
      if (!years.includes(2025)) years.push(2025);
      if (!years.includes(2026)) years.push(2026);
      years = Array.from(new Set<number>(years)).sort((a, b) => a - b);
      return NextResponse.json({ success: true, years });
    }

    const tahun = Number(searchParams.get('tahun')) || 2026;

    // 2. Ambil setting tahun (jika ada)
    const [settingRows]: any = await pool.query(
      `SELECT * FROM bitpro_sklb_setting_tahun WHERE tahun = ? LIMIT 1`,
      [tahun]
    );
    const setting = settingRows && settingRows.length > 0 ? settingRows[0] : null;

    // 3. Ambil data populasi Sapi PO pada tahun tersebut
    const [rows]: any = await pool.query(
      `SELECT * FROM bitpro_sklb_populasi_sapi_po WHERE tahun = ? ORDER BY populasi DESC, kecamatan_nama ASC`,
      [tahun]
    );

    const kecMap: Record<string, number> = {};
    let calculatedSum = 0;
    let triwulan = setting?.triwulan || 'Triwulan 2';

    (rows || []).forEach((r: any) => {
      const cleanId = (r.kecamatan_id || '').toLowerCase().replace('k_', '');
      const pop = Number(r.populasi) || 0;
      kecMap[cleanId] = pop;
      kecMap[`k_${cleanId}`] = pop;
      calculatedSum += pop;
      if (!setting?.triwulan && r.triwulan) {
        triwulan = r.triwulan;
      }
    });

    const isManualTotal = setting ? Number(setting.is_manual_total) === 1 : false;
    const totalPopulasi = (isManualTotal && setting.total_populasi !== null)
      ? Number(setting.total_populasi)
      : calculatedSum;

    return NextResponse.json({
      success: true,
      tahun,
      triwulan,
      totalPopulasi,
      calculatedSum,
      isManualTotal,
      kecMap,
      data: rows || [],
    });
  } catch (error: any) {
    console.error('Error GET sklb-sapi-po:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureSettingTable();
    const body = await req.json();

    // Aksi Tambah Tahun Baru
    if (body.action === 'add_year') {
      const newYear = Number(body.tahun);
      if (!newYear || newYear < 2000) {
        return NextResponse.json({ success: false, error: 'Tahun tidak valid' }, { status: 400 });
      }

      // Ambil template dari tahun terdekat (misal 2026 atau data terbaru)
      const [templateRows]: any = await pool.query(
        `SELECT kecamatan_id, kecamatan_nama, populasi, triwulan FROM bitpro_sklb_populasi_sapi_po WHERE tahun = 2026`
      );

      if (templateRows && templateRows.length > 0) {
        for (const row of templateRows) {
          await pool.query(
            `INSERT INTO bitpro_sklb_populasi_sapi_po (tahun, kecamatan_id, kecamatan_nama, populasi, triwulan)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE populasi = VALUES(populasi)`,
            [newYear, row.kecamatan_id, row.kecamatan_nama, row.populasi, row.triwulan || 'Triwulan 2']
          );
        }
      }

      // Inisialisasi setting tahun baru jika belum ada
      await pool.query(
        `INSERT IGNORE INTO bitpro_sklb_setting_tahun (tahun, triwulan, is_manual_total) VALUES (?, 'Triwulan 2', 0)`,
        [newYear]
      );

      return NextResponse.json({ success: true, message: `Periode Tahun ${newYear} berhasil ditambahkan` });
    }

    // Aksi Update Total & Triwulan Sapi PO (per tahun)
    if (body.action === 'update_total') {
      const { tahun, triwulan, total_populasi, is_manual } = body;
      const targetTahun = Number(tahun);
      if (!targetTahun) {
        return NextResponse.json({ success: false, error: 'Tahun wajib diisi' }, { status: 400 });
      }

      const cleanTriwulan = (triwulan || 'Triwulan 2').trim();
      const cleanTotal = total_populasi !== null && total_populasi !== undefined ? Number(total_populasi) : null;
      const manualFlag = is_manual ? 1 : (cleanTotal !== null ? 1 : 0);

      await pool.query(
        `INSERT INTO bitpro_sklb_setting_tahun (tahun, total_populasi, triwulan, is_manual_total)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           total_populasi = VALUES(total_populasi), 
           triwulan = VALUES(triwulan),
           is_manual_total = VALUES(is_manual_total)`,
        [targetTahun, cleanTotal, cleanTriwulan, manualFlag]
      );

      // Sinkronkan triwulan ke seluruh data kecamatan untuk tahun tersebut
      await pool.query(
        `UPDATE bitpro_sklb_populasi_sapi_po SET triwulan = ? WHERE tahun = ?`,
        [cleanTriwulan, targetTahun]
      );

      const session = await getSessionFromRequest(req as any);
      const userName = session?.nama || session?.nip_username || 'Unknown';

      await logActivity({
        module: 'bitpro',
        submenu: 'sklb',
        tableName: 'sklb_sapi_po',
        recordId: `${targetTahun}_total`,
        action: 'UPDATE',
        userName,
        details: { tahun: targetTahun, triwulan: cleanTriwulan, total_populasi: cleanTotal, is_manual: manualFlag },
      });

      return NextResponse.json({ 
        success: true, 
        message: `Total Populasi dan ${cleanTriwulan} Tahun ${targetTahun} berhasil diperbarui` 
      });
    }

    // Aksi Tambah / Update Satuan Kasus Populasi Sapi PO
    const { tahun, kecamatan_id, kecamatan_nama, populasi, triwulan, keterangan } = body;
    if (!tahun || !kecamatan_id) {
      return NextResponse.json({ success: false, error: 'Tahun dan Kecamatan wajib diisi' }, { status: 400 });
    }

    const cleanKecId = String(kecamatan_id).toLowerCase().replace('k_', '');
    const cleanPop = Number(populasi) || 0;

    // Ambil data lama untuk hitung selisih perubahan (delta)
    const [oldRows]: any = await pool.query(
      `SELECT populasi FROM bitpro_sklb_populasi_sapi_po WHERE tahun = ? AND kecamatan_id = ? LIMIT 1`,
      [Number(tahun), cleanKecId]
    );
    const oldPop = oldRows && oldRows.length > 0 ? Number(oldRows[0].populasi) || 0 : 0;
    const delta = cleanPop - oldPop;

    const session = await getSessionFromRequest(req as any);
    const userName = session?.nama || session?.nip_username || 'Unknown';

    await pool.query(
      `INSERT INTO bitpro_sklb_populasi_sapi_po (tahun, kecamatan_id, kecamatan_nama, populasi, triwulan, keterangan)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE populasi = VALUES(populasi), kecamatan_nama = VALUES(kecamatan_nama), triwulan = VALUES(triwulan), keterangan = VALUES(keterangan)`,
      [Number(tahun), cleanKecId, kecamatan_nama || cleanKecId, cleanPop, triwulan || 'Triwulan 2', keterangan || null]
    );

    // Jika setting tahun ada dan manual, sesuaikan total_populasi dengan delta
    if (delta !== 0) {
      await pool.query(
        `UPDATE bitpro_sklb_setting_tahun 
         SET total_populasi = total_populasi + ? 
         WHERE tahun = ? AND is_manual_total = 1 AND total_populasi IS NOT NULL`,
        [delta, Number(tahun)]
      );
    }

    // Sinkronkan triwulan ke setting jika ada perubahan triwulan
    if (triwulan) {
      await pool.query(
        `INSERT INTO bitpro_sklb_setting_tahun (tahun, triwulan)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE triwulan = VALUES(triwulan)`,
        [Number(tahun), triwulan]
      );
    }

    await logActivity({
      module: 'bitpro',
      submenu: 'sklb',
      tableName: 'sklb_sapi_po',
      recordId: `${tahun}_${cleanKecId}`,
      action: 'UPDATE',
      userName,
      details: { tahun, kecamatan_id: cleanKecId, kecamatan_nama, populasi: cleanPop, triwulan, keterangan },
    });

    return NextResponse.json({ success: true, message: 'Data populasi Sapi PO berhasil disimpan' });
  } catch (error: any) {
    console.error('Error POST sklb-sapi-po:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
