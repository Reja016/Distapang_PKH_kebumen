'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  HardDrive,
  FileCode,
  ShieldCheck,
  Server,
  Layers,
} from 'lucide-react';

interface DatabaseBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DatabaseBackupModal({ isOpen, onClose }: DatabaseBackupModalProps) {
  const [dbInfo, setDbInfo] = useState<{ database: string; tableCount: number; timestamp: string } | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadDbInfo();
      setRestoreStatus(null);
      setSelectedFile(null);
    }
  }, [isOpen]);

  const loadDbInfo = async () => {
    try {
      setIsLoadingInfo(true);
      const res = await fetch('/api/admin/backup-db?mode=info');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setDbInfo(json.data);
        }
      }
    } catch (e) {
      console.error('Failed to load DB info:', e);
    } finally {
      setIsLoadingInfo(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      setIsDownloading(true);
      setRestoreStatus(null);
      const res = await fetch('/api/admin/backup-db');
      if (!res.ok) throw new Error('Gagal mengunduh file backup dari server');

      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = 'backup_distapang_pkh.sql';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setRestoreStatus({
        type: 'success',
        message: `File cadangan "${filename}" berhasil diunduh ke komputer Anda.`,
      });
    } catch (err: any) {
      setRestoreStatus({
        type: 'error',
        message: 'Gagal membuat backup: ' + err.message,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.sql')) {
        alert('Mohon pilih file berformat .sql');
        return;
      }
      setSelectedFile(file);
      setRestoreStatus(null);
    }
  };

  const handleRestoreDatabase = async () => {
    if (!selectedFile) return;

    const confirmed = window.confirm(
      `PERINGATAN: Memulihkan database dari "${selectedFile.name}" akan menimpa/memperbarui data tabel yang ada saat ini. Apakah Anda yakin ingin melanjutkan?`
    );
    if (!confirmed) return;

    try {
      setIsRestoring(true);
      setRestoreStatus(null);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/admin/backup-db', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Terjadi kesalahan saat memulihkan database.');
      }

      setRestoreStatus({
        type: 'success',
        message: json.message || 'Database berhasil dipulihkan secara penuh!',
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadDbInfo();
    } catch (err: any) {
      setRestoreStatus({
        type: 'error',
        message: err.message || 'Gagal memulihkan database.',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center backdrop-blur-md">
              <Database size={20} className="text-sky-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Cadangkan & Pulihkan Database
              </h2>
              <p className="text-xs text-sky-100 font-medium">
                MySQL Database Backup & Restore Utility &bull; SiMantap PKH
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Database Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Server size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-500 truncate">Database Name</p>
                <p className="text-xs font-black text-slate-900 truncate">
                  {isLoadingInfo ? 'Memuat...' : dbInfo?.database || 'distapang_pkh'}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Layers size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-500 truncate">Total Tabel</p>
                <p className="text-xs font-black text-slate-900 truncate">
                  {isLoadingInfo ? 'Memuat...' : `${dbInfo?.tableCount || 0} Tabel Terdata`}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-500 truncate">Status Sistem</p>
                <p className="text-xs font-black text-emerald-700 truncate">Siap Cadangkan</p>
              </div>
            </div>
          </div>

          {/* Status Alert */}
          {restoreStatus && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-200 ${
                restoreStatus.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {restoreStatus.type === 'success' ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="text-xs font-semibold leading-relaxed flex-1">
                {restoreStatus.message}
              </div>
            </div>
          )}

          {/* Card 1: Download Backup */}
          <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Download size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">1. Unduh Cadangan Data (.sql)</h3>
                  <p className="text-[11px] text-slate-500">
                    Ekspor seluruh struktur tabel dan isi data MySQL dalam format standar SQL Dump.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="text-xs text-slate-600 font-medium">
                Mencakup modul Populasi, Produksi, SKLB, Puskeswan, Penyakit, Vaksinasi, RPH, dan KTT.
              </div>

              <button
                onClick={handleDownloadBackup}
                disabled={isDownloading}
                className="min-h-touch h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
              >
                {isDownloading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Membuat Dump...</span>
                  </>
                ) : (
                  <>
                    <HardDrive size={14} />
                    <span>Download Backup (.sql)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Restore Database */}
          <div className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Upload size={16} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">2. Pulihkan Database (Restore)</h3>
                <p className="text-[11px] text-slate-500">
                  Unggah file cadangan <code className="font-mono bg-slate-200 px-1 py-0.5 rounded text-slate-800">.sql</code> yang pernah diunduh untuk mengembalikan data.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".sql"
                onChange={handleFileChange}
                className="hidden"
                id="restore-sql-file-input"
              />

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <label
                  htmlFor="restore-sql-file-input"
                  className="flex-1 min-h-touch h-10 px-4 rounded-xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 bg-white hover:bg-indigo-50/50 text-xs font-bold text-slate-700 flex items-center justify-center sm:justify-start gap-2 cursor-pointer transition-all truncate"
                >
                  <FileCode size={16} className="text-indigo-600 shrink-0" />
                  <span className="truncate">
                    {selectedFile ? selectedFile.name : 'Pilih file backup .sql dari komputer...'}
                  </span>
                </label>

                <button
                  onClick={handleRestoreDatabase}
                  disabled={!selectedFile || isRestoring}
                  className="min-h-touch h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  {isRestoring ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Memulihkan...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={14} />
                      <span>Mulai Restore</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 leading-normal">
                * Pastikan file SQL berasal dari cadangan resmi SiMantap PKH untuk menghindari inkonsistensi skema tabel.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            SiMantap &bull; Hak Akses Administrator
          </span>

          <button
            onClick={onClose}
            className="min-h-touch h-9 px-4 rounded-xl bg-white hover:bg-slate-200 border border-slate-300 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
