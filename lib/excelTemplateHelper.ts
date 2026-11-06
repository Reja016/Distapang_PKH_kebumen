import * as XLSX from 'xlsx-js-style';
import {
  HEADER_STYLE,
  DATA_STYLE_BASE,
  BORDER_THIN,
  autoFitWorksheetColumns,
} from './excelExportHelper';

export interface ColumnDefinition {
  header: string;
  key: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  example?: any;
}

/**
 * Membuat worksheet template dengan header bergaya resmi SiMantap & baris contoh
 */
export function createStyledTemplateWorksheet(
  columns: ColumnDefinition[],
  sampleRows: any[][] = []
): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};

  // 1. Tulis Header (Baris 0)
  columns.forEach((col, cIdx) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: cIdx });
    ws[cellRef] = {
      t: 's',
      v: col.header,
      s: {
        ...HEADER_STYLE,
        fill: { fgColor: { rgb: 'F1F5F9' } },
        font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '0F172A' } },
      },
    };
  });

  // 2. Tulis Baris Contoh (Sample Rows)
  sampleRows.forEach((row, rIdx) => {
    const rowNum = rIdx + 1;
    row.forEach((val, cIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: rowNum, c: cIdx });
      const colDef = columns[cIdx];
      const isNum = typeof val === 'number';
      const align = colDef?.align || (isNum ? 'right' : 'left');

      ws[cellRef] = {
        t: isNum ? 'n' : 's',
        v: val !== null && val !== undefined ? val : '',
        s: {
          ...DATA_STYLE_BASE,
          font: { name: 'Calibri', sz: 11, color: { rgb: '334155' } },
          alignment: {
            horizontal: align,
            vertical: 'center',
          },
          border: BORDER_THIN,
        },
      };
    });
  });

  // 3. Set range worksheet
  const totalRows = Math.max(1, sampleRows.length + 1);
  const totalCols = columns.length;
  ws['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: totalRows - 1, c: totalCols - 1 },
  });

  // 4. Atur lebar kolom (auto-fit dengan batas minimum)
  autoFitWorksheetColumns(ws);

  // Jika kolom punya manual width, terapkan
  columns.forEach((col, idx) => {
    if (col.width && ws['!cols'] && ws['!cols'][idx]) {
      ws['!cols'][idx].wch = Math.max(ws['!cols'][idx].wch || 10, col.width);
    }
  });

  return ws;
}

/**
 * Membuat worksheet panduan & referensi pilihan opsi
 */
export function createInstructionsWorksheet(
  title: string,
  instructions: { judul: string; deskripsi: string; pilihan?: string[] }[]
): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  let curRow = 0;

  // Judul Sheet Panduan
  ws[XLSX.utils.encode_cell({ r: curRow, c: 0 })] = {
    t: 's',
    v: title,
    s: {
      font: { name: 'Calibri', sz: 13, bold: true, color: { rgb: '0F172A' } },
      alignment: { vertical: 'center' },
    },
  };
  curRow += 2;

  // Header Panduan
  const headers = ['No', 'Kolom / Ketentuan', 'Keterangan Pengisian', 'Pilihan Resmi'];
  headers.forEach((h, cIdx) => {
    ws[XLSX.utils.encode_cell({ r: curRow, c: cIdx })] = {
      t: 's',
      v: h,
      s: {
        ...HEADER_STYLE,
        fill: { fgColor: { rgb: 'E2E8F0' } },
      },
    };
  });
  curRow++;

  // Baris Panduan
  instructions.forEach((inst, idx) => {
    const pilihanStr = (inst.pilihan || []).join(', ') || '-';
    const values = [idx + 1, inst.judul, inst.deskripsi, pilihanStr];

    values.forEach((v, cIdx) => {
      ws[XLSX.utils.encode_cell({ r: curRow, c: cIdx })] = {
        t: typeof v === 'number' ? 'n' : 's',
        v,
        s: {
          ...DATA_STYLE_BASE,
          alignment: {
            horizontal: cIdx === 0 ? 'center' : 'left',
            vertical: 'center',
            wrapText: true,
          },
        },
      };
    });
    curRow++;
  });

  ws['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: curRow - 1, c: 3 },
  });

  ws['!cols'] = [
    { wch: 6 },  // No
    { wch: 25 }, // Kolom
    { wch: 45 }, // Keterangan
    { wch: 50 }, // Pilihan
  ];

  return ws;
}

/**
 * ── GENERATOR TEMPLATE: PENCATATAN PEMOTONGAN RPH / TPH / TPU ──
 */
export function downloadRphPemotonganTemplate(): void {
  const columns: ColumnDefinition[] = [
    { header: 'Tanggal (YYYY-MM-DD)', key: 'tanggal', width: 22, align: 'center' },
    { header: 'Tempat Pemotongan', key: 'tempat_pemotongan', width: 24, align: 'left' },
    { header: 'Nama Tempat Lain (Jika Luar RPH)', key: 'nama_tempat_lain', width: 32, align: 'left' },
    { header: 'Nama Jagal', key: 'nama_jagal', width: 22, align: 'left' },
    { header: 'Nama Pemilik', key: 'nama_pemilik', width: 22, align: 'left' },
    { header: 'Kecamatan', key: 'kecamatan', width: 18, align: 'left' },
    { header: 'Desa', key: 'desa', width: 18, align: 'left' },
    { header: 'Rumpun Hewan', key: 'rumpun_hewan', width: 20, align: 'left' },
    { header: 'Kategori Hewan', key: 'kategori_hewan', width: 20, align: 'center' },
    { header: 'Jumlah Ekor', key: 'jumlah_ekor', width: 14, align: 'center' },
    { header: 'Status Izin Potong', key: 'status_potong', width: 20, align: 'center' },
    { header: 'Bobot Hidup (Kg)', key: 'bobot_hidup', width: 18, align: 'right' },
    { header: 'Lingkar Dada (Cm)', key: 'lingkar_dada', width: 18, align: 'right' },
    { header: 'Pemeriksaan Antemortem', key: 'pemeriksaan_antemortem', width: 30, align: 'left' },
    { header: 'Pemeriksaan Postmortem', key: 'pemeriksaan_postmortem', width: 30, align: 'left' },
    { header: 'Status Kelayakan Daging', key: 'status_kelayakan', width: 24, align: 'center' },
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  const sampleRows: any[][] = [
    [
      todayStr,
      'RPH Kebumen',
      '-',
      'Pak Budi Jagal',
      'H. Slamet',
      'Kebumen',
      'Panjer',
      'Sapi PO',
      'Jantan',
      1,
      'Boleh Dipotong',
      420,
      178,
      'Sehat, aktif, cermin hidung basah, suhu normal 38.6°C',
      'Karkas bersih, hati bebas cacing Fasciola, paru normal',
      'Layak Konsumsi',
    ],
    [
      todayStr,
      'RPH Gombong',
      '-',
      'Karyono Jagal',
      'Hj. Siti',
      'Gombong',
      'Wonokriyo',
      'Sapi Simmental',
      'Betina Non-Produktif',
      1,
      'Boleh Dipotong',
      530,
      192,
      'Sehat, afkir umur tua (gigi tanggal), SKKW lengkap',
      'Organ dalam bersih, daging merah cerah, karkas sehat',
      'Layak Konsumsi',
    ],
    [
      todayStr,
      'Luar RPH Kebumen',
      'TPH H. Ridwan Pejagoan',
      'H. Ridwan',
      'Ahmad Syarif',
      'Pejagoan',
      'Kebulusan',
      'Sapi Limousine',
      'Jantan',
      1,
      'Boleh Dipotong',
      480,
      185,
      'Kondisi fisik sehat, mata cerah, tidak ada luka',
      'Pemeriksaan postmortem normal, daging segar',
      'Layak Konsumsi',
    ],
  ];

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Tanggal',
      deskripsi: 'Format tanggal wajib YYYY-MM-DD (Contoh: 2026-11-05).',
    },
    {
      judul: 'Tempat Pemotongan',
      deskripsi: 'Pilih salah satu dari 4 opsi resmi.',
      pilihan: ['RPH Kebumen', 'RPH Gombong', 'Luar RPH Kebumen', 'Luar RPH Gombong'],
    },
    {
      judul: 'Nama Tempat Lain',
      deskripsi: 'Isi jika memilih Luar RPH (misal nama TPH / halaman jagal). Jika RPH resmi isi tanda -',
    },
    {
      judul: 'Nama Jagal & Pemilik',
      deskripsi: 'Nama lengkap jagal pemotong dan peternak/pemilik sapi.',
    },
    {
      judul: 'Kecamatan & Desa',
      deskripsi: 'Lokasi asal hewan atau lokasi pemotongan di Kabupaten Kebumen.',
    },
    {
      judul: 'Rumpun Hewan',
      deskripsi: 'Jenis / rumpun sapi yang dipotong.',
      pilihan: ['Sapi PO', 'Sapi SO', 'Sapi Simmental', 'Sapi Limousine', 'Sapi Brahman', 'Sapi Perah'],
    },
    {
      judul: 'Kategori Hewan',
      deskripsi: 'Jenis kelamin / status reproduksi.',
      pilihan: ['Jantan', 'Betina Produktif', 'Betina Non-Produktif'],
    },
    {
      judul: 'Status Izin Potong',
      deskripsi: 'Hasil skrining antemortem untuk izin potong.',
      pilihan: ['Boleh Dipotong', 'Tidak Boleh Dipotong'],
    },
    {
      judul: 'Bobot Hidup & Lingkar Dada',
      deskripsi: 'Masukkan angka saja (tanpa satuan kg / cm). Sistem akan menghitung estimasi karkas dan daging secara otomatis berdasarkan SNI.',
    },
    {
      judul: 'Status Kelayakan Daging',
      deskripsi: 'Keputusan hasil akhir pasca pemeriksaan postmortem.',
      pilihan: ['Layak Konsumsi', 'Layak dengan Syarat', 'Ditolak'],
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN & ATURAN PENGISIAN TEMPLATE PEMOTONGAN HEWAN',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Pemotongan');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Import_Pemotongan_RPH_SiMantap.xlsx');
}

/**
 * ── GENERATOR TEMPLATE: DATA VAKSINASI HARIAN PMK ──
 */
export function downloadVaksinasiHarianTemplate(): void {
  const columns: ColumnDefinition[] = [
    { header: 'Puskeswan', key: 'puskeswan', width: 22, align: 'left' },
    { header: 'Tanggal (YYYY-MM-DD)', key: 'tanggal', width: 22, align: 'center' },
    { header: 'Jumlah Dosis (Ekor)', key: 'jumlah', width: 20, align: 'right' },
    { header: 'Keterangan (Opsional)', key: 'keterangan', width: 35, align: 'left' },
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  const sampleRows: any[][] = [
    ['Mirit', todayStr, 45, 'Vaksinasi massal peternak sapi potong'],
    ['Klirong', todayStr, 60, 'Dosis reguler ternak sapi & kambing'],
    ['Gombong', todayStr, 35, 'Pelayanan vaksinasi poskeswan'],
    ['Buayan', todayStr, 50, 'Vaksinasi lanjutan PMK'],
    ['Alian', todayStr, 40, 'Vaksinasi terpadu desa'],
    ['Prembun', todayStr, 30, 'Pelayanan terpadu wilayah'],
    ['Kebumen', todayStr, 55, 'Vaksinasi populasi rentan'],
    ['Karanganyar', todayStr, 40, 'Vaksinasi kelompok tani ternak'],
  ];

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Puskeswan',
      deskripsi: 'Nama Puskeswan wilayah kerja di Kabupaten Kebumen.',
      pilihan: ['Mirit', 'Klirong', 'Gombong', 'Buayan', 'Alian', 'Prembun', 'Kebumen', 'Karanganyar'],
    },
    {
      judul: 'Tanggal',
      deskripsi: 'Format tanggal wajib YYYY-MM-DD (Contoh: 2026-11-05).',
    },
    {
      judul: 'Jumlah Dosis (Ekor)',
      deskripsi: 'Jumlah ternak yang divaksin pada tanggal tersebut (angka bulat positif). Jika libur/nihil isi 0.',
    },
    {
      judul: 'Keterangan (Opsional)',
      deskripsi: 'Catatan tambahan seperti nama desa, jenis hewan, atau merk vaksin jika ada.',
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN & ATURAN PENGISIAN TEMPLATE VAKSINASI HARIAN PMK',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Vaksinasi_Harian');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Import_Vaksinasi_Harian_SiMantap.xlsx');
}

