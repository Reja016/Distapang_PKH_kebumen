import * as XLSX from 'xlsx-js-style';

export interface SignatureConfig {
  enabled: boolean;
  kota: string;
  jabatanLine1: string;
  jabatanLine2: string;
  namaPejabat: string;
  pangkat: string;
  nip: string;
}

export const DEFAULT_SIGNATURE_CONFIG: SignatureConfig = {
  enabled: true,
  kota: 'Kebumen',
  jabatanLine1: 'Kepala Bidang Peternakan dan Kesehatan',
  jabatanLine2: 'Hewan',
  namaPejabat: 'drh. MARTI IKE W. E., MP.',
  pangkat: 'Pembina',
  nip: 'NIP. 19770225 200212 2 006',
};

// Cache tanda tangan di client
let cachedSignature: SignatureConfig | null = null;

export async function getSignatureConfig(): Promise<SignatureConfig> {
  if (cachedSignature) return cachedSignature;
  try {
    const res = await fetch('/api/admin/signature-config');
    const json = await res.json();
    if (json.success && json.data) {
      cachedSignature = json.data;
      return json.data;
    }
  } catch {}
  return DEFAULT_SIGNATURE_CONFIG;
}

export function formatTanggalIndonesia(date: Date = new Date()): string {
  const bulanNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const day = date.getDate().toString().padStart(2, '0');
  const month = bulanNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// ── STYLE DEFINITIONS ──
export const BORDER_THIN = {
  top: { style: 'thin', color: { rgb: '000000' } },
  bottom: { style: 'thin', color: { rgb: '000000' } },
  left: { style: 'thin', color: { rgb: '000000' } },
  right: { style: 'thin', color: { rgb: '000000' } },
};

export const HEADER_STYLE = {
  font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: '000000' } },
  fill: { fgColor: { rgb: 'F1F5F9' } }, // Abu-abu muda bersih & elegan
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: BORDER_THIN,
};

export const TITLE_STYLE = {
  font: { name: 'Calibri', sz: 12, bold: true, color: { rgb: '000000' } },
  alignment: { horizontal: 'left', vertical: 'center' },
};

export const DATA_STYLE_BASE = {
  font: { name: 'Calibri', sz: 11, color: { rgb: '000000' } },
  border: BORDER_THIN,
};

export function formatCellValue(val: any): string | number {
  if (val === null || val === undefined || val === '') return '-';
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 'Ya' : 'Tidak';
  if (val instanceof Date) return val.toISOString().split('T')[0];
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch {
      return '-';
    }
  }
  const s = String(val).trim();
  return s === '' ? '-' : s;
}

/**
 * Tambahkan blok tanda tangan resmi ke worksheet yang sudah ada
 * Sekaligus merapikan border tabel, header tebal, dan sel non-kosong.
 */
export async function appendSignatureToWorksheet(
  ws: XLSX.WorkSheet,
  passedSignature?: SignatureConfig,
  customCol?: number
) {
  if (!ws['!ref']) return;
  const range = XLSX.utils.decode_range(ws['!ref']);
  const numCols = range.e.c + 1;

  // 1. Rapikan Tabel Data yang Sudah Ada: Judul Tebal, Border Penuh, Jangan Kosong
  for (let R = range.s.r; R <= range.e.r; ++R) {
    const isHeaderRow = R === 0;
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      let cell = ws[cellRef];

      if (isHeaderRow) {
        if (!cell) {
          cell = { t: 's', v: `Kolom ${C + 1}` };
          ws[cellRef] = cell;
        }
        cell.s = { ...HEADER_STYLE };
      } else {
        if (!cell || cell.v === null || cell.v === undefined || cell.v === '') {
          cell = { t: 's', v: '-' };
          ws[cellRef] = cell;
        }
        const isNum = cell.t === 'n' || typeof cell.v === 'number';
        const isCenterCol = C === 0; // Kolom nomor urut / No
        cell.s = {
          ...DATA_STYLE_BASE,
          alignment: {
            horizontal: isCenterCol ? 'center' : isNum ? 'right' : 'left',
            vertical: 'center',
          },
        };
      }
    }
  }

  // 2. Tambahkan Tanda Tangan Rata Tengah di Kanan Bawah
  const signature = passedSignature || (await getSignatureConfig());
  if (signature.enabled) {
    const signSpan = Math.min(3, numCols);
    const signStartCol = customCol !== undefined ? customCol : Math.max(0, numCols - signSpan);
    const signEndCol = numCols - 1;

    let curRow = range.e.r + 3; // Jarak 2 baris kosong dari tabel

    const tglTitimangsa = `${signature.kota || 'Kebumen'}, ${formatTanggalIndonesia(new Date())}`;
    const signItems = [
      { text: tglTitimangsa, bold: false, underline: false },
      { text: signature.jabatanLine1, bold: false, underline: false },
      { text: signature.jabatanLine2, bold: false, underline: false },
      { text: '', bold: false, underline: false },
      { text: '', bold: false, underline: false },
      { text: '', bold: false, underline: false },
      { text: signature.namaPejabat, bold: true, underline: true },
      { text: signature.pangkat, bold: false, underline: false },
      { text: signature.nip, bold: false, underline: false },
    ];

    ws['!merges'] = ws['!merges'] || [];

    for (const item of signItems) {
      if (item.text) {
        const cellRef = XLSX.utils.encode_cell({ r: curRow, c: signStartCol });
        ws[cellRef] = {
          t: 's',
          v: item.text,
          s: {
            font: {
              name: 'Calibri',
              sz: 11,
              bold: item.bold,
              underline: item.underline,
              color: { rgb: '000000' },
            },
            alignment: { horizontal: 'center', vertical: 'center' },
          },
        };

        // Merge kolom tanda tangan agar teks rata tengah sempurna
        if (signEndCol > signStartCol) {
          ws['!merges'].push({
            s: { r: curRow, c: signStartCol },
            e: { r: curRow, c: signEndCol },
          });
        }
      }
      curRow++;
    }

    range.e.r = Math.max(range.e.r, curRow);
    range.e.c = Math.max(range.e.c, signEndCol);
    ws['!ref'] = XLSX.utils.encode_range(range);
  }

  // 3. Auto-fit kolom
  autoFitWorksheetColumns(ws);
}

