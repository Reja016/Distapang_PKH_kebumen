'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  Building2,
  User,
  ShieldCheck,
} from 'lucide-react';
import {
  SignatureConfig,
  DEFAULT_SIGNATURE_CONFIG,
  exportToExcelWithSignature,
  formatTanggalIndonesia,
} from '@/lib/excelExportHelper';

export default function CustomSignatureTab() {
  const [config, setConfig] = useState<SignatureConfig>(DEFAULT_SIGNATURE_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/signature-config');
      const json = await res.json();
      if (json.success && json.data) {
        setConfig(json.data);
      }
    } catch (e) {
      console.error('Gagal mengambil data tanda tangan:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/admin/signature-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const json = await res.json();

      if (json.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        alert(json.error || 'Gagal menyimpan pengaturan tanda tangan.');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Kembalikan template tanda tangan ke pengaturan standar dinas?')) {
      setConfig(DEFAULT_SIGNATURE_CONFIG);
    }
  };

  const handleTestDownload = async () => {
    await exportToExcelWithSignature({
      filename: `Sampel_Laporan_Tanda_Tangan_${Date.now()}`,
      sheetName: 'Sampel Tanda Tangan',
      title: 'SAMPEL PENGUJIAN FORMAT TANDA TANGAN DINAS',
      subtitle: 'Contoh Tampilan Resmi Dokumen Excel Siap Cetak',
      headers: ['No', 'Kode Kegiatan', 'Nama Program', 'Wilayah / Lokasi', 'Status Pelaksanaan', 'Capaian (Target)'],
      data: [
        [1, 'PROG-001', 'Pelayanan Medik Veteriner Rutin', 'Puskeswan Kebumen', 'Selesai', '100%'],
        [2, 'PROG-002', 'Vaksinasi PMK & Penandaan Ternak', 'Puskeswan Kutowinangun', 'Selesai', '98.5%'],
        [3, 'PROG-003', 'Puskeswan Keliling (Puskeswanling)', 'Puskeswan Prembun', 'Berlangsung', '94.2%'],
      ],
      signatureConfig: config,
    });
  };

  const todayStr = formatTanggalIndonesia(new Date());

  return (
    <div className="space-y-6">
      {/* Header Info Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Format Resmi Dokumen Dinas</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            Kustom Tanda Tangan Laporan Excel
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Pengaturan tanda tangan ini akan disematkan secara otomatis di bagian kanan bawah setiap file Excel yang diunduh di seluruh menu aplikasi. Jika ada pergantian pejabat, data otomatis ter-update serentak.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTestDownload}
          className="px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-2xs shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Uji Download Sampel Excel
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Pengaturan tanda tangan dinas berhasil disimpan dan langsung aktif di seluruh menu!</span>
        </div>
      )}

      {/* Main Grid: Form di Kiri, Live Replica Preview di Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Pengaturan (7 Kolom) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-xs">
          <form onSubmit={handleSave} className="space-y-4">
            {/* Toggle Status Aktif */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 flex items-center justify-between">
              <div>
                <label htmlFor="toggle-signature" className="text-xs font-bold text-slate-900 dark:text-white block cursor-pointer">
                  Tampilkan Tanda Tangan pada Excel
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Jika dinonaktifkan, file Excel hanya akan memuat data tabel tanpa tanda tangan.
                </p>
              </div>
              <input
                id="toggle-signature"
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Titimangsa Kota */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Titimangsa Kota / Lokasi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={config.kota}
                onChange={(e) => setConfig({ ...config, kota: e.target.value })}
                placeholder="Contoh: Kebumen"
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Otomatis dirangkai dengan tanggal saat unduh (misal: <i>{config.kota || 'Kebumen'}, {todayStr}</i>)
              </p>
            </div>

            {/* Jabatan Baris 1 & Baris 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jabatan (Baris 1) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={config.jabatanLine1}
                  onChange={(e) => setConfig({ ...config, jabatanLine1: e.target.value })}
                  placeholder="Contoh: Kepala Bidang Peternakan dan Kesehatan"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jabatan (Baris 2 - Lanjutan)
                </label>
                <input
                  type="text"
                  value={config.jabatanLine2}
                  onChange={(e) => setConfig({ ...config, jabatanLine2: e.target.value })}
                  placeholder="Contoh: Hewan"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>
            </div>

            {/* Nama Pejabat & Gelar */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap &amp; Gelar Pejabat <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={config.namaPejabat}
                onChange={(e) => setConfig({ ...config, namaPejabat: e.target.value })}
                placeholder="Contoh: drh. MARTI IKE W. E., MP."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900 dark:text-white"
              />
            </div>

            {/* Pangkat & NIP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pangkat / Golongan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={config.pangkat}
                  onChange={(e) => setConfig({ ...config, pangkat: e.target.value })}
                  placeholder="Contoh: Pembina"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor Induk Pegawai (NIP) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={config.nip}
                  onChange={(e) => setConfig({ ...config, nip: e.target.value })}
                  placeholder="Contoh: NIP. 19770225 200212 2 006"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-medium"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Default
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan Tanda Tangan'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Replica Preview (5 Kolom) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Pratinjau di File Excel (Live Replica)
                </h4>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                config.enabled
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
              }`}>
                {config.enabled ? 'Status: Aktif' : 'Status: Nonaktif'}
              </span>
            </div>

            {/* Replica Kertas Tanda Tangan persis seperti gambar yang dikirim user */}
            <div className="p-6 bg-white dark:bg-slate-950 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 font-sans text-center relative overflow-hidden select-none">
              {!config.enabled && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4 z-10">
                  <div className="bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-rose-300 text-center shadow-lg">
                    <p className="text-xs font-bold text-rose-600">Tanda Tangan Sedang Dinonaktifkan</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Centang opsi di sebelah kiri untuk mengaktifkan kembali</p>
                  </div>
                </div>
              )}

              <div className="space-y-1 text-slate-900 dark:text-slate-100">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-2 text-center">
                  {config.kota || 'Kebumen'}, {todayStr}
                </p>

                <p className="text-xs sm:text-sm font-normal leading-tight text-center">
                  {config.jabatanLine1 || 'Kepala Bidang Peternakan dan Kesehatan'}
                </p>
                {config.jabatanLine2 && (
                  <p className="text-xs sm:text-sm font-normal leading-tight text-center">
                    {config.jabatanLine2}
                  </p>
                )}

                {/* Ruang Tanda Tangan Basah */}
                <div className="h-20 flex items-center justify-center text-slate-300 dark:text-slate-700 text-[11px] italic font-serif my-2">
                  ( Ruang Tanda Tangan &amp; Cap Basah )
                </div>

                {/* Nama Pejabat (Tebal & Garis Bawah) */}
                <p className="text-xs sm:text-sm font-extrabold underline underline-offset-4 tracking-wide text-center">
                  {config.namaPejabat || 'drh. MARTI IKE W. E., MP.'}
                </p>

                {/* Pangkat */}
                <p className="text-xs font-normal text-slate-700 dark:text-slate-300 text-center">
                  {config.pangkat || 'Pembina'}
                </p>

                {/* NIP */}
                <p className="text-xs font-mono font-normal text-slate-800 dark:text-slate-200 text-center">
                  {config.nip || 'NIP. 19770225 200212 2 006'}
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                Format Sesuai Dokumen Dinas
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-[10px]">
                Format tanda tangan ini disematkan di kolom kanan bawah tabel Excel dengan lebar kolom otomatis (auto-fit), siap langsung dicetak atau disalin ke dokumen laporan lainnya.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
