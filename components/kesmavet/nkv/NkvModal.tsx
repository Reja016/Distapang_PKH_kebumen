'use client';

import React, { useRef, useState } from 'react';
import { ShieldCheck, Loader2, Camera, Upload, Image as ImageIcon, X } from 'lucide-react';
import { compressImageFile } from '@/lib/file-compressor';
import { NKVRecord } from './types';

interface NkvModalProps {
  show: boolean;
  editingId: string | null;
  formData: Omit<NKVRecord, 'id'>;
  setFormData: React.Dispatch<React.SetStateAction<Omit<NKVRecord, 'id'>>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
}

export default function NkvModal({
  show,
  editingId,
  formData,
  setFormData,
  onClose,
  onSubmit,
  isSubmitting = false,
}: NkvModalProps) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  if (!show) return null;

  const handleProcessImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar (JPG, PNG, atau WebP).');
      return;
    }

    try {
      setIsCompressing(true);
      const base64 = await compressImageFile(file, 1600, 0.8, 2 * 1024 * 1024);
      setFormData((prev) => ({ ...prev, foto: base64 }));
    } catch (err: any) {
      alert('Gagal memproses gambar: ' + (err.message || 'Format tidak didukung'));
    } finally {
      setIsCompressing(false);
      // Reset input agar bisa pilih/foto ulang file yang sama jika diinginkan
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {editingId ? 'Edit Data Unit Usaha NKV' : 'Tambah Unit Usaha NKV Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Formulir pencatatan 11 kolom nomor kontrol veteriner
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nama Usaha
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: RPH Kebumen (UPTD)"
                value={formData.namaUsaha}
                onChange={(e) => setFormData({ ...formData, namaUsaha: e.target.value })}
                className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-purple-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Jenis Usaha <span className="text-[11px] text-slate-400 font-normal">(opsional)</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: RPH Ruminansia / TPU Unggas / Gudang Telur"
                value={formData.jenisUsaha}
                onChange={(e) => setFormData({ ...formData, jenisUsaha: e.target.value })}
                className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-purple-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Proses <span className="text-[11px] text-slate-400 font-normal">(opsional)</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Sertifikasi NKV Tingkat II / Pembinaan Lapangan"
              value={formData.proses}
              onChange={(e) => setFormData({ ...formData, proses: e.target.value })}
              className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-purple-600 outline-none"
            />
          </div>

          {/* Pembinaan 1 & Hasil */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span>📍 Pembinaan Tahap 1</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Tanggal / Waktu Pembinaan 1 <span className="text-[11px] text-slate-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 14 Maret 2025"
                  value={formData.pembinaan1}
                  onChange={(e) => setFormData({ ...formData, pembinaan1: e.target.value })}
                  className="w-full min-h-touch h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Hasil Pembinaan 1 <span className="text-[11px] text-slate-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Hasil evaluasi / catatan pembinaan 1"
                  value={formData.hasil1}
                  onChange={(e) => setFormData({ ...formData, hasil1: e.target.value })}
                  className="w-full min-h-touch h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Pembinaan 2 & Hasil */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span>📍 Pembinaan Tahap 2</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Tanggal / Waktu Pembinaan 2 <span className="text-[11px] text-slate-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 20 Mei 2025"
                  value={formData.pembinaan2}
                  onChange={(e) => setFormData({ ...formData, pembinaan2: e.target.value })}
                  className="w-full min-h-touch h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Hasil Pembinaan 2 <span className="text-[11px] text-slate-400 font-normal">(opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Hasil evaluasi / catatan pembinaan 2"
                  value={formData.hasil2}
                  onChange={(e) => setFormData({ ...formData, hasil2: e.target.value })}
                  className="w-full min-h-touch h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Pelatihan Higiene Sanitasi & Pengeluaran Rekomendasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Pelatihan Higiene Sanitasi <span className="text-[11px] text-slate-400 font-normal">(opsional)</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Sudah Bersertifikat (2 Petugas)"
                value={formData.pelatihanHigiene}
                onChange={(e) => setFormData({ ...formData, pelatihanHigiene: e.target.value })}
                className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-purple-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Pengeluaran Rekomendasi <span className="text-[11px] text-slate-400 font-normal">(opsional)</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Rekomendasi Diterbitkan (No: ...)"
                value={formData.pengeluaranRekomendasi}
                onChange={(e) => setFormData({ ...formData, pengeluaranRekomendasi: e.target.value })}
                className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-purple-600 outline-none"
              />
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Keterangan <span className="text-[11px] text-slate-400 font-normal">(opsional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Catatan tambahan status sertifikasi NKV..."
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-purple-600 outline-none leading-relaxed"
            />
          </div>

          {/* Lampiran Foto Unit Usaha NKV */}
          <div className="p-4 rounded-2xl border border-purple-100 dark:border-slate-800 bg-purple-50/50 dark:bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  📷 Lampiran Foto Unit Usaha <span className="text-[11px] text-slate-400 font-normal">(opsional)</span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Foto fisik sarana, tempat usaha, atau dokumen pendukung sertifikasi NKV
                </p>
              </div>
              {isCompressing && (
                <div className="flex items-center gap-1.5 text-xs text-purple-600 font-semibold">
                  <Loader2 size={14} className="animate-spin" />
                  <span>Mengompres foto...</span>
                </div>
              )}
            </div>

            {/* Input Tersembunyi: Kamera Bawaan HP Langsung */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleProcessImage}
            />

            {/* Input Tersembunyi: File Browser / Galeri HP */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProcessImage}
            />

            {formData.foto ? (
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-950 rounded-xl border border-purple-200 dark:border-slate-800">
                <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0">
                  <img
                    src={formData.foto}
                    alt="Foto Unit Usaha NKV"
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer"
                      title="Foto Ulang via Kamera HP"
                    >
                      <Camera size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer"
                      title="Ganti dari Galeri"
                    >
                      <Upload size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, foto: '' })}
                      className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer"
                      title="Hapus Foto"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-w-0 text-xs space-y-1.5 py-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>✓ Foto Siap Disimpan</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-tight">
                    Foto telah terkompresi otomatis. Arahkan kursor atau gunakan tombol di bawah untuk opsi lainnya:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Camera size={12} /> Foto Ulang
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Upload size={12} /> Ganti File
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, foto: '' })}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <X size={12} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  disabled={isCompressing}
                  className="min-h-touch h-11 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <Camera size={16} />
                  <span>Foto Langsung dari Kamera HP</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isCompressing}
                  className="min-h-touch h-11 px-3.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-white hover:bg-purple-50 dark:bg-slate-900 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <ImageIcon size={16} />
                  <span>Pilih dari Galeri / File</span>
                </button>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-touch h-11 px-5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 min-h-touch h-11 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>
                {isSubmitting
                  ? 'Menyimpan...'
                  : editingId
                  ? 'Simpan Perubahan NKV'
                  : 'Simpan Unit Usaha NKV'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
