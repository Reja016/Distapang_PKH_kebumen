import pool from '@/lib/db';

/**
 * Memastikan tabel `petugas_ib` memiliki struktur kolom lengkap (id_user, wilayah_puskeswan, dll)
 * dan 8 akun Puskeswan terhubung secara otomatis ke wilayah binaan induknya.
 */
export async function ensurePetugasIbTable(): Promise<void> {
  try {
    // 1. Pastikan tabel petugas_ib ada
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS petugas_ib (
        id_kompetensi INT AUTO_INCREMENT PRIMARY KEY,
        id_user INT,
        no_urut INT DEFAULT 1,
        nama_petugas VARCHAR(150),
        kompetensi VARCHAR(100) DEFAULT 'IB',
        wilayah_puskeswan VARCHAR(100),
        id_wilayah_binaan INT,
        wilayah_kerja_tambahan TEXT,
        wt1 INT,
        wt2 INT,
        wt3 INT,
        wt4 INT,
        wt5 INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // 2. Migrasi dinamis kolom petugas_ib jika tabel sudah ada dari skema lama
    try {
      const [cols]: any = await pool.query(`SHOW COLUMNS FROM petugas_ib`);
      const colNames = (cols || []).map((c: any) => c.Field.toLowerCase());

      if (!colNames.includes('id_user')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN id_user INT DEFAULT NULL`);
      }
      if (!colNames.includes('wilayah_puskeswan')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN wilayah_puskeswan VARCHAR(100) DEFAULT NULL`);
      } else {
        try {
          await pool.query(`ALTER TABLE petugas_ib MODIFY COLUMN wilayah_puskeswan VARCHAR(100) NULL DEFAULT NULL`);
        } catch {}
      }
      if (!colNames.includes('wilayah_kerja_tambahan')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN wilayah_kerja_tambahan VARCHAR(150) DEFAULT NULL`);
      }
      if (!colNames.includes('wt1')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN wt1 INT DEFAULT NULL`);
      }
      if (!colNames.includes('wt2')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN wt2 INT DEFAULT NULL`);
      }
      if (!colNames.includes('wt3')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN wt3 INT DEFAULT NULL`);
      }
      if (!colNames.includes('wt4')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN wt4 INT DEFAULT NULL`);
      }
      if (!colNames.includes('wt5')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN wt5 INT DEFAULT NULL`);
      }
      if (!colNames.includes('kompetensi')) {
        await pool.query(`ALTER TABLE petugas_ib ADD COLUMN kompetensi VARCHAR(100) DEFAULT 'IB'`);
      }
    } catch (colErr: any) {
      console.warn('[petugas_ib Dynamic Migration]:', colErr.message);
    }

    // 3. Sinkronisasi otomatis 8 akun Puskeswan ke wilayahnya di petugas_ib
    try {
      const PUSKESWAN_SEEDS = [
        { name: 'Puskeswan Mirit', pusk: 'Puskeswan Mirit', defaultWbId: 1 },
        { name: 'Puskeswan Klirong', pusk: 'Puskeswan Klirong', defaultWbId: 4 },
        { name: 'Puskeswan Gombong', pusk: 'Puskeswan Gombong', defaultWbId: 7 },
        { name: 'Puskeswan Buayan', pusk: 'Puskeswan Buayan', defaultWbId: 11 },
        { name: 'Puskeswan Alian', pusk: 'Puskeswan Alian', defaultWbId: 14 },
        { name: 'Puskeswan Prembun', pusk: 'Puskeswan Prembun', defaultWbId: 17 },
        { name: 'Puskeswan Kebumen', pusk: 'Puskeswan Kebumen', defaultWbId: 20 },
        { name: 'Puskeswan Karanganyar', pusk: 'Puskeswan Karanganyar', defaultWbId: 23 },
      ];

      for (const ps of PUSKESWAN_SEEDS) {
        const [uRows]: any = await pool.query(
          `SELECT id FROM anggota_users WHERE LOWER(nama) = LOWER(?) LIMIT 1`,
          [ps.name]
        );
        if (uRows && uRows.length > 0) {
          const uId = uRows[0].id;
          const [pRows]: any = await pool.query(
            `SELECT id_kompetensi, id_user, wilayah_puskeswan FROM petugas_ib 
             WHERE id_user = ? OR LOWER(nama_petugas) = LOWER(?) LIMIT 1`,
            [uId, ps.name]
          );

          if (pRows && pRows.length > 0) {
            if (!pRows[0].id_user || !pRows[0].wilayah_puskeswan) {
              await pool.query(
                `UPDATE petugas_ib SET id_user = ?, wilayah_puskeswan = ?, id_wilayah_binaan = COALESCE(id_wilayah_binaan, ?) WHERE id_kompetensi = ?`,
                [uId, ps.pusk, ps.defaultWbId, pRows[0].id_kompetensi]
              );
            }
          } else {
            const [maxRows]: any = await pool.query(`SELECT COALESCE(MAX(no_urut), 0) + 1 AS next_no FROM petugas_ib`);
            const nextNo = maxRows?.[0]?.next_no || 1;
            await pool.query(
              `INSERT INTO petugas_ib (id_user, no_urut, nama_petugas, kompetensi, wilayah_puskeswan, id_wilayah_binaan)
               VALUES (?, ?, ?, 'Keswan', ?, ?)`,
              [uId, nextNo, ps.name, ps.pusk, ps.defaultWbId]
            );
          }
        }
      }
    } catch (seedErr: any) {
      console.warn('[Puskeswan Seed Warning]:', seedErr.message);
    }
  } catch (err: any) {
    console.warn('[ensurePetugasIbTable Error]:', err.message);
  }
}

