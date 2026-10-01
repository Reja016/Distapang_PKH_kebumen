import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/session';
import { logActivity } from '@/lib/auditLog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function ensureGudangTables() {
  // 1. Pastikan tabel master barang ada
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS barang (
        id_barang INT AUTO_INCREMENT PRIMARY KEY,
        kode_barang VARCHAR(50) NULL,
        nama_barang VARCHAR(255) NOT NULL,
        kategori VARCHAR(100) DEFAULT 'Obat',
        satuan_kemasan VARCHAR(100) DEFAULT 'Botol',
        min_stok_dinas INT DEFAULT 10,
        keterangan TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
  } catch (e: any) {
    console.warn('ensureTable barang:', e.message);
  }

  // Lengkapi kolom tabel barang jika belum ada (kompatibel skema baru & skema lama dinas)
  const alterBarangCols = [
    'ALTER TABLE barang ADD COLUMN nama_barang VARCHAR(255) NULL',
    'ALTER TABLE barang ADD COLUMN kode_barang VARCHAR(50) NULL',
    'ALTER TABLE barang ADD COLUMN kategori VARCHAR(100) DEFAULT "Obat"',
    'ALTER TABLE barang ADD COLUMN satuan_kemasan VARCHAR(100) DEFAULT "Botol"',
    'ALTER TABLE barang ADD COLUMN min_stok_dinas INT DEFAULT 10',
    'ALTER TABLE barang ADD COLUMN keterangan TEXT NULL',
    'ALTER TABLE barang MODIFY COLUMN merk VARCHAR(100) NULL',
    'ALTER TABLE barang MODIFY COLUMN jenis_barang ENUM("Vaksin","Obat","Straw","Alat") NULL DEFAULT "Obat"',
    'ALTER TABLE barang MODIFY COLUMN satuan VARCHAR(50) NULL DEFAULT "Botol"',
  ];
  for (const q of alterBarangCols) {
    try { await pool.execute(q); } catch {}
  }

  // Sinkronisasi otomatis data eksisting antara merk <-> nama_barang, jenis_barang <-> kategori, satuan <-> satuan_kemasan
  try {
    await pool.execute("UPDATE barang SET nama_barang = merk WHERE (nama_barang IS NULL OR nama_barang = '') AND merk IS NOT NULL AND merk != ''");
    await pool.execute("UPDATE barang SET merk = nama_barang WHERE (merk IS NULL OR merk = '') AND nama_barang IS NOT NULL AND nama_barang != ''");
    await pool.execute("UPDATE barang SET kategori = jenis_barang WHERE (kategori IS NULL OR kategori = '') AND jenis_barang IS NOT NULL");
    await pool.execute("UPDATE barang SET jenis_barang = kategori WHERE (jenis_barang IS NULL) AND kategori IN ('Vaksin','Obat','Straw','Alat')");
    await pool.execute("UPDATE barang SET satuan_kemasan = satuan WHERE (satuan_kemasan IS NULL OR satuan_kemasan = '') AND satuan IS NOT NULL");
    await pool.execute("UPDATE barang SET satuan = satuan_kemasan WHERE (satuan IS NULL OR satuan = '') AND satuan_kemasan IS NOT NULL");
  } catch {}

  // 2. Pastikan tabel dropping_dinas ada & memiliki kolom batch, tgl expired, sumber anggaran
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS dropping_dinas (
        id_dropping_dinas INT AUTO_INCREMENT PRIMARY KEY,
        tahun INT(4) NOT NULL,
        bulan VARCHAR(20),
        id_barang INT(11),
        nomor_batch VARCHAR(100) NULL,
        tanggal_kadaluarsa DATE NULL,
        sumber_anggaran VARCHAR(100) DEFAULT 'APBD Kabupaten',
        satuan_kemasan VARCHAR(100) DEFAULT 'Botol',
        jumlah INT(20) DEFAULT 0,
        harga_satuan INT(20) DEFAULT 0,
        harga_total INT(20) DEFAULT 0,
        yang_menerima VARCHAR(255) NULL,
        nip_penerima VARCHAR(255) NULL,
        yang_menyerahkan VARCHAR(255) NULL,
        nip_penyerah VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
  } catch (e: any) {
    console.warn('ensureTable dropping_dinas:', e.message);
  }

  const alterDroppingCols = [
    'ALTER TABLE dropping_dinas ADD COLUMN nomor_batch VARCHAR(100) NULL',
    'ALTER TABLE dropping_dinas ADD COLUMN tanggal_kadaluarsa DATE NULL',
    'ALTER TABLE dropping_dinas ADD COLUMN sumber_anggaran VARCHAR(100) DEFAULT "APBD Kabupaten"',
    'ALTER TABLE dropping_dinas ADD COLUMN satuan_kemasan VARCHAR(100) DEFAULT "Botol"',
    'ALTER TABLE dropping_dinas ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  ];
  for (const q of alterDroppingCols) {
    try { await pool.execute(q); } catch {}
  }

  // 3. Pastikan tabel distribusi_obat (Berita Acara & Alokasi ke 8 Puskeswan)
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS distribusi_obat (
        id_distribusi INT AUTO_INCREMENT PRIMARY KEY,
        nomor_ba VARCHAR(100) NOT NULL,
        tanggal_ba DATE NOT NULL,
        jenis_distribusi ENUM('DROPING_TERENCANA', 'AMPRAHAN_INSIDENTAL') DEFAULT 'DROPING_TERENCANA',
        is_darurat TINYINT(1) DEFAULT 0,
        alasan_darurat TEXT NULL,
        id_puskeswan INT NOT NULL,
        nama_puskeswan VARCHAR(100) NOT NULL,
        id_barang INT NOT NULL,
        nama_barang VARCHAR(255) NOT NULL,
        nomor_batch VARCHAR(100) NULL,
        tanggal_kadaluarsa DATE NULL,
        sumber_anggaran VARCHAR(100) DEFAULT 'APBD Kabupaten',
        tahun_anggaran VARCHAR(10) DEFAULT '2026',
        satuan_kemasan VARCHAR(100) DEFAULT 'Botol',
        jumlah INT NOT NULL DEFAULT 1,
        yang_menyerahkan VARCHAR(255) NULL,
        nip_penyerah VARCHAR(255) NULL,
        yang_menerima VARCHAR(255) NULL,
        nip_penerima VARCHAR(255) NULL,
        status_terima ENUM('PENDING', 'DITERIMA') DEFAULT 'DITERIMA',
        file_bukti_ba LONGTEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
  } catch (e: any) {
    console.warn('ensureTable distribusi_obat:', e.message);
  }

  // 4. Pastikan tabel stok_puskeswan (Boleh habis sampai 0)
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS stok_puskeswan (
        id_stok_puskeswan INT AUTO_INCREMENT PRIMARY KEY,
        id_puskeswan INT NOT NULL,
        nama_puskeswan VARCHAR(100) NOT NULL,
        id_barang INT NOT NULL,
        nama_barang VARCHAR(255) NOT NULL,
        nomor_batch VARCHAR(100) NOT NULL,
        tanggal_kadaluarsa DATE NULL,
        sumber_anggaran VARCHAR(100) DEFAULT 'APBD Kabupaten',
        tahun_anggaran VARCHAR(10) DEFAULT '2026',
        satuan_kemasan VARCHAR(100) DEFAULT 'Botol',
        stok_masuk INT DEFAULT 0,
        stok_keluar INT DEFAULT 0,
        sisa_stok INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_pusk_batch (id_puskeswan, id_barang, nomor_batch)
      ) ENGINE=InnoDB;
    `);
  } catch (e: any) {
    console.warn('ensureTable stok_puskeswan:', e.message);
  }

  // 5. Pastikan tabel penggunaan_obat_puskeswan (Sistem Apotek / Pengurangan Real-time)
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS penggunaan_obat_puskeswan (
        id_penggunaan INT AUTO_INCREMENT PRIMARY KEY,
        tanggal DATE NOT NULL,
        id_puskeswan INT NOT NULL,
        nama_puskeswan VARCHAR(100) NOT NULL,
        id_barang INT NOT NULL,
        nama_produk VARCHAR(255) NOT NULL,
        nomor_batch VARCHAR(100) NOT NULL,
        sumber_anggaran VARCHAR(100) DEFAULT 'APBD Kabupaten',
        tahun_anggaran VARCHAR(10) DEFAULT '2026',
        tanggal_kadaluarsa DATE NULL,
        jumlah_penggunaan INT NOT NULL DEFAULT 1,
        kemasan VARCHAR(100) DEFAULT 'Botol',
        keterangan TEXT NULL,
        petugas VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);
  } catch (e: any) {
    console.warn('ensureTable penggunaan_obat_puskeswan:', e.message);
  }
}

// GET: Ambil data master barang, dropping masuk, distribusi/BA, stok dinas, stok puskeswan & penggunaan
export async function GET(request: Request) {
  try {
    await ensureGudangTables();

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'all';
    const idPuskeswan = searchParams.get('id_puskeswan');

    // 1. Master Barang (Adaptif nama_barang vs merk)
    let orderCol = 'b.id_barang';
    try {
      const [desc]: any = await pool.query('DESCRIBE barang');
      const fields = (desc || []).map((f: any) => f.Field);
      if (fields.includes('nama_barang')) {
        orderCol = 'b.nama_barang';
      } else if (fields.includes('merk')) {
        orderCol = 'b.merk';
      }
    } catch {}

    const [barangs]: any = await pool.query(`
      SELECT b.*, 
        COALESCE(b.nama_barang, b.merk, 'Barang') as nama_barang,
        COALESCE(b.satuan_kemasan, b.satuan, 'Botol') as satuan_kemasan,
        COALESCE(b.kategori, b.jenis_barang, 'Obat') as kategori,
        COALESCE(b.min_stok_dinas, 10) as min_stok_dinas
      FROM barang b
      ORDER BY ${orderCol} ASC
    `);

    // 2. Dropping Masuk ke Dinas
    const [droppings]: any = await pool.query(`
      SELECT d.*, 
        COALESCE(b.nama_barang, b.merk, 'Barang') as nama_barang, 
        COALESCE(d.satuan_kemasan, b.satuan_kemasan, b.satuan, 'Botol') as satuan_kemasan
      FROM dropping_dinas d
      LEFT JOIN barang b ON d.id_barang = b.id_barang
      ORDER BY d.id_dropping_dinas DESC
    `);

    // 3. Distribusi / Berita Acara
    let distQuery = `
      SELECT dist.* 
      FROM distribusi_obat dist
    `;
    const distParams: any[] = [];
    if (idPuskeswan && idPuskeswan !== 'all' && Number(idPuskeswan) > 0) {
      distQuery += ` WHERE dist.id_puskeswan = ? `;
      distParams.push(Number(idPuskeswan));
    }
    distQuery += ` ORDER BY dist.tanggal_ba DESC, dist.id_distribusi DESC `;
    const [distribusi]: any = await pool.query(distQuery, distParams);

    // 4. Hitung Saldo Stok Dinas & Batch Ledger Tunggal
    // Rumus: Saldo Dinas = Total Masuk (dropping_dinas) - Total Keluar (distribusi_obat)
    const ledgerMap: Record<number, any> = {};
    for (const b of barangs) {
      ledgerMap[b.id_barang] = {
        id_barang: b.id_barang,
        nama_barang: b.nama_barang,
        kategori: b.kategori || 'Obat',
        satuan_kemasan: b.satuan_kemasan || 'Botol',
        min_stok_dinas: Number(b.min_stok_dinas ?? 10),
        total_masuk: 0,
        total_terdistribusi: 0,
        saldo_dinas: 0,
        status_stok: 'HABIS',
        batches: {},
      };
    }

    for (const d of droppings) {
      const idB = Number(d.id_barang);
      if (!ledgerMap[idB]) continue;
      const jMasuk = Number(d.jumlah || 0);
      ledgerMap[idB].total_masuk += jMasuk;

      const bKey = String(d.nomor_batch || 'BATCH-DEFAULT').trim();
      if (!ledgerMap[idB].batches[bKey]) {
        const expDate = d.tanggal_kadaluarsa ? new Date(d.tanggal_kadaluarsa) : null;
        let daysToExp = 9999;
        let isExp = false;
        if (expDate) {
          const now = new Date();
          daysToExp = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
          isExp = daysToExp <= 0;
        }

        ledgerMap[idB].batches[bKey] = {
          nomor_batch: bKey,
          tanggal_kadaluarsa: d.tanggal_kadaluarsa ? String(d.tanggal_kadaluarsa).slice(0, 10) : '',
          sumber_anggaran: d.sumber_anggaran || 'APBD Kabupaten',
          tahun_anggaran: d.tahun || 2026,
          jumlah_masuk: 0,
          jumlah_keluar: 0,
          saldo_batch: 0,
          is_expired: isExp,
          days_to_expire: daysToExp,
        };
      }
      ledgerMap[idB].batches[bKey].jumlah_masuk += jMasuk;
    }

    for (const dist of distribusi) {
      const idB = Number(dist.id_barang);
      if (!ledgerMap[idB]) continue;
      const jKeluar = Number(dist.jumlah || 0);
      ledgerMap[idB].total_terdistribusi += jKeluar;

      const bKey = String(dist.nomor_batch || 'BATCH-DEFAULT').trim();
      if (ledgerMap[idB].batches[bKey]) {
        ledgerMap[idB].batches[bKey].jumlah_keluar += jKeluar;
      }
    }

    const stokDinasLedger = Object.values(ledgerMap).map((item: any) => {
      const saldo = Math.max(0, item.total_masuk - item.total_terdistribusi);
      let status: 'AMAN' | 'KRITIS' | 'HABIS' = 'AMAN';
      if (saldo === 0) {
        status = 'HABIS';
      } else if (saldo <= item.min_stok_dinas) {
        status = 'KRITIS';
      }

      const batchList = Object.values(item.batches).map((b: any) => ({
        ...b,
        saldo_batch: Math.max(0, b.jumlah_masuk - b.jumlah_keluar),
      }));

      return {
        ...item,
        saldo_dinas: saldo,
        status_stok: status,
        batches: batchList,
      };
    });

    // 5. Stok per Puskeswan
    let puskStockQuery = `
      SELECT sp.*, b.satuan_kemasan 
      FROM stok_puskeswan sp
      LEFT JOIN barang b ON sp.id_barang = b.id_barang
    `;
    const puskStockParams: any[] = [];
    if (idPuskeswan && idPuskeswan !== 'all' && Number(idPuskeswan) > 0) {
      puskStockQuery += ` WHERE sp.id_puskeswan = ? `;
      puskStockParams.push(Number(idPuskeswan));
    }
    puskStockQuery += ` ORDER BY sp.nama_puskeswan ASC, sp.nama_barang ASC `;
    const [stokPuskeswan]: any = await pool.query(puskStockQuery, puskStockParams);

    // 6. Laporan Penggunaan Obat Puskeswan (7 Kolom)
    let pengQuery = `
      SELECT p.* 
      FROM penggunaan_obat_puskeswan p
    `;
    const pengParams: any[] = [];
    if (idPuskeswan && idPuskeswan !== 'all' && Number(idPuskeswan) > 0) {
      pengQuery += ` WHERE p.id_puskeswan = ? `;
      pengParams.push(Number(idPuskeswan));
    }
    pengQuery += ` ORDER BY p.tanggal DESC, p.id_penggunaan DESC `;
    const [penggunaan]: any = await pool.query(pengQuery, pengParams);

    return NextResponse.json(
      {
        success: true,
        data: {
          masterBarang: barangs || [],
          droppingDinas: droppings || [],
          distribusi: distribusi || [],
          stokDinas: stokDinasLedger || [],
          stokPuskeswan: stokPuskeswan || [],
          penggunaan: penggunaan || [],
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
        },
      }
    );
  } catch (error: any) {
    console.error('Error GET /api/stok-gudang:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Menangani mutasi data gudang (Master, Dropping Dinas, Distribusi BA, Konfirmasi BA, Penggunaan)
export async function POST(request: Request) {
  try {
    await ensureGudangTables();
    const session = await getSessionFromRequest(request as any);
    const userName = session?.nama || session?.nip_username || request.headers.get('x-user-name') || 'Petugas';

    const body = await request.json();
    const { action } = body;

    // ── AKSI 1: TAMBAH / UPDATE MASTER BARANG ──
    if (action === 'SAVE_BARANG') {
      const { id_barang, nama_barang, kategori, satuan_kemasan, min_stok_dinas, keterangan } = body;
      if (!nama_barang) {
        return NextResponse.json({ success: false, error: 'Nama barang wajib diisi.' }, { status: 400 });
      }

      // Pastikan kolom baru siap di tabel barang
      try { await pool.execute('ALTER TABLE barang ADD COLUMN nama_barang VARCHAR(255) NULL'); } catch {}
      try { await pool.execute('ALTER TABLE barang ADD COLUMN kategori VARCHAR(100) DEFAULT "Obat"'); } catch {}
      try { await pool.execute('ALTER TABLE barang ADD COLUMN satuan_kemasan VARCHAR(100) DEFAULT "Botol"'); } catch {}
      try { await pool.execute('ALTER TABLE barang ADD COLUMN min_stok_dinas INT DEFAULT 10'); } catch {}
      try { await pool.execute('ALTER TABLE barang ADD COLUMN keterangan TEXT NULL'); } catch {}
      try { await pool.execute('ALTER TABLE barang MODIFY COLUMN merk VARCHAR(100) NULL'); } catch {}
      try { await pool.execute('ALTER TABLE barang MODIFY COLUMN jenis_barang ENUM("Vaksin","Obat","Straw","Alat") NULL DEFAULT "Obat"'); } catch {}
      try { await pool.execute('ALTER TABLE barang MODIFY COLUMN satuan VARCHAR(50) NULL DEFAULT "Botol"'); } catch {}

      let cols: string[] = [];
      try {
        const [desc]: any = await pool.query('DESCRIBE barang');
        cols = (desc || []).map((c: any) => c.Field);
      } catch {}

      const hasMerk = cols.includes('merk');
      const hasJenis = cols.includes('jenis_barang');
      const hasSatuan = cols.includes('satuan');
      const hasNamaBarang = cols.includes('nama_barang');

      const katVal = kategori || 'Obat';
      const satVal = satuan_kemasan || 'Botol';
      const minVal = Number(min_stok_dinas ?? 10);
      const ketVal = keterangan || '';

      if (id_barang) {
        const updateSets: string[] = [];
        const updateParams: any[] = [];

        if (hasNamaBarang) { updateSets.push('nama_barang = ?'); updateParams.push(nama_barang); }
        if (hasMerk) { updateSets.push('merk = ?'); updateParams.push(nama_barang); }
        if (cols.includes('kategori')) { updateSets.push('kategori = ?'); updateParams.push(katVal); }
        if (hasJenis && ['Vaksin', 'Obat', 'Straw', 'Alat'].includes(katVal)) { updateSets.push('jenis_barang = ?'); updateParams.push(katVal); }
        if (cols.includes('satuan_kemasan')) { updateSets.push('satuan_kemasan = ?'); updateParams.push(satVal); }
        if (hasSatuan) { updateSets.push('satuan = ?'); updateParams.push(satVal); }
        if (cols.includes('min_stok_dinas')) { updateSets.push('min_stok_dinas = ?'); updateParams.push(minVal); }
        if (cols.includes('keterangan')) { updateSets.push('keterangan = ?'); updateParams.push(ketVal); }

        updateParams.push(id_barang);
        await pool.execute(`UPDATE barang SET ${updateSets.join(', ')} WHERE id_barang = ?`, updateParams);
      } else {
        const insertCols: string[] = [];
        const insertPlaceholders: string[] = [];
        const insertParams: any[] = [];

        if (hasNamaBarang) { insertCols.push('nama_barang'); insertPlaceholders.push('?'); insertParams.push(nama_barang); }
        if (hasMerk) { insertCols.push('merk'); insertPlaceholders.push('?'); insertParams.push(nama_barang); }
        if (cols.includes('kategori')) { insertCols.push('kategori'); insertPlaceholders.push('?'); insertParams.push(katVal); }
        if (hasJenis) { insertCols.push('jenis_barang'); insertPlaceholders.push('?'); insertParams.push(['Vaksin', 'Obat', 'Straw', 'Alat'].includes(katVal) ? katVal : 'Obat'); }
        if (cols.includes('satuan_kemasan')) { insertCols.push('satuan_kemasan'); insertPlaceholders.push('?'); insertParams.push(satVal); }
        if (hasSatuan) { insertCols.push('satuan'); insertPlaceholders.push('?'); insertParams.push(satVal); }
        if (cols.includes('min_stok_dinas')) { insertCols.push('min_stok_dinas'); insertPlaceholders.push('?'); insertParams.push(minVal); }
        if (cols.includes('keterangan')) { insertCols.push('keterangan'); insertPlaceholders.push('?'); insertParams.push(ketVal); }

        await pool.execute(
          `INSERT INTO barang (${insertCols.join(', ')}) VALUES (${insertPlaceholders.join(', ')})`,
          insertParams
        );
      }

      await logActivity({
        module: 'keswan',
        submenu: 'stok-gudang',
        tableName: 'barang',
        recordId: String(id_barang || nama_barang),
        action: id_barang ? 'UPDATE' : 'CREATE',
        userName,
        details: { nama_barang, min_stok_dinas },
      });

      return NextResponse.json({ success: true, message: 'Data master barang berhasil disimpan.' });
    }

    // ── AKSI 2: TAMBAH DROPPING MASUK KE DINAS (APBD Kab, Provinsi, APBN) ──
    if (action === 'TAMBAH_DROPPING_DINAS') {
      const {
        tahun,
        bulan,
        id_barang,
        nomor_batch,
        tanggal_kadaluarsa,
        sumber_anggaran,
        satuan_kemasan,
        jumlah,
        harga_satuan,
        yang_menerima,
        nip_penerima,
        yang_menyerahkan,
        nip_penyerah,
      } = body;

      if (!id_barang || !jumlah || Number(jumlah) <= 0) {
        return NextResponse.json({ success: false, error: 'Barang dan jumlah wajib diisi.' }, { status: 400 });
      }

      const numJumlah = Number(jumlah);
      const numHarga = Number(harga_satuan || 0);
      const totalHarga = numJumlah * numHarga;
      const thn = Number(tahun || new Date().getFullYear());
      const bln = String(bulan || 'Januari');

      const [resIns]: any = await pool.execute(
        `INSERT INTO dropping_dinas 
          (tahun, bulan, id_barang, nomor_batch, tanggal_kadaluarsa, sumber_anggaran, satuan_kemasan, jumlah, harga_satuan, harga_total, yang_menerima, nip_penerima, yang_menyerahkan, nip_penyerah)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          thn,
          bln,
          id_barang,
          nomor_batch || 'BATCH-DEFAULT',
          tanggal_kadaluarsa || null,
          sumber_anggaran || 'APBD Kabupaten',
          satuan_kemasan || 'Botol',
          numJumlah,
          numHarga,
          totalHarga,
          yang_menerima || '',
          nip_penerima || '',
          yang_menyerahkan || '',
          nip_penyerah || '',
        ]
      );

      await logActivity({
        module: 'keswan',
        submenu: 'stok-gudang',
        tableName: 'dropping_dinas',
        recordId: String(resIns?.insertId || id_barang),
        action: 'CREATE',
        userName,
        details: { id_barang, nomor_batch, jumlah: numJumlah, sumber_anggaran },
      });

      return NextResponse.json({ success: true, message: 'Dropping masuk ke dinas berhasil dicatat.' });
    }

    // ── AKSI 3: BUAT DISTRIBUSI KE PUSKESWAN (Droping Terencana / Amprahan Insidental) ──
    if (action === 'BUAT_DISTRIBUSI') {
      const {
        nomor_ba,
        tanggal_ba,
        jenis_distribusi,
        is_darurat,
        alasan_darurat,
        id_puskeswan,
        nama_puskeswan,
        id_barang,
        nama_barang,
        nomor_batch,
        tanggal_kadaluarsa,
        sumber_anggaran,
        tahun_anggaran,
        satuan_kemasan,
        jumlah,
        yang_menyerahkan,
        nip_penyerah,
        yang_menerima,
        nip_penerima,
      } = body;

      if (!id_barang || !id_puskeswan || !jumlah || Number(jumlah) <= 0) {
        return NextResponse.json({ success: false, error: 'Data distribusi tidak lengkap.' }, { status: 400 });
      }

      const numJumlah = Number(jumlah);

      // Cek Saldo & Aturan Safety Stock Dinas
      const [sumMasuk]: any = await pool.query(
        `SELECT SUM(jumlah) as total_masuk FROM dropping_dinas WHERE id_barang = ?`,
        [id_barang]
      );
      const [sumKeluar]: any = await pool.query(
        `SELECT SUM(jumlah) as total_keluar FROM distribusi_obat WHERE id_barang = ?`,
        [id_barang]
      );
      const [barangRow]: any = await pool.query(
        `SELECT COALESCE(nama_barang, merk, 'Barang') as nama_barang, min_stok_dinas, satuan_kemasan FROM barang WHERE id_barang = ?`,
        [id_barang]
      );

      const totalMasuk = Number(sumMasuk?.[0]?.total_masuk || 0);
      const totalKeluar = Number(sumKeluar?.[0]?.total_keluar || 0);
      const saldoDinasSaatIni = Math.max(0, totalMasuk - totalKeluar);
      const minBuffer = Number(barangRow?.[0]?.min_stok_dinas ?? 10);
      const itemNama = barangRow?.[0]?.nama_barang || nama_barang;

      if (saldoDinasSaatIni < numJumlah) {
        return NextResponse.json({
          success: false,
          error: `Stok gudang dinas tidak mencukupi. Saldo saat ini: ${saldoDinasSaatIni} unit, permintaan: ${numJumlah} unit.`,
        }, { status: 400 });
      }

      const sisaSetelahAmbil = saldoDinasSaatIni - numJumlah;

      // PENTING: Jika sisa setelah diambil berada di bawah buffer stok dinas dan BUKAN pengeluaran darurat
      if (sisaSetelahAmbil < minBuffer && !is_darurat) {
        return NextResponse.json({
          success: false,
          isBufferLock: true,
          error: `Stok penyangga dinas terkunci! Pengambilan ini akan menyisakan ${sisaSetelahAmbil} unit (di bawah batas aman ${minBuffer} unit). Untuk pengambilan mendesak, hubungi Administrator atau centang opsi Pengambilan Darurat.`,
        }, { status: 403 });
      }

      const finalNoBA = nomor_ba || `BA/KESWAN/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`;
      const finalTgl = tanggal_ba || new Date().toISOString().slice(0, 10);

      // Simpan ke tabel distribusi_obat
      const [insDist]: any = await pool.execute(
        `INSERT INTO distribusi_obat 
          (nomor_ba, tanggal_ba, jenis_distribusi, is_darurat, alasan_darurat, id_puskeswan, nama_puskeswan, id_barang, nama_barang, nomor_batch, tanggal_kadaluarsa, sumber_anggaran, tahun_anggaran, satuan_kemasan, jumlah, yang_menyerahkan, nip_penyerah, yang_menerima, nip_penerima, status_terima)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DITERIMA')`,
        [
          finalNoBA,
          finalTgl,
          jenis_distribusi || 'DROPING_TERENCANA',
          is_darurat ? 1 : 0,
          alasan_darurat || '',
          id_puskeswan,
          nama_puskeswan,
          id_barang,
          itemNama,
          nomor_batch || 'BATCH-DEFAULT',
          tanggal_kadaluarsa || null,
          sumber_anggaran || 'APBD Kabupaten',
          String(tahun_anggaran || '2026'),
          satuan_kemasan || barangRow?.[0]?.satuan_kemasan || 'Botol',
          numJumlah,
          yang_menyerahkan || userName,
          nip_penyerah || '',
          yang_menerima || '',
          nip_penerima || '',
        ]
      );

      // Otomatis masukkan / tambah ke stok puskeswan terkait
      const batchKey = nomor_batch || 'BATCH-DEFAULT';
      await pool.execute(
        `INSERT INTO stok_puskeswan 
          (id_puskeswan, nama_puskeswan, id_barang, nama_barang, nomor_batch, tanggal_kadaluarsa, sumber_anggaran, tahun_anggaran, satuan_kemasan, stok_masuk, stok_keluar, sisa_stok)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
         ON DUPLICATE KEY UPDATE 
          stok_masuk = stok_masuk + VALUES(stok_masuk),
          sisa_stok = sisa_stok + VALUES(stok_masuk),
          tanggal_kadaluarsa = COALESCE(VALUES(tanggal_kadaluarsa), tanggal_kadaluarsa),
          sumber_anggaran = VALUES(sumber_anggaran)`,
        [
          id_puskeswan,
          nama_puskeswan,
          id_barang,
          itemNama,
          batchKey,
          tanggal_kadaluarsa || null,
          sumber_anggaran || 'APBD Kabupaten',
          String(tahun_anggaran || '2026'),
          satuan_kemasan || 'Botol',
          numJumlah,
          numJumlah,
        ]
      );

      await logActivity({
        module: 'keswan',
        submenu: 'stok-gudang',
        tableName: 'distribusi_obat',
        recordId: finalNoBA,
        action: 'CREATE',
        userName,
        details: {
          puskeswan: nama_puskeswan,
          obat: itemNama,
          jumlah: numJumlah,
          is_darurat,
          nomor_ba: finalNoBA,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Distribusi ke ${nama_puskeswan} berhasil dicatat dengan Berita Acara ${finalNoBA}.`,
        nomor_ba: finalNoBA,
      });
    }

    // ── AKSI 4: UPLOAD BUKTI TANDA TERIMA BERITA ACARA (PDF / Foto < 2MB) ──
    if (action === 'UPLOAD_BUKTI_BA') {
      const { id_distribusi, file_bukti_ba } = body;
      if (!id_distribusi || !file_bukti_ba) {
        return NextResponse.json({ success: false, error: 'ID distribusi dan file bukti wajib disertakan.' }, { status: 400 });
      }

      await pool.execute(
        `UPDATE distribusi_obat SET file_bukti_ba = ?, status_terima = 'DITERIMA' WHERE id_distribusi = ?`,
        [file_bukti_ba, id_distribusi]
      );

      await logActivity({
        module: 'keswan',
        submenu: 'stok-gudang',
        tableName: 'distribusi_obat',
        recordId: String(id_distribusi),
        action: 'UPDATE',
        userName,
        details: { keterangan: 'Upload bukti tanda terima Berita Acara' },
      });

      return NextResponse.json({ success: true, message: 'Bukti tanda terima Berita Acara berhasil diunggah.' });
    }

    // ── AKSI 5: CATAT PENGGUNAAN OBAT DI PUSKESWAN (Sistem Apotek / Pengurangan Real-time) ──
    if (action === 'CATAT_PENGGUNAAN') {
      const {
        tanggal,
        id_puskeswan,
        nama_puskeswan,
        id_barang,
        nomor_batch,
        jumlah_penggunaan,
        keterangan,
        petugas,
      } = body;

      if (!id_puskeswan || !id_barang || !nomor_batch || !jumlah_penggunaan || Number(jumlah_penggunaan) <= 0) {
        return NextResponse.json({ success: false, error: 'Data penggunaan obat tidak lengkap.' }, { status: 400 });
      }

      const numUsed = Number(jumlah_penggunaan);

      // Cek stok yang ada di puskeswan untuk batch ini
      const [puskStockRows]: any = await pool.query(
        `SELECT * FROM stok_puskeswan 
         WHERE id_puskeswan = ? AND id_barang = ? AND nomor_batch = ? LIMIT 1`,
        [id_puskeswan, id_barang, nomor_batch]
      );

      if (!puskStockRows || puskStockRows.length === 0) {
        return NextResponse.json({ success: false, error: 'Stok obat dengan batch tersebut tidak ditemukan di puskeswan ini.' }, { status: 404 });
      }

      const currentPuskStock = puskStockRows[0];
      const sisaSaatIni = Number(currentPuskStock.sisa_stok || 0);

      if (sisaSaatIni < numUsed) {
        return NextResponse.json({
          success: false,
          error: `Stok puskeswan tidak cukup! Sisa stok saat ini hanya ${sisaSaatIni} ${currentPuskStock.satuan_kemasan || 'unit'}, pemakaian: ${numUsed}.`,
        }, { status: 400 });
      }

      const tglUse = tanggal || new Date().toISOString().slice(0, 10);

      // 1. Simpan ke tabel penggunaan_obat_puskeswan
      await pool.execute(
        `INSERT INTO penggunaan_obat_puskeswan 
          (tanggal, id_puskeswan, nama_puskeswan, id_barang, nama_produk, nomor_batch, sumber_anggaran, tahun_anggaran, tanggal_kadaluarsa, jumlah_penggunaan, kemasan, keterangan, petugas)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tglUse,
          id_puskeswan,
          nama_puskeswan || currentPuskStock.nama_puskeswan,
          id_barang,
          currentPuskStock.nama_barang,
          nomor_batch,
          currentPuskStock.sumber_anggaran,
          currentPuskStock.tahun_anggaran,
          currentPuskStock.tanggal_kadaluarsa,
          numUsed,
          currentPuskStock.satuan_kemasan || 'Botol',
          keterangan || '',
          petugas || userName,
        ]
      );

      // 2. Kurangi stok puskeswan secara real-time (boleh sampai 0)
      await pool.execute(
        `UPDATE stok_puskeswan 
         SET stok_keluar = stok_keluar + ?, sisa_stok = sisa_stok - ? 
         WHERE id_stok_puskeswan = ?`,
        [numUsed, numUsed, currentPuskStock.id_stok_puskeswan]
      );

      await logActivity({
        module: 'keswan',
        submenu: 'stok-gudang',
        tableName: 'penggunaan_obat_puskeswan',
        recordId: `${nama_puskeswan}-${currentPuskStock.nama_barang}-${nomor_batch}`,
        action: 'CREATE',
        userName,
        details: {
          puskeswan: nama_puskeswan,
          obat: currentPuskStock.nama_barang,
          jumlah: numUsed,
          sisa_stok_akhir: sisaSaatIni - numUsed,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Pemakaian obat dicatat. Stok puskeswan berkurang ${numUsed}. Sisa stok saat ini: ${sisaSaatIni - numUsed}.`,
      });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak dikenali.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error POST /api/stok-gudang:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus data master/dropping/distribusi jika ada pembatalan
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ success: false, error: 'Tipe dan ID wajib disertakan.' }, { status: 400 });
    }

    if (type === 'barang') {
      await pool.execute(`DELETE FROM barang WHERE id_barang = ?`, [id]);
      return NextResponse.json({ success: true, message: 'Data master barang berhasil dihapus.' });
    }

    if (type === 'dropping') {
      await pool.execute(`DELETE FROM dropping_dinas WHERE id_dropping_dinas = ?`, [id]);
      return NextResponse.json({ success: true, message: 'Data dropping dinas berhasil dihapus.' });
    }

    if (type === 'distribusi') {
      // Hapus distribusi dan kurangi stok puskeswan yang tadi ditambah
      const [distRow]: any = await pool.query(`SELECT * FROM distribusi_obat WHERE id_distribusi = ?`, [id]);
      if (distRow && distRow.length > 0) {
        const d = distRow[0];
        try {
          await pool.execute(
            `UPDATE stok_puskeswan 
             SET stok_masuk = GREATEST(0, stok_masuk - ?), sisa_stok = GREATEST(0, sisa_stok - ?)
             WHERE id_puskeswan = ? AND id_barang = ? AND nomor_batch = ?`,
            [d.jumlah, d.jumlah, d.id_puskeswan, d.id_barang, d.nomor_batch]
          );
        } catch {}
      }
      await pool.execute(`DELETE FROM distribusi_obat WHERE id_distribusi = ?`, [id]);
      return NextResponse.json({ success: true, message: 'Distribusi berhasil dibatalkan.' });
    }

    if (type === 'penggunaan') {
      const [pengRow]: any = await pool.query(`SELECT * FROM penggunaan_obat_puskeswan WHERE id_penggunaan = ?`, [id]);
      if (pengRow && pengRow.length > 0) {
        const p = pengRow[0];
        try {
          await pool.execute(
            `UPDATE stok_puskeswan 
             SET stok_keluar = GREATEST(0, stok_keluar - ?), sisa_stok = sisa_stok + ?
             WHERE id_puskeswan = ? AND id_barang = ? AND nomor_batch = ?`,
            [p.jumlah_penggunaan, p.jumlah_penggunaan, p.id_puskeswan, p.id_barang, p.nomor_batch]
          );
        } catch {}
      }
      await pool.execute(`DELETE FROM penggunaan_obat_puskeswan WHERE id_penggunaan = ?`, [id]);
      return NextResponse.json({ success: true, message: 'Riwayat pemakaian berhasil dihapus dan stok dikembalikan.' });
    }

    return NextResponse.json({ success: false, error: 'Tipe penghapusan tidak valid.' }, { status: 400 });
  } catch (error: any) {
    console.error('Error DELETE /api/stok-gudang:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
