'use client';

import React from 'react';
import { X, CheckCircle2, Loader2, Plus } from 'lucide-react';
import { KECAMATAN_ITEMS } from '@/lib/sklbPetaData';
import { SapiPOFormData, ModalRekapState, ModalDetailState } from './types';

interface ModalSapiPOProps {
  modalSapiPO: { open: boolean; item: any | null };
  setModalSapiPO: (val: { open: boolean; item: any | null }) => void;
  formSapiPO: SapiPOFormData;
  setFormSapiPO: React.Dispatch<React.SetStateAction<SapiPOFormData>>;
  sapiPOKecMap: Record<string, number>;
  selectedYear: number;
  isSavingSapiPO: boolean;
  handleSaveSapiPO: (e: React.FormEvent) => void;
}

export function ModalSapiPO({
  modalSapiPO,
  setModalSapiPO,
  formSapiPO,
  setFormSapiPO,
  sapiPOKecMap,
  selectedYear,
  isSavingSapiPO,
  handleSaveSapiPO,
}: ModalSapiPOProps) {
  if (!modalSapiPO.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setModalSapiPO({ open: false, item: null })}
          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute top-4 right-4 sm:top-5 sm:right-5 cursor-pointer"
        >
          <X size={16} />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Input / Edit Populasi Sapi PO Tahun {selectedYear}
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Perbarui jumlah populasi Sapi Peranakan Ongole (PO) per kecamatan di Kabupaten Kebumen.
        </p>

        <form onSubmit={handleSaveSapiPO} className="space-y-4 text-xs font-semibold text-slate-700">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-bold text-slate-700">Kecamatan <span className="text-red-500">*</span></label>
              <select
                value={formSapiPO.kecamatan_id}
                onChange={(e) => {
                  const kecItem = KECAMATAN_ITEMS.find((k) => k.id === e.target.value || k.id.replace('k_', '') === e.target.value);
                  const cleanId = e.target.value.toLowerCase().replace('k_', '');
                  setFormSapiPO({
                    ...formSapiPO,
                    kecamatan_id: cleanId,
                    kecamatan_nama: kecItem ? kecItem.nama : cleanId,
                    populasi: sapiPOKecMap[cleanId] || 0,
                  });
                }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                {KECAMATAN_ITEMS.map((k) => {
                  const cleanId = k.id.toLowerCase().replace('k_', '');
                  return (
                    <option key={k.id} value={cleanId}>{k.nama}</option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-bold text-slate-700">Periode Triwulan</label>
              <input
                type="text"
                value={formSapiPO.triwulan}
                onChange={(e) => setFormSapiPO({ ...formSapiPO, triwulan: e.target.value })}
                placeholder="Contoh: Triwulan 2"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-bold text-slate-700">Jumlah Populasi Sapi PO (Ekor) <span className="text-red-500">*</span></label>
            <input
              type="number"
              required
              min="0"
              value={formSapiPO.populasi}
              onChange={(e) => setFormSapiPO({ ...formSapiPO, populasi: Math.max(0, parseInt(e.target.value, 10) || 0) })}
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600 text-sm"
            />
          </div>

          <div>
            <label className="block mb-1 font-bold text-slate-700">Keterangan Tambahan</label>
            <textarea
              rows={2}
              placeholder="Catatan verifikasi data lapangan..."
              value={formSapiPO.keterangan}
              onChange={(e) => setFormSapiPO({ ...formSapiPO, keterangan: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-emerald-600 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalSapiPO({ open: false, item: null })}
              className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSavingSapiPO}
              className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold shadow-xs cursor-pointer flex items-center gap-2"
            >
              {isSavingSapiPO ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              <span>Simpan Data Populasi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ModalAddYearProps {
  showAddYearModal: boolean;
  setShowAddYearModal: (val: boolean) => void;
  newYearInput: number;
  setNewYearInput: (val: number) => void;
  isAddingYear: boolean;
  handleAddYearSubmit: (e: React.FormEvent) => void;
}

export function ModalAddYear({
  showAddYearModal,
  setShowAddYearModal,
  newYearInput,
  setNewYearInput,
  isAddingYear,
  handleAddYearSubmit,
}: ModalAddYearProps) {
  if (!showAddYearModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setShowAddYearModal(false)}
          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute top-4 right-4 sm:top-5 sm:right-5 cursor-pointer"
        >
          <X size={16} />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">Tambah Periode Tahun Baru</h3>
        <p className="text-xs text-slate-500 mb-5">
          Buat periode populasi Sapi PO untuk tahun berikutnya.
        </p>

        <form onSubmit={handleAddYearSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
          <div>
            <label className="block mb-1 font-bold text-slate-700">Tahun Baru yang Ditambahkan <span className="text-red-500">*</span></label>
            <input
              type="number"
              required
              min={2020}
              max={2100}
              value={newYearInput}
              onChange={(e) => setNewYearInput(Number(e.target.value))}
              placeholder="Contoh: 2027"
              className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-emerald-600 text-sm"
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
              className="flex-1 h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              {isAddingYear ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              <span>{isAddingYear ? 'Menambahkan...' : 'Buat Tahun Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ModalRekapProps {
  modalRekap: ModalRekapState;
  setModalRekap: (val: ModalRekapState) => void;
  handleSaveRekap: (e: React.FormEvent) => void;
}

export function ModalRekap({
  modalRekap,
  setModalRekap,
  handleSaveRekap,
}: ModalRekapProps) {
  if (!modalRekap.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setModalRekap({ open: false, mode: 'tambah', data: null })}
          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute top-4 right-4 sm:top-5 sm:right-5 cursor-pointer"
        >
          <X size={16} />
        </button>
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          {modalRekap.mode === 'tambah' ? 'Tambah Data Jadwal Rekap' : 'Edit Data Jadwal Rekap'}
        </h3>
        <form onSubmit={handleSaveRekap} className="space-y-4 text-xs font-semibold text-slate-700">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-bold">Tanggal</label>
              <input
                type="text"
                required
                placeholder="Contoh: 14/05/2024"
                value={modalRekap.data?.tanggal || ''}
                onChange={(e) => setModalRekap({ ...modalRekap, data: { ...modalRekap.data, tanggal: e.target.value } })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Grup Tim</label>
              <select
                value={modalRekap.data?.grup || 'Tabel Kiri'}
                onChange={(e) => setModalRekap({ ...modalRekap, data: { ...modalRekap.data, grup: e.target.value } })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="Tabel Kiri">Tim Timur</option>
                <option value="Tabel Kanan">Tim Barat</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-bold">Desa</label>
              <input
                type="text"
                required
                value={modalRekap.data?.desa || ''}
                onChange={(e) => setModalRekap({ ...modalRekap, data: { ...modalRekap.data, desa: e.target.value } })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Kecamatan</label>
              <input
                type="text"
                required
                value={modalRekap.data?.kecamatan || ''}
                onChange={(e) => setModalRekap({ ...modalRekap, data: { ...modalRekap.data, kecamatan: e.target.value } })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 font-bold">Target</label>
              <input
                type="number"
                value={modalRekap.data?.target || 0}
                onChange={(e) => {
                  const tgt = Number(e.target.value) || 0;
                  const cap = Number(modalRekap.data?.capaian) || 0;
                  setModalRekap({ ...modalRekap, data: { ...modalRekap.data, target: tgt, selisih: cap - tgt } });
                }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium font-sans"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Capaian</label>
              <input
                type="number"
                value={modalRekap.data?.capaian || 0}
                onChange={(e) => {
                  const cap = Number(e.target.value) || 0;
                  const tgt = Number(modalRekap.data?.target) || 0;
                  setModalRekap({ ...modalRekap, data: { ...modalRekap.data, capaian: cap, selisih: cap - tgt } });
                }}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium font-sans"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Selisih</label>
              <input
                type="number"
                disabled
                value={modalRekap.data?.selisih || 0}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium font-sans text-slate-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalRekap({ open: false, mode: 'tambah', data: null })}
              className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ModalDetailProps {
  modalDetail: ModalDetailState;
  setModalDetail: (val: ModalDetailState) => void;
  handleSaveDetail: (e: React.FormEvent) => void;
}

export function ModalDetail({
  modalDetail,
  setModalDetail,
  handleSaveDetail,
}: ModalDetailProps) {
  if (!modalDetail.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setModalDetail({ open: false, mode: 'tambah', data: null })}
          className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute top-4 right-4 sm:top-5 sm:right-5 cursor-pointer"
        >
          <X size={16} />
        </button>
        <h3 className="text-lg font-bold text-slate-900 mb-4">
          {modalDetail.mode === 'tambah' ? 'Tambah Data Sapi SKLB' : 'Edit Data Sapi SKLB'}
        </h3>
        <form onSubmit={handleSaveDetail} className="space-y-4 text-xs font-semibold text-slate-700">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-bold">Desa Lokasi <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={modalDetail.data?.desa_lokasi || ''}
                onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, desa_lokasi: e.target.value } })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Nama Pemilik <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={modalDetail.data?.nama_pemilik || ''}
                onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, nama_pemilik: e.target.value } })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 font-bold">Dusun</label>
              <input
                type="text"
                value={modalDetail.data?.dusun || ''}
                onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, dusun: e.target.value } })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">RT</label>
              <input
                type="text"
                value={modalDetail.data?.rt || ''}
                onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, rt: e.target.value } })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">RW</label>
              <input
                type="text"
                value={modalDetail.data?.rw || ''}
                onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, rw: e.target.value } })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block mb-1 font-bold">Nama Sapi</label>
              <input
                type="text"
                value={modalDetail.data?.nama_sapi || ''}
                onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, nama_sapi: e.target.value } })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Jenis Kelamin</label>
              <select
                value={modalDetail.data?.jenis_kelamin || 'Betina'}
                onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, jenis_kelamin: e.target.value } })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="Betina">Betina</option>
                <option value="Jantan">Jantan</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-bold">Umur (Bulan)</label>
              <input
                type="number"
                value={modalDetail.data?.umur_bulan || ''}
                onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, umur_bulan: Number(e.target.value) || 0 } })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium font-sans"
              />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block mb-1 font-bold">Tinggi (cm)</label>
              <input
                type="number"
                step="any"
                value={modalDetail.data?.tinggi_pundak || ''}
                onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, tinggi_pundak: Number(e.target.value) || 0 } })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium font-sans"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Panjang (cm)</label>
              <input
                type="number"
                step="any"
                value={modalDetail.data?.panjang_badan || ''}
                onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, panjang_badan: Number(e.target.value) || 0 } })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium font-sans"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Dada (cm)</label>
              <input
                type="number"
                step="any"
                value={modalDetail.data?.lingkar_dada || ''}
                onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, lingkar_dada: Number(e.target.value) || 0 } })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium font-sans"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Berat (kg)</label>
              <input
                type="number"
                step="any"
                value={modalDetail.data?.berat_badan || ''}
                onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, berat_badan: Number(e.target.value) || 0 } })}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium font-sans"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalDetail({ open: false, mode: 'tambah', data: null })}
              className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
