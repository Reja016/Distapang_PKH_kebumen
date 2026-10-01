'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { DistribusiBaItem } from './types';
import { compressImageFile } from '@/lib/file-compressor';

interface UploadBuktiBaModalProps {
  item: DistribusiBaItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadBuktiBaModal({ item, onClose, onSuccess }: UploadBuktiBaModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [fileType, setFileType] = useState<'image' | 'pdf' | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!item) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setIsProcessing(true);

    try {
      if (file.type.startsWith('image/')) {
        setFileType('image');
        // Kompresi otomatis ke < 2 MB menggunakan canvas client-side
        const compressedBase64 = await compressImageFile(file, 1600, 0.8, 2 * 1024 * 1024);
        setFileBase64(compressedBase64);
        setSelectedFile(file);
      } else if (file.type === 'application/pdf') {
        if (file.size > 2 * 1024 * 1024) {
          setErrorMsg('Ukuran file PDF maksimal 2 MB.');
          setIsProcessing(false);
          return;
        }
        setFileType('pdf');
        const reader = new FileReader();
        reader.onload = () => {
          setFileBase64(reader.result as string);
          setSelectedFile(file);
          setIsProcessing(false);
        };
        reader.readAsDataURL(file);
        return;
      } else {
        setErrorMsg('Format file harus berupa PDF, JPG, atau PNG.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memproses file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileBase64) {
      setErrorMsg('Silakan pilih file bukti Berita Acara terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/stok-gudang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPLOAD_BUKTI_BA',
          id_distribusi: item.id_distribusi,
          file_bukti_ba: fileBase64,
        }),
      });

      const resJson = await res.json();
      if (resJson.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(resJson.error || 'Gagal mengunggah file.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-base">Unggah Bukti Tanda Terima BA</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-200">
              No. BA: <span className="font-mono text-blue-600 dark:text-blue-400">{item.nomor_ba}</span>
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              Tujuan: <strong>Puskeswan {item.nama_puskeswan}</strong> | Obat: <strong>{item.nama_barang}</strong> ({item.jumlah} {item.satuan_kemasan || 'unit'})
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Pilih Dokumen Scan / Foto Tanda Terima (PDF / JPG / PNG, Maks 2 MB)
            </label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
              <input
                type="file"
                id="file-ba-upload"
                accept="application/pdf, image/jpeg, image/png, image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-ba-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                  Klik untuk pilih file
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Foto langsung dari HP atau scan PDF (otomatis dikompres)
                </span>
              </label>
            </div>
          </div>

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Memproses & mengompresi gambar otomatis...</span>
            </div>
          )}

          {selectedFile && !isProcessing && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                {fileType === 'pdf' ? (
                  <FileText className="w-5 h-5 text-red-500 shrink-0" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                <span className="font-medium truncate">{selectedFile.name}</span>
              </div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold shrink-0">
                SIAP DIUNGGAH
              </span>
            </div>
          )}

          {/* Pratinjau Gambar */}
          {fileBase64 && fileType === 'image' && (
            <div className="max-h-48 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 flex justify-center bg-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={fileBase64} alt="Pratinjau Bukti BA" className="max-h-48 object-contain" />
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isUploading || !fileBase64 || isProcessing}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-md disabled:opacity-50 transition-all cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengunggah...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Simpan Bukti Tanda Terima
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
