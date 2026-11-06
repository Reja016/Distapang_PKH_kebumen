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
  Wheat,
  MapPin,
} from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { downloadPakanTernakTemplate } from '@/lib/excelTemplateHelper';
import { showToast } from '@/components/common/CustomToast';
import { INITIAL_KAPASITAS_PAKAN } from '@/lib/pakanData';

export interface ParsedPakanRow {
  kecamatan: string;
  matchedId?: string;
  potensi_pakan_kg: number;
  kapasitas_tampung_ekor: number;
  jumlah_ternak_st: number;
  potensi_penambahan_st: number;
  status: 'Surplus' | 'Defisit';
  keterangan: string;
  isValid: boolean;
  validationError?: string;
}

interface PakanImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedYear: number;
}

export default function PakanImportModal({
  isOpen,
  onClose,
  onSuccess,
  selectedYear,
}: PakanImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedPakanRow[]>([]);
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

  const cleanKecName = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/kecamatan|kec/g, '');

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
        workbook.SheetNames.find((s) => s.toLowerCase().includes('pakan') || s.toLowerCase().includes('kapasitas') || s.toLowerCase().includes('template')) ||
        workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];
      const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (!rawJson || rawJson.length === 0) {
        throw new Error('Lembar kerja Excel kosong atau data tidak ditemukan.');
      }

      const rows: ParsedPakanRow[] = rawJson.map((row) => {
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

        const rawKec = String(getVal(['kecamatan', 'nama', 'wilayah', 'nama_kecamatan']) || '').trim();
        const matched = INITIAL_KAPASITAS_PAKAN.find(
          (m) =>
            cleanKecName(m.nama) === cleanKecName(rawKec) ||
            cleanKecName(m.corelId) === cleanKecName(rawKec) ||
            cleanKecName(m.id) === cleanKecName(rawKec)
        );

        const potPakan = parseFloat(String(getVal(['potensi_pakan_kg', 'potensi_pakan', 'potensi']) || '0').replace(',', '.')) || 0;
        const kapTampung = parseFloat(String(getVal(['kapasitas_tampung_ekor', 'kapasitas_tampung', 'kapasitas']) || '0').replace(',', '.')) || 0;
        const jmlTernak = parseFloat(String(getVal(['jumlah_ternak_st', 'jumlah_ternak', 'ternak_st', 'populasi_st']) || '0').replace(',', '.')) || 0;
        const potPenambahan = Number((kapTampung - jmlTernak).toFixed(2));
        const status: 'Surplus' | 'Defisit' = potPenambahan >= 0 ? 'Surplus' : 'Defisit';
        const keterangan = String(getVal(['keterangan', 'ket', 'catatan']) || '').trim();

        const validationErrors: string[] = [];
        if (!rawKec) {
          validationErrors.push('Nama kecamatan kosong');
        } else if (!matched) {
          validationErrors.push(`Kecamatan "${rawKec}" tidak valid`);
        }

        return {
          kecamatan: matched ? matched.nama : rawKec,
          matchedId: matched?.id,
          potensi_pakan_kg: potPakan,
          kapasitas_tampung_ekor: kapTampung,
          jumlah_ternak_st: jmlTernak,
          potensi_penambahan_st: potPenambahan,
          status,
          keterangan,
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
      const res = await fetch('/api/pakan-ternak/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tahun: selectedYear,
          rows: validRows,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Terjadi kesalahan saat menyimpan data.');
      }

      showToast.success(json.message || `Berhasil memperbarui data kapasitas pakan tahun ${selectedYear}.`);
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
  const totalPotensi = parsedRows.reduce((acc, curr) => acc + (curr.potensi_pakan_kg || 0), 0);
  const totalTampung = parsedRows.reduce((acc, curr) => acc + (curr.kapasitas_tampung_ekor || 0), 0);
  const totalTernak = parsedRows.reduce((acc, curr) => acc + (curr.jumlah_ternak_st || 0), 0);
  const totalSurplus = parsedRows.filter((r) => r.status === 'Surplus').length;
  const totalDefisit = parsedRows.filter((r) => r.status === 'Defisit').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
              <Wheat size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Impor Data Kapasitas Pakan Ternak (Tahun {selectedYear})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pembaruan data daya dukung & kapasitas pakan 26 Kecamatan Kab. Kebumen
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
          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
                1
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                  Unduh Template Excel Resmi SiMantap (26 Kecamatan)
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  Template sudah memuat otomatis 26 nama kecamatan se-Kabupaten Kebumen. Tinggal isi angka potensi pakan, kapasitas tampung, dan populasi ternak ST.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => downloadPakanTernakTemplate(selectedYear)}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
            >
              <Download size={14} />
              <span>Unduh Template ({selectedYear})</span>
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
                  ? 'border-purple-500 bg-purple-50/30 dark:bg-purple-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-purple-500 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2.5">
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
                    Pratinjau Data ({parsedRows.length} Kecamatan)
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
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                    Surplus: {totalSurplus} Kec
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800">
                    Defisit: {totalDefisit} Kec
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                    Ternak: {totalTernak.toLocaleString('id-ID')} ST
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
                      <th className="py-2 px-2.5">Kecamatan</th>
                      <th className="py-2 px-2.5 text-right">Potensi Pakan (kg)</th>
                      <th className="py-2 px-2.5 text-right">Kapasitas (ekor)</th>
                      <th className="py-2 px-2.5 text-right">Populasi (ST)</th>
                      <th className="py-2 px-2.5 text-right">Penambahan (ST)</th>
                      <th className="py-2 px-2.5 text-center">Status Pakan</th>
                      <th className="py-2 px-2.5">Keterangan</th>
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
                        <td className="py-2 px-2.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {r.kecamatan}
                        </td>
                        <td className="py-2 px-2.5 text-right font-medium text-slate-700 dark:text-slate-300">
                          {r.potensi_pakan_kg.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-2.5 text-right font-medium text-slate-700 dark:text-slate-300">
                          {r.kapasitas_tampung_ekor.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-2.5 text-right font-medium text-slate-700 dark:text-slate-300">
                          {r.jumlah_ternak_st.toLocaleString('id-ID')}
                        </td>
                        <td
                          className={`py-2 px-2.5 text-right font-bold ${
                            r.potensi_penambahan_st >= 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {r.potensi_penambahan_st.toLocaleString('id-ID')}
                        </td>
                        <td className="py-2 px-2.5 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              r.status === 'Surplus'
                                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                                : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-2 px-2.5 text-slate-500 dark:text-slate-400 max-w-[140px] truncate">
                          {r.keterangan || '-'}
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
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold transition-all text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Memperbarui ke Database...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Impor {totalValid} Kecamatan ({selectedYear})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
