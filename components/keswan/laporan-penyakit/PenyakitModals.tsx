import React from 'react';
import { X, Loader2, CheckCircle2, Plus } from 'lucide-react';
import { KECAMATAN_MAP_ITEMS, DIAGNOSA_LIST, getZoneByKecamatanId } from '@/lib/penyakitData';
import { PenyakitFormValues } from './types';

interface PenyakitModalsProps {
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  editingItem: any | null;
  selectedYear: number;
  formValues: PenyakitFormValues;
  setFormValues: React.Dispatch<React.SetStateAction<PenyakitFormValues>>;
  handleCaseSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting: boolean;

  showAddYearModal: boolean;
  setShowAddYearModal: (show: boolean) => void;
  newYearInput: number;
  setNewYearInput: (yr: number) => void;
  handleAddYearSubmit: (e: React.FormEvent) => Promise<void>;
  isAddingYear: boolean;
}

export default function PenyakitModals({
  showAddModal,
  setShowAddModal,
  editingItem,
  selectedYear,
  formValues,
  setFormValues,
  handleCaseSubmit,
  isSubmitting,
  showAddYearModal,
  setShowAddYearModal,
  newYearInput,
  setNewYearInput,
  handleAddYearSubmit,
  isAddingYear,
}: PenyakitModalsProps) {
  return (
    <>
      {/* ── MODAL: TAMBAH / EDIT KASUS PENYAKIT ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute top-5 right-5 cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingItem ? 'Edit Laporan Kasus Penyakit' : 'Tambah Laporan Kasus Penyakit Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Input data kasus diagnosa penyakit hewan per kecamatan tahun {selectedYear}.
            </p>

            <form onSubmit={handleCaseSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-700">
                    Kecamatan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formValues.kecamatan_id}
                    onChange={(e) => {
                      const kec = KECAMATAN_MAP_ITEMS.find((k) => k.id === e.target.value);
                      const zone = getZoneByKecamatanId(e.target.value);
                      setFormValues({
                        ...formValues,
                        kecamatan_id: e.target.value,
                        kecamatan_nama: kec ? kec.nama : e.target.value,
                        puskeswan_id: zone ? zone.id : formValues.puskeswan_id,
                      });
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    {KECAMATAN_MAP_ITEMS.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-700">
                    Diagnosa Penyakit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formValues.diagnosa_nama}
                    onChange={(e) => setFormValues({ ...formValues, diagnosa_nama: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    {DIAGNOSA_LIST.map((d) => (
                      <option key={d.nama} value={d.nama}>
                        {d.nama}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700">
                  Jumlah Kasus (Ekor) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formValues.jumlah_kasus}
                  onChange={(e) =>
                    setFormValues({ ...formValues, jumlah_kasus: Math.max(1, parseInt(e.target.value, 10) || 1) })
                  }
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700">Keterangan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan penanganan / lokasi desa..."
                  value={formValues.keterangan}
                  onChange={(e) => setFormValues({ ...formValues, keterangan: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Simpan Laporan Kasus</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: TAMBAH TAHUN BARU ── */}
      {showAddYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAddYearModal(false)}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute top-5 right-5 cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Tambah Periode Tahun Baru</h3>
            <p className="text-xs text-slate-500 mb-5">
              Buat periode laporan kasus penyakit untuk tahun berikutnya.
            </p>

            <form onSubmit={handleAddYearSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 font-bold text-slate-700">
                  Tahun Baru yang Ditambahkan <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={2020}
                  max={2100}
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(Number(e.target.value))}
                  placeholder="Contoh: 2027"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-blue-600 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddYearModal(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isAddingYear}
                  className="flex-1 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  {isAddingYear ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>{isAddingYear ? 'Menambahkan...' : 'Buat Tahun Baru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