/**
 * Sinkronisasi wilayah kerja petugas ke tabel `petugas_ib`
 */
export async function syncPetugasIbRecord(
  userId: number,
  nama: string,
  role: string,
  isRestricted: boolean,
  puskeswanUtama?: string | null,
  wt1?: number | string | null,
  wt2?: number | string | null,
  wt3?: number | string | null,
  wt4?: number | string | null,
  wt5?: number | string | null,
  kompetensi?: string
): Promise<void> {
  await ensurePetugasIbTable();

  // Cek apakah data di petugas_ib sudah ada
  const [existing]: any = await pool.query(
    `SELECT id_kompetensi FROM petugas_ib WHERE id_user = ? OR LOWER(nama_petugas) = LOWER(?) LIMIT 1`,
    [userId, nama]
  );

  const komp = kompetensi || (role.toLowerCase() === 'puskeswan' ? 'Keswan' : 'IB');

  // Jika admin memilih TIDAK dibatasi wilayahnya
  if (!isRestricted || !puskeswanUtama) {
    if (existing && existing.length > 0) {
      await pool.query(
        `UPDATE petugas_ib SET 
          id_user = ?,
          nama_petugas = ?,
          wilayah_puskeswan = NULL,
          id_wilayah_binaan = NULL,
          wilayah_kerja_tambahan = NULL,
          wt1 = NULL, wt2 = NULL, wt3 = NULL, wt4 = NULL, wt5 = NULL,
          kompetensi = COALESCE(?, kompetensi)
        WHERE id_kompetensi = ?`,
        [userId, nama, komp, existing[0].id_kompetensi]
      );
    }
    return;
  }

  // Jika DIBATASI wilayahnya:
  const pUtama = puskeswanUtama.trim();

  // Cari default id_wilayah_binaan untuk puskeswanUtama
  let defaultWbId: number | null = null;
  const [wbRows]: any = await pool.query(
    `SELECT id_wilayah_binaan FROM wilayah_binaan WHERE LOWER(nama_puskeswan) = LOWER(?) LIMIT 1`,
    [pUtama]
  );
  if (wbRows && wbRows.length > 0) {
    defaultWbId = wbRows[0].id_wilayah_binaan;
  }

  // Parse wt1 s/d wt5 sebagai id_kecamatan
  const parseWt = (val: any): number | null => {
    if (val === null || val === undefined || val === '' || val === 0 || val === '0') return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  const finalWt1 = parseWt(wt1);
  const finalWt2 = parseWt(wt2);
  const finalWt3 = parseWt(wt3);
  const finalWt4 = parseWt(wt4);
  const finalWt5 = parseWt(wt5);

  const activeKecIds = [finalWt1, finalWt2, finalWt3, finalWt4, finalWt5].filter((id): id is number => id !== null);

  let wtStr = '';
  if (activeKecIds.length > 0) {
    const [kecRows]: any = await pool.query(
      `SELECT DISTINCT id_kecamatan, binaan FROM wilayah_binaan WHERE id_kecamatan IN (?)`,
      [activeKecIds]
    );
    const kecMap = new Map<number, string>();
    if (Array.isArray(kecRows)) {
      kecRows.forEach((r: any) => {
        const titleCase = r.binaan.charAt(0).toUpperCase() + r.binaan.slice(1).toLowerCase();
        kecMap.set(Number(r.id_kecamatan), titleCase);
      });
    }
    const kecNames = activeKecIds
      .map((id) => kecMap.get(id))
      .filter(Boolean)
      .map((k) => `Kec. ${k}`);
    wtStr = Array.from(new Set(kecNames)).join(', ');
  }

  if (existing && existing.length > 0) {
    await pool.query(
      `UPDATE petugas_ib SET 
        id_user = ?,
        nama_petugas = ?,
        wilayah_puskeswan = ?,
        id_wilayah_binaan = COALESCE(?, id_wilayah_binaan),
        wilayah_kerja_tambahan = ?,
        wt1 = ?, wt2 = ?, wt3 = ?, wt4 = ?, wt5 = ?,
        kompetensi = COALESCE(?, kompetensi)
      WHERE id_kompetensi = ?`,
      [
        userId,
        nama,
        pUtama,
        defaultWbId,
        wtStr || null,
        finalWt1, finalWt2, finalWt3, finalWt4, finalWt5,
        komp,
        existing[0].id_kompetensi,
      ]
    );
  } else {
    const [maxRows]: any = await pool.query(`SELECT COALESCE(MAX(no_urut), 0) + 1 AS next_no FROM petugas_ib`);
    const nextNo = maxRows?.[0]?.next_no || 1;

    await pool.query(
      `INSERT INTO petugas_ib 
        (id_user, no_urut, nama_petugas, kompetensi, wilayah_puskeswan, id_wilayah_binaan, wilayah_kerja_tambahan, wt1, wt2, wt3, wt4, wt5)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        nextNo,
        nama,
        komp,
        pUtama,
        defaultWbId,
        wtStr || null,
        finalWt1, finalWt2, finalWt3, finalWt4, finalWt5,
      ]
    );
  }
}
