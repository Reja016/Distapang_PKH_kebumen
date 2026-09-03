import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

const DEFAULT_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

async function ensureTableAndColumns() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pemotongan_rumpun_bulanan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tahun INT DEFAULT 2025,
        lokasi_kategori VARCHAR(50),
        bulan INT,
        po_jantan INT DEFAULT 0,
        po_betina_prod INT DEFAULT 0,
        po_betina_non_prod INT DEFAULT 0,
        so_jantan INT DEFAULT 0,
        so_betina_prod INT DEFAULT 0,
        so_betina_non_prod INT DEFAULT 0,
        simmental_jantan INT DEFAULT 0,
        simmental_betina_prod INT DEFAULT 0,
        simmental_betina_non_prod INT DEFAULT 0,
        limousine_jantan INT DEFAULT 0,
        limousine_betina_prod INT DEFAULT 0,
        limousine_betina_non_prod INT DEFAULT 0,
        babi_jantan INT DEFAULT 0,
        babi_betina_prod INT DEFAULT 0,
        babi_betina_non_prod INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_lokasi_thn_bln (tahun, lokasi_kategori, bulan)
      ) ENGINE=InnoDB;
    `);

    try { await pool.query(`ALTER TABLE pemotongan_rumpun_bulanan ADD COLUMN babi_jantan INT DEFAULT 0`); } catch {}
    try { await pool.query(`ALTER TABLE pemotongan_rumpun_bulanan ADD COLUMN babi_betina_prod INT DEFAULT 0`); } catch {}
    try { await pool.query(`ALTER TABLE pemotongan_rumpun_bulanan ADD COLUMN babi_betina_non_prod INT DEFAULT 0`); } catch {}
  } catch (e) {
    console.warn('ensureTableAndColumns warning:', e);
  }
}

export async function GET(req: Request) {
  try {
    await ensureTableAndColumns();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'years') {
      const [yearRows]: any = await pool.query(
        `SELECT DISTINCT tahun FROM pemotongan_rumpun_bulanan ORDER BY tahun ASC`
      );
      let years: number[] = yearRows ? yearRows.map((r: any) => Number(r.tahun)).filter(Boolean) : [];
      if (!years.includes(2025)) years.push(2025);
      if (!years.includes(2026)) years.push(2026);
      years = Array.from(new Set<number>(years)).sort((a, b) => a - b);
      return NextResponse.json({ success: true, years });
    }

    const tahun = Number(searchParams.get('tahun')) || 2025;

    const [rows]: any = await pool.query(
      `SELECT * FROM pemotongan_rumpun_bulanan WHERE tahun = ? ORDER BY lokasi_kategori, bulan ASC`,
      [tahun]
    );

    const categories = ['rph_kebumen', 'luar_rph_kebumen', 'rph_gombong', 'luar_rph_gombong'];
    const result: Record<string, any[]> = {};

    categories.forEach((cat) => {
      const catRows = rows ? rows.filter((r: any) => r.lokasi_kategori === cat) : [];
      result[cat] = Array.from({ length: 12 }, (_, idx) => {
        const monthNum = idx + 1;
        const found = catRows.find((r: any) => Number(r.bulan) === monthNum);
        return {
          bulan_idx: monthNum,
          bulan: DEFAULT_MONTHS[idx],
          po_jantan: found ? Number(found.po_jantan) : 0,
          po_betina_prod: found ? Number(found.po_betina_prod) : 0,
          po_betina_non_prod: found ? Number(found.po_betina_non_prod) : 0,
          so_jantan: found ? Number(found.so_jantan) : 0,
          so_betina_prod: found ? Number(found.so_betina_prod) : 0,
          so_betina_non_prod: found ? Number(found.so_betina_non_prod) : 0,
          simmental_jantan: found ? Number(found.simmental_jantan) : 0,
          simmental_betina_prod: found ? Number(found.simmental_betina_prod) : 0,
          simmental_betina_non_prod: found ? Number(found.simmental_betina_non_prod) : 0,
          limousine_jantan: found ? Number(found.limousine_jantan) : 0,
          limousine_betina_prod: found ? Number(found.limousine_betina_prod) : 0,
          limousine_betina_non_prod: found ? Number(found.limousine_betina_non_prod) : 0,
          babi_jantan: found ? Number(found.babi_jantan) : 0,
          babi_betina_prod: found ? Number(found.babi_betina_prod) : 0,
          babi_betina_non_prod: found ? Number(found.babi_betina_non_prod) : 0,
        };
      });
    });

    return NextResponse.json({ success: true, tahun, data: result });
  } catch (error: any) {
    console.error('Error GET pemotongan-rumpun:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureTableAndColumns();
    const body = await req.json();
    const { action, tahun, data } = body;

    // Tambah tahun baru
    if (action === 'add_year') {
      const newYear = Number(tahun);
      if (!newYear || newYear < 2000) {
        return NextResponse.json({ success: false, error: 'Tahun tidak valid' }, { status: 400 });
      }

      const categories = ['rph_kebumen', 'luar_rph_kebumen', 'rph_gombong', 'luar_rph_gombong'];
      for (const cat of categories) {
        for (let m = 1; m <= 12; m++) {
          await pool.query(
            `INSERT INTO pemotongan_rumpun_bulanan (tahun, lokasi_kategori, bulan)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE tahun=VALUES(tahun)`,
            [newYear, cat, m]
          );
        }
      }
      return NextResponse.json({ success: true, message: `Tahun ${newYear} berhasil ditambahkan!` });
    }

    if (!tahun || !data) {
      return NextResponse.json({ success: false, error: 'Tahun dan data wajib diisi' }, { status: 400 });
    }

    for (const [kategori, months] of Object.entries(data as Record<string, any[]>)) {
      for (const m of months) {
        await pool.query(
          `INSERT INTO pemotongan_rumpun_bulanan (
            tahun, lokasi_kategori, bulan,
            po_jantan, po_betina_prod, po_betina_non_prod,
            so_jantan, so_betina_prod, so_betina_non_prod,
            simmental_jantan, simmental_betina_prod, simmental_betina_non_prod,
            limousine_jantan, limousine_betina_prod, limousine_betina_non_prod,
            babi_jantan, babi_betina_prod, babi_betina_non_prod
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            po_jantan = VALUES(po_jantan),
            po_betina_prod = VALUES(po_betina_prod),
            po_betina_non_prod = VALUES(po_betina_non_prod),
            so_jantan = VALUES(so_jantan),
            so_betina_prod = VALUES(so_betina_prod),
            so_betina_non_prod = VALUES(so_betina_non_prod),
            simmental_jantan = VALUES(simmental_jantan),
            simmental_betina_prod = VALUES(simmental_betina_prod),
            simmental_betina_non_prod = VALUES(simmental_betina_non_prod),
            limousine_jantan = VALUES(limousine_jantan),
            limousine_betina_prod = VALUES(limousine_betina_prod),
            limousine_betina_non_prod = VALUES(limousine_betina_non_prod),
            babi_jantan = VALUES(babi_jantan),
            babi_betina_prod = VALUES(babi_betina_prod),
            babi_betina_non_prod = VALUES(babi_betina_non_prod)`,
          [
            tahun,
            kategori,
            m.bulan_idx,
            Number(m.po_jantan) || 0,
            Number(m.po_betina_prod) || 0,
            Number(m.po_betina_non_prod) || 0,
            Number(m.so_jantan) || 0,
            Number(m.so_betina_prod) || 0,
            Number(m.so_betina_non_prod) || 0,
            Number(m.simmental_jantan) || 0,
            Number(m.simmental_betina_prod) || 0,
            Number(m.simmental_betina_non_prod) || 0,
            Number(m.limousine_jantan) || 0,
            Number(m.limousine_betina_prod) || 0,
            Number(m.limousine_betina_non_prod) || 0,
            Number(m.babi_jantan) || 0,
            Number(m.babi_betina_prod) || 0,
            Number(m.babi_betina_non_prod) || 0,
          ]
        );
      }
    }

    return NextResponse.json({ success: true, message: 'Data pemotongan rumpun berhasil disimpan' });
  } catch (error: any) {
    console.error('Error POST pemotongan-rumpun:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
