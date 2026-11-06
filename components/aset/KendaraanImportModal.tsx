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
  Car,
} from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { downloadInventarisKendaraanTemplate } from '@/lib/excelTemplateHelper';
import { showToast } from '@/components/common/CustomToast';

export interface ParsedKendaraanRow {
  nama_pemegang: string;
  merk_type: string;
  tahun: string | number;
  nopol_baru: string;
  nopol_lama: string;
  nomor_mesin: string;
  nomor_rangka: string;
  keterangan: string;
  isValid: boolean;
  validationError?: string;
}

interface KendaraanImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function KendaraanImportModal({
  isOpen,
  onClose,
  onSuccess,
}: KendaraanImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedKendaraanRow[]>([]);
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
        const workbook = XLSX.read(buffer, { type: 'binary' });

        const sheetNames = workbook.SheetNames;
        const targetSheetName =
          sheetNames.find(
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
          throw new Error('File Excel terbaca kosong atau tidak memiliki baris data.');
        }

        const rows: ParsedKendaraanRow[] = [];

        for (const raw of rawData) {
          const rawPemegang = String(
            raw['Nama Pemegang / Penanggung Jawab'] ||
              raw['Nama Pemegang'] ||
              raw['nama_pemegang'] ||
              raw['Penanggung Jawab'] ||
              raw['Pemegang'] ||
              ''
          ).trim();

          const rawMerk = String(
            raw['Merk / Type Kendaraan'] ||
              raw['Merk / Type'] ||
              raw['merk_type'] ||
              raw['Merk'] ||
              raw['Type'] ||
              ''
          ).trim();

          const rawTahun =
            raw['Tahun Pembuatan / Perolehan'] !== undefined && raw['Tahun Pembuatan / Perolehan'] !== ''
              ? raw['Tahun Pembuatan / Perolehan']
              : raw['Tahun'] !== undefined && raw['Tahun'] !== ''
              ? raw['Tahun']
              : raw['tahun'] !== undefined && raw['tahun'] !== ''
              ? raw['tahun']
              : '';

          const rawNopolBaru = String(
            raw['Nomor Polisi Baru (Plat Aktif)'] ||
              raw['Nomor Polisi (Baru)'] ||
              raw['Nomor Polisi Baru'] ||
              raw['nopol_baru'] ||
              raw['Nopol Baru'] ||
              raw['Plat Nomor'] ||
              ''
          ).trim();

          const rawNopolLama = String(
            raw['Nomor Polisi Lama'] ||
              raw['Nomor Polisi (Lama)'] ||
              raw['nopol_lama'] ||
              raw['Nopol Lama'] ||
              ''
          ).trim();

          const rawNoMesin = String(
            raw['Nomor Mesin'] ||
              raw['nomor_mesin'] ||
              raw['No Mesin'] ||
              ''
          ).trim();

          const rawNoRangka = String(
            raw['Nomor Rangka'] ||
              raw['nomor_rangka'] ||
              raw['No Rangka'] ||
              ''
          ).trim();

          const rawKet = String(
            raw['Keterangan / Kondisi'] ||
              raw['Keterangan'] ||
              raw['keterangan'] ||
              raw['Kondisi'] ||
              ''
          ).trim();

          let isValid = true;
          let validationError = '';

          if (!rawPemegang && !rawNopolBaru) {
            isValid = false;
            validationError = 'Nama Pemegang dan Nomor Polisi Baru tidak boleh kosong';
          } else if (!rawPemegang) {
            isValid = false;
            validationError = 'Nama Pemegang wajib diisi';
          } else if (!rawNopolBaru) {
            isValid = false;
            validationError = 'Nomor Polisi Baru wajib diisi';
          }

          rows.push({
            nama_pemegang: rawPemegang,
            merk_type: rawMerk || '-',
            tahun: rawTahun,
            nopol_baru: rawNopolBaru,
            nopol_lama: rawNopolLama,
            nomor_mesin: rawNoMesin,
            nomor_rangka: rawNoRangka,
            keterangan: rawKet,
            isValid,
            validationError,
          });
        }

        setParsedRows(rows);
        setIsParsing(false);
      } catch (err: any) {
        console.error('Error saat parsing file Excel Kendaraan:', err);
        setErrorMessage(
          err.message || 'Format file Excel tidak sesuai dengan template resmi SiMantap.'
        );
        setIsParsing(false);
      }
    };

    reader.readAsBinaryString(uploadedFile);
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const handleSubmit = async () => {
    if (validRows.length === 0) {
      showToast.error('Tidak ada data valid yang siap diimpor!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/aset-kendaraan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: validRows }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || resData.message || 'Gagal menyimpan data ke database.');
      }

      showToast.success(resData.message || `Berhasil mengimpor ${validRows.length} data kendaraan dinas!`);
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Gagal mengirim data import kendaraan:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat menyimpan data.');
      showToast.error(err.message || 'Gagal mengimpor data kendaraan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Car size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                Import Inventaris Kendaraan Dinas (Excel)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unggah data buku inventaris kendaraan operasional dinas secara massal / gelondongan
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* STEP 1: Download Template */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  Langkah 1: Gunakan Template Resmi SiMantap Aset
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Template sudah disesuaikan dengan kolom baku buku inventaris kendaraan operasional roda 2 dan roda 4.
                </p>
              </div>
            </div>
            <button
              onClick={downloadInventarisKendaraanTemplate}
              type="button"
              className="min-h-touch h-9 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Download size={14} strokeWidth={2.5} />
              <span>Unduh Template Kendaraan</span>
            </button>
          </div>

          {/* STEP 2: Upload File Box */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider">
              Langkah 2: Pilih &amp; Unggah File Excel
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                file
                  ? 'border-amber-400 bg-amber-50/30 dark:bg-amber-950/10'
                  : 'border-slate-300 dark:border-slate-700 hover:border-amber-500 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-600 flex items-center justify-center shadow-xs">
                  {isParsing ? (
                    <Loader2 size={24} className="animate-spin text-amber-600" />
                  ) : (
                    <UploadCloud size={24} />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {file ? file.name : 'Klik untuk memilih file Excel Kendaraan atau seret ke sini'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Mendukung format .XLSX dan .XLS resmi SiMantap
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-bold">Terjadi Kesalahan</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* STEP 3: Preview Data & Validasi */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider">
                    Langkah 3: Pratinjau &amp; Verifikasi Data ({parsedRows.length} Unit Terbaca)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Periksa kembali data kendaraan dinas sebelum disimpan ke database
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <Check size={12} strokeWidth={3} />
                    {validRows.length} Valid
                  </span>
                  {invalidRows.length > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle size={12} />
                      {invalidRows.length} Perlu Dicek
                    </span>
                  )}
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto shadow-2xs">
                <table className="w-full text-left text-[11px] sm:text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-3 py-2.5 text-center w-10">No</th>
                      <th className="px-3 py-2.5 text-center w-20">Status</th>
                      <th className="px-3 py-2.5">Nama Pemegang</th>
                      <th className="px-3 py-2.5">Merk / Type</th>
                      <th className="px-3 py-2.5 text-center">Tahun</th>
                      <th className="px-3 py-2.5 text-center">Nopol Baru</th>
                      <th className="px-3 py-2.5 text-center">Nopol Lama</th>
                      <th className="px-3 py-2.5">No. Mesin</th>
                      <th className="px-3 py-2.5">No. Rangka</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          !row.isValid
                            ? 'bg-rose-50/40 dark:bg-rose-950/10'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="px-3 py-2 text-center text-slate-500 font-medium">{idx + 1}</td>
                        <td className="px-3 py-2 text-center">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-[10px]">
                              <CheckCircle2 size={11} /> Valid
                            </span>
                          ) : (
                            <span
                              title={row.validationError}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-bold text-[10px] cursor-help"
                            >
                              <AlertTriangle size={11} /> Eror
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">{row.nama_pemegang}</td>
                        <td className="px-3 py-2 font-medium text-slate-800 dark:text-slate-200">{row.merk_type}</td>
                        <td className="px-3 py-2 text-center font-mono">{row.tahun || '-'}</td>
                        <td className="px-3 py-2 text-center font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20">{row.nopol_baru}</td>
                        <td className="px-3 py-2 text-center font-mono text-slate-500">{row.nopol_lama || '-'}</td>
                        <td className="px-3 py-2 font-mono text-[10px] text-slate-700 dark:text-slate-300">{row.nomor_mesin || '-'}</td>
                        <td className="px-3 py-2 font-mono text-[10px] text-slate-700 dark:text-slate-300">{row.nomor_rangka || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {invalidRows.length > 0 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Info size={13} className="shrink-0" />
                  Baris tanpa nama pemegang atau nomor polisi baru tidak akan dimasukkan ke database. Periksa kelengkapan file Excel Anda.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={resetState}
            disabled={!file || isSubmitting}
            className="min-h-touch h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Reset / Ganti File
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="min-h-touch h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={validRows.length === 0 || isSubmitting}
              className="min-h-touch h-10 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Menyimpan ke Database...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={15} strokeWidth={2.5} />
                  <span>Simpan {validRows.length} Kendaraan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
