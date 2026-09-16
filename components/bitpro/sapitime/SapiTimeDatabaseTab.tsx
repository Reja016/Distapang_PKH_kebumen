'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Search, Syringe, User, Trash2 } from 'lucide-react';
import { Cattle, calculateAge } from './types';

interface SapiTimeDatabaseTabProps {
  cattleList: Cattle[];
  canCreate?: boolean;
  canEdit: boolean;
  editingCattle: Cattle | null;
  setEditingCattle: (val: Cattle | null) => void;
  formData: any;
  setFormData: (val: any) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  handleUpdateCattle: () => void;
  handleAddCattle: () => void;
  handleEditCattle: (c: Cattle) => void;
  handleDeleteCattle: (id: string) => void;
  onOpenIBModal: (c: Cattle) => void;
}

export function SapiTimeDatabaseTab({
  cattleList,
  canCreate,
  canEdit,
  editingCattle,
  setEditingCattle,
  formData,
  setFormData,
  searchTerm,
  setSearchTerm,
  handleUpdateCattle,
  handleAddCattle,
  handleEditCattle,
  handleDeleteCattle,
  onOpenIBModal,
}: SapiTimeDatabaseTabProps) {
  const router = useRouter();

  return (
    <div className="animate-in fade-in space-y-6">
      {/* ── FORM INLINE PENDAFTARAN / EDIT INDUKAN SAPI ── */}
      {(canCreate || canEdit) && (!editingCattle || canEdit) && (
        <div id="form-sapi" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Plus size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  {editingCattle ? (
                    <>
                      <Edit2 size={18} className="text-emerald-700" />
                      <span>Edit Data Sapi: {editingCattle.name}</span>
                    </>
                  ) : (
                    <span>Data Inseminasi Buatan</span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  Input data identitas peternak dan status reproduksi sapi secara langsung
                </p>
              </div>
            </div>

            {editingCattle && (
              <button
                onClick={() => {
                  setEditingCattle(null);
                  setFormData({ status: 'Estrus', cycleLength: 21, kecamatan: '', desa: '', ownerName: '' });
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                ✕ Batalkan Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Nama Peternak <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-bold text-slate-900"
                value={formData.ownerName || ''}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="Nama pemilik peternak"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Nama Sapi <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-bold text-slate-900"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Si Manis"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Desa <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-medium text-slate-900"
                value={formData.desa || ''}
                onChange={(e) => setFormData({ ...formData, desa: e.target.value })}
                placeholder="Desa"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Kecamatan <span className="text-red-500">*</span></label>
              <input
                type="text"
                className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-medium text-slate-900"
                value={formData.kecamatan || ''}
                onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                placeholder="Kecamatan"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Ras Sapi</label>
              <input
                type="text"
                className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-medium text-slate-900"
                value={formData.breed || ''}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="PO / Simmental / Limousin"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Tanggal Lahir Sapi</label>
              <input
                type="date"
                className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-medium text-slate-900"
                value={formData.birthDate || ''}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Status Reproduksi</label>
              <select
                className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-bold text-slate-900"
                value={formData.status || 'Estrus'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Estrus">Estrus (Birahi)</option>
                <option value="Bunting">Bunting</option>
                <option value="Laktasi">Laktasi / Menyusui</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Tanggal Estrus Terakhir</label>
              <input
                type="date"
                className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-medium text-slate-900"
                value={formData.lastEstrus || ''}
                onChange={(e) => setFormData({ ...formData, lastEstrus: e.target.value })}
              />
            </div>
          </div>

          {formData.status === 'Bunting' && (
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1 text-emerald-900">
                  Tanggal Mulai Bunting (Tanggal IB Berhasil)
                </label>
                <input
                  type="date"
                  className="w-full min-h-touch h-10 px-3.5 border border-emerald-300 rounded-xl bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                  value={formData.pregnancyDate || ''}
                  onChange={(e) => setFormData({ ...formData, pregnancyDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-emerald-900">Catatan Kebuntingan</label>
                <input
                  type="text"
                  className="w-full min-h-touch h-10 px-3.5 border border-emerald-300 rounded-xl bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                  value={formData.pregnancyNotes || ''}
                  onChange={(e) => setFormData({ ...formData, pregnancyNotes: e.target.value })}
                  placeholder="Hasil USG / Palpasi Rektal"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-1">
            {editingCattle && (
              <button
                onClick={() => {
                  setEditingCattle(null);
                  setFormData({ status: 'Estrus', cycleLength: 21, kecamatan: '', desa: '', ownerName: '' });
                }}
                className="min-h-touch h-10 px-5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Batal
              </button>
            )}
            <button
              onClick={editingCattle ? handleUpdateCattle : handleAddCattle}
              className="min-h-touch h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              {editingCattle ? 'Simpan Perubahan Sapi' : 'Simpan Data Sapi Baru'}
            </button>
          </div>
        </div>
      )}

      {/* ── SEARCH & ACTION TOOLBAR ── */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-1/2">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama peternak atau sapi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full min-h-touch h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 text-sm shadow-xs transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => router.push('/bitpro/database-ib')}
            className="min-h-touch h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Syringe size={16} className="text-emerald-700" />
            <span>Database IB ↗</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cattleList
          .filter(
            (c) =>
              c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (c.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((cattle) => (
            <div
              key={cattle.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-slate-900 truncate flex items-center gap-1.5">
                      <User size={16} className="text-slate-400 shrink-0" />
                      {cattle.ownerName || 'Tanpa Nama'}
                    </h3>
                    <p className="font-bold text-sm text-emerald-700 mt-1 truncate">Sapi: {cattle.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {cattle.id} • {cattle.kecamatan || '-'}, {cattle.desa || '-'}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      cattle.status === 'Bunting'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {cattle.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 mb-5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Ras</span>
                    <span className="font-semibold text-slate-800">{cattle.breed}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Umur</span>
                    <span className="font-semibold text-slate-800">{calculateAge(cattle.birthDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Estrus Terakhir</span>
                    <span className="font-semibold text-slate-800">
                      {cattle.lastEstrus ? new Date(cattle.lastEstrus).toLocaleDateString('id-ID') : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Total IB</span>
                    <span className="font-semibold text-slate-800">{cattle.inseminations?.length || 0} Kali</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {canEdit && (
                  <button
                    onClick={() => handleEditCattle(cattle)}
                    className="flex-1 min-h-touch h-10 bg-slate-50 text-slate-700 rounded-xl border border-slate-200 font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>Edit</span>
                  </button>
                )}
                {(canCreate ?? canEdit) && (
                  <button
                    onClick={() => onOpenIBModal(cattle)}
                    className="flex-1 min-h-touch h-10 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5 text-xs shadow-xs cursor-pointer"
                  >
                    <Syringe size={13} />
                    <span>Catat IB</span>
                  </button>
                )}
                {canEdit && (
                  <button
                    onClick={() => handleDeleteCattle(cattle.id)}
                    title="Hapus Sapi"
                    className="min-h-touch h-10 w-10 bg-red-50 text-red-600 rounded-xl border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
