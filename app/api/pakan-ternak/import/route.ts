import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { INITIAL_KAPASITAS_PAKAN } from '@/lib/pakanData';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';

async function ensureTable() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS kesmavet_kapasitas_pakan (
        id VARCHAR(50) NOT NULL,
        tahun INT NOT NULL DEFAULT 2025,
        corelId VARCHAR(100) NOT NULL,
        nama VARCHAR(100) NOT NULL,
        potensi_pakan_kg DOUBLE NOT NULL DEFAULT 0,
        kapasitas_tampung_ekor DOUBLE NOT NULL DEFAULT 0,
        jumlah_ternak_st DOUBLE NOT NULL DEFAULT 0,
        potensi_penambahan_st DOUBLE NOT NULL DEFAULT 0,
        status VARCHAR(20) NOT NULL DEFAULT 'Surplus',
        centerX INT NOT NULL DEFAULT 500,
        centerY INT NOT NULL DEFAULT 500,
        tagName VARCHAR(20) NOT NULL DEFAULT 'polygon',
        points LONGTEXT,
        d LONGTEXT,
        keterangan TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id, tahun)
      ) ENGINE=InnoDB;
    `);
  } catch (e: any) {
    console.warn('Gagal memastikan tabel kesmavet_kapasitas_pakan:', e.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();

    const session = await getSessionFromRequest(req as any);
    const userName = session?.nama || session?.nip_username || 'Petugas Kesmavet';

    const body = await req.json();
    const tahun = Number(body.tahun) || new Date().getFullYear();
    const rows = Array.isArray(body) ? body : body.rows || body.items || [];

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Data impor kosong atau format salah.' },
        { status: 400 }
      );
    }

    let updatedCount = 0;
    const errors: string[] = [];

    // Helper normalisasi nama kecamatan
    const cleanKecName = (str: string) =>
      str.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/kecamatan|kec/g, '');

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

      const rawKec = String(getVal(['kecamatan', 'nama', 'wilayah', 'nama_kecamatan']) || '').trim();
      if (!rawKec) {
        errors.push(`Baris ${i + 1}: Nama kecamatan tidak boleh kosong.`);
        continue;
      }

      const matchedMaster = INITIAL_KAPASITAS_PAKAN.find(
        (m) =>
          cleanKecName(m.nama) === cleanKecName(rawKec) ||
          cleanKecName(m.corelId) === cleanKecName(rawKec) ||
          cleanKecName(m.id) === cleanKecName(rawKec)
      );

      if (!matchedMaster) {
        errors.push(`Baris ${i + 1}: Kecamatan "${rawKec}" tidak dikenali di Kabupaten Kebumen.`);
        continue;
      }

      const potPakan = parseFloat(String(getVal(['potensi_pakan_kg', 'potensi_pakan', 'potensi']) || '0').replace(',', '.')) || 0;
      const kapTampung = parseFloat(String(getVal(['kapasitas_tampung_ekor', 'kapasitas_tampung', 'kapasitas']) || '0').replace(',', '.')) || 0;
      const jmlTernak = parseFloat(String(getVal(['jumlah_ternak_st', 'jumlah_ternak', 'ternak_st', 'populasi_st']) || '0').replace(',', '.')) || 0;
      const potPenambahan = Number((kapTampung - jmlTernak).toFixed(2));
      const status = potPenambahan >= 0 ? 'Surplus' : 'Defisit';
      const keterangan = String(getVal(['keterangan', 'ket', 'catatan']) || '').trim();

      try {
        await pool.execute(
          `INSERT INTO kesmavet_kapasitas_pakan 
           (id, tahun, corelId, nama, potensi_pakan_kg, kapasitas_tampung_ekor, jumlah_ternak_st, potensi_penambahan_st, status, centerX, centerY, tagName, points, d, keterangan)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             potensi_pakan_kg=VALUES(potensi_pakan_kg),
             kapasitas_tampung_ekor=VALUES(kapasitas_tampung_ekor),
             jumlah_ternak_st=VALUES(jumlah_ternak_st),
             potensi_penambahan_st=VALUES(potensi_penambahan_st),
             status=VALUES(status),
             keterangan=VALUES(keterangan)`,
          [
            matchedMaster.id,
            tahun,
            matchedMaster.corelId,
            matchedMaster.nama,
            potPakan,
            kapTampung,
            jmlTernak,
            potPenambahan,
            status,
            matchedMaster.centerX,
            matchedMaster.centerY,
            matchedMaster.tagName,
            matchedMaster.points || '',
            matchedMaster.d || '',
            keterangan,
          ]
        );
        updatedCount++;
      } catch (err: any) {
        console.error(`Error updating kapasitas pakan for ${matchedMaster.nama}:`, err);
        errors.push(`Baris ${i + 1} (${matchedMaster.nama}): ${err.message}`);
      }
    }

    if (updatedCount > 0) {
      await logActivity({
        module: 'kesmavet',
        submenu: 'pakan-ternak',
        tableName: 'kesmavet_kapasitas_pakan',
        recordId: `${tahun}-BULK_IMPORT`,
        action: 'IMPORT',
        userName,
        details: {
          tahun,
          updatedCount,
          totalRows: rows.length,
          errorsCount: errors.length,
        },
      });
    }

    return NextResponse.json({
      success: updatedCount > 0,
      message: `Berhasil mengimpor dan memperbarui ${updatedCount} data kapasitas pakan kecamatan tahun ${tahun}.`,
      updatedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error POST /api/pakan-ternak/import:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses impor file Excel.' },
      { status: 500 }
    );
  }
}