/**
 * ── GENERATOR TEMPLATE: LAPORAN KASUS PENYAKIT HEWAN ──
 */
export function downloadLaporanPenyakitTemplate(): void {
  const columns: ColumnDefinition[] = [
    { header: 'Tahun', key: 'tahun', width: 12, align: 'center' },
    { header: 'Kecamatan', key: 'kecamatan', width: 20, align: 'left' },
    { header: 'Diagnosa Penyakit', key: 'diagnosa_nama', width: 24, align: 'left' },
    { header: 'Jumlah Kasus (Ekor)', key: 'jumlah_kasus', width: 20, align: 'right' },
    { header: 'Keterangan (Opsional)', key: 'keterangan', width: 35, align: 'left' },
  ];

  const currentYear = new Date().getFullYear();

  const sampleRows: any[][] = [
    [currentYear, 'Kebumen', 'Pink Eye', 3, 'Pengobatan salep mata & injeksi antibiotik'],
    [currentYear, 'Alian', 'Scabies', 5, 'Injeksi ivermectin sapi potong'],
    [currentYear, 'Gombong', 'BEF', 2, 'Gejala demam 3 hari, terapi vitamin & penurun panas'],
    [currentYear, 'Prembun', 'Bloat', 1, 'Kembung akut pasca pakan hijauan basah'],
    [currentYear, 'Klirong', 'Mastitis', 2, 'Radang ambing sapi perah laktasi'],
    [currentYear, 'Buayan', 'Cacingan', 4, 'Pemberian obat cacing albendazole'],
    [currentYear, 'Mirit', 'LSD', 1, 'Isolasi ternak bergejala nodul kulit'],
    [currentYear, 'Karanganyar', 'Distokia', 1, 'Bantuan pertolongan persalinan induk sapi'],
  ];

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Tahun',
      deskripsi: 'Tahun pelaporan kasus (Contoh: 2026).',
    },
    {
      judul: 'Kecamatan',
      deskripsi: 'Nama Kecamatan di Kabupaten Kebumen tempat kasus ditemukan.',
      pilihan: [
        'Ayah', 'Buayan', 'Puring', 'Petanahan', 'Klirong', 'Buluspesantren',
        'Ambal', 'Mirit', 'Bonorowo', 'Prembun', 'Padureso', 'Kutowinangun',
        'Alian', 'Poncowarno', 'Kebumen', 'Pejagoan', 'Sruweng', 'Adimulyo',
        'Kuwarasan', 'Rowokele', 'Sempor', 'Gombong', 'Karanganyar', 'Karanggayam',
        'Sadang', 'Karangsambung',
      ],
    },
    {
      judul: 'Diagnosa Penyakit',
      deskripsi: 'Nama diagnosa medis / klinis penyakit hewan.',
      pilihan: [
        'Pink Eye', 'BEF', 'Scabies', 'Cacingan', 'Bloat', 'Mastitis',
        'LSD', 'PMK', 'Distokia', 'Pneumonia', 'Enteritis', 'ORF',
        'Ektoparasit', 'Abses', 'Artritis', 'Anemia', 'Prolaps Uteri',
      ],
    },
    {
      judul: 'Jumlah Kasus (Ekor)',
      deskripsi: 'Jumlah ekor hewan ternak yang terjangkit kasus (angka bulat positif, minimal 1).',
    },
    {
      judul: 'Keterangan (Opsional)',
      deskripsi: 'Catatan tambahan seperti nama desa, peternak, atau riwayat penanganan medis.',
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN & ATURAN PENGISIAN TEMPLATE LAPORAN PENYAKIT HEWAN',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Laporan_Penyakit');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Import_Laporan_Penyakit_SiMantap.xlsx');
}

/**
 * ── GENERATOR TEMPLATE: MASTER KELOMPOK TANI TERNAK (KTT) ──
 */
export function downloadKttTemplate(): void {
  const columns: ColumnDefinition[] = [
    { header: 'Kecamatan', key: 'kecamatan', width: 20, align: 'left' },
    { header: 'Desa', key: 'desa', width: 20, align: 'left' },
    { header: 'Nama Kelompok', key: 'nama_kelompok', width: 26, align: 'left' },
    { header: 'Nama Ketua', key: 'nama_ketua', width: 22, align: 'left' },
    { header: 'Jenis Kelompok', key: 'jenis_kelompok', width: 18, align: 'left' },
    { header: 'Kelas Kelompok', key: 'kelas_kelompok', width: 16, align: 'center' },
    { header: 'Nomor Register', key: 'nomor_register', width: 22, align: 'center' },
    { header: 'Gapoktan Induk (Opsional)', key: 'gapoktan_induk', width: 24, align: 'left' },
    { header: 'Luas Lahan (Ha)', key: 'luas_lahan_ha', width: 16, align: 'right' },
    { header: 'Anggota Laki-laki', key: 'anggota_laki', width: 18, align: 'right' },
    { header: 'Anggota Perempuan', key: 'anggota_perempuan', width: 18, align: 'right' },
  ];

  const sampleRows: any[][] = [
    [
      'Kebumen',
      'Panjer',
      'KTT Lembu Makmur',
      'H. Budi Santoso',
      'Sapi Potong',
      'Madya',
      '33.05.15.2001.001',
      'Gapoktan Tani Makmur',
      1.5,
      18,
      7,
    ],
    [
      'Gombong',
      'Wonokriyo',
      'KTT Mandiri Jaya',
      'Ahmad Ridwan',
      'Sapi Perah',
      'Lanjut',
      '33.05.22.2005.002',
      'Gapoktan Wonokriyo Subur',
      2.0,
      14,
      9,
    ],
    [
      'Klirong',
      'Kradenan',
      'KTT Berkah Ternak',
      'Siti Maryam',
      'Kambing/Domba',
      'Pemula',
      '33.05.05.2010.003',
      '-',
      0.8,
      12,
      10,
    ],
    [
      'Prembun',
      'Bagung',
      'KTT Lembu Agung',
      'Karyono',
      'Sapi Potong',
      'Utama',
      '33.05.10.1998.001',
      'Gapoktan Bagung Bersatu',
      3.2,
      22,
      12,
    ],
  ];

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Kecamatan',
      deskripsi: 'Nama Kecamatan di Kabupaten Kebumen.',
      pilihan: [
        'Ayah', 'Buayan', 'Puring', 'Petanahan', 'Klirong', 'Buluspesantren',
        'Ambal', 'Mirit', 'Bonorowo', 'Prembun', 'Padureso', 'Kutowinangun',
        'Alian', 'Poncowarno', 'Kebumen', 'Pejagoan', 'Sruweng', 'Adimulyo',
        'Kuwarasan', 'Rowokele', 'Sempor', 'Gombong', 'Karanganyar', 'Karanggayam',
        'Sadang', 'Karangsambung',
      ],
    },
    {
      judul: 'Desa',
      deskripsi: 'Nama Desa / Kelurahan domisili sekretariat kelompok tani ternak.',
    },
    {
      judul: 'Nama Kelompok',
      deskripsi: 'Nama resmi Kelompok Tani Ternak (KTT).',
    },
    {
      judul: 'Nama Ketua',
      deskripsi: 'Nama lengkap ketua kelompok tani ternak.',
    },
    {
      judul: 'Jenis Kelompok',
      deskripsi: 'Komoditas utama ternak yang diusahakan.',
      pilihan: ['Sapi Potong', 'Sapi Perah', 'Kambing/Domba', 'Unggas', 'Kerbau', 'Campuran'],
    },
    {
      judul: 'Kelas Kelompok',
      deskripsi: 'Tingkatan sertifikasi kemampuan kelompok.',
      pilihan: ['Pemula', 'Lanjut', 'Madya', 'Utama'],
    },
    {
      judul: 'Nomor Register',
      deskripsi: 'Nomor register resmi Simluhtan / Dinas. Jika belum ada isi tanda -.',
    },
    {
      judul: 'Gapoktan Induk',
      deskripsi: 'Nama Gapoktan naungan (jika belum tergabung isi tanda -).',
    },
    {
      judul: 'Luas Lahan (Ha)',
      deskripsi: 'Luas lahan pakan/kandang dalam hektar (angka desimal dengan titik, misal: 1.5).',
    },
    {
      judul: 'Anggota Laki & Perempuan',
      deskripsi: 'Jumlah anggota aktif berdasarkan jenis kelamin (angka bulat).',
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN & ATURAN PENGISIAN TEMPLATE MASTER KTT',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Master_KTT');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Import_Database_KTT_SiMantap.xlsx');
}

/**
 * ── GENERATOR TEMPLATE: DATABASE INSEMINASI BUATAN (IB) ──
 */
export function downloadDatabaseIbTemplate(): void {
  const columns: ColumnDefinition[] = [
    { header: 'Nama Peternak', key: 'ownerName', width: 22, align: 'left' },
    { header: 'Nama Sapi', key: 'cattleName', width: 20, align: 'left' },
    { header: 'Kecamatan', key: 'kecamatan', width: 18, align: 'left' },
    { header: 'Desa', key: 'desa', width: 18, align: 'left' },
    { header: 'Tanggal IB (YYYY-MM-DD)', key: 'date', width: 22, align: 'center' },
    { header: 'Jam IB', key: 'time', width: 12, align: 'center' },
    { header: 'Nama Inseminator', key: 'inseminatorName', width: 22, align: 'left' },
    { header: 'Kode Straw', key: 'strawCode', width: 18, align: 'center' },
    { header: 'Nama Pejantan', key: 'bullName', width: 20, align: 'left' },
    { header: 'Ras Pejantan', key: 'bullBreed', width: 18, align: 'left' },
    { header: 'Hasil PKB (Opsional)', key: 'pkbResult', width: 20, align: 'center' },
    { header: 'Catatan IB (Opsional)', key: 'notes', width: 35, align: 'left' },
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  const sampleRows: any[][] = [
    [
      'H. Budi Santoso',
      'Si Manis',
      'Kebumen',
      'Panjer',
      todayStr,
      '08:30',
      'Karyono, S.Pt',
      'SM-2026-041',
      'Bima Simmental',
      'Simmental',
      'Bunting',
      'Pelayanan IB birahi normal pagi hari',
    ],
    [
      'Ahmad Ridwan',
      'Si Cantik',
      'Gombong',
      'Wonokriyo',
      todayStr,
      '09:15',
      'Joko Susilo',
      'LM-2026-018',
      'Gatotkaca',
      'Limousine',
      '-',
      'Birahi estrus terdeteksi peternak',
    ],
    [
      'Siti Maryam',
      'Gading',
      'Klirong',
      'Kradenan',
      todayStr,
      '10:00',
      'Budi Santoso',
      'PO-2026-005',
      'Arjuna PO',
      'PO',
      'Bunting',
      'Kondisi reproduksi sehat',
    ],
    [
      'Pak Slamet',
      'Larasati',
      'Prembun',
      'Bagung',
      todayStr,
      '11:20',
      'Rahmat Hidayat',
      'BR-2026-012',
      'Brahman Perkasa',
      'Brahman',
      '-',
      'Pelayanan IB poskeswan wilayah',
    ],
  ];

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Nama Peternak',
      deskripsi: 'Nama lengkap peternak pemilik sapi betina akseptor.',
    },
    {
      judul: 'Nama Sapi',
      deskripsi: 'Nama panggilan atau nomor eartag sapi akseptor.',
    },
    {
      judul: 'Kecamatan & Desa',
      deskripsi: 'Lokasi domisili kandang sapi di Kabupaten Kebumen.',
      pilihan: [
        'Ayah', 'Buayan', 'Puring', 'Petanahan', 'Klirong', 'Buluspesantren',
        'Ambal', 'Mirit', 'Bonorowo', 'Prembun', 'Padureso', 'Kutowinangun',
        'Alian', 'Poncowarno', 'Kebumen', 'Pejagoan', 'Sruweng', 'Adimulyo',
        'Kuwarasan', 'Rowokele', 'Sempor', 'Gombong', 'Karanganyar', 'Karanggayam',
        'Sadang', 'Karangsambung',
      ],
    },
    {
      judul: 'Tanggal IB',
      deskripsi: 'Format tanggal pelaksanaan IB wajib YYYY-MM-DD (Contoh: 2026-11-05).',
    },
    {
      judul: 'Jam IB',
      deskripsi: 'Format jam pelaksanaan (Contoh: 08:30).',
    },
    {
      judul: 'Nama Inseminator',
      deskripsi: 'Nama lengkap petugas inseminator yang melaksanakan IB.',
    },
    {
      judul: 'Kode Straw',
      deskripsi: 'Nomor batch / kode semen beku (straw) yang diinseminasikan.',
    },
    {
      judul: 'Nama & Ras Pejantan',
      deskripsi: 'Identitas pejantan unggul sumber semen beku.',
      pilihan: ['Simmental', 'Limousine', 'PO', 'Brahman', 'Angus', 'Sapi Perah'],
    },
    {
      judul: 'Hasil PKB (Opsional)',
      deskripsi: 'Jika kebuntingan sudah diperiksa isi Bunting atau Tidak Bunting. Jika belum diperiksa isi -.',
      pilihan: ['Bunting', 'Tidak Bunting', '-'],
    },
    {
      judul: 'Catatan IB (Opsional)',
      deskripsi: 'Catatan tambahan seperti kondisi birahi atau perlakuan khusus.',
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN & ATURAN PENGISIAN TEMPLATE INSEMINASI BUATAN (IB)',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Inseminasi_Buatan');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Import_Database_IB_SiMantap.xlsx');
}

