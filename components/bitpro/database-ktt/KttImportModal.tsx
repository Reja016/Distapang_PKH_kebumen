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
import { downloadKttTemplate } from '@/lib/excelTemplateHelper';

interface ParsedKttRow {
  kecamatan: string;
  desa: string;
  nama_kelompok: string;
  nama_ketua: string;
  jenis_kelompok: string;
  kelas_kelompok: string;
  nomor_register?: string;
  gapoktan_induk?: string;
  luas_lahan_ha: number;
  anggota_laki: number;
  anggota_perempuan: number;
  isValid: boolean;
  validationError?: string;
}

interface KttImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function KttImportModal({
  isOpen,
  onClose,
  onSuccess,
}: KttImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedKttRow[]>([]);
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

        const rows: ParsedKttRow[] = [];

        for (const raw of rawData) {
          const rawKec = String(
            raw['Kecamatan'] ||
              raw['kecamatan'] ||
              raw['Kecamatan / Wilayah'] ||
              ''
          ).trim();

          const rawDesa = String(
            raw['Desa'] ||
              raw['desa'] ||
              raw['Desa / Kelurahan'] ||
              ''
          ).trim();

          const rawNamaKelompok = String(
            raw['Nama Kelompok'] ||
              raw['nama_kelompok'] ||
              raw['Nama KTT'] ||
              raw['Kelompok'] ||
              ''
          ).trim();

          const rawKetua = String(
            raw['Nama Ketua'] ||
              raw['nama_ketua'] ||
              raw['Ketua Kelompok'] ||
              raw['Ketua'] ||
              ''
          ).trim();

          const rawJenis = String(
            raw['Jenis Kelompok'] ||
              raw['jenis_kelompok'] ||
              raw['Komoditas'] ||
              'Sapi Potong'
          ).trim();

          const rawKelas = String(
            raw['Kelas Kelompok'] ||
              raw['kelas_kelompok'] ||
              raw['Kelas'] ||
              'Pemula'
          ).trim();

          const rawReg = String(
            raw['Nomor Register'] ||
              raw['nomor_register'] ||
              raw['No Register'] ||
              '-'
          ).trim();

          const rawGapoktan = String(
            raw['Gapoktan Induk (Opsional)'] ||
              raw['Gapoktan Induk'] ||
              raw['gapoktan_induk'] ||
              raw['Gapoktan'] ||
              '-'
          ).trim();

          const rawLuas =
            raw['Luas Lahan (Ha)'] !== undefined && raw['Luas Lahan (Ha)'] !== ''
              ? Number(raw['Luas Lahan (Ha)'])
              : raw['luas_lahan_ha'] !== undefined && raw['luas_lahan_ha'] !== ''
              ? Number(raw['luas_lahan_ha'])
              : 0;

          const rawLaki =
            raw['Anggota Laki-laki'] !== undefined && raw['Anggota Laki-laki'] !== ''
              ? parseInt(String(raw['Anggota Laki-laki']), 10)
              : raw['anggota_laki'] !== undefined && raw['anggota_laki'] !== ''
              ? parseInt(String(raw['anggota_laki']), 10)
              : 0;

          const rawPerempuan =
            raw['Anggota Perempuan'] !== undefined && raw['Anggota Perempuan'] !== ''
              ? parseInt(String(raw['Anggota Perempuan']), 10)
              : raw['anggota_perempuan'] !== undefined && raw['anggota_perempuan'] !== ''
              ? parseInt(String(raw['anggota_perempuan']), 10)
              : 0;

          if (!rawKec && !rawNamaKelompok) {
            continue; // Baris kosong
          }

          let isValid = true;
          let validationError = '';

          if (!rawKec) {
            isValid = false;
            validationError = 'Kecamatan wajib diisi';
          } else if (!rawNamaKelompok) {
            isValid = false;
            validationError = 'Nama kelompok wajib diisi';
          }

          rows.push({
            kecamatan: rawKec,
            desa: rawDesa || '-',
            nama_kelompok: rawNamaKelompok,
            nama_ketua: rawKetua || '-',
            jenis_kelompok: rawJenis || 'Sapi Potong',
            kelas_kelompok: rawKelas || 'Pemula',
            nomor_register: rawReg || '-',
            gapoktan_induk: rawGapoktan || '-',
            luas_lahan_ha: Math.max(0, isNaN(rawLuas) ? 0 : rawLuas),
            anggota_laki: Math.max(0, isNaN(rawLaki) ? 0 : rawLaki),
            anggota_perempuan: Math.max(0, isNaN(rawPerempuan) ? 0 : rawPerempuan),
            isValid,
            validationError,
          });
        }

        if (rows.length === 0) {
          throw new Error('Tidak ada baris data kelompok tani ternak yang terdeteksi.');
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
      setErrorMessage('Terjadi kendala saat membaca file Excel.');
      setIsParsing(false);
    };

    reader.readAsBinaryString(uploadedFile);
  };

  // Kirim data ke API batch
  const handleSubmit = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setErrorMessage('Tidak ada data valid yang dapat disimpan.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ktt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: validRows }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || json.message || 'Gagal mengimpor data ke server.');
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Error import KTT:', err);
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
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <UploadCloud size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Import Excel Database Kelompok Tani Ternak (KTT)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  Input Massal
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unggah buku register master KTT banyak desa/kecamatan sekaligus secara cepat
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
          <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  1
                </span>
                <span className="font-bold text-sm text-emerald-950 dark:text-emerald-200">
                  Unduh Template Resmi SiMantap (.xlsx)
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 pl-7">
                Format template telah disesuaikan dengan struktur Buku Register Induk KTT Kabupaten Kebumen.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadKttTemplate}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              <Download size={14} />
              <span>Unduh Template Excel</span>
            </button>
          </div>

          {/* STEP 2: Upload File Excel */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Pilih File Excel yang Sudah Diisi
              </span>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center gap-3 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-850/50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
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
              <Loader2 size={16} className="animate-spin text-emerald-600" />
              <span>Sedang memvalidasi baris data kelompok tani...</span>
            </div>
          )}

          {/* Alert Error */}
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
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                    3
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    Pratinjau Data Kelompok Tani
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
                      <th className="p-2.5">Kecamatan</th>
                      <th className="p-2.5">Desa</th>
                      <th className="p-2.5">Nama Kelompok</th>
                      <th className="p-2.5">Nama Ketua</th>
                      <th className="p-2.5">Komoditas</th>
                      <th className="p-2.5 text-center">Kelas</th>
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
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">{row.kecamatan || '-'}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{row.desa || '-'}</td>
                        <td className="p-2.5 font-bold text-emerald-700 dark:text-emerald-300">{row.nama_kelompok || '-'}</td>
                        <td className="p-2.5 text-slate-700 dark:text-slate-200">{row.nama_ketua || '-'}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-300">{row.jenis_kelompok || '-'}</td>
                        <td className="p-2.5 text-center font-semibold">{row.kelas_kelompok || '-'}</td>
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

          {/* Info Aturan Wilayah */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
            <Info size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>
                <strong>Buku Register KTT SiMantap:</strong> Data yang diimpor akan langsung tersimpan ke database induk kelompok tani dan dapat dikelola arsip dokumen digitalnya (AD/ART, SK Kemenkumham, dll).
              </p>
              <p>
                Petugas lapangan hanya dapat mengimpor data untuk kecamatan yang berada dalam wilayah binaan kerjanya.
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
            className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Menyimpan ke Server...</span>
              </>
            ) : (
              <>
                <UploadCloud size={14} />
                <span>Simpan {validCount} Kelompok Tani</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
