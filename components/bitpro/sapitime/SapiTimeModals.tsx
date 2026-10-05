'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Syringe,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  Layers,
  Edit2,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Cattle, Insemination, calculateAge, KECAMATAN_LIST, getDesaListForKecamatan } from './types';
import { useUserAreaRestriction } from '@/hooks/useUserAreaRestriction';

interface ModalEstrusInfoProps {
  showEstrusModal: boolean;
  setShowEstrusModal: (val: boolean) => void;
}

export function ModalEstrusInfo({
  showEstrusModal,
  setShowEstrusModal,
}: ModalEstrusInfoProps) {
  if (!showEstrusModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setShowEstrusModal(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-2xl font-light cursor-pointer"
        >
          &times;
        </button>
        <h3 className="text-xl font-bold text-amber-900 mb-5 flex items-center gap-2">
          <Sparkles size={20} className="text-amber-600" />
          <span>Tanda-Tanda Birahi (Estrus 3A)</span>
        </h3>
        <div className="space-y-4">
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
            <h4 className="font-bold text-amber-900 text-sm mb-1.5">Tanda Utama (Pasti)</h4>
            <ul className="list-disc pl-5 text-xs text-amber-900 font-medium space-y-1">
              <li>Sapi betina diam saat dinaiki oleh sapi jantan atau sesama sapi betina (*standing heat*).</li>
            </ul>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">Tanda Pendukung (Gejala 3A)</h4>
            <ul className="list-disc pl-5 text-xs text-slate-700 space-y-1.5">
              <li><strong>Abuh:</strong> Bibir kelamin (vulva) terlihat sedikit bengkak.</li>
              <li><strong>Abang:</strong> Selaput lendir bagian dalam vulva berwarna kemerahan.</li>
              <li><strong>Anget:</strong> Suhu tubuh dan area vulva terasa lebih hangat.</li>
              <li>Keluar lendir bening transparan dan elastis dari vulva.</li>
              <li>Sapi terlihat gelisah, sering melenguh (*bengok-bengok*), dan nafsu makan menurun.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ModalCattleFormProps {
  isOpen: boolean;
  isEdit: boolean;
  onClose: () => void;
  formData: any;
  setFormData: (val: any) => void;
  onSubmit: () => void;
}

export function ModalCattleForm({
  isOpen,
  isEdit,
  onClose,
  formData,
  setFormData,
  onSubmit,
}: ModalCattleFormProps) {
  const { isAdmin, filterKecamatanList, allowedKecamatan } = useUserAreaRestriction();
  const availableKecamatanList = filterKecamatanList(KECAMATAN_LIST);

  const desaList = getDesaListForKecamatan(formData?.kecamatan);

  // Auto-set jika petugas hanya memiliki 1 wilayah kerja dan belum memilih
  useEffect(() => {
    if (isOpen && !isAdmin && availableKecamatanList.length === 1 && !formData?.kecamatan) {
      setFormData((prev: any) => ({ ...prev, kecamatan: availableKecamatanList[0] }));
    }
  }, [isOpen, isAdmin, availableKecamatanList, formData?.kecamatan, setFormData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            {isEdit ? 'Edit Data Sapi' : 'Tambah Indukan Sapi Baru'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {!isAdmin && allowedKecamatan.length > 0 && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <MapPin size={16} className="text-emerald-600 shrink-0" />
            <span>
              Wilayah Wewenang Anda: <strong>{allowedKecamatan.join(', ')}</strong>
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Nama Peternak</label>
            <input
              type="text"
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900 font-bold"
              value={formData.ownerName || ''}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
              placeholder="Nama pemilik peternak"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Nama Sapi</label>
            <input
              type="text"
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900 font-bold"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Si Manis"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Kecamatan <span className="text-red-500">*</span></label>
            <select
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900 font-medium cursor-pointer"
              value={formData.kecamatan ? formData.kecamatan.toUpperCase() : ''}
              onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value, desa: '' })}
            >
              <option value="">-- Pilih Kecamatan --</option>
              {availableKecamatanList.map((kec) => (
                <option key={kec} value={kec}>
                  {kec}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Desa <span className="text-red-500">*</span></label>
            <select
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900 font-medium cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
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
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
              value={formData.breed || ''}
              onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              placeholder="PO / Simmental / Limousin"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Tanggal Lahir Sapi</label>
            <input
              type="date"
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
              value={formData.birthDate || ''}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Status Reproduksi</label>
            <select
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900 font-bold"
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
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
              value={formData.lastEstrus || ''}
              onChange={(e) => setFormData({ ...formData, lastEstrus: e.target.value })}
            />
          </div>

          {formData.status === 'Bunting' && (
            <div className="col-span-1 sm:col-span-2 bg-emerald-50 p-4 rounded-xl border border-emerald-200">
              <label className="block text-xs font-bold mb-1 text-emerald-900">
                Tanggal Mulai Bunting (Tanggal IB Berhasil)
              </label>
              <input
                type="date"
                className="w-full min-h-touch h-11 px-3.5 border border-emerald-300 rounded-xl bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                value={formData.pregnancyDate || ''}
                onChange={(e) => setFormData({ ...formData, pregnancyDate: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8 pt-5 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 min-h-touch h-11 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onSubmit}
            disabled={!formData.name || !formData.kecamatan || !formData.desa}
            className="flex-1 min-h-touch h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs disabled:opacity-40 cursor-pointer"
          >
            Simpan Data
          </button>
        </div>
      </div>
    </div>
  );
}

interface ModalCatatIBProps {
  showIBModal: boolean;
  setShowIBModal: (val: boolean) => void;
  selectedCattleForIB: Cattle | null;
  ibFormData: any;
  setIbFormData: (val: any) => void;
  handleAddInsemination: () => void;
}

export function ModalCatatIB({
  showIBModal,
  setShowIBModal,
  selectedCattleForIB,
  ibFormData,
  setIbFormData,
  handleAddInsemination,
}: ModalCatatIBProps) {
  const { isAdmin, filterKecamatanList, allowedKecamatan } = useUserAreaRestriction();
  const availableIbKecamatanList = filterKecamatanList(KECAMATAN_LIST);

  const ibDesaList = getDesaListForKecamatan(ibFormData?.kecamatan);

  // Auto-set data sapi akseptor, wilayah domisili, dan default tanggal/waktu
  useEffect(() => {
    if (showIBModal && selectedCattleForIB) {
      setIbFormData((prev: any) => ({
        ...prev,
        date: prev?.date || new Date().toISOString().split('T')[0],
        time: prev?.time || '08:00',
        kecamatan: prev?.kecamatan || selectedCattleForIB.kecamatan || (!isAdmin && availableIbKecamatanList.length === 1 ? availableIbKecamatanList[0] : ''),
        desa: prev?.desa || selectedCattleForIB.desa || '',
      }));
    }
  }, [showIBModal, selectedCattleForIB, isAdmin, availableIbKecamatanList, setIbFormData]);

  if (!showIBModal || !selectedCattleForIB) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Syringe size={20} className="text-emerald-700" />
            <span>Catat Inseminasi Buatan - Sapi {selectedCattleForIB.name}</span>
          </h3>
          <button
            onClick={() => setShowIBModal(false)}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Info Sapi Akseptor (Auto-Fill Otomatis Nama & Jenis) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5 p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
          <div>
            <label className="block text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-1">
              Nama Sapi Akseptor (Induk Betina)
            </label>
            <input
              type="text"
              readOnly
              value={selectedCattleForIB.name || ''}
              className="w-full h-10 px-3.5 border border-emerald-300 rounded-xl bg-white text-emerald-950 font-extrabold text-xs cursor-not-allowed shadow-2xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-1">
              Jenis / Ras Sapi Akseptor (Betina)
            </label>
            <input
              type="text"
              readOnly
              value={selectedCattleForIB.breed || 'Tidak Spesifik'}
              className="w-full h-10 px-3.5 border border-emerald-300 rounded-xl bg-white text-emerald-950 font-extrabold text-xs cursor-not-allowed shadow-2xs"
            />
          </div>
        </div>

        {!isAdmin && allowedKecamatan.length > 0 && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <MapPin size={16} className="text-emerald-600 shrink-0" />
            <span>
              Wilayah Wewenang Anda: <strong>{allowedKecamatan.join(', ')}</strong>
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Tanggal Pelaksanaan IB</label>
            <input
              type="date"
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900 font-semibold"
              value={ibFormData.date || ''}
              onChange={(e) => setIbFormData({ ...ibFormData, date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Waktu / Jam IB</label>
            <input
              type="time"
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
              value={ibFormData.time || ''}
              onChange={(e) => setIbFormData({ ...ibFormData, time: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Kecamatan</label>
            <select
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900 font-medium cursor-pointer"
              value={ibFormData.kecamatan ? ibFormData.kecamatan.toUpperCase() : ''}
              onChange={(e) => setIbFormData({ ...ibFormData, kecamatan: e.target.value, desa: '' })}
            >
              <option value="">-- Pilih Kecamatan --</option>
              {availableIbKecamatanList.map((kec) => (
                <option key={kec} value={kec}>
                  {kec}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Desa</label>
            <select
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900 font-medium cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
              value={ibFormData.desa || ''}
              onChange={(e) => setIbFormData({ ...ibFormData, desa: e.target.value })}
              disabled={!ibFormData.kecamatan}
            >
              <option value="">
                {ibFormData.kecamatan ? '-- Pilih Desa / Kelurahan --' : '-- Pilih Kecamatan Dahulu --'}
              </option>
              {ibDesaList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
              {ibFormData.desa && !ibDesaList.includes(ibFormData.desa) && (
                <option value={ibFormData.desa}>{ibFormData.desa}</option>
              )}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold mb-1 text-slate-700">Nama Petugas Inseminator</label>
            <input
              type="text"
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
              value={ibFormData.inseminatorName || ''}
              onChange={(e) => setIbFormData({ ...ibFormData, inseminatorName: e.target.value })}
              placeholder="Nama lengkap petugas inseminator"
            />
          </div>

          {/* Rincian Semen Beku (Straw) & Pejantan Donor */}
          <div className="sm:col-span-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Data Semen Beku (Straw) &amp; Pejantan Donor
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Kode Batch Straw</label>
            <input
              type="text"
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900 font-bold"
              value={ibFormData.strawCode || ''}
              onChange={(e) => setIbFormData({ ...ibFormData, strawCode: e.target.value })}
              placeholder="Kode sperma beku (straw)"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Nama Sapi Pejantan (Donor Straw)</label>
            <input
              type="text"
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
              value={ibFormData.bullName || ''}
              onChange={(e) => setIbFormData({ ...ibFormData, bullName: e.target.value })}
              placeholder="Nama pejantan donor (misal: Bima / Gatotkaca)"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold mb-1 text-slate-700">Ras / Bangsa Pejantan (Donor)</label>
            <input
              type="text"
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
              value={ibFormData.bullBreed || ''}
              onChange={(e) => setIbFormData({ ...ibFormData, bullBreed: e.target.value })}
              placeholder="Contoh: Limousin / Brahman / Simental / Angus"
            />
          </div>

          {ibFormData.date && (
            <div className="sm:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-200">
              <label className="block text-xs font-bold mb-1 text-blue-900">
                Rekomendasi Jadwal PKB (90 Hari Setelah IB)
              </label>
              <input
                type="text"
                readOnly
                className="w-full min-h-touch h-11 px-3.5 border border-blue-300 rounded-xl bg-white text-blue-900 font-bold text-xs cursor-not-allowed"
                value={new Date(
                  new Date(ibFormData.date).setDate(new Date(ibFormData.date).getDate() + 90)
                ).toLocaleDateString('id-ID')}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8 pt-5 border-t border-slate-100">
          <button
            onClick={() => setShowIBModal(false)}
            className="flex-1 min-h-touch h-11 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleAddInsemination}
            disabled={!ibFormData.date || !ibFormData.inseminatorName}
            className="flex-1 min-h-touch h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs disabled:opacity-40 transition-colors cursor-pointer"
          >
            Simpan &amp; Kirim Data IB
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 4. MODAL TRACE RIWAYAT IB PER EKOR SAPI ──
interface ModalTraceSapiProps {
  cattle: Cattle | null;
  isOpen: boolean;
  onClose: () => void;
  onEditStatusIb?: (ib: Insemination, cattle: Cattle) => void;
}

export function ModalTraceSapi({
  cattle,
  isOpen,
  onClose,
  onEditStatusIb,
}: ModalTraceSapiProps) {
  if (!isOpen || !cattle) return null;

  const inseminations = cattle.inseminations || [];
  // Sort ascending for chronological trace (IB Ke-1 first)
  const chronologicalIbs = [...inseminations].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const totalIb = chronologicalIbs.length;
  const countBerhasil = chronologicalIbs.filter((i) => i.status_keberhasilan === 'Berhasil').length;
  const countGagal = chronologicalIbs.filter((i) => i.status_keberhasilan === 'Tidak Berhasil').length;
  const countMenunggu = chronologicalIbs.filter((i) => !i.status_keberhasilan || i.status_keberhasilan === 'Menunggu PKB').length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Syringe size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  Trace Riwayat IB Sapi: <span className="text-emerald-700">{cattle.name}</span>
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  ID: {cattle.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-700">{cattle.ownerName || 'Peternak Tanpa Nama'}</span>
                <span>•</span>
                <span>{cattle.kecamatan || '-'}, {cattle.desa || '-'}</span>
                <span>•</span>
                <span>Ras: {cattle.breed || '-'}</span>
                <span>•</span>
                <span>Umur: {calculateAge(cattle.birthDate)}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl font-light cursor-pointer -mt-1"
          >
            &times;
          </button>
        </div>

        {/* Ringkasan Statistik IB Sapi */}
        <div className="grid grid-cols-4 gap-2 my-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
            <p className="text-[10px] font-bold uppercase text-slate-400">Total IB</p>
            <p className="text-lg font-extrabold text-slate-900">{totalIb}x</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center">
            <p className="text-[10px] font-bold uppercase text-emerald-700">Berhasil Jadi</p>
            <p className="text-lg font-extrabold text-emerald-800">{countBerhasil}x</p>
          </div>
          <div className="bg-rose-50 p-3 rounded-xl border border-rose-200 text-center">
            <p className="text-[10px] font-bold uppercase text-rose-700">Tidak Berhasil</p>
            <p className="text-lg font-extrabold text-rose-800">{countGagal}x</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-center">
            <p className="text-[10px] font-bold uppercase text-amber-700">Menunggu PKB</p>
            <p className="text-lg font-extrabold text-amber-800">{countMenunggu}x</p>
          </div>
        </div>

        {/* Timeline Riwayat Inseminasi */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Urutan Pelayanan Inseminasi Buatan (Trace Riwayat)
            </h4>
            <span className="text-[11px] text-slate-400">
              Status reproduksi saat ini: <strong className="text-slate-700">{cattle.status}</strong>
            </span>
          </div>

          {chronologicalIbs.length > 0 ? (
            chronologicalIbs.map((ib, idx) => {
              const orderNum = ib.ibOrder || idx + 1;
              const isBerhasil = ib.status_keberhasilan === 'Berhasil';
              const isGagal = ib.status_keberhasilan === 'Tidak Berhasil';
              const isMenunggu = !ib.status_keberhasilan || ib.status_keberhasilan === 'Menunggu PKB';

              return (
                <div
                  key={ib.id || idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    isBerhasil
                      ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                      : isGagal
                      ? 'bg-rose-50/30 border-rose-200 hover:border-rose-300'
                      : 'bg-amber-50/30 border-amber-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl font-black text-xs flex items-center justify-center shrink-0 shadow-xs ${
                          isBerhasil
                            ? 'bg-emerald-600 text-white'
                            : isGagal
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        #{orderNum}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-slate-900">
                            Inseminasi Buatan Ke-{orderNum}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            • {new Date(ib.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            {ib.time ? ` (${ib.time})` : ''}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-slate-600">
                          <div>
                            <span className="text-slate-400">Petugas Inseminator: </span>
                            <strong className="text-slate-800">{ib.inseminatorName || '-'}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Kode Straw / Pejantan: </span>
                            <strong className="text-slate-800">
                              {ib.strawCode || '-'} {ib.bullBreed ? `(${ib.bullBreed})` : ''}
                            </strong>
                          </div>
                          {ib.pkbDateActual && (
                            <div>
                              <span className="text-slate-400">Tgl PKB Riil: </span>
                              <strong className="text-slate-800">
                                {new Date(ib.pkbDateActual).toLocaleDateString('id-ID')} ({ib.pkbResult || '-'})
                              </strong>
                            </div>
                          )}
                          {ib.birthDate && (
                            <div>
                              <span className="text-slate-400">Tgl Kelahiran: </span>
                              <strong className="text-emerald-700">
                                {new Date(ib.birthDate).toLocaleDateString('id-ID')} ({ib.calfGender || 'Pedet'})
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge & Action */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          isBerhasil
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : isGagal
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {isBerhasil && <CheckCircle2 size={13} />}
                        {isGagal && <XCircle size={13} />}
                        {isMenunggu && <Clock size={13} />}
                        <span>{ib.status_keberhasilan || 'Menunggu PKB'}</span>
                      </span>

                      <span className="text-[10px] font-semibold text-slate-400">
                        {ib.mode_keberhasilan === 'manual' ? 'Penetapan Manual' : 'Kalkulasi Sistem Otomatis'}
                      </span>

                      {onEditStatusIb && (
                        <button
                          onClick={() => onEditStatusIb(ib, cattle)}
                          className="mt-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 size={11} />
                          <span>Ubah Status</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              Sapi ini belum memiliki data riwayat Inseminasi Buatan (IB).
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 5. MODAL EDIT STATUS KEBERHASILAN IB (MANUAL / SISTEM) ──
interface ModalEditStatusIbProps {
  ib: Insemination | null;
  cattle: Cattle | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (ibId: number, status: string, mode: string) => Promise<void>;
}

export function ModalEditStatusIb({
  ib,
  cattle,
  isOpen,
  onClose,
  onSave,
}: ModalEditStatusIbProps) {
  const [mode, setMode] = React.useState<'sistem' | 'manual'>('sistem');
  const [status, setStatus] = React.useState<'Berhasil' | 'Tidak Berhasil' | 'Menunggu PKB'>('Berhasil');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (ib) {
      setMode(ib.mode_keberhasilan === 'manual' ? 'manual' : 'sistem');
      setStatus(
        (ib.status_keberhasilan as any) ||
          (ib.birthDate || ib.pkbResult === 'Bunting' ? 'Berhasil' : 'Menunggu PKB')
      );
    }
  }, [ib, isOpen]);

  if (!isOpen || !ib) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(ib.id, status, mode);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-2xl font-light cursor-pointer"
        >
          &times;
        </button>

        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-1 flex items-center gap-2">
          <Edit2 size={18} className="text-emerald-600" />
          <span>Atur Status Keberhasilan IB</span>
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Sapi: <strong>{cattle?.name || ib.cattleName || 'Sapi'}</strong> • IB Ke-{ib.ibOrder || 1} (
          {new Date(ib.date).toLocaleDateString('id-ID')})
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Mode Penentuan Status</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('sistem')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'sistem'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <p className="text-xs flex items-center justify-between">
                  <span>Sistem Otomatis</span>
                  {mode === 'sistem' && <Check size={14} className="text-emerald-600" />}
                </p>
                <p className="text-[10px] text-slate-500 font-normal mt-1">
                  Dihitung otomatis dari riwayat PKB &amp; siklus estrus sapi
                </p>
              </button>

              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'manual'
                    ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <p className="text-xs flex items-center justify-between">
                  <span>Penetapan Manual</span>
                  {mode === 'manual' && <Check size={14} className="text-emerald-600" />}
                </p>
                <p className="text-[10px] text-slate-500 font-normal mt-1">
                  Pilihan langsung oleh petugas di lapangan
                </p>
              </button>
            </div>
          </div>

          {mode === 'manual' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pilih Hasil Keberhasilan Manual
              </label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs font-bold text-slate-900 cursor-pointer"
              >
                <option value="Berhasil">Berhasil (Konsepsi / Bunting / Lahir)</option>
                <option value="Tidak Berhasil">Tidak Berhasil (Kosong / Birahi Ulang / Gagal)</option>
                <option value="Menunggu PKB">Menunggu PKB (Masih Dalam Proses)</option>
              </select>
            </div>
          ) : (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-[11px] text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <RotateCcw size={13} className="text-blue-600" />
                <span>Kalkulasi Otomatis Sistem Aktif</span>
              </p>
              <p className="text-blue-800">
                Status akan otomatis membaca dari hasil PKB (Bunting/Tidak) dan urutan riwayat suntikan sapi secara cerdas.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-3 border-t border-slate-100 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