/**
 * ── GENERATOR TEMPLATE: DATA POPULASI TERNAK DESA ──
 */
export function downloadPopulasiTernakTemplate(): void {
  const columns: ColumnDefinition[] = [
    { header: 'Triwulan', key: 'tw', width: 12, align: 'center' },
    { header: 'Kecamatan', key: 'kecamatan', width: 18, align: 'left' },
    { header: 'Desa', key: 'desa', width: 18, align: 'left' },
    // Sapi Potong
    { header: 'AJ Sapi', key: 'AJ Sapi', width: 12, align: 'right' },
    { header: 'AB Sapi', key: 'AB Sapi', width: 12, align: 'right' },
    { header: 'MJ Sapi', key: 'MJ Sapi', width: 12, align: 'right' },
    { header: 'MB Sapi', key: 'MB Sapi', width: 12, align: 'right' },
    { header: 'DJ Sapi', key: 'DJ Sapi', width: 12, align: 'right' },
    { header: 'DB Sapi', key: 'DB Sapi', width: 12, align: 'right' },
    // Sapi Perah
    { header: 'AJ Perah', key: 'AJ Perah', width: 12, align: 'right' },
    { header: 'AB Perah', key: 'AB Perah', width: 12, align: 'right' },
    { header: 'MJ Perah', key: 'MJ Perah', width: 12, align: 'right' },
    { header: 'MB Perah', key: 'MB Perah', width: 12, align: 'right' },
    { header: 'DJ Perah', key: 'DJ Perah', width: 12, align: 'right' },
    { header: 'DB Perah', key: 'DB Perah', width: 12, align: 'right' },
    // Kerbau
    { header: 'AJ Kerbau', key: 'AJ Kerbau', width: 12, align: 'right' },
    { header: 'AB Kerbau', key: 'AB Kerbau', width: 12, align: 'right' },
    { header: 'MJ Kerbau', key: 'MJ Kerbau', width: 12, align: 'right' },
    { header: 'MB Kerbau', key: 'MB Kerbau', width: 12, align: 'right' },
    { header: 'DJ Kerbau', key: 'DJ Kerbau', width: 12, align: 'right' },
    { header: 'DB Kerbau', key: 'DB Kerbau', width: 12, align: 'right' },
    // Kuda
    { header: 'AJ Kuda', key: 'AJ Kuda', width: 12, align: 'right' },
    { header: 'AB Kuda', key: 'AB Kuda', width: 12, align: 'right' },
    { header: 'MJ Kuda', key: 'MJ Kuda', width: 12, align: 'right' },
    { header: 'MB Kuda', key: 'MB Kuda', width: 12, align: 'right' },
    { header: 'DJ Kuda', key: 'DJ Kuda', width: 12, align: 'right' },
    { header: 'DB Kuda', key: 'DB Kuda', width: 12, align: 'right' },
    // Kambing
    { header: 'AJ Kambing', key: 'AJ Kambing', width: 12, align: 'right' },
    { header: 'AB Kambing', key: 'AB Kambing', width: 12, align: 'right' },
    { header: 'MJ Kambing', key: 'MJ Kambing', width: 12, align: 'right' },
    { header: 'MB Kambing', key: 'MB Kambing', width: 12, align: 'right' },
    { header: 'DJ Kambing', key: 'DJ Kambing', width: 12, align: 'right' },
    { header: 'DB Kambing', key: 'DB Kambing', width: 12, align: 'right' },
    // Domba
    { header: 'AJ Domba', key: 'AJ Domba', width: 12, align: 'right' },
    { header: 'AB Domba', key: 'AB Domba', width: 12, align: 'right' },
    { header: 'MJ Domba', key: 'MJ Domba', width: 12, align: 'right' },
    { header: 'MB Domba', key: 'MB Domba', width: 12, align: 'right' },
    { header: 'DJ Domba', key: 'DJ Domba', width: 12, align: 'right' },
    { header: 'DB Domba', key: 'DB Domba', width: 12, align: 'right' },
    // Babi
    { header: 'AJ Babi', key: 'AJ Babi', width: 12, align: 'right' },
    { header: 'AB Babi', key: 'AB Babi', width: 12, align: 'right' },
    { header: 'MJ Babi', key: 'MJ Babi', width: 12, align: 'right' },
    { header: 'MB Babi', key: 'MB Babi', width: 12, align: 'right' },
    { header: 'DJ Babi', key: 'DJ Babi', width: 12, align: 'right' },
    { header: 'DB Babi', key: 'DB Babi', width: 12, align: 'right' },
    // Unggas
    { header: 'Ayam Kampung', key: 'Ayam Kampung', width: 14, align: 'right' },
    { header: 'Ayam Petelur', key: 'Ayam Petelur', width: 14, align: 'right' },
    { header: 'Ayam Broiler', key: 'Ayam Broiler', width: 14, align: 'right' },
    { header: 'Puyuh', key: 'Puyuh', width: 12, align: 'right' },
    { header: 'Itik', key: 'Itik', width: 12, align: 'right' },
    { header: 'Entog', key: 'Entog', width: 12, align: 'right' },
    { header: 'Angsa', key: 'Angsa', width: 12, align: 'right' },
    { header: 'Merpati', key: 'Merpati', width: 12, align: 'right' },
    // Aneka Ternak
    { header: 'Kelinci Jantan', key: 'Kelinci Jantan', width: 14, align: 'right' },
    { header: 'Kelinci Betina', key: 'Kelinci Betina', width: 14, align: 'right' },
  ];

  const sampleRows: any[][] = [
    [
      'TW 1', 'KEBUMEN', 'PANJER',
      12, 15, 8, 10, 25, 40, // Sapi Potong
      0, 0, 0, 0, 0, 0,       // Sapi Perah
      0, 0, 0, 0, 0, 0,       // Kerbau
      0, 0, 0, 0, 0, 0,       // Kuda
      20, 25, 15, 18, 30, 50, // Kambing
      10, 15, 8, 12, 15, 25,  // Domba
      0, 0, 0, 0, 0, 0,       // Babi
      450, 0, 1200, 0, 85, 40, 6, 25, // Unggas
      10, 20 // Kelinci
    ],
    [
      'TW 1', 'GOMBONG', 'WONOKRIYO',
      8, 10, 6, 8, 18, 28,  // Sapi Potong
      2, 4, 2, 3, 5, 8,     // Sapi Perah
      0, 0, 0, 0, 0, 0,     // Kerbau
      0, 0, 0, 0, 0, 0,     // Kuda
      15, 20, 10, 12, 22, 35, // Kambing
      5, 8, 4, 6, 10, 15,   // Domba
      0, 0, 0, 0, 0, 0,     // Babi
      380, 0, 800, 0, 60, 30, 4, 15, // Unggas
      6, 12 // Kelinci
    ],
    [
      'TW 1', 'KLIRONG', 'KRADENAN',
      15, 18, 10, 12, 30, 45, // Sapi Potong
      0, 0, 0, 0, 0, 0,       // Sapi Perah
      2, 2, 1, 1, 3, 4,       // Kerbau
      0, 0, 0, 0, 0, 0,       // Kuda
      25, 30, 18, 22, 35, 60, // Kambing
      8, 10, 5, 7, 12, 18,    // Domba
      0, 0, 0, 0, 0, 0,       // Babi
      520, 0, 1500, 0, 110, 50, 8, 30, // Unggas
      8, 15 // Kelinci
    ],
  ];

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Triwulan',
      deskripsi: 'Pilihan triwulan laporan populasi.',
      pilihan: ['TW 1', 'TW 2', 'TW 3', 'TW 4'],
    },
    {
      judul: 'Kecamatan & Desa',
      deskripsi: 'Nama Kecamatan dan Desa domisili data populasi ternak (huruf kapital).',
    },
    {
      judul: 'Kode Ruminansia (AJ, AB, MJ, MB, DJ, DB)',
      deskripsi: 'AJ = Anak Jantan, AB = Anak Betina, MJ = Muda Jantan, MB = Muda Betina, DJ = Dewasa Jantan, DB = Dewasa Betina.',
    },
    {
      judul: 'Unggas & Aneka Ternak',
      deskripsi: 'Masukkan jumlah ekor ternak aktif (angka bulat). Jika populasi di desa tsb nihil, isi angka 0.',
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN & ATURAN PENGISIAN TEMPLATE POPULASI TERNAK',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Populasi_Ternak');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Import_Populasi_Ternak_SiMantap.xlsx');
}

/**
 * 7. Template Import Database Sebaran Farm Peternakan
 */
