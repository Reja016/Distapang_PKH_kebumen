import React from 'react';
import { UploadCloud, X } from 'lucide-react';

interface BulkUploadModalProps {
  showBulkUpload: boolean;
  setShowBulkUpload: (show: boolean) => void;
  handleExcelUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BulkUploadModal({
  showBulkUpload,
  setShowBulkUpload,
  handleExcelUpload,
}: BulkUploadModalProps) {
  if (!showBulkUpload) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <UploadCloud size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Import File Excel Data Populasi</h3>
              <p className="text-xs text-slate-500">Unggah berkas rekap data populasi seluruh desa</p>
            </div>
          </div>
          <button
            onClick={() => setShowBulkUpload(false)}
            className="w-8 h-8 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <p>
            Format file Excel harus memiliki kolom header:{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-bold">Kecamatan</code>,{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-bold">Desa</code>, dan nama-nama
            kolom komoditas.
          </p>

          <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70 cursor-pointer transition-colors text-center">
            <UploadCloud size={28} className="text-emerald-600 mb-2" />
            <span className="text-xs font-bold text-emerald-900">Pilih Berkas Excel (.xlsx / .xls)</span>
            <span className="text-[10px] text-slate-400 mt-1">Sistem akan membaca seluruh baris desa secara otomatis</span>
            <input type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="hidden" />
          </label>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setShowBulkUpload(false)}
            className="min-h-touch h-10 px-4 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
