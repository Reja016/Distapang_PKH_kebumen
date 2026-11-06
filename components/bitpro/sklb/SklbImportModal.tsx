'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Layers,
} from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { downloadSklbTemplate } from '@/lib/excelTemplateHelper';
import { showToast } from '@/components/common/CustomToast';

export interface ParsedSklbDetailRow {
  desa_lokasi: string;
  no: number;
  nama_pemilik: string;
  dusun: string;
  rt: string;
  rw: string;
  nama_sapi: string;
  jenis_kelamin: string;
  kode_bapak: string;
  kode_induk: string;
  umur_bulan: number;
  tinggi_pundak: number;
  panjang_badan: number;
  lingkar_dada: number;
  berat_badan: number;
  isValid: boolean;
  validationError?: string;
}

export interface ParsedSklbRekapRow {
  tahun: number;
  grup: string;
  no_urut: number;
  tanggal: string;
  kecamatan: string;
  desa: string;
  target: number;
  capaian: number;
  selisih: number;
  isValid: boolean;
  validationError?: string;
}

interface SklbImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialTab?: 'detail' | 'rekap';
  selectedYear: number;
}

export default function SklbImportModal({
  isOpen,
  onClose,
  onSuccess,
  initialTab = 'detail',
  selectedYear,
}: SklbImportModalProps) {
  const [activeMode, setActiveMode] = useState<'detail' | 'rekap'>(initialTab);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [detailRows, setDetailRows] = useState<ParsedSklbDetailRow[]>([]);
  const [rekapRows, setRekapRows] = useState<ParsedSklbRekapRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActiveMode(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const resetState = () => {
    setFile(null);
    setDetailRows([]);
    setRekapRows([]);
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

        let parsedAny = false;

        // 1. Parsing Sheet Detail Ternak jika ada
        const detailSheetName = sheetNames.find(
          (name) =>
            name.toLowerCase().includes('detail') ||
            name.toLowerCase().includes('ternak') ||
            name.toLowerCase().includes('sapi')
        );

        if (detailSheetName && workbook.Sheets[detailSheetName]) {
          const rawDetail: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[detailSheetName], { defval: '' });
          if (rawDetail && rawDetail.length > 0) {
            const rows: ParsedSklbDetailRow[] = [];
            rawDetail.forEach((raw, idx) => {
              const desa = String(raw['Desa Lokasi'] || raw['desa_lokasi'] || raw['Desa'] || '').trim();
              const pemilik = String(raw['Nama Pemilik / Peternak'] || raw['Nama Pemilik'] || raw['nama_pemilik'] || raw['Peternak'] || '').trim();
              const no = Number(raw['No Urut'] || raw['no'] || raw['No'] || idx + 1) || (idx + 1);
              const dusun = String(raw['Dusun'] || raw['dusun'] || '').trim();
              const rt = String(raw['RT'] || raw['rt'] || '').trim();
              const rw = String(raw['RW'] || raw['rw'] || '').trim();
              const namaSapi = String(raw['Nama Sapi / Eartag'] || raw['Nama Sapi'] || raw['nama_sapi'] || '-').trim();
              const kelamin = String(raw['Jenis Kelamin'] || raw['jenis_kelamin'] || 'Betina').trim();
              const kodeBapak = String(raw['Kode Pejantan / Bapak'] || raw['kode_bapak'] || '-').trim();
              const kodeInduk = String(raw['Kode Induk'] || raw['kode_induk'] || '-').trim();
              const umur = Number(raw['Umur (Bulan)'] || raw['umur_bulan'] || raw['Umur']) || 0;
              const tp = Number(raw['Tinggi Pundak (cm)'] || raw['tinggi_pundak'] || raw['Tinggi']) || 0;
              const pb = Number(raw['Panjang Badan (cm)'] || raw['panjang_badan'] || raw['Panjang']) || 0;
              const ld = Number(raw['Lingkar Dada (cm)'] || raw['lingkar_dada'] || raw['Dada']) || 0;
              const bb = Number(raw['Berat Badan (kg)'] || raw['berat_badan'] || raw['Berat']) || 0;

              let isValid = true;
              let validationError = '';
              if (!desa && !pemilik) {
                isValid = false;
                validationError = 'Desa dan Nama Pemilik tidak boleh kosong';
              } else if (!pemilik) {
                isValid = false;
                validationError = 'Nama Pemilik wajib diisi';
              }

              rows.push({
                desa_lokasi: desa,
                no,
                nama_pemilik: pemilik,
                dusun,
                rt,
                rw,
                nama_sapi: namaSapi,
                jenis_kelamin: kelamin,
                kode_bapak: kodeBapak,
                kode_induk: kodeInduk,
                umur_bulan: umur,
                tinggi_pundak: tp,
                panjang_badan: pb,
                lingkar_dada: ld,
                berat_badan: bb,
                isValid,
                validationError,
              });
            });

            setDetailRows(rows);
            parsedAny = true;
          }
        }

        // 2. Parsing Sheet Rekapitulasi Capaian jika ada
        const rekapSheetName = sheetNames.find(
          (name) =>
            name.toLowerCase().includes('rekap') ||
            name.toLowerCase().includes('capaian') ||
            name.toLowerCase().includes('jadwal')
        );

        if (rekapSheetName && workbook.Sheets[rekapSheetName]) {
          const rawRekap: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[rekapSheetName], { defval: '' });
          if (rawRekap && rawRekap.length > 0) {
            const rows: ParsedSklbRekapRow[] = [];
            rawRekap.forEach((raw, idx) => {
              const th = Number(raw['Tahun'] || raw['tahun'] || selectedYear) || selectedYear;
              const grup = String(raw['Grup / Tim'] || raw['Grup'] || raw['grup'] || 'Tabel Kiri').trim();
              const noUrut = Number(raw['No Urut'] || raw['no_urut'] || idx + 1) || (idx + 1);
              const tgl = String(raw['Tanggal Pelaksanaan'] || raw['Tanggal'] || raw['tanggal'] || '-').trim();
              const kec = String(raw['Kecamatan'] || raw['kecamatan'] || '').trim();
              const desa = String(raw['Desa'] || raw['desa'] || '').trim();
              const target = Number(raw['Target (Ekor)'] || raw['Target'] || raw['target']) || 0;
              const capaian = Number(raw['Capaian (Ekor)'] || raw['Capaian'] || raw['capaian']) || 0;
              const selisih = capaian - target;

              let isValid = true;
              let validationError = '';
              if (!desa || !kec) {
                isValid = false;
                validationError = 'Desa dan Kecamatan wajib diisi';
              }

              rows.push({
                tahun: th,
                grup,
                no_urut: noUrut,
                tanggal: tgl,
                kecamatan: kec,
                desa,
                target,
                capaian,
                selisih,
                isValid,
                validationError,
              });
            });

            setRekapRows(rows);
            parsedAny = true;
          }
        }

        // Fallback: Jika tidak ada sheet bernama detail/rekap, parse sheet pertama
        if (!parsedAny && sheetNames.length > 0) {
          const firstSheet = workbook.Sheets[sheetNames[0]];
          const rawFirst: any[] = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
          if (rawFirst && rawFirst.length > 0) {
            // Cek apakah ini detail atau rekap berdasarkan kolom
            const firstRow = rawFirst[0] || {};
            const keys = Object.keys(firstRow).map((k) => k.toLowerCase());
            const hasDetailKeys = keys.some((k) => k.includes('pemilik') || k.includes('pundak') || k.includes('sapi'));

            if (hasDetailKeys) {
              const rows: ParsedSklbDetailRow[] = rawFirst.map((raw, idx) => ({
                desa_lokasi: String(raw['Desa Lokasi'] || raw['Desa'] || '').trim(),
                no: Number(raw['No Urut'] || raw['No'] || idx + 1) || (idx + 1),
                nama_pemilik: String(raw['Nama Pemilik / Peternak'] || raw['Nama Pemilik'] || raw['Peternak'] || '').trim(),
                dusun: String(raw['Dusun'] || '').trim(),
                rt: String(raw['RT'] || '').trim(),
                rw: String(raw['RW'] || '').trim(),
                nama_sapi: String(raw['Nama Sapi / Eartag'] || raw['Nama Sapi'] || '-').trim(),
                jenis_kelamin: String(raw['Jenis Kelamin'] || 'Betina').trim(),
                kode_bapak: String(raw['Kode Pejantan / Bapak'] || '-').trim(),
                kode_induk: String(raw['Kode Induk'] || '-').trim(),
                umur_bulan: Number(raw['Umur (Bulan)'] || raw['Umur']) || 0,
                tinggi_pundak: Number(raw['Tinggi Pundak (cm)'] || raw['Tinggi']) || 0,
                panjang_badan: Number(raw['Panjang Badan (cm)'] || raw['Panjang']) || 0,
                lingkar_dada: Number(raw['Lingkar Dada (cm)'] || raw['Dada']) || 0,
                berat_badan: Number(raw['Berat Badan (kg)'] || raw['Berat']) || 0,
                isValid: Boolean(raw['Nama Pemilik / Peternak'] || raw['Nama Pemilik'] || raw['Peternak']),
              }));
              setDetailRows(rows);
              setActiveMode('detail');
            } else {
              const rows: ParsedSklbRekapRow[] = rawFirst.map((raw, idx) => ({
                tahun: Number(raw['Tahun'] || selectedYear) || selectedYear,
                grup: String(raw['Grup / Tim'] || 'Tabel Kiri').trim(),
                no_urut: Number(raw['No Urut'] || idx + 1) || (idx + 1),
                tanggal: String(raw['Tanggal Pelaksanaan'] || '-').trim(),
                kecamatan: String(raw['Kecamatan'] || '').trim(),
                desa: String(raw['Desa'] || '').trim(),
                target: Number(raw['Target (Ekor)'] || 0),
                capaian: Number(raw['Capaian (Ekor)'] || 0),
                selisih: Number(raw['Capaian (Ekor)'] || 0) - Number(raw['Target (Ekor)'] || 0),
                isValid: Boolean(raw['Desa'] && raw['Kecamatan']),
              }));
              setRekapRows(rows);
              setActiveMode('rekap');
            }
            parsedAny = true;
          }
        }

        if (!parsedAny) {
          throw new Error('Tidak dapat menemukan data valid di dalam file Excel.');
        }

        setIsParsing(false);
      } catch (err: any) {
        console.error('Error saat parsing file Excel SKLB:', err);
        setErrorMessage(err.message || 'Format file Excel tidak sesuai dengan template resmi SiMantap.');
        setIsParsing(false);
      }
    };

    reader.readAsBinaryString(uploadedFile);
  };

  const validDetail = detailRows.filter((r) => r.isValid);
  const invalidDetail = detailRows.filter((r) => !r.isValid);

  const validRekap = rekapRows.filter((r) => r.isValid);
  const invalidRekap = rekapRows.filter((r) => !r.isValid);

  const currentRowsCount = activeMode === 'detail' ? validDetail.length : validRekap.length;

  const handleSubmit = async () => {
    if (currentRowsCount === 0) {
      showToast.error('Tidak ada data valid yang siap diimpor untuk tab ini!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (activeMode === 'detail') {
        const response = await fetch('/api/sync-sklb-detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: validDetail }),
        });
        const resData = await response.json();
        if (!response.ok || !resData.success) {
          throw new Error(resData.error || resData.message || 'Gagal menyimpan data detail sapi.');
        }
        showToast.success(resData.message || `Berhasil mengimpor ${validDetail.length} data sapi calon bibit!`);
      } else {
        const response = await fetch(`/api/sync-sklb-summary?tahun=${selectedYear}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: validRekap, tahun: selectedYear }),
        });
        const resData = await response.json();
        if (!response.ok || !resData.success) {
          throw new Error(resData.error || resData.message || 'Gagal menyimpan data rekapitulasi.');
        }
        showToast.success(resData.message || `Berhasil mengimpor ${validRekap.length} data rekap capaian SKLB!`);
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Gagal mengirim data import SKLB:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat menyimpan data.');
      showToast.error(err.message || 'Gagal mengimpor data SKLB.');
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
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <UploadCloud size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                Import Data SKLB (Excel Gelondongan)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unggah hasil pengukuran morfometrik sapi bibit atau rekap capaian lapangan ({selectedYear})
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
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveMode('detail')}
              className={`min-h-touch h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeMode === 'detail'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Layers size={14} />
              <span>Detail Ternak Calon Bibit {detailRows.length > 0 ? `(${detailRows.length})` : ''}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('rekap')}
              className={`min-h-touch h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeMode === 'rekap'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <FileSpreadsheet size={14} />
              <span>Rekapitulasi Capaian Tim {rekapRows.length > 0 ? `(${rekapRows.length})` : ''}</span>
            </button>
          </div>

          {/* STEP 1: Download Template */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <FileSpreadsheet size={18} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                  Langkah 1: Gunakan Template Resmi SiMantap SKLB
                </h4>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Template memuat 2 lembar kerja: <strong>Detail_Ternak_SKLB</strong> (morfometrik sapi) &amp; <strong>Rekapitulasi_Capaian</strong> serta lembar petunjuk.
                </p>
              </div>
            </div>
            <button
              onClick={downloadSklbTemplate}
              type="button"
              className="min-h-touch h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Download size={14} strokeWidth={2.5} />
              <span>Unduh Template SKLB</span>
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
                  ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/10'
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50'
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
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 flex items-center justify-center shadow-xs">
                  {isParsing ? (
                    <Loader2 size={24} className="animate-spin text-emerald-600" />
                  ) : (
                    <UploadCloud size={24} />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                    {file ? file.name : 'Klik untuk memilih file Excel SKLB atau seret ke sini'}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Mendukung format .XLSX dan .XLS dengan sheet Detail Ternak atau Rekap Capaian
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
          {activeMode === 'detail' && detailRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider">
                    Langkah 3: Pratinjau Master Detail Ternak ({detailRows.length} Ekor Terbaca)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Data karakteristik morfometrik individu sapi yang akan disimpan ke database
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <Check size={12} strokeWidth={3} />
                    {validDetail.length} Valid
                  </span>
                  {invalidDetail.length > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle size={12} />
                      {invalidDetail.length} Perlu Dicek
                    </span>
                  )}
                </div>
              </div>

              {/* Table Preview Detail */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto shadow-2xs">
                <table className="w-full text-left text-[11px] sm:text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-3 py-2.5 text-center w-10">No</th>
                      <th className="px-3 py-2.5 text-center w-20">Status</th>
                      <th className="px-3 py-2.5">Desa</th>
                      <th className="px-3 py-2.5">Nama Pemilik</th>
                      <th className="px-3 py-2.5">Nama Sapi</th>
                      <th className="px-3 py-2.5 text-center">Kelamin</th>
                      <th className="px-3 py-2.5 text-right">Umur</th>
                      <th className="px-3 py-2.5 text-right">Tinggi (cm)</th>
                      <th className="px-3 py-2.5 text-right">Panjang (cm)</th>
                      <th className="px-3 py-2.5 text-right">Dada (cm)</th>
                      <th className="px-3 py-2.5 text-right">Berat (kg)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {detailRows.map((row, idx) => (
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
                        <td className="px-3 py-2 font-bold text-emerald-700 dark:text-emerald-400">{row.desa_lokasi}</td>
                        <td className="px-3 py-2 font-bold text-slate-900 dark:text-white">{row.nama_pemilik}</td>
                        <td className="px-3 py-2 text-slate-800 dark:text-slate-200">{row.nama_sapi}</td>
                        <td className="px-3 py-2 text-center">{row.jenis_kelamin}</td>
                        <td className="px-3 py-2 text-right font-mono">{row.umur_bulan} bln</td>
                        <td className="px-3 py-2 text-right font-mono">{row.tinggi_pundak}</td>
                        <td className="px-3 py-2 text-right font-mono">{row.panjang_badan}</td>
                        <td className="px-3 py-2 text-right font-mono">{row.lingkar_dada}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-slate-900 dark:text-white">{row.berat_badan}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMode === 'rekap' && rekapRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider">
                    Langkah 3: Pratinjau Rekapitulasi Capaian ({rekapRows.length} Lokasi Terbaca)
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Jadwal lapangan dan target capaian tim penilaian SKLB ({selectedYear})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <Check size={12} strokeWidth={3} />
                    {validRekap.length} Valid
                  </span>
                  {invalidRekap.length > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                      <AlertTriangle size={12} />
                      {invalidRekap.length} Perlu Dicek
                    </span>
                  )}
                </div>
              </div>

              {/* Table Preview Rekap */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto shadow-2xs">
                <table className="w-full text-left text-[11px] sm:text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-3 py-2.5 text-center w-10">No</th>
                      <th className="px-3 py-2.5 text-center w-20">Status</th>
                      <th className="px-3 py-2.5">Grup</th>
                      <th className="px-3 py-2.5">Tanggal</th>
                      <th className="px-3 py-2.5">Kecamatan</th>
                      <th className="px-3 py-2.5">Desa</th>
                      <th className="px-3 py-2.5 text-right">Target</th>
                      <th className="px-3 py-2.5 text-right">Capaian</th>
                      <th className="px-3 py-2.5 text-right">Selisih</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {rekapRows.map((row, idx) => (
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
                        <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{row.grup}</td>
                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">{row.tanggal}</td>
                        <td className="px-3 py-2 font-semibold text-slate-900 dark:text-white">{row.kecamatan}</td>
                        <td className="px-3 py-2 font-bold text-emerald-700 dark:text-emerald-400">{row.desa}</td>
                        <td className="px-3 py-2 text-right font-mono">{row.target}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">{row.capaian}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold">{row.selisih}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              disabled={currentRowsCount === 0 || isSubmitting}
              className="min-h-touch h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Menyimpan ke Database...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={15} strokeWidth={2.5} />
                  <span>
                    Simpan {currentRowsCount} {activeMode === 'detail' ? 'Data Sapi' : 'Data Rekap'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