export function downloadDataFarmTemplate(): void {
  const columns: ColumnDefinition[] = [
    { header: 'Kategori Farm', key: 'kategori', width: 16, align: 'center' },
    { header: 'Jenis Ternak', key: 'hewan', width: 18, align: 'left' },
    { header: 'Nama Unit Farm', key: 'nama_unit_farm', width: 28, align: 'left' },
    { header: 'Nama Badan Usaha / PT / CV', key: 'nama_badan_usaha', width: 28, align: 'left' },
    { header: 'Status Kemitraan', key: 'mandiri_kemitraan', width: 18, align: 'center' },
    { header: 'Kecamatan', key: 'kecamatan', width: 18, align: 'left' },
    { header: 'Desa / Kelurahan', key: 'desa', width: 20, align: 'left' },
    { header: 'Alamat Lengkap', key: 'alamat', width: 35, align: 'left' },
    { header: 'No Telp / HP', key: 'telp_hp', width: 16, align: 'center' },
    { header: 'Kapasitas Kandang (Ekor)', key: 'kapasitas_gudang', width: 22, align: 'right' },
    { header: 'Jumlah Populasi Aktif (Ekor)', key: 'jumlah_populasi', width: 24, align: 'right' },
    { header: 'Bobot Panen Rata-rata (Kg)', key: 'bobot_rata2_panen', width: 24, align: 'right' },
    { header: 'FCR / Konsumsi Pakan', key: 'konsumsi_pakan_fcr', width: 20, align: 'right' },
    { header: 'Status Aktif', key: 'status', width: 14, align: 'center' },
    { header: 'Lintang (Latitude)', key: 'lintang', width: 18, align: 'center' },
    { header: 'Bujur (Longitude)', key: 'bujur', width: 18, align: 'center' },
    { header: 'Catatan', key: 'catatan', width: 30, align: 'left' },
  ];

  const sampleRows: any[][] = [
    [
      'Broiler',
      'Ayam Broiler',
      'Farm Berkah Unggas',
      'PT. Ciomas Adisatwa',
      'Kemitraan',
      'KEBUMEN',
      'Panjer',
      'Dusun Kalijaya RT 02/01',
      '081234567890',
      10000,
      9500,
      '1.85',
      '1.55',
      'Aktif',
      '-7.671234',
      '109.654321',
      'Kandang closed house 2 lantai, ventilasi otomatis',
    ],
    [
      'Petelur',
      'Ayam Petelur',
      'Makmur Telur Sejahtera',
      'CV. Mandiri Telur',
      'Mandiri',
      'GOMBONG',
      'Wonokriyo',
      'Jl. Semondo No. 12',
      '081398765432',
      5000,
      4800,
      '',
      '',
      'Aktif',
      '-7.604567',
      '109.512345',
      'Kandang baterai kawat galvanis, produksi 240 kg telur/hari',
    ],
    [
      'General',
      'Sapi Potong',
      'Lembu Lestari Farm',
      '',
      'Mandiri',
      'AMBAL',
      'Ambalresmi',
      'Dusun Krajan RT 01/02',
      '082145678901',
      50,
      42,
      '',
      '',
      'Aktif',
      '-7.771234',
      '109.734567',
      'Penggemukan sapi PO dan Limosin simental',
    ],
    [
      'General',
      'Domba',
      'Berkah Mendo Farm',
      '',
      'Kelompok',
      'KLIRONG',
      'Kradenan',
      'Dusun Kradenan RT 03/01',
      '085712345678',
      120,
      95,
      '',
      '',
      'Aktif',
      '-7.712345',
      '109.645678',
      'Panggung kayu breeding domba dorper cross & texel',
    ],
  ];

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Kategori Farm',
      deskripsi: 'Pilihan kategori utama farm peternakan di SiMantap.',
      pilihan: ['Broiler', 'Petelur', 'General'],
    },
    {
      judul: 'Jenis Ternak',
      deskripsi: 'Komoditas ternak yang dipelihara.',
      pilihan: ['Ayam Broiler', 'Ayam Petelur', 'Sapi Potong', 'Sapi Perah', 'Domba', 'Kambing', 'Babi', 'Lainnya'],
    },
    {
      judul: 'Status Kemitraan',
      deskripsi: 'Pola pengelolaan usaha farm.',
      pilihan: ['Mandiri', 'Kemitraan', 'Perusahaan', 'Kelompok'],
    },
    {
      judul: 'Kecamatan',
      deskripsi: 'Nama Kecamatan lokasi farm di Kabupaten Kebumen (huruf kapital).',
      pilihan: [
        'Ayah', 'Buayan', 'Puring', 'Petanahan', 'Klirong', 'Buluspesantren',
        'Ambal', 'Mirit', 'Bonorowo', 'Prembun', 'Padureso', 'Kutowinangun',
        'Alian', 'Poncowarno', 'Kebumen', 'Pejagoan', 'Sruweng', 'Adimulyo',
        'Kuwarasan', 'Rowokele', 'Sempor', 'Gombong', 'Karanganyar', 'Karanggayam',
        'Sadang', 'Karangsambung',
      ],
    },
    {
      judul: 'Kapasitas & Populasi',
      deskripsi: 'Isi dengan angka numerik (ekor). Kosongkan atau isi 0 jika belum ada data populasi terkini.',
    },
    {
      judul: 'Koordinat GPS (Lintang & Bujur)',
      deskripsi: 'Format koordinat desimal lintang (negatif, misal: -7.671234) dan bujur (positif, misal: 109.654321). Bersifat opsional.',
    },
    {
      judul: 'Status Aktif',
      deskripsi: 'Status operasional farm saat ini.',
      pilihan: ['Aktif', 'Non-Aktif', 'Tutup Sementara'],
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN & ATURAN PENGISIAN TEMPLATE DATA FARM PETERNAKAN',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Data_Farm');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Import_Data_Farm_SiMantap.xlsx');
}

/**
 * 8. Template Import SKLB (Surat Keterangan Layak Bibit)
 */
export function downloadSklbTemplate(): void {
  // Sheet 1: Master Detail Ternak
  const detailColumns: ColumnDefinition[] = [
    { header: 'Desa Lokasi', key: 'desa_lokasi', width: 20, align: 'left' },
    { header: 'No Urut', key: 'no', width: 10, align: 'center' },
    { header: 'Nama Pemilik / Peternak', key: 'nama_pemilik', width: 28, align: 'left' },
    { header: 'Dusun', key: 'dusun', width: 20, align: 'left' },
    { header: 'RT', key: 'rt', width: 8, align: 'center' },
    { header: 'RW', key: 'rw', width: 8, align: 'center' },
    { header: 'Nama Sapi / Eartag', key: 'nama_sapi', width: 22, align: 'left' },
    { header: 'Jenis Kelamin', key: 'jenis_kelamin', width: 14, align: 'center' },
    { header: 'Kode Pejantan / Bapak', key: 'kode_bapak', width: 22, align: 'left' },
    { header: 'Kode Induk', key: 'kode_induk', width: 22, align: 'left' },
    { header: 'Umur (Bulan)', key: 'umur_bulan', width: 14, align: 'right' },
    { header: 'Tinggi Pundak (cm)', key: 'tinggi_pundak', width: 18, align: 'right' },
    { header: 'Panjang Badan (cm)', key: 'panjang_badan', width: 18, align: 'right' },
    { header: 'Lingkar Dada (cm)', key: 'lingkar_dada', width: 18, align: 'right' },
    { header: 'Berat Badan (kg)', key: 'berat_badan', width: 16, align: 'right' },
  ];

  const detailSampleRows: any[][] = [
    [
      'Candirenggo',
      1,
      'Sutrisno',
      'Krajan',
      '02',
      '01',
      'PO-001 / Si Manis',
      'Betina',
      'STRAW-PO-2023',
      'IND-PO-045',
      24,
      126.5,
      138.0,
      165.0,
      385.0,
    ],
    [
      'Candirenggo',
      2,
      'Budi Santoso',
      'Dukuh Kulon',
      '01',
      '02',
      'PO-002 / Mega',
      'Betina',
      'STRAW-PO-2023',
      'IND-PO-088',
      30,
      128.0,
      142.5,
      172.0,
      415.0,
    ],
    [
      'Panjer',
      1,
      'H. Slamet',
      'Kalisari',
      '03',
      '02',
      'PO-003 / Ronggo',
      'Jantan',
      'STRAW-PO-2022',
      'IND-PO-012',
      36,
      135.0,
      155.0,
      188.0,
      520.0,
    ],
    [
      'Wonokriyo',
      1,
      'Suparno',
      'Semondo Kidul',
      '04',
      '01',
      'PO-004 / Lestari',
      'Betina',
      'STRAW-PO-2024',
      'IND-PO-099',
      18,
      118.0,
      126.0,
      148.0,
      310.0,
    ],
  ];

  // Sheet 2: Rekapitulasi Capaian
  const rekapColumns: ColumnDefinition[] = [
    { header: 'Tahun', key: 'tahun', width: 10, align: 'center' },
    { header: 'Grup / Tim', key: 'grup', width: 14, align: 'center' },
    { header: 'No Urut', key: 'no_urut', width: 10, align: 'center' },
    { header: 'Tanggal Pelaksanaan', key: 'tanggal', width: 20, align: 'center' },
    { header: 'Kecamatan', key: 'kecamatan', width: 18, align: 'left' },
    { header: 'Desa', key: 'desa', width: 20, align: 'left' },
    { header: 'Target (Ekor)', key: 'target', width: 14, align: 'right' },
    { header: 'Capaian (Ekor)', key: 'capaian', width: 14, align: 'right' },
  ];

  const rekapSampleRows: any[][] = [
    [2026, 'Tabel Kiri', 1, '12 Mei 2026', 'AYAH', 'Candirenggo', 50, 48],
    [2026, 'Tabel Kiri', 2, '15 Mei 2026', 'AYAH', 'Jatijajar', 45, 45],
    [2026, 'Tabel Kanan', 1, '18 Mei 2026', 'KEBUMEN', 'Panjer', 60, 58],
    [2026, 'Tabel Kanan', 2, '22 Mei 2026', 'GOMBONG', 'Wonokriyo', 40, 42],
  ];

  const wsDetail = createStyledTemplateWorksheet(detailColumns, detailSampleRows);
  const wsRekap = createStyledTemplateWorksheet(rekapColumns, rekapSampleRows);

  const instructions = [
    {
      judul: 'Master Detail Ternak (Sheet: Detail_Ternak_SKLB)',
      deskripsi: 'Lembar input identitas individu sapi calon bibit dan hasil pengukuran morfometrik (penimbangan & pengukuran tubuh).',
    },
    {
      judul: 'Jenis Kelamin',
      deskripsi: 'Pilihan jenis kelamin sapi yang diukur.',
      pilihan: ['Betina', 'Jantan'],
    },
    {
      judul: 'Satuan Morfometrik',
      deskripsi: 'Umur dalam Bulan, Tinggi Pundak dalam cm, Panjang Badan dalam cm, Lingkar Dada dalam cm, dan Berat Badan dalam kg.',
    },
    {
      judul: 'Rekapitulasi Capaian (Sheet: Rekapitulasi_Capaian)',
      deskripsi: 'Lembar jadwal dan target serta realisasi capaian per desa/kecamatan oleh Tim Penilai SKLB.',
      pilihan: ['Tabel Kiri', 'Tabel Kanan'],
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN & ATURAN PENGISIAN TEMPLATE SKLB KABUPATEN KEBUMEN',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Detail_Ternak_SKLB');
  XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekapitulasi_Capaian');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Import_SKLB_SiMantap.xlsx');
}

/**
 * 9. Template Import Sertifikasi NKV (Nomor Kontrol Veteriner)
 */
