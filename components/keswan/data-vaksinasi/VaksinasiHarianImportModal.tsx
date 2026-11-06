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
} from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { downloadVaksinasiHarianTemplate } from '@/lib/excelTemplateHelper';

interface ParsedVaksinasiRow {
  puskeswan: string;
  tanggal: string;
  jumlah: number;
  keterangan?: string;
  isValid: boolean;
  validationError?: string;
}

interface VaksinasiHarianImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultYear?: number;
  defaultMonth?: number;
}

export default function VaksinasiHarianImportModal({
  isOpen,
  onClose,
  onSuccess,
  defaultYear = new Date().getFullYear(),
  defaultMonth = new Date().getMonth() + 1,
}: VaksinasiHarianImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedVaksinasiRow[]>([]);
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

  // Helper untuk format tanggal aman (YYYY-MM-DD)
  const formatCellDate = (raw: any): string => {
    if (!raw) return '';
    if (typeof raw === 'number') {
      // Excel serial date format
      const dateObj = new Date((raw - (25567 + 2)) * 86400 * 1000);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().slice(0, 10);
      }
    }
    const str = String(raw).trim();
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
      const parts = str.split('-');
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(str)) {
      const parts = str.split(/[\/\-]/);
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
    return str;
  };

  // Parsing file excel yang diunggah
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsParsing(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary', cellDates: true });

        // Cari sheet data (prioritaskan 'Template_Vaksinasi_Harian' atau sheet pertama selain panduan)
        const sheetNames = workbook.SheetNames;
        let targetSheetName = sheetNames.find(
          (name) =>
            !name.toLowerCase().includes('petunjuk') &&
            !name.toLowerCase().includes('panduan') &&
            !name.toLowerCase().includes('instruksi')
        ) || sheetNames[0];

        const worksheet = workbook.Sheets[targetSheetName];
        if (!worksheet) {
          throw new Error('Lembar kerja (sheet) tidak ditemukan di dalam file Excel.');
        }

        const rawData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        if (!rawData || rawData.length === 0) {
          throw new Error('File Excel terbaca kosong atau tidak memiliki data.');
        }

        const rows: ParsedVaksinasiRow[] = [];

        // Deteksi apakah format baris-per-baris (Row based) atau format matriks tanggal 1-31
        const firstRowKeys = Object.keys(rawData[0] || {});
        const hasDateColumn = firstRowKeys.some((k) =>
          /tanggal|date|tgl/i.test(k)
        );

        if (hasDateColumn) {
          // FORMAT 1: Row Based (Puskeswan, Tanggal, Jumlah Dosis)
          for (const raw of rawData) {
            const puskeswan = String(
              raw['Puskeswan'] || raw['puskeswan'] || raw['Nama Puskeswan'] || ''
            ).trim();

            const rawDate =
              raw['Tanggal (YYYY-MM-DD)'] ||
              raw['Tanggal'] ||
              raw['tanggal'] ||
              raw['Date'] ||
              '';
            const tanggal = formatCellDate(rawDate);

            const rawJumlah =
              raw['Jumlah Dosis (Ekor)'] !== undefined && raw['Jumlah Dosis (Ekor)'] !== ''
                ? raw['Jumlah Dosis (Ekor)']
                : raw['Jumlah Dosis'] !== undefined && raw['Jumlah Dosis'] !== ''
                ? raw['Jumlah Dosis']
                : raw['Jumlah'] !== undefined && raw['Jumlah'] !== ''
                ? raw['Jumlah']
                : raw['jumlah'] !== undefined && raw['jumlah'] !== ''
                ? raw['jumlah']
                : 0;

            const jumlah = Math.max(0, parseInt(String(rawJumlah), 10) || 0);
            const keterangan = String(
              raw['Keterangan (Opsional)'] || raw['Keterangan'] || raw['keterangan'] || raw['Catatan'] || ''
            ).trim();

            if (!puskeswan && !tanggal && jumlah === 0) {
              continue; // Abaikan baris kosong
            }

            let isValid = true;
            let validationError = '';

            if (!puskeswan) {
              isValid = false;
              validationError = 'Puskeswan wajib diisi';
            } else if (!tanggal || !/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
              isValid = false;
              validationError = 'Format tanggal harus YYYY-MM-DD';
            }

            rows.push({
              puskeswan,
              tanggal,
              jumlah,
              keterangan,
              isValid,
              validationError,
            });
          }
        } else {
          // FORMAT 2: Matriks Kolom 1..31 (seperti hasil export SiMantap)
          const dayKeys = firstRowKeys.filter((k) => /^\d{1,2}$/.test(k.trim()));

          for (const raw of rawData) {
            const puskeswan = String(
              raw['Puskeswan'] || raw['puskeswan'] || raw['nama'] || ''
            ).trim();
            if (!puskeswan) continue;

            const yyyy = defaultYear;
            const mm = String(defaultMonth).padStart(2, '0');

            for (const dayKey of dayKeys) {
              const val = raw[dayKey];
              const jumlah = Math.max(0, parseInt(String(val), 10) || 0);
              if (jumlah > 0) {
                const dd = dayKey.trim().padStart(2, '0');
                const tanggal = `${yyyy}-${mm}-${dd}`;
                rows.push({
                  puskeswan,
                  tanggal,
                  jumlah,
                  isValid: true,
                });
              }
            }
          }
        }

        if (rows.length === 0) {
          throw new Error('Tidak ada baris data valid yang terdeteksi untuk diimpor.');
        }

        setParsedRows(rows);
      } catch (err: any) {
        console.error('Gagal memproses file Excel:', err);
        setErrorMessage(err.message || 'Gagal membaca isi file Excel.');
        setParsedRows([]);
      } finally {
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setErrorMessage('Terjadi gangguan saat membaca file Excel dari perangkat.');
      setIsParsing(false);
    };

    reader.readAsBinaryString(uploadedFile);
  };

  // Simpan data batch ke database via API
  const handleSubmit = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setErrorMessage('Tidak ada data valid yang dapat disimpan.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/vaksinasi-pmk/harian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: validRows }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || 'Gagal mengimpor data ke server.');
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Error saat submit import vaksinasi:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat menyimpan data massal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <UploadCloud size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Import Excel Data Vaksinasi Harian PMK
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Input Massal
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unggah data harian log vaksinasi banyak puskeswan sekaligus via file Excel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Modal (Scrollable) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200">
          {/* STEP 1: Unduh Format Template Resmi */}
          <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  1
                </span>
                <span className="font-bold text-sm text-blue-950 dark:text-blue-200">
                  Unduh Template Resmi SiMantap (.xlsx)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 pl-7">
                Gunakan template standar agar header dan format tanggal terbaca otomatis oleh sistem.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadVaksinasiHarianTemplate}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              <Download size={14} />
              <span>Unduh Template Excel</span>
            </button>
          </div>

          {/* STEP 2: Upload File Excel */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Pilih File Excel yang Sudah Diisi
              </span>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-850/50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  {file ? file.name : 'Klik untuk memilih file Excel atau seret ke area ini'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Mendukung format .xlsx, .xls, atau .csv (Maksimal 1.000 baris per unggahan)
                </p>
              </div>
            </div>
          </div>

          {/* Loading Indicator Saat Parsing */}
          {isParsing && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 text-xs font-bold">
              <Loader2 size={16} className="animate-spin text-blue-600" />
              <span>Sedang memproses dan memvalidasi isi lembar kerja...</span>
            </div>
          )}

          {/* Alert Error Jika Ada Masalah */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-start gap-3 text-rose-800 dark:text-rose-200 text-xs font-medium">
              <AlertTriangle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Gagal memproses file:</span> {errorMessage}
              </div>
            </div>
          )}

          {/* STEP 3: Pratinjau Data (Preview) */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Pratinjau Data Vaksinasi
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> {validCount} Siap Simpan
                  </span>
                  {invalidCount > 0 && (
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1">
                      <AlertTriangle size={12} /> {invalidCount} Tidak Lengkap
                    </span>
                  )}
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-2.5 text-center w-10">No</th>
                      <th className="p-2.5">Puskeswan</th>
                      <th className="p-2.5 text-center">Tanggal</th>
                      <th className="p-2.5 text-right">Jumlah Dosis</th>
                      <th className="p-2.5">Keterangan</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={!row.isValid ? 'bg-rose-50/50 dark:bg-rose-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}
                      >
                        <td className="p-2.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">{row.puskeswan || '-'}</td>
                        <td className="p-2.5 text-center font-mono">{row.tanggal || '-'}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-blue-700 dark:text-blue-300">
                          {row.jumlah.toLocaleString('id-ID')}
                        </td>
                        <td className="p-2.5 text-slate-500 truncate max-w-[150px]">{row.keterangan || '-'}</td>
                        <td className="p-2.5 text-center">
                          {row.isValid ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                              Valid
                            </span>
                          ) : (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                              title={row.validationError}
                            >
                              {row.validationError || 'Tidak Valid'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Info Aturan Wilayah & Update Otomatis */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
            <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>
                <strong>Catatan Sistem SiMantap:</strong> Jika tanggal dan puskeswan yang diimpor sudah pernah diisi sebelumnya, data akan diperbarui (update) dengan jumlah dosis terbaru.
              </p>
              <p>
                Petugas lapangan hanya dapat mengimpor data untuk wilayah binaan puskeswan yang ditugaskan.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/70 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-10 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || validCount === 0}
            className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Menyimpan ke Server...</span>
              </>
            ) : (
              <>
                <UploadCloud size={14} />
                <span>Simpan {validCount} Data Vaksinasi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
