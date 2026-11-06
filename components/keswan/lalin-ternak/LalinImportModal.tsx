'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Info,
  Check,
  AlertCircle,
  Truck,
  Store,
} from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { downloadLalinTernakTemplate } from '@/lib/excelTemplateHelper';
import { showToast } from '@/components/common/CustomToast';

export interface ParsedLalinRow {
  kategori: 'Pemasukkan' | 'Pengeluaran';
  wilayah: 'Kebumen' | 'Gombong';
  tanggal_pengiriman: string;
  no_skkh: string;
  nama_pemilik: string;
  alamat_pemilik: string;
  jenis_ternak: string;
  umur: number | null;
  satuan_umur: 'bulan' | 'tahun';
  jumlah_jantan: number;
  jumlah_betina: number;
  jumlah: number;
  satuan_jumlah: 'ekor' | 'kilo';
  asal_ternak: string;
  tujuan_ternak: string;
  ket: string;
  isValid: boolean;
  validationError?: string;
}

interface LalinImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultKategori?: 'Pemasukkan' | 'Pengeluaran';
  defaultWilayah?: 'Kebumen' | 'Gombong';
}

export default function LalinImportModal({
  isOpen,
  onClose,
  onSuccess,
  defaultKategori = 'Pemasukkan',
  defaultWilayah = 'Kebumen',
}: LalinImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedLalinRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const resetState = () => {
    setFile(null);
    setParsedRows([]);
    setErrorMessage(null);
    setIsParsing(false);
    setIsSubmitting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // Helper untuk format tanggal YYYY-MM-DD
  const formatCellDate = (raw: any): string => {
    if (!raw) return new Date().toISOString().split('T')[0];
    if (typeof raw === 'number') {
      const dateObj = new Date((raw - (25567 + 2)) * 86400 * 1000);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split('T')[0];
      }
    }
    const str = String(raw).trim();
    const dmy = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (dmy) {
      return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
    }
    const ymd = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
    if (ymd) {
      return `${ymd[1]}-${ymd[2].padStart(2, '0')}-${ymd[3].padStart(2, '0')}`;
    }
    return str;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processSelectedFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processSelectedFile(droppedFile);
    }
  };

  const processSelectedFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsParsing(true);
    setErrorMessage(null);

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName =
        workbook.SheetNames.find((s) => s.toLowerCase().includes('lalu') || s.toLowerCase().includes('lalin') || s.toLowerCase().includes('template')) ||
        workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];
      const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!rawJson || rawJson.length === 0) {
        throw new Error('Lembar kerja Excel kosong atau data tidak ditemukan.');
      }

      const rows: ParsedLalinRow[] = rawJson.map((row, index) => {
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

        let kategoriRaw = String(getVal(['kategori', 'jenis_lalin']) || defaultKategori).trim();
        let kategori: 'Pemasukkan' | 'Pengeluaran' = defaultKategori;
        if (/keluar|pengeluaran/i.test(kategoriRaw)) {
          kategori = 'Pengeluaran';
        } else if (/masuk|pemasukkan|pemasukan/i.test(kategoriRaw)) {
          kategori = 'Pemasukkan';
        }

        let wilayahRaw = String(getVal(['wilayah', 'pasar_hewan', 'pasar']) || defaultWilayah).trim();
        let wilayah: 'Kebumen' | 'Gombong' = defaultWilayah;
        if (/gombong/i.test(wilayahRaw)) {
          wilayah = 'Gombong';
        } else if (/kebumen/i.test(wilayahRaw)) {
          wilayah = 'Kebumen';
        }

        const rawTanggal = getVal(['tanggal_pengiriman', 'tanggal', 'tgl']);
        const tanggal_pengiriman = formatCellDate(rawTanggal);

        const no_skkh_raw = getVal(['no_skkh', 'skkh', 'nomor_skkh']);
        const no_skkh =
          no_skkh_raw && String(no_skkh_raw).trim() !== '-' ? String(no_skkh_raw).trim() : '';

        const nama_pemilik = String(getVal(['nama_pemilik', 'nama', 'pemilik']) || '').trim();
        const alamat_pemilik = String(getVal(['alamat_pemilik', 'alamat']) || '').trim();
        const jenis_ternak = String(getVal(['jenis_ternak', 'ternak', 'komoditas']) || 'Sapi').trim();

        const rawUmur = getVal(['umur', 'usia']);
        const umur =
          rawUmur !== undefined && rawUmur !== null && String(rawUmur).trim() !== ''
            ? Number(rawUmur) || null
            : null;

        let satuanUmurRaw = String(getVal(['satuan_umur', 'satuan_usia']) || 'tahun').trim().toLowerCase();
        const satuan_umur: 'bulan' | 'tahun' = satuanUmurRaw === 'bulan' ? 'bulan' : 'tahun';

        const jumlah_jantan = Number(getVal(['jumlah_jantan', 'jantan'])) || 0;
        const jumlah_betina = Number(getVal(['jumlah_betina', 'betina'])) || 0;
        const rawJumlah = Number(getVal(['jumlah', 'total_ekor', 'ekor'])) || 0;
        const jumlah =
          jumlah_jantan > 0 || jumlah_betina > 0
            ? jumlah_jantan + jumlah_betina
            : rawJumlah > 0
            ? rawJumlah
            : 0;

        let satuanJumlahRaw = String(getVal(['satuan_jumlah', 'satuan']) || 'ekor').trim().toLowerCase();
        const satuan_jumlah: 'ekor' | 'kilo' = satuanJumlahRaw === 'kilo' ? 'kilo' : 'ekor';

        const asal_ternak = String(getVal(['asal_ternak', 'asal']) || '').trim();
        const tujuan_ternak = String(getVal(['tujuan_ternak', 'tujuan']) || '').trim();
        const ket = String(getVal(['ket', 'keterangan', 'catatan']) || '').trim();

        const validationErrors: string[] = [];
        if (!nama_pemilik) validationErrors.push('Nama Pemilik wajib diisi');
        if (!alamat_pemilik) validationErrors.push('Alamat wajib diisi');
        if (!jenis_ternak) validationErrors.push('Jenis ternak wajib diisi');
        if (jumlah <= 0) validationErrors.push('Jumlah ekor harus lebih dari 0');

        return {
          kategori,
          wilayah,
          tanggal_pengiriman,
          no_skkh,
          nama_pemilik,
          alamat_pemilik,
          jenis_ternak,
          umur,
          satuan_umur,
          jumlah_jantan,
          jumlah_betina,
          jumlah,
          satuan_jumlah,
          asal_ternak,
          tujuan_ternak,
          ket,
          isValid: validationErrors.length === 0,
          validationError: validationErrors.join(', '),
        };
      });

      setParsedRows(rows);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Gagal membaca atau mem-parsing file Excel.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleUploadSubmit = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setErrorMessage('Tidak ada baris data valid yang dapat diimpor.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/lalin-ternak/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: validRows }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Terjadi kesalahan saat menyimpan data.');
      }

      showToast.success(json.message || `Berhasil mengimpor ${json.insertedCount} data lalu lintas ternak.`);
      onSuccess();
      handleClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengirim data ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalValid = parsedRows.filter((r) => r.isValid).length;
  const totalInvalid = parsedRows.filter((r) => !r.isValid).length;
  const totalJantan = parsedRows.reduce((acc, curr) => acc + (curr.jumlah_jantan || 0), 0);
  const totalBetina = parsedRows.reduce((acc, curr) => acc + (curr.jumlah_betina || 0), 0);
  const grandTotalEkor = parsedRows.reduce((acc, curr) => acc + (curr.jumlah || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
              <Truck size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Impor Data Lalu Lintas Ternak (Excel)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Format resmi SiMantap Kab. Kebumen (Pemasukan & Pengeluaran)
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Konten Scrollable */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          {/* LANGKAH 1: Download Format Resmi */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                1
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                  Unduh Template Excel Resmi SiMantap
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Template sudah diformat dengan kolom standar (Kategori, Pasar, No. SKKH, Pemilik, Alamat, Jantan/Betina, Asal, Tujuan).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => downloadLalinTernakTemplate()}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
            >
              <Download size={14} />
              <span>Unduh Template</span>
            </button>
          </div>

          {/* LANGKAH 2: Upload File Area Drag & Drop */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-[10px]">
                2
              </div>
              <label className="font-bold text-slate-900 dark:text-white text-xs">
                Pilih atau Tarik File Excel (.xlsx / .xls)
              </label>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                file
                  ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5">
                {isParsing ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <UploadCloud size={24} />
                )}
              </div>
              {file ? (
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{file.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {(file.size / 1024).toFixed(1)} KB • Klik untuk ganti file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">
                    Klik untuk memilih file atau seret file ke sini
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Mendukung file Excel format .xlsx dan .xls
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Alert Error jika ada */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p className="text-xs">{errorMessage}</p>
            </div>
          )}

          {/* LANGKAH 3: Pratinjau Interaktif & Validasi */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-[10px]">
                    3
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                    Pratinjau Data ({parsedRows.length} Baris)
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                    ✓ {totalValid} Siap Impor
                  </span>
                  {totalInvalid > 0 && (
                    <span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                      ⚠ {totalInvalid} Perlu Koreksi
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                    Total: {grandTotalEkor} Ekor (♂ {totalJantan} | ♀ {totalBetina})
                  </span>
                </div>
              </div>

              {/* Tabel Pratinjau */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 z-10 text-slate-700 dark:text-slate-300 font-bold">
                    <tr>
                      <th className="py-2 px-2.5 text-center w-8">No</th>
                      <th className="py-2 px-2.5">Status</th>
                      <th className="py-2 px-2.5">Kategori</th>
                      <th className="py-2 px-2.5">Pasar</th>
                      <th className="py-2 px-2.5">Tanggal</th>
                      <th className="py-2 px-2.5">No. SKKH</th>
                      <th className="py-2 px-2.5">Pemilik</th>
                      <th className="py-2 px-2.5">Alamat</th>
                      <th className="py-2 px-2.5">Ternak</th>
                      <th className="py-2 px-2.5 text-center">Jantan</th>
                      <th className="py-2 px-2.5 text-center">Betina</th>
                      <th className="py-2 px-2.5 text-center">Total</th>
                      <th className="py-2 px-2.5">Asal</th>
                      <th className="py-2 px-2.5">Tujuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.map((r, i) => (
                      <tr
                        key={i}
                        className={
                          !r.isValid
                            ? 'bg-amber-50/50 dark:bg-amber-950/20'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }
                      >
                        <td className="py-2 px-2.5 text-center font-medium text-slate-500">
                          {i + 1}
                        </td>
                        <td className="py-2 px-2.5 whitespace-nowrap">
                          {r.isValid ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <CheckCircle2 size={12} /> Valid
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold"
                              title={r.validationError}
                            >
                              <AlertTriangle size={12} /> Koreksi
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-2.5 font-semibold text-slate-900 dark:text-white">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              r.kategori === 'Pemasukkan'
                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                            }`}
                          >
                            {r.kategori}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-slate-700 dark:text-slate-300">
                          {r.wilayah}
                        </td>
                        <td className="py-2 px-2.5 whitespace-nowrap text-slate-600 dark:text-slate-400">
                          {r.tanggal_pengiriman}
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 dark:text-slate-400">
                          {r.no_skkh || '-'}
                        </td>
                        <td className="py-2 px-2.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {r.nama_pemilik || <span className="text-amber-500 italic">Kosong</span>}
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 dark:text-slate-400 max-w-[140px] truncate">
                          {r.alamat_pemilik || <span className="text-amber-500 italic">Kosong</span>}
                        </td>
                        <td className="py-2 px-2.5 text-slate-800 dark:text-slate-200">
                          {r.jenis_ternak}
                        </td>
                        <td className="py-2 px-2.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                          {r.jumlah_jantan}
                        </td>
                        <td className="py-2 px-2.5 text-center font-semibold text-slate-700 dark:text-slate-300">
                          {r.jumlah_betina}
                        </td>
                        <td className="py-2 px-2.5 text-center font-bold text-blue-600 dark:text-blue-400">
                          {r.jumlah}
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 dark:text-slate-400">
                          {r.asal_ternak || '-'}
                        </td>
                        <td className="py-2 px-2.5 text-slate-600 dark:text-slate-400">
                          {r.tujuan_ternak || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Aksi */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-all text-xs cursor-pointer"
          >
            Batal
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting || totalValid === 0}
              onClick={handleUploadSubmit}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition-all text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Mengimpor ke Database...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Impor {totalValid} Data Terverifikasi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
