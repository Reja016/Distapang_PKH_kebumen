'use client';

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import {
  KelompokTani,
  KelompokTaniFormValues,
  KECAMATAN_OPTIONS,
  KELAS_ORDER,
} from './types';

interface KttModalsProps {
  formOpen: boolean;
  formMode: 'tambah' | 'edit';
  formValues: KelompokTaniFormValues;
  setFormValues: React.Dispatch<React.SetStateAction<KelompokTaniFormValues>>;
  isSaving: boolean;
  onCloseForm: () => void;
  onSubmitForm: (e: React.FormEvent) => void;

  deleteTarget: KelompokTani | null;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
}

export default function KttModals({
  formOpen,
  formMode,
  formValues,
  setFormValues,
  isSaving,
  onCloseForm,
  onSubmitForm,
  deleteTarget,
  onCloseDelete,
  onConfirmDelete,
}: KttModalsProps) {
  return (
    <>
      {/* ── MODAL FORM TAMBAH/EDIT ── */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[94vh] sm:max-h-[90vh] bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {formMode === 'tambah' ? 'Tambah Kelompok Tani Baru' : 'Edit Data Kelompok Tani'}
              </h3>
              <button
                onClick={onCloseForm}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={onSubmitForm} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Nama Kelompok Tani
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: KTT Lembu Agung"
                    value={formValues.namaKelompok}
                    onChange={(e) => setFormValues({ ...formValues, namaKelompok: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-emerald-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Nomor Register / SK
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 524/12/2024"
                    value={formValues.nomorRegister}
                    onChange={(e) => setFormValues({ ...formValues, nomorRegister: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-emerald-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Kecamatan
                  </label>
                  <select
                    required
                    value={formValues.kecamatan}
                    onChange={(e) => setFormValues({ ...formValues, kecamatan: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-emerald-500 focus:bg-white outline-none"
                  >
                    <option value="">Pilih Kecamatan</option>
                    {KECAMATAN_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Desa / Kelurahan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama desa"
                    value={formValues.desa}
                    onChange={(e) => setFormValues({ ...formValues, desa: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-emerald-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Nama Ketua Kelompok
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama ketua"
                    value={formValues.namaKetuaKelompok}
                    onChange={(e) => setFormValues({ ...formValues, namaKetuaKelompok: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-emerald-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Kelas Kelompok
                  </label>
                  <select
                    value={formValues.kelasKelompok}
                    onChange={(e) => setFormValues({ ...formValues, kelasKelompok: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-emerald-500 focus:bg-white outline-none"
                  >
                    {KELAS_ORDER.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Anggota Laki-laki
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={formValues.anggotaLaki}
                    onChange={(e) =>
                      setFormValues({ ...formValues, anggotaLaki: parseInt(e.target.value) || 0 })
                    }
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-emerald-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Anggota Perempuan
                  </label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    value={formValues.anggotaPerempuan}
                    onChange={(e) =>
                      setFormValues({ ...formValues, anggotaPerempuan: parseInt(e.target.value) || 0 })
                    }
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-emerald-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="sticky bottom-0 bg-white/95 backdrop-blur-md pt-3.5 pb-1 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onCloseForm}
                  className="min-h-touch h-10 px-4 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="min-h-touch h-10 px-5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-600/90 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Kelompok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI HAPUS ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle size={24} />
              <h3 className="font-bold text-base text-slate-900">Konfirmasi Hapus Data</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus data kelompok{' '}
              <span className="font-bold text-slate-900">{deleteTarget.namaKelompok}</span> di Desa{' '}
              {deleteTarget.desa}? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={onCloseDelete}
                className="min-h-touch h-10 px-4 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={onConfirmDelete}
                className="min-h-touch h-10 px-5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm cursor-pointer"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
