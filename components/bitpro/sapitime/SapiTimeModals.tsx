'use client';

import React from 'react';
import { Sparkles, Syringe } from 'lucide-react';
import { Cattle, KECAMATAN_LIST, getDesaListForKecamatan } from './types';

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
  if (!isOpen) return null;

  const desaList = getDesaListForKecamatan(formData.kecamatan);

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
              {KECAMATAN_LIST.map((kec) => (
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
  if (!showIBModal || !selectedCattleForIB) return null;

  const ibDesaList = getDesaListForKecamatan(ibFormData.kecamatan);

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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-700">Tanggal Pelaksanaan IB</label>
            <input
              type="date"
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
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
            <label className="block text-xs font-bold mb-1 text-slate-700">Nama Pejantan</label>
            <input
              type="text"
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
              value={ibFormData.bullName || ''}
              onChange={(e) => setIbFormData({ ...ibFormData, bullName: e.target.value })}
              placeholder="Nama sapi pejantan"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold mb-1 text-slate-700">Ras Pejantan</label>
            <input
              type="text"
              className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
              value={ibFormData.bullBreed || ''}
              onChange={(e) => setIbFormData({ ...ibFormData, bullBreed: e.target.value })}
              placeholder="Contoh: Limousin / Brahman / Simental"
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
