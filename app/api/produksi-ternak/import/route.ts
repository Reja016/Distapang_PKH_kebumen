import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';

async function ensureTable(tableName: string) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      kategori VARCHAR(50) NOT NULL,
      jenis VARCHAR(100) NOT NULL,
      jan DECIMAL(12,2) DEFAULT 0.00,
      feb DECIMAL(12,2) DEFAULT 0.00,
      mar DECIMAL(12,2) DEFAULT 0.00,
      apr DECIMAL(12,2) DEFAULT 0.00,
      mei DECIMAL(12,2) DEFAULT 0.00,
      jun DECIMAL(12,2) DEFAULT 0.00,
      jul DECIMAL(12,2) DEFAULT 0.00,
      agt DECIMAL(12,2) DEFAULT 0.00,
      sep DECIMAL(12,2) DEFAULT 0.00,
      okt DECIMAL(12,2) DEFAULT 0.00,
      nov DECIMAL(12,2) DEFAULT 0.00,
      des DECIMAL(12,2) DEFAULT 0.00,
      total DECIMAL(12,2) DEFAULT 0.00,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req as any);
    const petugasNama = session?.nama || session?.nip_username || 'Petugas Bitpro';

    const body = await req.json();
    const rows = Array.isArray(body) ? body : body.rows || body.items || [];
    const targetYear = String(body.year || '2026').trim();
    const tableName = `produksi_${targetYear}`;

    await ensureTable(tableName);

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
        return '';
      };

      let kategori = String(getVal(['kategori', 'kat']) || 'Daging').trim();
      if (!kategori) kategori = 'Daging';
      // Normalize kategori: capitalize first letter
      kategori = kategori.charAt(0).toUpperCase() + kategori.slice(1).toLowerCase();

      const jenis = String(
        getVal(['jeniskomoditasternak', 'jenis', 'komoditas', 'jenishewan', 'hewan']) || ''
      ).trim();

      if (!jenis) {
        errors.push(`Baris ${i + 1}: Jenis komoditas / ternak wajib diisi.`);
        continue;
      }

      const parseNum = (aliases: string[]): number => {
        const val = getVal(aliases);
        if (typeof val === 'number') return isNaN(val) ? 0 : val;
        const str = String(val).replace(/,/g, '.').replace(/[^0-9.-]/g, '');
        const n = parseFloat(str);
        return isNaN(n) ? 0 : n;
      };

      const jan = parseNum(['januari', 'jan', 'bln1']);
      const feb = parseNum(['februari', 'feb', 'bln2']);
      const mar = parseNum(['maret', 'mar', 'bln3']);
      const apr = parseNum(['april', 'apr', 'bln4']);
      const mei = parseNum(['mei', 'may', 'bln5']);
      const jun = parseNum(['juni', 'jun', 'bln6']);
      const jul = parseNum(['juli', 'jul', 'bln7']);
      const agt = parseNum(['agustus', 'agt', 'aug', 'bln8']);
      const sep = parseNum(['september', 'sep', 'sept', 'bln9']);
      const okt = parseNum(['oktober', 'okt', 'oct', 'bln10']);
      const nov = parseNum(['november', 'nov', 'bln11']);
      const des = parseNum(['desember', 'des', 'dec', 'bln12']);

      const total = jan + feb + mar + apr + mei + jun + jul + agt + sep + okt + nov + des;

      try {
        // Cek apakah komoditas & kategori ini sudah ada di tabel
        const [existing]: any = await pool.query(
          `SELECT id FROM ${tableName} WHERE LOWER(kategori) = LOWER(?) AND LOWER(jenis) = LOWER(?) LIMIT 1`,
          [kategori, jenis]
        );

        if (existing && existing.length > 0) {
          await pool.query(
            `UPDATE ${tableName} 
             SET jan=?, feb=?, mar=?, apr=?, mei=?, jun=?, jul=?, agt=?, sep=?, okt=?, nov=?, des=?, total=? 
             WHERE id=?`,
            [jan, feb, mar, apr, mei, jun, jul, agt, sep, okt, nov, des, total, existing[0].id]
          );
        } else {
          await pool.query(
            `INSERT INTO ${tableName} 
             (kategori, jenis, jan, feb, mar, apr, mei, jun, jul, agt, sep, okt, nov, des, total)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [kategori, jenis, jan, feb, mar, apr, mei, jun, jul, agt, sep, okt, nov, des, total]
          );
        }
        insertedCount++;
      } catch (err: any) {
        console.error(`Error saving produksi row ${i + 1}:`, err);
        errors.push(`Baris ${i + 1} (${jenis}): ${err.message}`);
      }
    }

    if (insertedCount > 0) {
      await logActivity({
        module: 'bitpro',
        submenu: 'populasi-dan-produksi',
        tableName,
        recordId: 'BULK_IMPORT',
        action: 'IMPORT',
        userName: petugasNama,
        details: {
          year: targetYear,
          insertedCount,
          totalRows: rows.length,
          errorsCount: errors.length,
        },
      });
    }

    return NextResponse.json({
      success: insertedCount > 0,
      message: `Berhasil mengimpor ${insertedCount} dari ${rows.length} data produksi ternak tahun ${targetYear}.`,
      insertedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Error POST /api/produksi-ternak/import:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses impor file Excel.' },
      { status: 500 }
    );
  }
}