export function downloadNkvTemplate(): void {
  const columns: ColumnDefinition[] = [
    { header: 'Nama Usaha / Unit Usaha', key: 'nama_usaha', width: 32, align: 'left' },
    { header: 'Jenis Usaha', key: 'jenis_usaha', width: 24, align: 'left' },
    { header: 'Proses / Tahapan Sertifikasi', key: 'proses', width: 28, align: 'left' },
    { header: 'Tanggal Pembinaan 1', key: 'pembinaan_1', width: 20, align: 'center' },
    { header: 'Hasil Pembinaan 1', key: 'hasil_1', width: 35, align: 'left' },
    { header: 'Tanggal Pembinaan 2', key: 'pembinaan_2', width: 20, align: 'center' },
    { header: 'Hasil Pembinaan 2', key: 'hasil_2', width: 35, align: 'left' },
    { header: 'Pelatihan Higiene Sanitasi', key: 'pelatihan_higiene', width: 30, align: 'left' },
    { header: 'Pengeluaran Rekomendasi', key: 'pengeluaran_rekomendasi', width: 32, align: 'left' },
    { header: 'Keterangan', key: 'keterangan', width: 32, align: 'left' },
  ];

  const sampleRows: any[][] = [
    [
      'RPH Kebumen (UPTD)',
      'RPH Ruminansia',
      'Sertifikasi NKV Tingkat II',
      '14 Maret 2025',
      'Kelayakan dasar & alur sanitasi memenuhi syarat',
      '20 Mei 2025',
      'Perbaikan sarana cold storage telah selesai',
      'Sudah Bersertifikat (2 Juleha & 4 Petugas)',
      'Rekomendasi Diterbitkan (No: 524/112/2025)',
      'Telah terverifikasi Dinas Peternakan Provinsi',
    ],
    [
      'RPH Gombong (UPTD)',
      'RPH Ruminansia',
      'Pembinaan & Audit Lapangan',
      '10 Februari 2025',
      'Penataan drainase limbah cair perlu optimasi',
      '18 Juni 2025',
      'Instalasi IPAL berfungsi optimal',
      'Sudah Bersertifikat (3 Petugas)',
      'Rekomendasi Diterbitkan (No: 524/145/2025)',
      'Menunggu penerbitan nomor resmi provinsi',
    ],
    [
      'TPU Unggas Barokah Petanahan',
      'TPU Unggas',
      'Penerbitan Rekomendasi NKV',
      '05 April 2025',
      'Pemisahan area bersih dan kotor terlaksana',
      '12 Juli 2025',
      'Uji residu & cemaran mikroba nihil',
      'Sudah Bersertifikat (1 Pengelola)',
      'Rekomendasi Diterbitkan (No: 524/189/2025)',
      'NKV Level III Aktif',
    ],
    [
      'UD Berkah Telur Kutowinangun',
      'Gudang Telur Konsumsi',
      'Pengajuan Sertifikasi Baru',
      '22 Januari 2025',
      'Sistem pencatatan batch & suhu ruang diperiksa',
      '15 Agustus 2025',
      'Pendingin dan tata ruang higienis siap audit',
      'Proses Sertifikasi Higiene Sanitasi',
      'Dalam Proses Validasi',
      'Dijadwalkan visitasi tim penilai provinsi',
    ],
  ];

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Nama Usaha / Unit Usaha (Wajib)',
      deskripsi: 'Nama resmi fasilitas usaha pengolahan / distribusi produk hewan (contoh: RPH, TPU, Gudang Telur, Kios Daging).',
    },
    {
      judul: 'Jenis Usaha',
      deskripsi: 'Kategori rantai pasok produk pangan asal hewan.',
      pilihan: [
        'RPH Ruminansia',
        'RPH Unggas / TPU Unggas',
        'RPH Babi',
        'Gudang Telur Konsumsi',
        'Gudang Berpendingin (Cold Storage)',
        'Kios Daging Segar',
        'Unit Pengolahan Daging',
        'Unit Pengolahan Susu',
        'Sarang Burung Walet',
      ],
    },
    {
      judul: 'Proses / Tahapan',
      deskripsi: 'Status tahapan pembinaan dan sertifikasi NKV unit usaha.',
      pilihan: [
        'Pengajuan Sertifikasi Baru',
        'Pembinaan & Audit Lapangan',
        'Perbaikan Temuan Mayor/Minor',
        'Penerbitan Rekomendasi NKV',
        'Sertifikasi NKV Tingkat I',
        'Sertifikasi NKV Tingkat II',
        'Sertifikasi NKV Tingkat III',
        'Surveilans / Perpanjangan NKV',
      ],
    },
    {
      judul: 'Pelatihan Higiene Sanitasi',
      deskripsi: 'Status sertifikasi higiene sanitasi petugas / juru sembelih halal (Juleha).',
    },
    {
      judul: 'Pengeluaran Rekomendasi',
      deskripsi: 'Nomor surat rekomendasi dinas kabupaten atau status penerbitan rekomendasi.',
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN PENGISIAN TEMPLATE NOMOR KONTROL VETERINER (NKV)',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_NKV');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Import_NKV_SiMantap.xlsx');
}

/**
 * 10. Template Import Buku Inventaris Kendaraan Dinas Operasional
 */
export function downloadInventarisKendaraanTemplate(): void {
  const columns: ColumnDefinition[] = [
    { header: 'Nama Pemegang / Penanggung Jawab', key: 'nama_pemegang', width: 32, align: 'left' },
    { header: 'Merk / Type Kendaraan', key: 'merk_type', width: 28, align: 'left' },
    { header: 'Tahun Pembuatan / Perolehan', key: 'tahun', width: 18, align: 'center' },
    { header: 'Nomor Polisi Baru (Plat Aktif)', key: 'nopol_baru', width: 22, align: 'center' },
    { header: 'Nomor Polisi Lama', key: 'nopol_lama', width: 20, align: 'center' },
    { header: 'Nomor Mesin', key: 'nomor_mesin', width: 24, align: 'left' },
    { header: 'Nomor Rangka', key: 'nomor_rangka', width: 26, align: 'left' },
    { header: 'Keterangan / Kondisi', key: 'keterangan', width: 30, align: 'left' },
  ];

  const sampleRows: any[][] = [
    [
      'Kepala Dinas Pertanian & Pangan',
      'Toyota Kijang Innova 2.0 G M/T',
      2021,
      'AA 1 D',
      'AA 1234 AD',
      '1TR-FE8923145',
      'MHF11GB40K0029141',
      'Kendaraan Dinas Operasional Pimpinan',
    ],
    [
      'Kabid Peternakan & Keswan',
      'Toyota Avanza 1.3 E M/T',
      2019,
      'AA 1045 D',
      'AA 9876 AD',
      '1NR-VE7623910',
      'MHF12BB20J0018274',
      'Operasional Bidang Peternakan',
    ],
    [
      'Medik Veteriner / Puskeswan Kebumen',
      'Honda Supra X 125 FI',
      2020,
      'AA 6120 D',
      'AA 4521 AD',
      'JB91E1492014',
      'MH1JB9115LK892301',
      'Pelayanan Lapangan & Vaksinasi',
    ],
    [
      'Petugas Inseminasi Buatan (Ambal)',
      'Honda CB150 Verza',
      2022,
      'AA 6234 D',
      '-',
      'KC52E1093821',
      'MH1KC5217NK029182',
      'Operasional Pelayanan IB Lapangan',
    ],
  ];

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Nama Pemegang / Penanggung Jawab (Wajib)',
      deskripsi: 'Nama pejabat, petugas lapangan, atau unit kerja pemegang kendaraan operasional dinas.',
    },
    {
      judul: 'Merk / Type Kendaraan (Wajib)',
      deskripsi: 'Merk dan tipe kendaraan roda 2 atau roda 4 (contoh: Honda Supra X 125, Toyota Hilux, Yamaha Vixion).',
    },
    {
      judul: 'Nomor Polisi Baru (Wajib)',
      deskripsi: 'Nomor registrasi kendaraan bermotor (plat nomor dinas/aktif saat ini, contoh: AA 1045 D).',
    },
    {
      judul: 'Nomor Mesin & Nomor Rangka',
      deskripsi: 'Nomor identifikasi fisik mesin dan rangka sesuai STNK / BPKB kendaraan.',
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN PENGISIAN TEMPLATE INVENTARIS KENDARAAN DINAS',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Kendaraan');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Import_Inventaris_Kendaraan_SiMantap.xlsx');
}

/**
 * 11. Template Import Pemotongan & Pengawasan Hewan Kurban
 */
export function downloadHewanKurbanTemplate(): void {
  const columns: ColumnDefinition[] = [
    { header: 'Tanggal', key: 'tanggal', width: 14, align: 'center' },
    { header: 'Kecamatan', key: 'kecamatan', width: 18, align: 'left' },
    { header: 'Desa', key: 'desa', width: 20, align: 'left' },
    { header: 'Nama Lokasi', key: 'nama_lokasi', width: 30, align: 'left' },
    { header: 'Jenis Tempat', key: 'jenis_tempat', width: 18, align: 'center' },
    { header: 'Sapi Jantan', key: 'sapi_jantan', width: 14, align: 'right' },
    { header: 'Sapi Betina', key: 'sapi_betina', width: 14, align: 'right' },
    { header: 'Kambing Jantan', key: 'kambing_jantan', width: 16, align: 'right' },
    { header: 'Kambing Betina', key: 'kambing_betina', width: 16, align: 'right' },
    { header: 'Domba Jantan', key: 'domba_jantan', width: 16, align: 'right' },
    { header: 'Domba Betina', key: 'domba_betina', width: 16, align: 'right' },
    { header: 'Kerbau Jantan', key: 'kerbau_jantan', width: 16, align: 'right' },
    { header: 'Kerbau Betina', key: 'kerbau_betina', width: 16, align: 'right' },
    { header: 'Keterangan', key: 'keterangan', width: 35, align: 'left' },
  ];

  const sampleRows: any[][] = [
    [
      '2026-06-17',
      'Kebumen',
      'Panjer',
      'Masjid Agung Kebumen',
      'Masjid',
      5,
      0,
      12,
      0,
      3,
      0,
      0,
      0,
      'Pemeriksaan antemortem sehat, bebas cacing hati fasciola hepatica',
    ],
    [
      '2026-06-17',
      'Klirong',
      'Klirong',
      'Musholla Al-Ikhlas',
      'Musholla',
      2,
      0,
      6,
      0,
      1,
      0,
      0,
      0,
      'Kondisi jeroan & karkas layak konsumsi aman ASUH',
    ],
    [
      '2026-06-17',
      'Gombong',
      'Wonokriyo',
      'Halaman RPH-R Gombong',
      'RPH-R',
      8,
      0,
      15,
      0,
      4,
      0,
      0,
      0,
      'Penyembelihan oleh Juleha tersertifikasi, higienis optimal',
    ],
    [
      '2026-06-18',
      'Petanahan',
      'Petanahan',
      'Masjid Baiturrahman',
      'Masjid',
      3,
      0,
      10,
      0,
      2,
      0,
      0,
      0,
      'Hari Tasyrik ke-1, pemotongan berjalan lancar dan tertib',
    ],
  ];

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Tanggal Pemotongan (Format YYYY-MM-DD)',
      deskripsi: 'Tanggal pelaksanaan penyembelihan kurban (misal Hari Raya Idul Adha atau Hari Tasyrik).',
    },
    {
      judul: 'Kecamatan & Desa (Wajib)',
      deskripsi: 'Lokasi administratif kecamatan dan desa tempat pemotongan kurban berlangsung di Kabupaten Kebumen.',
    },
    {
      judul: 'Jenis Tempat',
      deskripsi: 'Kategori fasilitas tempat pemotongan kurban.',
      pilihan: ['Masjid', 'Musholla', 'RPH-R', 'Lapangan', 'Sekolah', 'Rumah Warga', 'Lainnya'],
    },
    {
      judul: 'Jumlah Ternak per Spesies & Kelamin',
      deskripsi: 'Isi jumlah ekor ternak yang disembelih (angka bulat). Jika nihil, isi 0.',
    },
    {
      judul: 'Keterangan Pemeriksaan',
      deskripsi: 'Catatan pengawasan kesehatan hewan kurban oleh tim Kesmavet (antemortem/postmortem).',
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN PENGISIAN TEMPLATE PEMOTONGAN HEWAN KURBAN',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Hewan_Kurban');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Import_Hewan_Kurban_SiMantap.xlsx');
}

/**
 * Download Template Excel Lalu Lintas Ternak (Kategori Pemasukan & Pengeluaran)
 * Standar SiMantap dengan styling xlsx-js-style & petunjuk pengisian.
 */