/**
 * Otomatis menghitung dan merapikan lebar kolom agar tidak terpotong / ###
 */
export function autoFitWorksheetColumns(ws: XLSX.WorkSheet) {
  if (!ws['!ref']) return;
  const range = XLSX.utils.decode_range(ws['!ref']);
  const colWidths: number[] = [];

  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxLen = 10;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
      if (cell && cell.v !== undefined && cell.v !== null) {
        const str = String(cell.v);
        // Abaikan teks judul atau tanda tangan panjang yang di-merge agar kolom tidak melar berlebihan
        if (str.length > 30) continue;
        maxLen = Math.max(maxLen, str.length);
      }
    }
    colWidths.push(Math.min(Math.max(maxLen + 4, 12), 45));
  }

  ws['!cols'] = colWidths.map((w) => ({ wch: w }));
}

export interface ExportExcelOptions {
  filename: string;
  sheetName?: string;
  title?: string;
  subtitle?: string;
  headers?: string[];
  data?: (string | number | null | undefined)[][];
  rows?: Record<string, any>[];
  signatureConfig?: SignatureConfig;
  includeKop?: boolean;
}

/**
 * Ekspor data ke Excel (.xlsx) dengan tabel bergaris penuh (Thin Border),
 * Judul & Header tebal (Bold), data jangan kosong, dan Tanda Tangan Rata Tengah di kanan bawah.
 * (Kop instansi dihapus sesuai permintaan agar bersih & langsung ke data).
 */
