'use client';

import React from 'react';
import { Car } from 'lucide-react';
import { KendaraanFormData } from './types';

interface KendaraanModalFormProps {
  showModal: boolean;
  editingId: string | null;
  formData: KendaraanFormData;
  setFormData: React.Dispatch<React.SetStateAction<KendaraanFormData>>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function KendaraanModalForm({
  showModal,
  editingId,
  formData,
  setFormData,
  onClose,
  onSubmit,
}: KendaraanModalFormProps) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Car size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {editingId ? 'Edit Data Kendaraan Dinas' : 'Tambah Kendaraan Dinas Baru'}
              </h3>
              <p className="text-xs text-slate-500">
                Formulir pencatatan plat nomor, nomor mesin, dan nomor rangka
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nama Pemegang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Medik Veteriner / Nama Pejabat"
                value={formData.namaPemegang}
                onChange={(e) => setFormData({ ...formData, namaPemegang: e.target.value })}
                className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-amber-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Merk / Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Toyota Avanza / Honda Supra X"
                value={formData.merkType}
                onChange={(e) => setFormData({ ...formData, merkType: e.target.value })}
                className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-amber-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Tahun Pembuatan / Pengadaan
            </label>
            <input
              type="text"
              placeholder="Contoh: 2021"
              value={formData.tahun}
              onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
              className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-amber-600 outline-none"
            />
          </div>

          {/* Nopol Lama & Baru */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <span>Nomor Registrasi Kendaraan Bermotor (Nopol)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nomor Polisi Lama</label>
                <input
                  type="text"
                  placeholder="Contoh: AA 1234 AD"
                  value={formData.nopolLama}
                  onChange={(e) => setFormData({ ...formData, nopolLama: e.target.value })}
                  className="w-full min-h-touch h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Nomor Polisi Baru</label>
                <input
                  type="text"
                  placeholder="Contoh: AA 1 D"
                  value={formData.nopolBaru}
                  onChange={(e) => setFormData({ ...formData, nopolBaru: e.target.value })}
                  className="w-full min-h-touch h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-emerald-800"
                />
              </div>
            </div>
          </div>

          {/* Nomor Mesin & Nomor Rangka */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nomor Mesin
              </label>
              <input
                type="text"
                placeholder="Contoh: 1TR-FE8923145"
                value={formData.nomorMesin}
                onChange={(e) => setFormData({ ...formData, nomorMesin: e.target.value })}
                className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:border-amber-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nomor Rangka
              </label>
              <input
                type="text"
                placeholder="Contoh: MHF11GB40K0029141"
                value={formData.nomorRangka}
                onChange={(e) => setFormData({ ...formData, nomorRangka: e.target.value })}
                className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:border-amber-600 outline-none"
              />
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Keterangan Tambahan
            </label>
            <textarea
              rows={2}
              placeholder="Catatan status kendaraan, lokasi pos dinas, kondisi mesin, dll..."
              value={formData.keterangan}
              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-amber-600 outline-none leading-relaxed"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-touch h-11 px-5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 min-h-touch h-11 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              {editingId ? 'Simpan Perubahan Kendaraan' : 'Simpan Kendaraan Baru'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