export function downloadLalinTernakTemplate(): void {
  const columns: ColumnDefinition[] = [
    { header: 'Kategori', key: 'kategori', width: 16, align: 'center' },
    { header: 'Pasar Hewan', key: 'wilayah', width: 16, align: 'center' },
    { header: 'Tanggal Pengiriman', key: 'tanggal_pengiriman', width: 20, align: 'center' },
    { header: 'No. SKKH', key: 'no_skkh', width: 24, align: 'left' },
    { header: 'Nama Pemilik', key: 'nama_pemilik', width: 24, align: 'left' },
    { header: 'Alamat Pemilik', key: 'alamat_pemilik', width: 32, align: 'left' },
    { header: 'Jenis Ternak', key: 'jenis_ternak', width: 16, align: 'center' },
    { header: 'Umur', key: 'umur', width: 10, align: 'center' },
    { header: 'Satuan Umur', key: 'satuan_umur', width: 14, align: 'center' },
    { header: 'Jumlah Jantan', key: 'jumlah_jantan', width: 14, align: 'right' },
    { header: 'Jumlah Betina', key: 'jumlah_betina', width: 14, align: 'right' },
    { header: 'Satuan Jumlah', key: 'satuan_jumlah', width: 14, align: 'center' },
    { header: 'Asal Ternak', key: 'asal_ternak', width: 24, align: 'left' },
    { header: 'Tujuan Ternak', key: 'tujuan_ternak', width: 24, align: 'left' },
    { header: 'Keterangan', key: 'ket', width: 32, align: 'left' },
  ];

  const sampleRows: (string | number | null)[][] = [
    [
      'Pemasukkan',
      'Kebumen',
      '2026-11-06',
      '524.3/102/SKKH/XI/2026',
      'Sutrisno',
      'Desa Karanganyar RT 02/03, Karanganyar',
      'Sapi',
      2,
      'tahun',
      5,
      0,
      'ekor',
      'Kab. Boyolali',
      'Pasar Hewan Kebumen',
      'Kondisi klinis sehat, SKKH terlampir',
    ],
    [
      'Pengeluaran',
      'Gombong',
      '2026-11-06',
      '524.3/103/SKKH/XI/2026',
      'Budi Santoso',
      'Kelurahan Gombong RT 01/04, Gombong',
      'Kambing',
      1,
      'tahun',
      8,
      4,
      'ekor',
      'Pasar Hewan Gombong',
      'Kab. Cilacap',
      'Pengiriman ternak potong',
    ],
    [
      'Pemasukkan',
      'Kebumen',
      '2026-11-07',
      '',
      'H. Ahmad Syarif',
      'Desa Muktisari RT 01/01, Kebumen',
      'Domba',
      2,
      'tahun',
      0,
      6,
      'ekor',
      'Kab. Magelang',
      'Pasar Hewan Kebumen',
      'Bibit domba, kondisi aktif dan sehat',
    ],
  ];

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Kategori Lalu Lintas (Wajib)',
      deskripsi: 'Pilihan jenis pergerakan ternak. Tulis tepat sesuai pilihan.',
      pilihan: ['Pemasukkan', 'Pengeluaran'],
    },
    {
      judul: 'Pasar Hewan (Wajib)',
      deskripsi: 'Wilayah pasar hewan pos pengawasan di Kabupaten Kebumen.',
      pilihan: ['Kebumen', 'Gombong'],
    },
    {
      judul: 'Tanggal Pengiriman (Format YYYY-MM-DD)',
      deskripsi: 'Tanggal ternak masuk/keluar pasar hewan (contoh: 2026-11-06).',
    },
    {
      judul: 'Nomor SKKH',
      deskripsi: 'Nomor Surat Keterangan Kesehatan Hewan. Kosongkan jika belum diterbitkan.',
    },
    {
      judul: 'Nama & Alamat Pemilik (Wajib)',
      deskripsi: 'Nama peternak/pedagang dan alamat lengkap domisili pengirim.',
    },
    {
      judul: 'Jenis Ternak (Wajib)',
      deskripsi: 'Komoditas ternak yang dilalulintaskan.',
      pilihan: ['Sapi', 'Kambing', 'Domba', 'Kerbau', 'Kuda', 'Babi', 'Lainnya'],
    },
    {
      judul: 'Jumlah Jantan & Betina (Wajib)',
      deskripsi: 'Isi jumlah ekor ternak jantan dan betina dengan angka bulat. Jika tidak ada, isi 0.',
    },
    {
      judul: 'Asal & Tujuan Ternak',
      deskripsi: 'Daerah asal ternak diberangkatkan dan kota/kabupaten tujuan akhir.',
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN PENGISIAN TEMPLATE LALU LINTAS TERNAK',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Lalu_Lintas');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Lalu_Lintas_Ternak_SiMantap.xlsx');
}

/**
 * 13. Template Import Pencatatan Pasar Hewan (Timbang & PKB)
 * Standar SiMantap dengan styling xlsx-js-style & petunjuk pengisian.
 */
export function downloadPasarHewanTemplate(): void {
  const columns: ColumnDefinition[] = [
    { header: 'Tanggal', key: 'tanggal', width: 14, align: 'center' },
    { header: 'Pasar', key: 'pasar', width: 14, align: 'center' },
    { header: 'Nama Pemilik', key: 'nama_pemilik', width: 24, align: 'left' },
    { header: 'Jenis Ternak', key: 'jenis_ternak', width: 16, align: 'center' },
    { header: 'Berat Badan (KG)', key: 'bb', width: 18, align: 'right' },
    { header: 'Warna Ternak', key: 'warna', width: 16, align: 'left' },
    { header: 'Layanan', key: 'layanan', width: 18, align: 'center' },
    { header: 'Hasil PKB', key: 'hasil_pkb', width: 16, align: 'center' },
    { header: 'Status Retribusi', key: 'sudah_bayar', width: 16, align: 'center' },
    { header: 'Keterangan', key: 'keterangan', width: 32, align: 'left' },
  ];

  const sampleRows: any[][] = [
    [
      '2026-11-06',
      'Kebumen',
      'H. Mulyadi',
      'Sapi',
      450.5,
      'Simental',
      'Timbang + PKB',
      'Bunting',
      'Lunas',
      'Sapi bunting 4 bulan, kondisi sehat bugar',
    ],
    [
      '2026-11-06',
      'Kebumen',
      'Sutrisno',
      'Sapi',
      385.0,
      'Hitam',
      'Timbang',
      '',
      'Lunas',
      'Sapi jantan pedaging siap potong',
    ],
    [
      '2026-11-06',
      'Gombong',
      'Ahmad Fauzi',
      'Kambing',
      42.0,
      'Coklat Putih',
      'Timbang',
      '',
      'Lunas',
      'Kambing jawa randu jantan',
    ],
  ];

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Tanggal Pemeriksaan (Format YYYY-MM-DD)',
      deskripsi: 'Tanggal pelayanan timbang atau PKB di pasar hewan (contoh: 2026-11-06).',
    },
    {
      judul: 'Pasar Hewan (Wajib)',
      deskripsi: 'Lokasi pos pasar hewan di Kabupaten Kebumen.',
      pilihan: ['Kebumen', 'Gombong'],
    },
    {
      judul: 'Nama Pemilik / Pedagang (Wajib)',
      deskripsi: 'Nama pemilik atau pedagang yang membawa ternak ke pos timbang/PKB.',
    },
    {
      judul: 'Jenis Ternak (Wajib)',
      deskripsi: 'Komoditas ternak yang diperiksa.',
      pilihan: ['Sapi', 'Kambing', 'Domba', 'Kerbau'],
    },
    {
      judul: 'Berat Badan (BB) dalam KG',
      deskripsi: 'Hasil pengukuran timbangan ternak hidup (angka desimal/bulat). Jika layanan hanya PKB, boleh dikosongkan.',
    },
    {
      judul: 'Warna Ternak (Wajib)',
      deskripsi: 'Ciri warna bulu dominan ternak (contoh: Hitam, Putih, Merah, Simental, PO, dll).',
    },
    {
      judul: 'Layanan Pasar Hewan (Wajib)',
      deskripsi: 'Jenis jasa/pelayanan yang diberikan kepada ternak.',
      pilihan: ['Timbang', 'Timbang + PKB', 'PKB'],
    },
    {
      judul: 'Hasil Pemeriksaan Kebuntingan (PKB)',
      deskripsi: 'Wajib diisi jika layanan "Timbang + PKB" atau "PKB". Kosongkan jika layanan hanya "Timbang".',
      pilihan: ['Bunting', 'Tidak Bunting'],
    },
    {
      judul: 'Status Retribusi',
      deskripsi: 'Keterangan pembayaran retribusi pasar hewan.',
      pilihan: ['Lunas', 'Belum Lunas'],
    },
    {
      judul: 'Keterangan',
      deskripsi: 'Catatan tambahan terkait kondisi fisik ternak atau catatan petugas.',
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN PENGISIAN TEMPLATE PENCATATAN PASAR HEWAN',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Pasar_Hewan');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Pencatatan_Pasar_Hewan_SiMantap.xlsx');
}

/**
 * 14. Template Import Kapasitas & Daya Dukung Pakan Ternak (26 Kecamatan)
 * Standar SiMantap dengan styling xlsx-js-style & petunjuk pengisian.
 */
export function downloadPakanTernakTemplate(tahun: number = new Date().getFullYear()): void {
  const columns: ColumnDefinition[] = [
    { header: 'Kecamatan', key: 'kecamatan', width: 22, align: 'left' },
    { header: 'Potensi Pakan (kg)', key: 'potensi_pakan_kg', width: 22, align: 'right' },
    { header: 'Kapasitas Tampung (ekor)', key: 'kapasitas_tampung_ekor', width: 24, align: 'right' },
    { header: 'Jumlah Ternak Sekarang (ST)', key: 'jumlah_ternak_st', width: 28, align: 'right' },
    { header: 'Keterangan', key: 'keterangan', width: 35, align: 'left' },
  ];

  const KECAMATAN_26 = [
    'AYAH',
    'BUAYAN',
    'PURING',
    'PETANAHAN',
    'KLIRONG',
    'BULUSPESANTREN',
    'AMBAL',
    'MIRIT',
    'BONOROWO',
    'PREMBUN',
    'PADURESO',
    'KUTOWINANGUN',
    'ALIAN',
    'PONCOWARNO',
    'KEBUMEN',
    'PEJAGOAN',
    'SRUWENG',
    'ADIMULYO',
    'KUWARASAN',
    'ROWOKELE',
    'SEMPOR',
    'GOMBONG',
    'KARANGANYAR',
    'KARANGGAYAM',
    'SADANG',
    'KARANGSAMBUNG',
  ];

  const sampleRows: any[][] = KECAMATAN_26.map((kec, idx) => {
    // Berikan contoh data realistis untuk 3 baris pertama, sisanya default 0
    if (idx === 0) return [kec, 6085.92, 5338.53, 5458.94, 'Kondisi defisit pakan hijauan di wilayah pesisir'];
    if (idx === 1) return [kec, 7170.82, 6290.20, 2242.14, 'Surplus pakan perkebunan dan tegalan'];
    if (idx === 2) return [kec, 5520.40, 4830.00, 3120.50, 'Potensi jerami padi melimpah'];
    return [kec, 0, 0, 0, ''];
  });

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Kecamatan (26 Kecamatan Kabupaten Kebumen)',
      deskripsi: 'Nama kecamatan sudah terdaftar otomatis (26 Kecamatan). Jangan mengubah atau menghapus nama kecamatan.',
    },
    {
      judul: 'Potensi Pakan (kg)',
      deskripsi: 'Estimasi total ketersediaan bahan pakan hijauan dan limbah pertanian dalam kilogram (kg) per tahun.',
    },
    {
      judul: 'Kapasitas Tampung (ekor)',
      deskripsi: 'Daya tampung maksimal populasi ternak ruminansia berdasarkan potensi pakan yang tersedia.',
    },
    {
      judul: 'Jumlah Ternak Sekarang (Satuan Ternak / ST)',
      deskripsi: 'Populasi ternak riil di lapangan yang telah dikonversi ke Satuan Ternak (ST). 1 ST setara 1 ekor sapi dewasa.',
    },
    {
      judul: 'Perhitungan Otomatis Sistem',
      deskripsi: 'Sistem SiMantap akan secara otomatis menghitung Potensi Penambahan (ST) = Kapasitas Tampung - Jumlah Ternak, serta menentukan Status (Surplus jika >= 0, Defisit jika < 0).',
    },
    {
      judul: 'Keterangan',
      deskripsi: 'Catatan tambahan pengawasan pakan, hambatan ketersediaan pakan, atau potensi sentra hijauan pakan ternak (HPT).',
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    `PANDUAN PENGISIAN TEMPLATE KAPASITAS PAKAN TERNAK TAHUN ${tahun}`,
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Kapasitas_Pakan');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, `Template_Kapasitas_Pakan_Ternak_Kebumen_${tahun}_SiMantap.xlsx`);
}

