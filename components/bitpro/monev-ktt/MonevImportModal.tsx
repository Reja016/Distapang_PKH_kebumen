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
  Activity,
} from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { downloadMonevKttTemplate } from '@/lib/excelTemplateHelper';
import { showToast } from '@/components/common/CustomToast';

export interface ParsedMonevRow {
  tahun: string;
  nama_ktt: string;
  nama_ketua: string;
  kecamatan: string;
  desa: string;
  jenis_ternak: string;
  betina: number;
  jantan: number;
  bibit_odot: number;
  obat_paket: number;
  anak_lahir: number;
  anak_mati: number;
  anak_dijual: number;
  pokok_mati: number;
  pokok_potong_paksa: number;
  pokok_dijual: number;
  beli_pengganti: number;
  waktu_monev: string;
  keterangan: string;
  lat: number | null;
  lng: number | null;
  isValid: boolean;
  validationError?: string;
}

interface MonevImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedYear?: string;
}

export default function MonevImportModal({
  isOpen,
  onClose,
  onSuccess,
  selectedYear = '2026',
}: MonevImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedMonevRow[]>([]);
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
            name.toLowerCase().includes('monev') ||
            name.toLowerCase().includes('ktt') ||
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

        const rows: ParsedMonevRow[] = rawJson.map((row: any) => {
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

          const nama_ktt = String(
            getVal(['namaktt', 'ktt', 'namakelompok', 'namakelompokktt', 'kelompok']) || ''
          ).trim();

          const tahun = String(
            getVal(['tahunbantuan', 'tahun', 'thbantuan', 'th']) || selectedYear
          ).trim();

          const nama_ketua = String(getVal(['namaketua', 'ketua', 'namaketuakelompok']) || '').trim();
          const kecamatan = String(getVal(['kecamatan', 'kec']) || '').trim().toUpperCase();
          const desa = String(getVal(['desa', 'kelurahan', 'desakelurahan']) || '').trim().toUpperCase();
          const jenis_ternak = String(getVal(['jenisternak', 'jenis', 'komoditas']) || 'Sapi').trim();

          const betina = parseInt(String(getVal(['betinab', 'betina', 'b', 'awalbetina']) || '0'), 10) || 0;
          const jantan = parseInt(String(getVal(['jantanj', 'jantan', 'j', 'awaljantan']) || '0'), 10) || 0;
          const bibit_odot = parseInt(String(getVal(['bibitodotstek', 'bibitodot', 'odot']) || '0'), 10) || 0;
          const obat_paket = parseInt(String(getVal(['obatpaket', 'obatobatanpaket', 'obat']) || '0'), 10) || 0;

          const anak_lahir = parseInt(String(getVal(['anaklahir', 'lahiranak', 'lahir']) || '0'), 10) || 0;
          const anak_mati = parseInt(String(getVal(['anakmati', 'matianak']) || '0'), 10) || 0;
          const anak_dijual = parseInt(String(getVal(['anakdijual', 'jualanak', 'anakjual']) || '0'), 10) || 0;
          const pokok_mati = parseInt(String(getVal(['pokokmati', 'matipokok', 'matibangkai']) || '0'), 10) || 0;
          const pokok_potong_paksa = parseInt(String(getVal(['pokokpotongpaksa', 'potongpaksa', 'matipotong']) || '0'), 10) || 0;
          const pokok_dijual = parseInt(String(getVal(['pokokdijual', 'pokokjual', 'jualpokok']) || '0'), 10) || 0;
          const beli_pengganti = parseInt(String(getVal(['belipengganti', 'pengganti', 'beli']) || '0'), 10) || 0;

          const rawWaktu = getVal(['kondisiwaktumonev', 'waktumonev', 'kondisitahun', 'waktu', 'tanggal']);
          const waktu_monev = rawWaktu ? formatCellDate(rawWaktu) : new Date().toISOString().split('T')[0];

          const keterangan = String(getVal(['keterangansumberdana', 'keterangan', 'sumberdana', 'catatan', 'ket']) || '').trim();

          const rawLat = getVal(['latitude', 'lat']);
          const rawLng = getVal(['longitude', 'lng', 'long']);
          const lat = rawLat !== '' && !isNaN(Number(rawLat)) ? Number(rawLat) : null;
          const lng = rawLng !== '' && !isNaN(Number(rawLng)) ? Number(rawLng) : null;

          let isValid = true;
          let validationError = '';

          if (!nama_ktt) {
            isValid = false;
            validationError = 'Nama KTT wajib diisi';
          }

          return {
            tahun,
            nama_ktt,
            nama_ketua,
            kecamatan,
            desa,
            jenis_ternak,
            betina,
            jantan,
            bibit_odot,
            obat_paket,
            anak_lahir,
            anak_mati,
            anak_dijual,
            pokok_mati,
            pokok_potong_paksa,
            pokok_dijual,
            beli_pengganti,
            waktu_monev,
            keterangan,
            lat,
            lng,
            isValid,
            validationError,
          };
        });

        const filtered = rows.filter((r) => r.nama_ktt || r.kecamatan || r.desa);

        if (filtered.length === 0) {
          setErrorMessage('Tidak ada data valid yang dapat diimpor.');
        } else {
          setParsedRows(filtered);
        }
      } catch (err: any) {
        console.error('Error parsing excel:', err);
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

  const handleSubmit = async () => {
    if (parsedRows.length === 0) return;
    if (validRowCount === 0) {
      showToast.error('Tidak ada baris data yang valid untuk disimpan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const validRowsToSubmit = parsedRows.filter((r) => r.isValid);

      const res = await fetch('/api/monev-ktt/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: validRowsToSubmit }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || result.message || 'Gagal menyimpan data ke database.');
      }

      showToast.success(
        `Sukses! ${result.insertedCount || validRowsToSubmit.length} data monev KTT berhasil diimpor.`
      );
      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('Error submitting monev import:', err);
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
                Import Data Monitoring &amp; Evaluasi KTT (Monev)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unggah data hibah ternak, bantuan bibit/obat, dan dinamika mutasi ternak secara massal.
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
                Gunakan format template standar dengan kolom bantuan awal (Jantan/Betina/Odot/Obat) dan kolom mutasi (Lahir/Mati/Jual/Beli).
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadMonevKttTemplate(selectedYear)}
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
                    Membaca dan memverifikasi data Excel...
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
                    Pratinjau &amp; Validasi Data ({parsedRows.length} Baris)
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
                        <th className="py-2.5 px-3 font-bold text-center">Tahun</th>
                        <th className="py-2.5 px-3 font-bold">Nama KTT</th>
                        <th className="py-2.5 px-3 font-bold">Ketua</th>
                        <th className="py-2.5 px-3 font-bold">Wilayah (Kec/Desa)</th>
                        <th className="py-2.5 px-3 font-bold text-center">Ternak</th>
                        <th className="py-2.5 px-3 font-bold text-right">Awal (B/J)</th>
                        <th className="py-2.5 px-3 font-bold text-right">Lahir</th>
                        <th className="py-2.5 px-3 font-bold text-right">Mati</th>
                        <th className="py-2.5 px-3 font-bold text-right">Jual</th>
                        <th className="py-2.5 px-3 font-bold text-center">Waktu Monev</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {parsedRows.map((row, idx) => {
                        const totalMati = row.pokok_mati + row.pokok_potong_paksa + row.anak_mati;
                        const totalJual = row.pokok_dijual + row.anak_dijual;

                        return (
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
                            <td className="py-2 px-3 text-center font-mono text-slate-700 dark:text-slate-300">
                              {row.tahun}
                            </td>
                            <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                              {row.nama_ktt}
                            </td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                              {row.nama_ketua || '-'}
                            </td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                              {row.kecamatan || '-'} {row.desa ? `/ ${row.desa}` : ''}
                            </td>
                            <td className="py-2 px-3 text-center whitespace-nowrap">
                              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {row.jenis_ternak}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                              {row.betina} B / {row.jantan} J
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-emerald-700 dark:text-emerald-400">
                              +{row.anak_lahir}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-rose-600 dark:text-rose-400">
                              -{totalMati}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-amber-600 dark:text-amber-400">
                              {totalJual}
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              {row.waktu_monev}
                            </td>
                          </tr>
                        );
                      })}
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
                <span>Simpan {validRowCount} Data Monev</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
