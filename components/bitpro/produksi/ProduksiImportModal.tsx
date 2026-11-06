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
  Check,
  AlertCircle,
  PieChart,
} from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { downloadProduksiTernakTemplate } from '@/lib/excelTemplateHelper';
import { showToast } from '@/components/common/CustomToast';

export interface ParsedProduksiRow {
  kategori: string;
  jenis: string;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  mei: number;
  jun: number;
  jul: number;
  agt: number;
  sep: number;
  okt: number;
  nov: number;
  des: number;
  total: number;
  isValid: boolean;
  validationError?: string;
}

interface ProduksiImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  year?: string;
}

export default function ProduksiImportModal({
  isOpen,
  onClose,
  onSuccess,
  year = '2026',
}: ProduksiImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedProduksiRow[]>([]);
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    processSelectedFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processSelectedFile(droppedFile);
    }
  };

  const processSelectedFile = (selectedFile: File) => {
    if (
      !selectedFile.name.endsWith('.xlsx') &&
      !selectedFile.name.endsWith('.xls')
    ) {
      setErrorMessage('Format file tidak didukung. Harap unggah file Excel (.xlsx atau .xls).');
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        let sheetName = workbook.SheetNames[0];
        const preferredSheet = workbook.SheetNames.find(
          (name) =>
            name.toLowerCase().includes('produksi') ||
            name.toLowerCase().includes('daging') ||
            name.toLowerCase().includes('telur') ||
            name.toLowerCase().includes('template')
        );
        if (preferredSheet) sheetName = preferredSheet;

        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setErrorMessage('Sheet data kosong atau tidak ditemukan baris data yang valid.');
          setIsParsing(false);
          return;
        }

        const cleanKey = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');

        const rows: ParsedProduksiRow[] = rawJson.map((row: any) => {
          const getVal = (aliases: string[]) => {
            for (const key of Object.keys(row)) {
              const k = cleanKey(key);
              for (const alias of aliases) {
                if (k === cleanKey(alias)) {
                  return row[key];
                }
              }
            }
            return '';
          };

          let kategori = String(getVal(['kategori', 'kat']) || 'Daging').trim();
          kategori = kategori.charAt(0).toUpperCase() + kategori.slice(1).toLowerCase();

          const jenis = String(
            getVal(['jeniskomoditasternak', 'jenis', 'komoditas', 'jenishewan', 'hewan']) || ''
          ).trim();

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

          let isValid = true;
          let validationError = '';

          if (!jenis) {
            isValid = false;
            validationError = 'Jenis komoditas wajib diisi';
          }

          return {
            kategori,
            jenis,
            jan,
            feb,
            mar,
            apr,
            mei,
            jun,
            jul,
            agt,
            sep,
            okt,
            nov,
            des,
            total,
            isValid,
            validationError,
          };
        });

        const filtered = rows.filter((r) => r.jenis || r.total > 0);

        if (filtered.length === 0) {
          setErrorMessage('Tidak ada data valid yang dapat diimpor.');
        } else {
          setParsedRows(filtered);
        }
      } catch (err: any) {
        console.error('Error parsing excel produksi:', err);
        setErrorMessage('Gagal membaca isi file Excel. Pastikan file tidak rusak.');
      } finally {
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Terjadi kesalahan saat membaca file.');
      setIsParsing(false);
    };

    reader.readAsBinaryString(selectedFile);
  };

  const validRowCount = parsedRows.filter((r) => r.isValid).length;
  const invalidRowCount = parsedRows.length - validRowCount;
  const totalVolumeProduksi = parsedRows.filter((r) => r.isValid).reduce((acc, curr) => acc + curr.total, 0);

  const handleSubmit = async () => {
    if (parsedRows.length === 0) return;
    if (validRowCount === 0) {
      showToast.error('Tidak ada baris data yang valid untuk disimpan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const validRowsToSubmit = parsedRows.filter((r) => r.isValid);

      const res = await fetch('/api/produksi-ternak/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: validRowsToSubmit, year }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || result.message || 'Gagal menyimpan data produksi ke database.');
      }

      showToast.success(
        `Sukses! ${result.insertedCount || validRowsToSubmit.length} komoditas produksi ${year} berhasil diimpor.`
      );
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Error submitting produksi import:', err);
      showToast.error(err.message || 'Terjadi kesalahan sistem saat mengimpor data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Import Data Produksi Ternak ({year})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unggah rekapitulasi data tonase daging dan butir telur per bulan secara massal.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            aria-label="Tutup Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-900 dark:text-slate-100">
          {/* Step 1: Download Template */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                Langkah 1
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Unduh Template Excel Resmi SiMantap
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Template ini menyediakan kolom kategori (Daging/Telur), jenis komoditas, dan angka bulanan Januari s.d. Desember.
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadProduksiTernakTemplate(year)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow shrink-0 cursor-pointer"
            >
              <Download size={15} strokeWidth={2.5} />
              <span>Unduh Template (.xlsx)</span>
            </button>
          </div>

          {/* Step 2: Upload File Drag & Drop */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                Langkah 2
              </span>
              {file && (
                <button
                  type="button"
                  onClick={resetState}
                  className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                >
                  Ganti File
                </button>
              )}
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                file
                  ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10'
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />

              {isParsing ? (
                <div className="flex flex-col items-center gap-2 py-3">
                  <Loader2 className="animate-spin text-emerald-600" size={32} />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Membaca dan memverifikasi data Excel produksi...
                  </p>
                </div>
              ) : file ? (
                <div className="flex flex-col items-center gap-2 py-1">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Check size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB &bull; Klik atau seret berkas baru untuk mengganti
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center">
                    <UploadCloud size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      Pilih atau tarik file Excel di sini
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Mendukung format .xlsx dan .xls hasil unduhan template resmi
                    </p>
                  </div>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-medium">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Step 3: Interactive Preview & Validation */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    Langkah 3
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Pratinjau &amp; Validasi Data ({parsedRows.length} Komoditas &bull; Total: {totalVolumeProduksi.toLocaleString('id-ID')} KG/Butir)
                  </h4>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 size={14} /> {validRowCount} Siap Diimpor
                  </span>
                  {invalidRowCount > 0 && (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                      <AlertTriangle size={14} /> {invalidRowCount} Perlu Koreksi
                    </span>
                  )}
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="max-h-60 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                      <tr>
                        <th className="py-2.5 px-3 font-bold text-center w-10">No</th>
                        <th className="py-2.5 px-3 font-bold text-center">Status</th>
                        <th className="py-2.5 px-3 font-bold text-center">Kategori</th>
                        <th className="py-2.5 px-3 font-bold">Komoditas / Ternak</th>
                        <th className="py-2.5 px-3 font-bold text-right">Jan</th>
                        <th className="py-2.5 px-3 font-bold text-right">Feb</th>
                        <th className="py-2.5 px-3 font-bold text-right">Mar</th>
                        <th className="py-2.5 px-3 font-bold text-right">Apr</th>
                        <th className="py-2.5 px-3 font-bold text-right">Mei</th>
                        <th className="py-2.5 px-3 font-bold text-right">Jun</th>
                        <th className="py-2.5 px-3 font-bold text-right">Total Tahunan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {parsedRows.map((row, idx) => (
                        <tr
                          key={idx}
                          className={
                            row.isValid
                              ? 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                              : 'bg-amber-50/50 dark:bg-amber-950/20'
                          }
                        >
                          <td className="py-2 px-3 text-center text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-3 text-center whitespace-nowrap">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                                <CheckCircle2 size={11} /> Valid
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                                title={row.validationError}
                              >
                                <AlertTriangle size={11} /> Perlu Koreksi
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                row.kategori.toLowerCase() === 'telur'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              }`}
                            >
                              {row.kategori}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                            {row.jenis}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                            {row.jan.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                            {row.feb.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                            {row.mar.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                            {row.apr.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                            {row.mei.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                            {row.jun.toLocaleString('id-ID')}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                            {row.total.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || parsedRows.length === 0 || validRowCount === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white disabled:text-slate-500 text-xs font-bold transition-all shadow-sm disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Menyimpan ke Database...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={15} strokeWidth={2.5} />
                <span>Simpan {validRowCount} Data Produksi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
