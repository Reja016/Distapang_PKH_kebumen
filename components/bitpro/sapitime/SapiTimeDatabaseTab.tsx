'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Search, Syringe, User, Trash2, Activity, Bell, AlertCircle } from 'lucide-react';
import { Cattle, calculateAge, KECAMATAN_LIST, getDesaListForKecamatan } from './types';

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
  onShowHistory?: (row: any) => void;
  onTraceCattle?: (cattle: Cattle) => void;
  onLaporKondisi?: (cattle: Cattle) => void;
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
  onShowHistory,
  onTraceCattle,
  onLaporKondisi,
}: SapiTimeDatabaseTabProps) {
  const router = useRouter();
  const desaList = getDesaListForKecamatan(formData.kecamatan);

  return (
    <div className="animate-in fade-in space-y-6">
      {/* ── FORM INLINE PENDAFTARAN / EDIT INDUKAN SAPI ── */}
      {(canCreate || canEdit) && (!editingCattle || canEdit) && (
        <div id="form-sapi" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Plus size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  {editingCattle ? (
                    <>
                      <Edit2 size={18} className="text-emerald-700 dark:text-emerald-400" />
                      <span>Edit Data Sapi: {editingCattle.name}</span>
                    </>
                  ) : (
                    <span>Data Inseminasi Buatan</span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Input data identitas peternak dan status reproduksi sapi secara langsung
                </p>
              </div>
            </div>

            {editingCattle && (
              <button
                onClick={() => {
                  setEditingCattle(null);
                  setFormData({ status: 'Estrus', cycleLength: 21, kecamatan: '', desa: '', ownerName: '', nik: '' });
                }}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                ✕ Batalkan Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">Nama Peternak</label>
              <input
                type="text"
                className="w-full min-h-touch h-10 px-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-600 text-xs font-bold text-slate-900 dark:text-white transition-colors"
                value={formData.ownerName || ''}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="Nama pemilik peternak"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">No. Telepon Peternak <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">(opsional)</span></label>
              <input
                type="tel"
                className="w-full min-h-touch h-10 px-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-600 text-xs font-bold text-slate-900 dark:text-white transition-colors"
                value={formData.ownerPhone || ''}
                onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                placeholder="Contoh: 081234567890"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700 dark:text-slate-300">NIK Peternak <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal">(opsional)</span></label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={16}
                className="w-full min-h-touch h-10 px-3.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-emerald-600 text-xs font-bold text-slate-900 dark:text-white transition-colors"
                value={formData.nik || ''}
                onChange={(e) => setFormData({ ...formData, nik: e.target.value.replace(/\D/g, '') })}
                placeholder="16 digit NIK"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">No. Registrasi / Eartag Sapi <span className="text-[11px] text-slate-400 font-normal">(opsional)</span></label>
              <input
                type="text"
                className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-bold text-slate-900"
                value={formData.registrationNumber || ''}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                placeholder="No. eartag / barcode registrasi"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Nama Sapi <span className="text-[11px] text-slate-400 font-normal">(opsional)</span></label>
              <input
                type="text"
                className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-bold text-slate-900"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Si Manis"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Kecamatan</label>
              <select
                className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-medium text-slate-900 cursor-pointer"
                value={formData.kecamatan ? formData.kecamatan.toUpperCase() : ''}
                onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value, desa: '' })}
              >
                <option value="">-- Pilih Kecamatan --</option>
                {KECAMATAN_LIST.map((kec) => (
                  <option key={kec} value={kec}>
                    {kec}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Desa</label>
              <select
                className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-medium text-slate-900 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                value={formData.desa || ''}
                onChange={(e) => setFormData({ ...formData, desa: e.target.value })}
                disabled={!formData.kecamatan}
              >
                <option value="">
                  {formData.kecamatan ? '-- Pilih Desa / Kelurahan --' : '-- Pilih Kecamatan Dahulu --'}
                </option>
                {desaList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
                {formData.desa && !desaList.includes(formData.desa) && (
                  <option value={formData.desa}>{formData.desa}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Ras Sapi</label>
              <input
                type="text"
                required
                className="w-full min-h-touch h-10 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-medium text-slate-900"
                value={formData.breed || ''}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="Contoh: PO / Simmental / Limousin"
              />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1 text-slate-700">Tanggal Lahir Sapi <span className="text-[11px] text-slate-400 font-normal">(opsional)</span></label>
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
              <label className="block text-xs font-bold mb-1 text-slate-700">Tanggal Estrus Terakhir <span className="text-[11px] text-slate-400 font-normal">(opsional)</span></label>
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
                  setFormData({ status: 'Estrus', cycleLength: 21, kecamatan: '', desa: '', ownerName: '', nik: '' });
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
            placeholder="Cari nama peternak, NIK, atau sapi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full min-h-touch h-11 pl-11 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 text-sm shadow-xs transition-colors"
          />
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium sm:hidden">
            Total: <strong className="text-slate-800 dark:text-slate-200">{cattleList.length}</strong> Sapi
          </span>
          <button
            onClick={() => router.push('/bitpro/database-ib')}
            className="min-h-touch h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <Syringe size={16} className="text-emerald-700 dark:text-emerald-400" />
            <span>Database IB ↗</span>
          </button>
        </div>
      </div>

      {/* ── TABEL DATA INDUKAN SAPI (STICKY TABLE CONTAINER & RESPONSIVE MOBILE) ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        {/* Subheader info jumlah & petunjuk scroll */}
        <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Daftar Indukan Terdaftar: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{cattleList.length}</span> ekor
          </span>
          <span className="text-[10px] italic hidden sm:inline">
            ↕ Scroll ke bawah untuk melihat sapi lainnya (header tetap menempel)
          </span>
        </div>

        {/* Scrollable Container dengan max-height & sticky thead */}
        <div className="overflow-x-auto overflow-y-auto max-h-[65vh] sm:max-h-[580px] scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 z-10 shadow-2xs">
              <tr className="bg-slate-100 dark:bg-slate-800 text-[11px] font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-3.5 whitespace-nowrap text-center w-12 bg-slate-100 dark:bg-slate-800">No</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[190px] bg-slate-100 dark:bg-slate-800">Peternak & Kontak</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[160px] bg-slate-100 dark:bg-slate-800">Identitas Sapi</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[130px] bg-slate-100 dark:bg-slate-800">Ras & Umur</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[150px] bg-slate-100 dark:bg-slate-800">Lokasi</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[120px] text-center bg-slate-100 dark:bg-slate-800">Status</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[110px] text-center bg-slate-100 dark:bg-slate-800">Riwayat IB</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-center min-w-[170px] bg-slate-100 dark:bg-slate-800">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {cattleList
                .filter(
                  (c) =>
                    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (c.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (c.nik || '').includes(searchTerm) ||
                    (c.registrationNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (c.ownerPhone || '').includes(searchTerm)
                )
                .map((cattle, idx) => {
                  const latestIb = cattle.inseminations && cattle.inseminations.length > 0
                    ? [...cattle.inseminations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                    : null;
                  let daysSinceIB: number | null = null;
                  if (latestIb && latestIb.date) {
                    const diff = Math.floor((new Date().getTime() - new Date(latestIb.date).getTime()) / (1000 * 3600 * 24));
                    if (diff >= 0) daysSinceIB = diff;
                  }
                  const isEstrusWindow = daysSinceIB !== null && daysSinceIB >= 18 && daysSinceIB <= 24;

                  return (
                    <tr
                      key={cattle.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group ${
                        isEstrusWindow ? 'bg-amber-50/40 dark:bg-amber-950/20' : 'odd:bg-white even:bg-slate-50/30 dark:odd:bg-slate-900 dark:even:bg-slate-850'
                      }`}
                    >
                      {/* 1. No */}
                      <td className="py-3 px-3.5 text-center text-slate-400 font-mono font-medium">
                        {idx + 1}
                      </td>

                      {/* 2. Peternak & Kontak */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <User size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[170px]">{cattle.ownerName || 'Tanpa Nama'}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          {cattle.ownerPhone && (
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">📞 {cattle.ownerPhone}</span>
                          )}
                          {cattle.nik && (
                            <span>NIK: <span className="font-mono text-slate-700 dark:text-slate-300">{cattle.nik}</span></span>
                          )}
                        </div>
                      </td>

                      {/* 3. Identitas Sapi */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="font-bold text-emerald-800 dark:text-emerald-300 truncate max-w-[160px]">
                          {cattle.name || `Sapi ${cattle.id}`}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                            {cattle.id}
                          </span>
                          {cattle.registrationNumber && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[9px] font-mono font-bold border border-emerald-200 dark:border-emerald-800">
                              Reg: {cattle.registrationNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Ras & Umur */}
                      <td className="py-3 px-3.5 align-top">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {cattle.breed}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Umur: {calculateAge(cattle.birthDate)}
                        </div>
                      </td>

                      {/* 5. Lokasi */}
                      <td className="py-3 px-3.5 align-top text-slate-600 dark:text-slate-300">
                        <div className="font-medium truncate max-w-[150px]">
                          {cattle.kecamatan || '-'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                          {cattle.desa || '-'}
                        </div>
                      </td>

                      {/* 6. Status Reproduksi */}
                      <td className="py-3 px-3.5 align-top text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                            cattle.status === 'Bunting'
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : cattle.status === 'Laktasi'
                              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                              : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {cattle.status}
                        </span>
                        {isEstrusWindow && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 text-[9px] font-bold border border-amber-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              H+{daysSinceIB} Cek Birahi
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 7. Riwayat IB */}
                      <td className="py-3 px-3.5 align-top text-center">
                        <button
                          type="button"
                          onClick={() => onTraceCattle?.(cattle)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-[11px] transition-colors cursor-pointer"
                          title="Klik untuk melihat riwayat inseminasi lengkap"
                        >
                          <Syringe size={11} className="text-emerald-700 dark:text-emerald-400" />
                          <span>{cattle.inseminations?.length || 0}x IB</span>
                        </button>
                      </td>

                      {/* 8. Aksi (Normal Column di ujung tabel) */}
                      <td className="py-3 px-3.5 align-top text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-nowrap">
                          {/* Catat IB */}
                          {(canCreate ?? canEdit) && (
                            <button
                              type="button"
                              onClick={() => onOpenIBModal(cattle)}
                              className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors flex items-center gap-1 text-[11px] shadow-2xs cursor-pointer shrink-0"
                              title="Catat Pelayanan Inseminasi Buatan"
                            >
                              <Syringe size={11} />
                              <span>IB</span>
                            </button>
                          )}

                          {/* Lapor Kondisi Fisik */}
                          {onLaporKondisi && (
                            <button
                              type="button"
                              onClick={() => onLaporKondisi(cattle)}
                              className="h-8 w-8 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                              title="Lapor Kondisi Fisik Sapi"
                            >
                              <Activity size={12} />
                            </button>
                          )}

                          {/* Edit Sapi */}
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleEditCattle(cattle)}
                              className="h-8 w-8 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                              title="Edit Data Sapi"
                            >
                              <Edit2 size={12} />
                            </button>
                          )}

                          {/* Riwayat Audit Log */}
                          {onShowHistory && (
                            <button
                              type="button"
                              onClick={() => onShowHistory(cattle)}
                              className="h-8 w-8 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                              title="Riwayat Perubahan Data"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            </button>
                          )}

                          {/* Hapus Sapi */}
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCattle(cattle.id)}
                              className="h-8 w-8 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                              title="Hapus Sapi"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Kondisi Data Kosong */}
        {cattleList.filter(
          (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.nik || '').includes(searchTerm) ||
            (c.registrationNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.ownerPhone || '').includes(searchTerm)
        ).length === 0 && (
          <div className="p-10 text-center text-slate-400 dark:text-slate-500">
            <p className="text-xs font-semibold">Tidak ada data sapi indukan yang cocok.</p>
          </div>
        )}
      </div>
    </div>
  );
}