/**
 * 15. Template Import Pelayanan Jasa Medik Veteriner Puskeswan
 * Standar SiMantap dengan styling xlsx-js-style & petunjuk pengisian.
 */
export function downloadPelayananMedikTemplate(): void {
  const columns: ColumnDefinition[] = [
    { header: 'Tanggal', key: 'tanggal', width: 14, align: 'center' },
    { header: 'Puskeswan', key: 'puskeswan', width: 16, align: 'center' },
    { header: 'Nama Pemilik', key: 'nama_pemilik', width: 22, align: 'left' },
    { header: 'Alamat', key: 'alamat', width: 30, align: 'left' },
    { header: 'Jenis Hewan', key: 'jenis_hewan', width: 16, align: 'center' },
    { header: 'Jenis Kelamin', key: 'jenis_kelamin', width: 14, align: 'center' },
    { header: 'Umur', key: 'umur', width: 14, align: 'center' },
    { header: 'Diagnosa Penyakit', key: 'diagnosa_nama', width: 22, align: 'left' },
    { header: 'Tindakan / Layanan', key: 'layanan_terpilih', width: 26, align: 'left' },
    { header: 'Total Retribusi (Rp)', key: 'total_retribusi', width: 18, align: 'right' },
    { header: 'Luar Jam Kerja', key: 'is_luar_jam_kerja', width: 16, align: 'center' },
    { header: 'Catatan Anamnesa', key: 'catatan', width: 32, align: 'left' },
  ];

  const sampleRows: any[][] = [
    [
      '2026-11-06',
      'KEBUMEN',
      'Sugeng Widodo',
      'Desa Muktisari RT 02/01, Kebumen',
      'Sapi',
      'Jantan',
      '2 tahun',
      'Helminthiasis',
      'Pemeriksaan Klinis, Pemberian Antelmintik',
      25000,
      'Tidak',
      'Kondisi lesu, nafsu makan menurun',
    ],
    [
      '2026-11-06',
      'GOMBONG',
      'Nurul Hidayah',
      'Kelurahan Gombong RT 03/02, Gombong',
      'Kucing',
      'Betina',
      '1 tahun',
      'Scabies',
      'Pemeriksaan Klinis, Injeksi Ivermectin',
      20000,
      'Tidak',
      'Keropeng di daun telinga',
    ],
    [
      '2026-11-06',
      'KLIRONG',
      'Bambang Irawan',
      'Desa Klegenrejo RT 01/03, Klirong',
      'Kambing',
      'Jantan',
      '1.5 tahun',
      'Sehat',
      'Pemeriksaan Kesehatan Rutin',
      15000,
      'Tidak',
      'Kondisi bugar, nafsu makan baik',
    ],
  ];

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Tanggal Pelayanan (Format YYYY-MM-DD)',
      deskripsi: 'Tanggal pemeriksaan atau pelayanan klinik hewan (contoh: 2026-11-06).',
    },
    {
      judul: 'Puskeswan (Wajib)',
      deskripsi: 'Pusat Kesehatan Hewan tempat pelayanan dilaksanakan.',
      pilihan: ['MIRIT', 'KLIRONG', 'GOMBONG', 'BUAYAN', 'ALIAN', 'PREMBUN', 'KEBUMEN', 'KARANGANYAR'],
    },
    {
      judul: 'Nama & Alamat Pemilik (Wajib)',
      deskripsi: 'Nama lengkap peternak/pemilik dan alamat domisili (desa, kecamatan).',
    },
    {
      judul: 'Jenis Hewan & Kelamin (Wajib)',
      deskripsi: 'Spesies pasien hewan (Sapi, Kambing, Domba, Kucing, Anjing, Kerbau, dll) dan kelamin (Jantan / Betina).',
    },
    {
      judul: 'Diagnosa Penyakit',
      deskripsi: 'Hasil diagnosa dokter hewan / paramedis veteriner (misal: Scabies, Helminthiasis, BEF, Myiasis, Sehat).',
    },
    {
      judul: 'Tindakan / Layanan & Retribusi',
      deskripsi: 'Deskripsi pengobatan/tindakan medis dan total tarif retribusi dalam rupiah (angka bulat tanpa titik/koma).',
    },
    {
      judul: 'Luar Jam Kerja',
      deskripsi: 'Isi "Ya" jika pelayanan panggilan darurat di luar jam operasional (retribusi Rp 0), atau "Tidak" untuk jam normal.',
      pilihan: ['Ya', 'Tidak'],
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN PENGISIAN TEMPLATE PELAYANAN PUSKESWAN',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Pelayanan_Puskeswan');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Pelayanan_Puskeswan_SiMantap.xlsx');
}

/**
 * 16. Template Import Log Aktivitas & Pembinaan KTT (Kelompok Tani Ternak)
 * Standar SiMantap dengan styling xlsx-js-style & petunjuk pengisian.
 */
export function downloadKegiatanKttTemplate(): void {
  const columns: ColumnDefinition[] = [
    { header: 'Tanggal', key: 'tanggal', width: 14, align: 'center' },
    { header: 'Nama Kelompok (KTT)', key: 'nama_ktt', width: 28, align: 'left' },
    { header: 'Kecamatan', key: 'kecamatan', width: 18, align: 'left' },
    { header: 'Desa', key: 'desa', width: 18, align: 'left' },
    { header: 'Tim Pelaksana', key: 'tim_pelaksana', width: 18, align: 'center' },
    { header: 'Nama Kegiatan', key: 'nama_kegiatan', width: 34, align: 'left' },
    { header: 'Hasil Pendampingan / Kegiatan', key: 'hasil_kegiatan', width: 42, align: 'left' },
  ];

  const sampleRows: any[][] = [
    [
      '2026-11-06',
      'KTT Lembu Seto',
      'Prembun',
      'Tersobo',
      'Tim Bitpro',
      'Pembinaan Manajemen Kelompok & Kandang',
      'Evaluasi sanitasi kandang koloni dan pencatatan buku kas kelompok ternak.',
    ],
    [
      '2026-11-06',
      'KTT Berkah Ternak',
      'Klirong',
      'Klegenrejo',
      'Tim Keswan',
      'Monitoring Populasi & Kesehatan Ternak',
      'Pemeriksaan kesehatan sapi potong 24 ekor, seluruh ternak bugar dan bebas PMK.',
    ],
    [
      '2026-11-07',
      'KTT Maju Makmur',
      'Ayah',
      'Argopeni',
      'Tim Bitpro',
      'Pendampingan Pakan & Hijauan Makanan Ternak (HMT)',
      'Pelatihan pembuatan silase hijauan jagung dan penanaman rumput odot di lahan kelompok.',
    ],
  ];

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Tanggal Kegiatan (Format YYYY-MM-DD)',
      deskripsi: 'Tanggal pelaksanaan pendampingan atau pembinaan KTT (contoh: 2026-11-06).',
    },
    {
      judul: 'Nama Kelompok (KTT) (Wajib)',
      deskripsi: 'Nama kelompok tani ternak di Kebumen. Sistem akan otomatis mencocokkan ke master data KTT.',
    },
    {
      judul: 'Kecamatan & Desa',
      deskripsi: 'Lokasi kelompok ternak. Jika dikosongkan, sistem akan mengambil otomatis dari master data KTT.',
    },
    {
      judul: 'Tim Pelaksana (Wajib)',
      deskripsi: 'Pilihan tim dinas pelaksana kegiatan.',
      pilihan: ['Tim Bitpro', 'Tim Keswan', 'Tim Kesmavet', 'Puskeswan'],
    },
    {
      judul: 'Nama Kegiatan (Wajib)',
      deskripsi: 'Uraian jenis kegiatan/pembinaan (misal: Pembinaan Manajemen Kelompok, Monitoring Populasi, dll).',
    },
    {
      judul: 'Hasil Pendampingan / Kegiatan (Wajib)',
      deskripsi: 'Uraian hasil evaluasi, pencapaian, atau tindak lanjut kegiatan pembinaan di lapangan.',
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN PENGISIAN TEMPLATE LOG KEGIATAN KTT',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Kegiatan_KTT');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Log_Kegiatan_KTT_SiMantap.xlsx');
}

/**
 * 17. Template Import Data Monitoring & Evaluasi KTT (Monev KTT)
 * Standar SiMantap dengan styling xlsx-js-style & petunjuk pengisian.
 */