export async function exportToExcelWithSignature(options: ExportExcelOptions) {
  const {
    filename,
    sheetName = 'Sheet1',
    title,
    headers: explicitHeaders,
    data: explicitData,
    rows,
    signatureConfig: passedSignature,
  } = options;

  const signature = passedSignature || (await getSignatureConfig());

  let headers: string[] = [];
  let dataRows: (string | number)[][] = [];

  if (rows && rows.length > 0) {
    headers = Object.keys(rows[0]);
    dataRows = rows.map((r) => headers.map((h) => formatCellValue(r[h])));
  } else if (explicitHeaders && explicitData) {
    headers = explicitHeaders;
    dataRows = explicitData.map((row) => row.map((cell) => formatCellValue(cell)));
  } else if (explicitHeaders) {
    headers = explicitHeaders;
    dataRows = [];
  }

  const numCols = Math.max(headers.length, 6);
  const ws: XLSX.WorkSheet = {};
  const merges: XLSX.Range[] = [];

  let curRow = 0;

  // 1. Judul Laporan (Jika ada): Ditebalkan, Tanpa Kop Instansi
  if (title) {
    const titleCellRef = XLSX.utils.encode_cell({ r: curRow, c: 0 });
    ws[titleCellRef] = {
      t: 's',
      v: title.toUpperCase(),
      s: TITLE_STYLE,
    };
    curRow += 2; // Beri 1 baris jarak sebelum tabel
  }

  const headerRowIndex = curRow;

  // 2. Baris Header Tabel: Ditebalkan (Bold), Latar Abu-abu, Rata Tengah, Bergaris
  headers.forEach((headerText, colIdx) => {
    const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: colIdx });
    ws[cellRef] = {
      t: 's',
      v: headerText || '-',
      s: HEADER_STYLE,
    };
  });
  curRow++;

  // 3. Baris Data: Bergaris Kotak (Border Thin), Data Jangan Kosong (formatCellValue)
  if (dataRows.length === 0) {
    // Jika tidak ada data, beri 1 baris info agar tidak melompong
    headers.forEach((_, colIdx) => {
      const cellRef = XLSX.utils.encode_cell({ r: curRow, c: colIdx });
      ws[cellRef] = {
        t: 's',
        v: colIdx === 0 ? '(Tidak ada data)' : '-',
        s: {
          ...DATA_STYLE_BASE,
          alignment: { horizontal: 'center', vertical: 'center' },
        },
      };
    });
    curRow++;
  } else {
    dataRows.forEach((row) => {
      row.forEach((cellVal, colIdx) => {
        const cellRef = XLSX.utils.encode_cell({ r: curRow, c: colIdx });
        const headerName = headers[colIdx] || '';
        const isNum = typeof cellVal === 'number';
        const isCenter =
          headerName === 'No' ||
          headerName === 'Nomor' ||
          headerName.toLowerCase().includes('tanggal') ||
          headerName.toLowerCase().includes('status');

        ws[cellRef] = {
          t: isNum ? 'n' : 's',
          v: cellVal,
          s: {
            ...DATA_STYLE_BASE,
            alignment: {
              horizontal: isCenter ? 'center' : isNum ? 'right' : 'left',
              vertical: 'center',
            },
          },
        };
      });
      curRow++;
    });
  }

  const lastDataRow = curRow - 1;

  // 4. Blok Tanda Tangan Dinas: Rata Tengah (Center Aligned) di Kanan Bawah
  if (signature.enabled) {
    curRow += 2; // Jarak 2 baris setelah tabel

    const signSpan = Math.min(3, numCols);
    const signStartCol = Math.max(0, numCols - signSpan);
    const signEndCol = numCols - 1;

    const tglTitimangsa = `${signature.kota || 'Kebumen'}, ${formatTanggalIndonesia(new Date())}`;
    const signItems = [
      { text: tglTitimangsa, bold: false, underline: false },
      { text: signature.jabatanLine1, bold: false, underline: false },
      { text: signature.jabatanLine2, bold: false, underline: false },
      { text: '', bold: false, underline: false },
      { text: '', bold: false, underline: false },
      { text: '', bold: false, underline: false },
      { text: signature.namaPejabat, bold: true, underline: true },
      { text: signature.pangkat, bold: false, underline: false },
      { text: signature.nip, bold: false, underline: false },
    ];

    for (const item of signItems) {
      if (item.text) {
        const cellRef = XLSX.utils.encode_cell({ r: curRow, c: signStartCol });
        ws[cellRef] = {
          t: 's',
          v: item.text,
          s: {
            font: {
              name: 'Calibri',
              sz: 11,
              bold: item.bold,
              underline: item.underline,
              color: { rgb: '000000' },
            },
            alignment: { horizontal: 'center', vertical: 'center' },
          },
        };

        if (signEndCol > signStartCol) {
          merges.push({
            s: { r: curRow, c: signStartCol },
            e: { r: curRow, c: signEndCol },
          });
        }
      }
      curRow++;
    }
  }

  // Simpan range worksheet
  ws['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: Math.max(lastDataRow, curRow - 1), c: numCols - 1 },
  });

  if (merges.length > 0) {
    ws['!merges'] = merges;
  }

  // Auto-fit kolom
  autoFitWorksheetColumns(ws);

  // Buat workbook & download
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));

  const finalFilename = filename.toLowerCase().endsWith('.xlsx')
    ? filename
    : `${filename}.xlsx`;
  XLSX.writeFile(wb, finalFilename);
}

/**
 * Simpan multi-sheet Workbook dengan menambahkan border, header tebal,
 * dan blok tanda tangan dinas di setiap sheet secara otomatis.
 */
export async function saveWorkbookWithSignature(
  wb: XLSX.WorkBook,
  filename: string,
  passedSignature?: SignatureConfig
) {
  const signature = passedSignature || (await getSignatureConfig());
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    if (ws) {
      await appendSignatureToWorksheet(ws, signature);
    }
  }
  const finalFilename = filename.toLowerCase().endsWith('.xlsx')
    ? filename
    : `${filename}.xlsx`;
  XLSX.writeFile(wb, finalFilename);
}

export { XLSX };

