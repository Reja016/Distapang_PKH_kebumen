'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx-js-style';
import {
  UploadCloud,
  Download,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from 'lucide-react';
import { downloadRphPemotonganTemplate } from '@/lib/excelTemplateHelper';
import { showToast } from '@/components/common/CustomToast';

interface PencatatanPemotonganImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedPemotonganRow {
  tanggal: string;
  tempat_pemotongan: string;
  nama_tempat_lain?: string;
  nama_jagal?: string;
  nama_pemilik: string;
  kecamatan: string;
  desa: string;
  rumpun_hewan: string;
  kategori_hewan: string;
  jumlah_ekor: number;
  status_potong: string;
  bobot_hidup?: number;
  lingkar_dada?: number;
  pemeriksaan_antemortem?: string;
  pemeriksaan_postmortem?: string;
  status_kelayakan: string;
  isValid: boolean;
  validationError?: string;
}

export default function PencatatanPemotonganImportModal({
  isOpen,
  onClose,
  onSuccess,
}: PencatatanPemotonganImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedPemotonganRow[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsParsing(true);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array', cellDates: true });

      // Ambil sheet data (utamakan Template_Pemotongan atau sheet pertama)
      const sheetName = wb.SheetNames.includes('Template_Pemotongan')
        ? 'Template_Pemotongan'
        : wb.SheetNames[0];

      const ws = wb.Sheets[sheetName];
      const rawRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

      const mapped: ParsedPemotonganRow[] = rawRows.map((r, idx) => {
        // Normalisasi key
        const getVal = (possibleKeys: string[]) => {
          for (const k of possibleKeys) {
            if (r[k] !== undefined && r[k] !== '') return r[k];
          }
          return '';
        };

        // Format tanggal (dukung format string YYYY-MM-DD maupun objek Date dari Excel)
        let rawDate = getVal(['Tanggal (YYYY-MM-DD)', 'Tanggal', 'tanggal']);
        let formattedDate = '';
        if (rawDate instanceof Date) {
          formattedDate = rawDate.toISOString().split('T')[0];
        } else if (typeof rawDate === 'string' && rawDate.trim()) {
          const s = rawDate.trim();
          if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
            formattedDate = s;
          } else {
            const parsed = new Date(s);
            if (!isNaN(parsed.getTime())) {
              formattedDate = parsed.toISOString().split('T')[0];
            } else {
              formattedDate = s;
            }
          }
        }

        const tempat = String(getVal(['Tempat Pemotongan', 'tempat_pemotongan', 'Tempat'])).trim();
        const namaPemilik = String(getVal(['Nama Pemilik', 'nama_pemilik', 'Pemilik'])).trim();
        const namaJagal = String(getVal(['Nama Jagal', 'nama_jagal', 'Jagal'])).trim() || '-';
        const namaTempatLain = String(getVal(['Nama Tempat Lain (Jika Luar RPH)', 'Nama Tempat Lain', 'nama_tempat_lain'])).trim();
        const kec = String(getVal(['Kecamatan', 'kecamatan'])).trim() || '-';
        const desa = String(getVal(['Desa', 'desa'])).trim() || '-';
        const rumpun = String(getVal(['Rumpun Hewan', 'rumpun_hewan', 'Rumpun'])).trim() || 'Sapi PO';
        const kategori = String(getVal(['Kategori Hewan', 'kategori_hewan', 'Kategori'])).trim() || 'Jantan';
        const jml = Number(getVal(['Jumlah Ekor', 'jumlah_ekor', 'Jumlah'])) || 1;
        const statusPotong = String(getVal(['Status Izin Potong', 'status_potong', 'Status Potong'])).trim() || 'Boleh Dipotong';

        const rawBobot = getVal(['Bobot Hidup (Kg)', 'Bobot Hidup', 'bobot_hidup']);
        const bobot = rawBobot !== '' && !isNaN(Number(rawBobot)) ? Number(rawBobot) : undefined;

        const rawLingkar = getVal(['Lingkar Dada (Cm)', 'Lingkar Dada', 'lingkar_dada']);
        const lingkar = rawLingkar !== '' && !isNaN(Number(rawLingkar)) ? Number(rawLingkar) : undefined;

        const antemortem = String(getVal(['Pemeriksaan Antemortem', 'pemeriksaan_antemortem'])).trim() || 'Sehat, layak potong';
        const postmortem = String(getVal(['Pemeriksaan Postmortem', 'pemeriksaan_postmortem'])).trim() || 'Karkas & organ sehat';
        const kelayakan = String(getVal(['Status Kelayakan Daging', 'status_kelayakan', 'Kelayakan'])).trim() || 'Layak Konsumsi';

        // Validasi wajib
        let isValid = true;
        let validationError = '';

        if (!formattedDate) {
          isValid = false;
          validationError = 'Tanggal wajib diisi';
        } else if (!tempat) {
          isValid = false;
          validationError = 'Tempat pemotongan wajib diisi';
        } else if (!namaPemilik) {
          isValid = false;
          validationError = 'Nama pemilik wajib diisi';
        }

        return {
          tanggal: formattedDate,
          tempat_pemotongan: tempat,
          nama_tempat_lain: namaTempatLain === '-' ? '' : namaTempatLain,
          nama_jagal: namaJagal,
          nama_pemilik: namaPemilik,
          kecamatan: kec,
          desa,
          rumpun_hewan: rumpun,
          kategori_hewan: kategori,
          jumlah_ekor: jml,
          status_potong: statusPotong,
          bobot_hidup: bobot,
          lingkar_dada: lingkar,
          pemeriksaan_antemortem: antemortem,
          pemeriksaan_postmortem: postmortem,
          status_kelayakan: kelayakan,
          isValid,
          validationError,
        };
      });

      setParsedRows(mapped);
    } catch (err: any) {
      console.error('Error parsing excel:', err);
      showToast.error('Gagal membaca file Excel. Pastikan format berkas valid (.xlsx / .xls).');
    } finally {
      setIsParsing(false);
    }
  };

  const validRows = parsedRows.filter((r) => r.isValid);
  const invalidRows = parsedRows.filter((r) => !r.isValid);

  const handleSubmitBulk = async () => {
    if (validRows.length === 0) {
      showToast.error('Tidak ada baris data valid yang siap disimpan.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/pencatatan-pemotongan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: validRows }),
      });

      const json = await res.json();
      if (json.success) {
        showToast.success(`Berhasil mengimpor ${validRows.length} data pemotongan hewan!`);
        onSuccess();
        onClose();
      } else {
        showToast.error(json.error || 'Gagal menyimpan data massal.');
      }
    } catch (err: any) {
      showToast.error('Terjadi kesalahan koneksi saat mengimpor data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Modal */}
        <div className="p-4 sm:p-6 border-b border-purple-900 bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-950 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white shadow-xs">
              <UploadCloud size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                Import Data Pemotongan Hewan (Excel)
              </h3>
              <p className="text-xs text-purple-200/90 mt-0.5">
                Input data gelondongan menggunakan berkas Excel rapi berstandar SiMantap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-slate-800 dark:text-slate-100 text-xs">
          {/* ── LANGKAH 1: UNDUH TEMPLATE RESMI ── */}
          <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-extrabold text-purple-950 dark:text-purple-200 text-xs sm:text-sm">
                <FileSpreadsheet size={16} className="text-purple-600 dark:text-purple-400" />
                <span>1. Unduh Template Excel SiMantap</span>
              </div>
              <p className="text-[11px] text-purple-800/90 dark:text-purple-300">
                Template sudah diformat rapi (header resmi abu-abu, border, auto-fit kolom, baris contoh, dan sheet panduan pengisian).
              </p>
            </div>
            <button
              type="button"
              onClick={downloadRphPemotonganTemplate}
              className="h-9 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
            >
              <Download size={14} />
              <span>Unduh Template .xlsx</span>
            </button>
          </div>

          {/* ── LANGKAH 2: PILIH FILE & UPLOAD ── */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-700 dark:text-slate-300">
              2. Pilih File Excel yang Telah Diisi
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
            >
              <UploadCloud size={32} className="text-purple-600 dark:text-purple-400 mb-2" />
              <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                {fileName ? fileName : 'Klik di sini untuk memilih file Excel (.xlsx / .xls)'}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">
                Sistem akan membaca seluruh baris dan menghitung karkas/daging secara otomatis
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* ── LANGKAH 3: PREVIEW DATA TERBACA ── */}
          {isParsing ? (
            <div className="py-8 flex items-center justify-center gap-2 text-slate-500">
              <Loader2 size={18} className="animate-spin text-purple-600" />
              <span>Membaca data dari file Excel...</span>
            </div>
          ) : parsedRows.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  Ringkasan Data Terbaca ({parsedRows.length} baris):
                </span>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>{validRows.length} Valid</span>
                  </span>
                  {invalidRows.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-200 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{invalidRows.length} Tidak Lengkap</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Tabel Singkat */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto text-[11px]">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 sticky top-0">
                    <tr>
                      <th className="p-2 text-center w-8">No</th>
                      <th className="p-2">Tanggal</th>
                      <th className="p-2">Tempat</th>
                      <th className="p-2">Jagal</th>
                      <th className="p-2">Pemilik</th>
                      <th className="p-2">Rumpun & Bobot</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.slice(0, 10).map((row, idx) => (
                      <tr
                        key={idx}
                        className={
                          row.isValid
                            ? 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            : 'bg-rose-50/60 dark:bg-rose-950/30 text-rose-800'
                        }
                      >
                        <td className="p-2 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="p-2 font-medium">{row.tanggal || '-'}</td>
                        <td className="p-2">{row.tempat_pemotongan || '-'}</td>
                        <td className="p-2">{row.nama_jagal || '-'}</td>
                        <td className="p-2 font-bold">{row.nama_pemilik || '-'}</td>
                        <td className="p-2">
                          {row.rumpun_hewan} {row.bobot_hidup ? `(${row.bobot_hidup} kg)` : ''}
                        </td>
                        <td className="p-2 text-center">
                          {row.isValid ? (
                            <span className="text-emerald-700 font-bold">✓ Siap</span>
                          ) : (
                            <span className="text-rose-600 font-bold text-[10px]" title={row.validationError}>
                              {row.validationError}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 10 && (
                <p className="text-[10px] text-slate-400 italic text-right">
                  Menampilkan 10 dari total {parsedRows.length} baris data...
                </p>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5 bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isSubmitting || validRows.length === 0}
            onClick={handleSubmitBulk}
            className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Menyimpan {validRows.length} Data...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                <span>Simpan {validRows.length} Data Gelondongan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