export function downloadMonevKttTemplate(tahun?: string): void {
  const currentYear = tahun || String(new Date().getFullYear());
  const columns: ColumnDefinition[] = [
    { header: 'Tahun Bantuan', key: 'tahun', width: 14, align: 'center' },
    { header: 'Nama KTT', key: 'nama_ktt', width: 28, align: 'left' },
    { header: 'Nama Ketua', key: 'nama_ketua', width: 20, align: 'left' },
    { header: 'Kecamatan', key: 'kecamatan', width: 18, align: 'left' },
    { header: 'Desa', key: 'desa', width: 18, align: 'left' },
    { header: 'Jenis Ternak', key: 'jenis_ternak', width: 16, align: 'center' },
    { header: 'Betina (B)', key: 'betina', width: 12, align: 'right' },
    { header: 'Jantan (J)', key: 'jantan', width: 12, align: 'right' },
    { header: 'Bibit Odot (Stek)', key: 'bibit_odot', width: 16, align: 'right' },
    { header: 'Obat (Paket)', key: 'obat_paket', width: 14, align: 'right' },
    { header: 'Anak Lahir', key: 'anak_lahir', width: 12, align: 'right' },
    { header: 'Anak Mati', key: 'anak_mati', width: 12, align: 'right' },
    { header: 'Anak Dijual', key: 'anak_dijual', width: 12, align: 'right' },
    { header: 'Pokok Mati', key: 'pokok_mati', width: 12, align: 'right' },
    { header: 'Pokok Potong Paksa', key: 'pokok_potong_paksa', width: 18, align: 'right' },
    { header: 'Pokok Dijual', key: 'pokok_dijual', width: 12, align: 'right' },
    { header: 'Beli Pengganti', key: 'beli_pengganti', width: 14, align: 'right' },
    { header: 'Kondisi Waktu Monev', key: 'waktu_monev', width: 18, align: 'center' },
    { header: 'Keterangan / Sumber Dana', key: 'keterangan', width: 32, align: 'left' },
    { header: 'Latitude', key: 'lat', width: 14, align: 'center' },
    { header: 'Longitude', key: 'lng', width: 14, align: 'center' },
  ];

  const sampleRows: any[][] = [
    [
      currentYear,
      'KTT Berkah Makmur',
      'Budi Santoso',
      'Buayan',
      'Jladri',
      'Sapi',
      10,
      2,
      500,
      1,
      2,
      0,
      0,
      0,
      0,
      0,
      0,
      '2026-11-06',
      'Bantuan APBD Kabupaten Kebumen',
      -7.712345,
      109.456789,
    ],
    [
      '2025',
      'KTT Lembu Sejahtera',
      'Ahmad Fauzi',
      'Puring',
      'Sitiadi',
      'Kambing',
      15,
      3,
      0,
      1,
      4,
      1,
      0,
      0,
      0,
      0,
      0,
      '2026-11-06',
      'Bantuan Hibah Provinsi Jawa Tengah',
      -7.684123,
      109.512345,
    ],
    [
      currentYear,
      'KTT Maju Makmur',
      'Slamet Riyadi',
      'Klirong',
      'Klegenrejo',
      'Domba',
      20,
      4,
      250,
      1,
      3,
      0,
      0,
      0,
      0,
      0,
      0,
      '2026-11-07',
      'Bantuan Pokir DPRD',
      '',
      '',
    ],
  ];

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Tahun Bantuan (Wajib)',
      deskripsi: 'Tahun penganggaran atau penyaluran bantuan ternak (contoh: 2026, 2025, dst).',
    },
    {
      judul: 'Nama KTT & Nama Ketua (Wajib)',
      deskripsi: 'Nama kelompok tani ternak penerima hibah dan nama ketua kelompok saat ini.',
    },
    {
      judul: 'Kecamatan & Desa (Wajib)',
      deskripsi: 'Wilayah lokasi kandang kelompok ternak di Kabupaten Kebumen.',
    },
    {
      judul: 'Jenis Ternak (Wajib)',
      deskripsi: 'Komoditas ternak yang dimonitoring.',
      pilihan: ['Sapi', 'Kambing', 'Domba', 'Ayam KUB', 'Ayam Petelur'],
    },
    {
      judul: 'Populasi Awal Bantuan (Wajib)',
      deskripsi: 'Isi jumlah ekor ternak Betina (B) dan Jantan (J), bibit odot (stek), dan paket obat yang diterima saat hibah disalurkan.',
    },
    {
      judul: 'Dinamika Populasi & Mutasi Ternak',
      deskripsi: 'Isi jumlah anak lahir, anak mati, anak dijual, pokok mati bangkai, pokok potong paksa, pokok dijual, dan beli pengganti dengan angka bulat (isi 0 jika tidak ada mutasi).',
    },
    {
      judul: 'Kondisi Waktu Monev',
      deskripsi: 'Waktu atau tanggal pelaksanaan monitoring lapangan (format YYYY-MM-DD atau teks bulan).',
    },
    {
      judul: 'Latitude & Longitude',
      deskripsi: 'Koordinat titik GPS lokasi kandang (opsional, desimal minus, contoh: -7.712345, 109.456789).',
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN PENGISIAN TEMPLATE MONEV KTT',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Monev_KTT');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, `Template_Monev_KTT_${currentYear}_SiMantap.xlsx`);
}

/**
 * 18. Template Import Logistik Masuk Gudang Dinas (Dropping Logistik Obat & Vaksin)
 * Standar SiMantap dengan styling xlsx-js-style & petunjuk pengisian.
 */
export function downloadStokGudangDroppingTemplate(): void {
  const columns: ColumnDefinition[] = [
    { header: 'Tahun Anggaran', key: 'tahun', width: 14, align: 'center' },
    { header: 'Bulan', key: 'bulan', width: 14, align: 'center' },
    { header: 'Nama Produk / Obat', key: 'nama_barang', width: 28, align: 'left' },
    { header: 'Kategori', key: 'kategori', width: 16, align: 'center' },
    { header: 'Satuan Kemasan', key: 'satuan_kemasan', width: 16, align: 'center' },
    { header: 'Nomor Batch / Lot', key: 'nomor_batch', width: 18, align: 'center' },
    { header: 'Tanggal Kadaluarsa (EXP)', key: 'tanggal_kadaluarsa', width: 18, align: 'center' },
    { header: 'Sumber Anggaran', key: 'sumber_anggaran', width: 18, align: 'center' },
    { header: 'Jumlah Masuk', key: 'jumlah', width: 14, align: 'right' },
    { header: 'Harga Satuan (Rp)', key: 'harga_satuan', width: 16, align: 'right' },
    { header: 'Petugas Penerima', key: 'yang_menerima', width: 22, align: 'left' },
    { header: 'Distributor / Penyerah', key: 'yang_menyerahkan', width: 26, align: 'left' },
  ];

  const sampleRows: any[][] = [
    [
      2026,
      'November',
      'Vaksin Aftopor PMK',
      'Vaksin',
      'Botol (50 Dosis)',
      'PMK-2026-X01',
      '2027-11-30',
      'APBN',
      200,
      150000,
      'Drh. Ahmad Fauzi',
      'PT. Medion Farma Jaya',
    ],
    [
      2026,
      'November',
      'Ivermectin Injeksi 1%',
      'Obat',
      'Vial (100 ml)',
      'IVM-0925-B',
      '2028-05-15',
      'APBD Kabupaten',
      50,
      85000,
      'Drh. Ahmad Fauzi',
      'PT. Mensana Aneka Satwa',
    ],
    [
      2026,
      'November',
      'Oxytetracycline LA 20%',
      'Obat',
      'Vial (100 ml)',
      'OXY-LA-441',
      '2027-08-20',
      'APBD Provinsi',
      100,
      65000,
      'Drh. Ahmad Fauzi',
      'CV. Berkah Vet Kebumen',
    ],
  ];

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Tahun Anggaran & Bulan (Wajib)',
      deskripsi: 'Tahun pengadaan logistik (contoh: 2026) dan nama bulan kedatangan barang (contoh: November).',
    },
    {
      judul: 'Nama Produk / Obat (Wajib)',
      deskripsi: 'Nama merek dagang obat, vaksin, straw, atau alat kesehatan. Sistem akan otomatis meregistrasi ke Master Barang jika belum terdaftar.',
    },
    {
      judul: 'Kategori (Wajib)',
      deskripsi: 'Kelompok jenis perbekalan kesehatan hewan.',
      pilihan: ['Obat', 'Vaksin', 'Straw', 'Alat'],
    },
    {
      judul: 'Satuan Kemasan (Wajib)',
      deskripsi: 'Bentuk kemasan fisik perbekalan logistik.',
      pilihan: ['Botol', 'Vial', 'Ampul', 'Dosis', 'Box', 'Dus', 'Pcs', 'Sachet'],
    },
    {
      judul: 'Nomor Batch & Tanggal Kadaluarsa (EXP)',
      deskripsi: 'Nomor lot produksi dan batas tanggal kedaluwarsa dari pabrikan (format YYYY-MM-DD, contoh: 2027-12-31) untuk manajemen FEFO.',
    },
    {
      judul: 'Sumber Anggaran (Wajib)',
      deskripsi: 'Asal pembiayaan pengadaan barang.',
      pilihan: ['APBD Kabupaten', 'APBD Provinsi', 'APBN', 'DAK', 'Hibah'],
    },
    {
      judul: 'Jumlah Masuk & Harga Satuan (Wajib)',
      deskripsi: 'Isi jumlah barang masuk dengan angka bulat positif, dan harga satuan dalam rupiah (angka bulat tanpa titik/koma).',
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN PENGISIAN TEMPLATE DROPPING LOGISTIK GUDANG',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template_Dropping_Gudang');
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, 'Template_Dropping_Gudang_Logistik_SiMantap.xlsx');
}

/**
 * 19. Template Import Data Produksi Peternakan (Daging & Telur)
 * Standar SiMantap dengan styling xlsx-js-style & petunjuk pengisian.
 */
export function downloadProduksiTernakTemplate(year?: string): void {
  const currentYear = year || String(new Date().getFullYear());
  const columns: ColumnDefinition[] = [
    { header: 'Kategori', key: 'kategori', width: 14, align: 'center' },
    { header: 'Jenis Komoditas / Ternak', key: 'jenis', width: 24, align: 'left' },
    { header: 'Januari', key: 'jan', width: 13, align: 'right' },
    { header: 'Februari', key: 'feb', width: 13, align: 'right' },
    { header: 'Maret', key: 'mar', width: 13, align: 'right' },
    { header: 'April', key: 'apr', width: 13, align: 'right' },
    { header: 'Mei', key: 'mei', width: 13, align: 'right' },
    { header: 'Juni', key: 'jun', width: 13, align: 'right' },
    { header: 'Juli', key: 'jul', width: 13, align: 'right' },
    { header: 'Agustus', key: 'agt', width: 13, align: 'right' },
    { header: 'September', key: 'sep', width: 13, align: 'right' },
    { header: 'Oktober', key: 'okt', width: 13, align: 'right' },
    { header: 'November', key: 'nov', width: 13, align: 'right' },
    { header: 'Desember', key: 'des', width: 13, align: 'right' },
  ];

  const sampleRows: any[][] = [
    [
      'Daging',
      'Sapi Potong',
      12450.5,
      11800.0,
      14200.0,
      16500.0,
      15100.0,
      18900.0,
      17200.0,
      13800.0,
      14500.0,
      15200.0,
      14900.0,
      16800.0,
    ],
    [
      'Daging',
      'Ayam Broiler',
      45200.0,
      43100.0,
      48500.0,
      52000.0,
      49800.0,
      51200.0,
      50100.0,
      46700.0,
      47900.0,
      48300.0,
      49100.0,
      53400.0,
    ],
    [
      'Daging',
      'Kambing',
      3200.0,
      2900.0,
      3400.0,
      4100.0,
      3800.0,
      4600.0,
      4200.0,
      3100.0,
      3300.0,
      3500.0,
      3400.0,
      3900.0,
    ],
    [
      'Telur',
      'Ayam Petelur',
      68500.0,
      65400.0,
      71200.0,
      74500.0,
      72300.0,
      73100.0,
      71900.0,
      69200.0,
      70500.0,
      71800.0,
      72400.0,
      76200.0,
    ],
    [
      'Telur',
      'Itik / Bebek',
      14200.0,
      13800.0,
      14900.0,
      15600.0,
      15100.0,
      15300.0,
      14800.0,
      14100.0,
      14500.0,
      14700.0,
      14900.0,
      15800.0,
    ],
    [
      'Telur',
      'Puyuh',
      8500.0,
      8100.0,
      8900.0,
      9300.0,
      9100.0,
      9200.0,
      8900.0,
      8400.0,
      8700.0,
      8800.0,
      8900.0,
      9500.0,
    ],
  ];

  const wsTemplate = createStyledTemplateWorksheet(columns, sampleRows);

  const instructions = [
    {
      judul: 'Kategori (Wajib)',
      deskripsi: 'Pilihan jenis produksi peternakan.',
      pilihan: ['Daging', 'Telur'],
    },
    {
      judul: 'Jenis Komoditas / Ternak (Wajib)',
      deskripsi: 'Nama komoditas ternak (misal: Sapi Potong, Ayam Broiler, Kambing, Domba, Ayam Petelur, Itik / Bebek, Puyuh).',
    },
    {
      judul: 'Bulan Januari - Desember (Wajib)',
      deskripsi: 'Jumlah produksi bulanan dalam satuan Kilogram (KG) untuk daging dan Butir/KG untuk telur. Dapat diisi desimal (contoh: 12450.5). Kosongkan atau isi 0 jika belum ada produksi.',
    },
  ];

  const wsPanduan = createInstructionsWorksheet(
    'PANDUAN PENGISIAN TEMPLATE PRODUKSI PETERNAKAN',
    instructions
  );

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsTemplate, `Template_Produksi_${currentYear}`);
  XLSX.utils.book_append_sheet(wb, wsPanduan, 'Petunjuk_Pengisian');

  XLSX.writeFile(wb, `Template_Produksi_Ternak_${currentYear}_SiMantap.xlsx`);
}









