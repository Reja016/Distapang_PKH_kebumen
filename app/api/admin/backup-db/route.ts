import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

function escapeSqlValue(val: any): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return val ? '1' : '0';
  if (typeof val === 'object') {
    if (val instanceof Date) {
      return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
    }
    return `'${JSON.stringify(val).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`;
  }
  const str = String(val);
  return `'${str.replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\n/g, '\\n').replace(/\r/g, '\\r')}'`;
}

// ── GET: GENERATE & DOWNLOAD SQL BACKUP DUMP ──
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode');

    // Quick stats info for modal
    if (mode === 'info') {
      const [tableRows]: any = await pool.query('SHOW TABLES');
      const tableCount = tableRows ? tableRows.length : 0;
      const [dbNameRow]: any = await pool.query('SELECT DATABASE() as db_name');
      const dbName = dbNameRow?.[0]?.db_name || 'distapang_pkh';

      return NextResponse.json({
        success: true,
        data: {
          database: dbName,
          tableCount,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // 1. Ambil seluruh nama tabel di database
    const [tableRows]: any = await pool.query('SHOW TABLES');
    if (!tableRows || tableRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Database kosong atau tabel tidak ditemukan' }, { status: 404 });
    }

    const tableNames: string[] = tableRows.map((r: any) => Object.values(r)[0] as string);
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' ');

    let sqlDump = `-- ========================================================\n`;
    sqlDump += `-- SiMantap PKH - Sistem Informasi Manajemen Peternakan Terpadu\n`;
    sqlDump += `-- Dinas Pertanian dan Pangan Kabupaten Kebumen\n`;
    sqlDump += `-- Database Backup Dump\n`;
    sqlDump += `-- Dibuat pada: ${formattedDate} WIB\n`;
    sqlDump += `-- Total Tabel: ${tableNames.length}\n`;
    sqlDump += `-- ========================================================\n\n`;
    sqlDump += `SET FOREIGN_KEY_CHECKS=0;\n`;
    sqlDump += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n`;
    sqlDump += `SET time_zone = "+07:00";\n\n`;

    for (const table of tableNames) {
      sqlDump += `-- --------------------------------------------------------\n`;
      sqlDump += `-- Struktur Tabel: \`${table}\`\n`;
      sqlDump += `-- --------------------------------------------------------\n`;
      sqlDump += `DROP TABLE IF EXISTS \`${table}\`;\n`;

      const [createRows]: any = await pool.query(`SHOW CREATE TABLE \`${table}\``);
      if (createRows && createRows.length > 0) {
        const createTableSql = createRows[0]['Create Table'] || createRows[0]['Create View'];
        if (createTableSql) {
          sqlDump += `${createTableSql};\n\n`;
        }
      }

      // Ambil seluruh data baris
      const [dataRows]: any = await pool.query(`SELECT * FROM \`${table}\``);
      if (dataRows && dataRows.length > 0) {
        sqlDump += `-- Data untuk Tabel: \`${table}\` (${dataRows.length} baris)\n`;
        const columns = Object.keys(dataRows[0]).map((col) => `\`${col}\``).join(', ');

        const chunkSize = 100;
        for (let i = 0; i < dataRows.length; i += chunkSize) {
          const chunk = dataRows.slice(i, i + chunkSize);
          const valuesSql = chunk
            .map((row: any) => `(${Object.values(row).map(escapeSqlValue).join(', ')})`)
            .join(',\n  ');

          sqlDump += `INSERT INTO \`${table}\` (${columns}) VALUES\n  ${valuesSql};\n`;
        }
        sqlDump += `\n`;
      }
    }

    sqlDump += `SET FOREIGN_KEY_CHECKS=1;\n`;
    sqlDump += `-- Selesai backup pada: ${new Date().toISOString()}\n`;

    const filename = `backup_distapang_pkh_${now.toISOString().slice(0, 10)}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}.sql`;

    return new NextResponse(sqlDump, {
      status: 200,
      headers: {
        'Content-Type': 'application/sql; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error GET backup-db:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// ── POST: RESTORE DATABASE DARI FILE .SQL ──
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'File SQL tidak ditemukan dalam request' }, { status: 400 });
    }

    const fileContent = await file.text();
    if (!fileContent || fileContent.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'File SQL kosong' }, { status: 400 });
    }

    // Split SQL by statement (semicolon at end of line or query)
    const statements = fileContent
      .split(/;\s*[\r\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

    if (statements.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada perintah SQL yang valid untuk dieksekusi' }, { status: 400 });
    }

    await pool.query('SET FOREIGN_KEY_CHECKS=0;');

    let executedCount = 0;
    for (const stmt of statements) {
      try {
        await pool.query(stmt);
        executedCount++;
      } catch (err: any) {
        console.warn('Restore SQL statement warning:', err.message, '\nQuery snippet:', stmt.slice(0, 100));
      }
    }

    await pool.query('SET FOREIGN_KEY_CHECKS=1;');

    return NextResponse.json({
      success: true,
      message: `Database berhasil dipulihkan! ${executedCount} query dieksekusi dari file ${file.name}.`,
      queriesExecuted: executedCount,
    });
  } catch (error: any) {
    console.error('Error POST restore backup-db:', error);
    try {
      await pool.query('SET FOREIGN_KEY_CHECKS=1;');
    } catch {}
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
