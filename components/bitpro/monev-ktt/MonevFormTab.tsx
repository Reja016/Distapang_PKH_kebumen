'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  Filter,
  Search,
  X,
  MapPin,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
  Edit2,
  Trash2,
  FileCheck,
  AlertCircle,
  Download,
  Printer,
} from 'lucide-react';
import {
  DATA_WILAYAH,
  DAFTAR_JENIS_TERNAK,
  FieldData,
  KondisiTernak,
  hitungKondisi,
} from './types';
import { BarisTernak, KondisiSection } from './KondisiFormSections';
import { compressImageFile } from '@/lib/file-compressor';
import { cetakLaporanRuminansia } from './monev-pdf-printer';

interface MonevFormTabProps {
  formSectionRef: React.RefObject<any>;
  // Tahun Bantuan
  tahunBantuanFilter: string;
  onSelectTahunBantuan: (th: string) => void;
  daftarTahunAktif: string[];
  // Form State
  editingId: string | null;
  formTahun: string;
  setFormTahun: (val: string) => void;
  formKec: string;
  setFormKec: (val: string) => void;
  formDesa: string;
  setFormDesa: (val: string) => void;
  formKtt: string;
  setFormKtt: (val: string) => void;
  formJenis: string;
  setFormJenis: (val: string) => void;
  formSumberDana: string;
  setFormSumberDana: (val: string) => void;
  formWaktuMonev: string;
  setFormWaktuMonev: (val: string) => void;
  formKondisi: KondisiTernak;
  updateKondisi: (field: keyof KondisiTernak, value: any) => void;
  handlePdfUploadGeneric: (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldPdf: keyof KondisiTernak,
    fieldName: keyof KondisiTernak
  ) => void;
  removePdfGeneric: (fieldPdf: keyof KondisiTernak, fieldName: keyof KondisiTernak) => void;
  // GPS & Photo
  formLat: number | null;
  setFormLat: (val: number | null) => void;
  formLng: number | null;
  setFormLng: (val: number | null) => void;
  handleGetLocation: () => void;
  isGettingLocation: boolean;
  formPhoto: string | null;
  setFormPhoto: (val: string | null) => void;
  handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  cameraInputRef: React.RefObject<any>;
  galleryInputRef: React.RefObject<any>;
  setPreviewPhotoModal: (val: { url: string; title: string } | null) => void;
  formCatatan: string;
  setFormCatatan: (val: string) => void;
  // Live Search KTT
  kttInputRef: React.RefObject<any>;
  showKttSuggestions: boolean;
  setShowKttSuggestions: (val: boolean) => void;
  filteredKttSuggestions: Array<{ id: any; namaKelompok: string; kecamatan: string; desa: string; ketua?: string }>;
  handleSelectKtt: (ktt: { namaKelompok: string; kecamatan: string; desa: string }) => void;
  // Handlers
  handleSubmitLapangan: (e: React.FormEvent) => void;
  resetForm: () => void;
  // Table Data
  dbLapanganFiltered: FieldData[];
  canEdit: boolean;
  onEdit: (data: FieldData) => void;
  onDelete: (id: string) => void;
  kttMasterList?: Array<{ id: any; namaKelompok: string; kecamatan: string; desa: string; ketua?: string }>;
}

export function MonevFormTab({
  formSectionRef,
  tahunBantuanFilter,
  onSelectTahunBantuan,
  daftarTahunAktif,
  editingId,
  formTahun,
  setFormTahun,
  formKec,
  setFormKec,
  formDesa,
  setFormDesa,
  formKtt,
  setFormKtt,
  formJenis,
  setFormJenis,
  formSumberDana,
  setFormSumberDana,
  formWaktuMonev,
  setFormWaktuMonev,
  formKondisi,
  updateKondisi,
  handlePdfUploadGeneric,
  removePdfGeneric,
  formLat,
  setFormLat,
  formLng,
  setFormLng,
  handleGetLocation,
  isGettingLocation,
  formPhoto,
  setFormPhoto,
  handlePhotoUpload,
  cameraInputRef,
  galleryInputRef,
  setPreviewPhotoModal,
  formCatatan,
  setFormCatatan,
  kttInputRef,
  showKttSuggestions,
  setShowKttSuggestions,
  filteredKttSuggestions,
  handleSelectKtt,
  handleSubmitLapangan,
  resetForm,
  dbLapanganFiltered,
  canEdit,
  onEdit,
  onDelete,
  kttMasterList = [],
}: MonevFormTabProps) {
  const kalkulasi = hitungKondisi(formKondisi);

  // ── FILTER KECAMATAN DI DATABASE ──
  const [filterKecamatan, setFilterKecamatan] = useState<string>('Semua Kecamatan');
  const daftarKecamatan = useMemo(() => Object.keys(DATA_WILAYAH).sort(), []);

  // Filter Tabel Gabungan: Tahun Bantuan + Kecamatan
  const dbLapanganTabel = useMemo(() => {
    return dbLapanganFiltered.filter((d) => {
      // Filter hanya data Ruminansia (default jika tidak ada kategori atau kategori Ruminansia)
      if (d.kategori === 'Unggas') return false;
      if (filterKecamatan === 'Semua Kecamatan') return true;
      return (d.kec || '').toUpperCase() === filterKecamatan.toUpperCase();
    });
  }, [dbLapanganFiltered, filterKecamatan]);

  // Upload handler for TTD Petugas (Foto Asli, Tanpa Filter)
  const handleUploadTtdPetugas = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1400, 0.85, 2 * 1024 * 1024);
      updateKondisi('fotoTtdPetugas', compressed);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses foto tanda tangan petugas');
    }
  };

  // Upload handler for TTD Ketua + Cap Kelompok (Foto Asli, Tanpa Filter)
  const handleUploadTtdKetuaCap = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1400, 0.85, 2 * 1024 * 1024);
      updateKondisi('fotoTtdKetuaCap', compressed);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses foto tanda tangan + cap ketua KTT');
    }
  };

  // Validasi Form Submit (GPS Wajib Diisi)
  const onSubmitWithValidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (formLat === null || formLng === null || isNaN(formLat) || isNaN(formLng)) {
      alert('⚠️ Titik Koordinat GPS Wajib Diklik / Diisi!\nSilakan klik tombol "📍 Ambil GPS Otomatis" atau ketik koordinat lokasi kandang KTT.');
      return;
    }
    handleSubmitLapangan(e);
  };

  return (
    <div ref={formSectionRef} className="space-y-8 animate-in fade-in duration-200">
      {/* ── 1. FILTER TAHUN BANTUAN & KECAMATAN (FILTER DATABASE) ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Filter size={16} strokeWidth={2.5} className="text-emerald-600" />
              <span>Filter Data Lapangan (Tahun &amp; Kecamatan)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Saring daftar kelompok tani ternak berdasarkan tahun bantuan dan wilayah kecamatan
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Tahun: {tahunBantuanFilter}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {filterKecamatan}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Pilih Tahun Bantuan</label>
            <select
              value={tahunBantuanFilter}
              onChange={(e) => onSelectTahunBantuan(e.target.value)}
              className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-800 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-2xs cursor-pointer"
            >
              <option value="Semua Tahun">📅 Semua Tahun Bantuan</option>
              {daftarTahunAktif.map((th) => (
                <option key={th} value={th}>
                  Tahun Bantuan {th}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Pilih Kecamatan</label>
            <select
              value={filterKecamatan}
              onChange={(e) => setFilterKecamatan(e.target.value)}
              className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-800 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all shadow-2xs cursor-pointer"
            >
              <option value="Semua Kecamatan">📍 Semua Kecamatan</option>
              {daftarKecamatan.map((kec) => (
                <option key={kec} value={kec}>
                  Kecamatan {kec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── 2. TABEL DAFTAR DATA LAPANGAN (REPOSISI KE BAWAH FILTER) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <span>Daftar Data Lapangan Ruminansia ({tahunBantuanFilter} · {filterKecamatan})</span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {dbLapanganTabel.length} Kelompok
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Data terekam di sistem monev lapangan Dinas Pertanian dan Pangan
            </p>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold">
              <tr>
                <th className="px-4 py-3.5 text-center w-12">No</th>
                <th className="px-4 py-3.5">Tahun</th>
                <th className="px-4 py-3.5">Nama KTT</th>
                <th className="px-4 py-3.5">Wilayah</th>
                <th className="px-4 py-3.5">Komoditas</th>
                <th className="px-4 py-3.5 text-right">Awal</th>
                <th className="px-4 py-3.5 text-right">Sisa Pokok</th>
                <th className="px-4 py-3.5 text-right">Total Aset</th>
                <th className="px-4 py-3.5 text-center">GPS &amp; TTD</th>
                <th className="px-4 py-3.5 text-center">Aksi / Cetak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dbLapanganTabel.map((d, idx) => {
                const h = hitungKondisi(d.kondisi);
                const baMati = d.kondisi.matiBangkaiBAPdf;
                const baJual = d.kondisi.jualBAPdf;
                const ttdKetua = d.kondisi.fotoTtdKetuaCap;
                const ttdPetugas = d.kondisi.fotoTtdPetugas;

                return (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-center font-bold text-emerald-700 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-800">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs">
                        {d.tahun}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">{d.namaKtt}</td>
                    <td className="px-4 py-3.5 text-slate-600 text-xs">
                      {d.desa}, {d.kec}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                        {d.jenis}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-700">{h.a}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-700">{h.e}</td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-emerald-700">{h.i} Ekor</td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
                        {d.lat ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-0.5" title={`Lat: ${d.lat}, Lng: ${d.lng}`}>
                            <CheckCircle2 size={13} strokeWidth={2.5} /> GPS
                          </span>
                        ) : (
                          <span className="text-red-500 font-bold text-[11px]">Belum GPS</span>
                        )}

                        {d.photo && (
                          <button
                            type="button"
                            onClick={() => setPreviewPhotoModal({ url: d.photo!, title: `Foto Dokumentasi: ${d.namaKtt} (${d.desa}, ${d.kec})` })}
                            className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Klik untuk melihat / unduh foto dokumentasi"
                          >
                            <ImageIcon size={11} strokeWidth={2.5} className="text-emerald-600" />
                            <span>Foto</span>
                          </button>
                        )}

                        {ttdPetugas && (
                          <button
                            type="button"
                            onClick={() => setPreviewPhotoModal({ url: ttdPetugas, title: `TTD Petugas Monev: ${d.namaKtt}` })}
                            className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 cursor-pointer"
                            title="Lihat / Unduh Tanda Tangan Petugas"
                          >
                            <FileCheck size={11} strokeWidth={2.5} className="text-emerald-600" />
                            <span>TTD Petugas</span>
                          </button>
                        )}

                        {ttdKetua && (
                          <button
                            type="button"
                            onClick={() => setPreviewPhotoModal({ url: ttdKetua, title: `Tanda Tangan & Cap: ${d.namaKtt}` })}
                            className="text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 cursor-pointer"
                            title="Lihat / Unduh Tanda Tangan & Cap Kelompok"
                          >
                            <FileCheck size={11} strokeWidth={2.5} className="text-blue-600" />
                            <span>TTD+Cap</span>
                          </button>
                        )}

                        {baMati && (
                          <a
                            href={baMati}
                            download={d.kondisi.matiBangkaiBAName || 'BA_Kematian.pdf'}
                            target="_blank"
                            rel="noreferrer"
                            className="text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5"
                            title="Berita Acara Kematian"
                          >
                            <FileText size={11} strokeWidth={2.5} className="text-red-600" />
                            <span>BA Mati</span>
                          </a>
                        )}

                        {baJual && (
                          <a
                            href={baJual}
                            download={d.kondisi.jualBAName || 'BA_Penjualan.pdf'}
                            target="_blank"
                            rel="noreferrer"
                            className="text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5"
                            title="Berita Acara Penjualan"
                          >
                            <FileText size={11} strokeWidth={2.5} className="text-amber-700" />
                            <span>BA Jual</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => cetakLaporanRuminansia(d, kttMasterList)}
                          className="w-8 h-8 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                          title="Cetak / Unduh Laporan PDF Template Resmi"
                        >
                          <Printer size={13} strokeWidth={2.5} />
                        </button>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => onEdit(d)}
                              className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                              title="Edit Data"
                            >
                              <Edit2 size={13} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => onDelete(d.id)}
                              className="w-8 h-8 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
                              title="Hapus Data"
                            >
                              <Trash2 size={13} strokeWidth={2.5} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {dbLapanganTabel.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-5 py-10 text-center text-slate-400 font-medium">
                    Belum ada data monev lapangan tersimpan untuk filter {tahunBantuanFilter} · {filterKecamatan}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. FORMULIR INPUT MONEV TERNAK HIBAH RUMINANSIA ── */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">
              {editingId ? 'Edit Data Monev Ruminansia' : `Formulir Monev Ternak Hibah Ruminansia (Tahun Bantuan ${formTahun})`}
            </h3>
            <p className="text-xs text-slate-500">
              Pencatatan perkembangan populasi ternak ruminansia (sapi, kambing, domba) sesuai formulir resmi
            </p>
          </div>
          {editingId && (
            <button
              onClick={resetForm}
              className="min-h-touch h-9 px-3.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Batal Edit
            </button>
          )}
        </div>

        <form onSubmit={onSubmitWithValidation} className="space-y-6">
          {/* Bagian 1: Informasi Wilayah & Kelompok */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>1. Informasi Wilayah &amp; Kelompok Tani Ternak</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Tahun Bantuan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formTahun}
                  onChange={(e) => setFormTahun(e.target.value)}
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-emerald-500 outline-none cursor-pointer"
                >
                  {daftarTahunAktif.map((th) => (
                    <option key={th} value={th}>Tahun Bantuan {th}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Sumber Dana <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formSumberDana}
                  onChange={(e) => setFormSumberDana(e.target.value)}
                  placeholder="Contoh: APBD / DAK"
                  required
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Kecamatan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formKec}
                  onChange={(e) => {
                    setFormKec(e.target.value);
                    setFormDesa('');
                  }}
                  required
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-emerald-500 outline-none cursor-pointer"
                >
                  <option value="">Pilih Kecamatan...</option>
                  {daftarKecamatan.map((kec) => (
                    <option key={kec} value={kec}>{kec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Desa / Kelurahan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formDesa}
                  onChange={(e) => setFormDesa(e.target.value)}
                  disabled={!formKec}
                  required
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-emerald-500 outline-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">Pilih Desa...</option>
                  {formKec && DATA_WILAYAH[formKec]?.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative" ref={kttInputRef}>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center justify-between">
                  <span>Nama Kelompok (KTT) <span className="text-red-500">*</span></span>
                  <span className="text-[10px] font-semibold text-emerald-700">🔍 Live Search Master</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ketik nama kelompok..."
                    value={formKtt}
                    onChange={(e) => {
                      setFormKtt(e.target.value);
                      setShowKttSuggestions(true);
                    }}
                    onFocus={() => setShowKttSuggestions(true)}
                    className="w-full min-h-touch h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-emerald-500 outline-none"
                  />
                  <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {showKttSuggestions && filteredKttSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {filteredKttSuggestions.map((item) => (
                      <div
                        key={item.id}
                        onMouseDown={() => handleSelectKtt(item)}
                        className="p-2.5 hover:bg-emerald-50/80 cursor-pointer text-xs transition-colors"
                      >
                        <p className="font-bold text-slate-900">{item.namaKelompok}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span className="bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-md font-semibold">
                            Kec. {item.kecamatan}
                          </span>
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md">
                            Desa {item.desa}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Komoditas Ruminansia <span className="text-red-500">*</span>
                </label>
                <select
                  value={formJenis}
                  onChange={(e) => setFormJenis(e.target.value)}
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-emerald-500 outline-none cursor-pointer"
                >
                  {DAFTAR_JENIS_TERNAK.filter((j) => !j.toLowerCase().includes('ayam') && !j.toLowerCase().includes('unggas')).map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Waktu Pelaksanaan Monev <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formWaktuMonev}
                  onChange={(e) => setFormWaktuMonev(e.target.value)}
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs focus:border-emerald-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bagian 2: Rincian Mutasi & Kondisi Ternak Ruminansia */}
          <div className="space-y-4">
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
              2. Rincian Mutasi &amp; Kondisi Ternak Pokok (Sesuai Lembar Monev Ruminansia)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <KondisiSection nomor="1" title="Jumlah Ternak Awal Total (a)" total={kalkulasi.a} totalLabel="Total Awal">
                <BarisTernak
                  label="Awal"
                  jantan={formKondisi.awalJantan}
                  betina={formKondisi.awalBetina}
                  onJantan={(v: number) => updateKondisi('awalJantan', v)}
                  onBetina={(v: number) => updateKondisi('awalBetina', v)}
                />
              </KondisiSection>

              <KondisiSection nomor="2" title="Kematian Ternak Pokok (b)" total={kalkulasi.b} totalLabel="Total Mati">
                <div className="space-y-3">
                  <BarisTernak
                    label="Mati Bangkai"
                    showBA
                    jantan={formKondisi.matiBangkaiJantan}
                    betina={formKondisi.matiBangkaiBetina}
                    ba={formKondisi.matiBangkaiBA}
                    baPdf={formKondisi.matiBangkaiBAPdf}
                    baPdfName={formKondisi.matiBangkaiBAName}
                    onJantan={(v: number) => updateKondisi('matiBangkaiJantan', v)}
                    onBetina={(v: number) => updateKondisi('matiBangkaiBetina', v)}
                    onBA={(v) => updateKondisi('matiBangkaiBA', v)}
                    onUploadBAPdf={(e) => handlePdfUploadGeneric(e, 'matiBangkaiBAPdf', 'matiBangkaiBAName')}
                    onRemoveBAPdf={() => removePdfGeneric('matiBangkaiBAPdf', 'matiBangkaiBAName')}
                  />
                  <div className="pt-2 border-t border-slate-100">
                    <BarisTernak
                      label="Mati Potong Paksa"
                      showBA
                      jantan={formKondisi.matiPotongJantan}
                      betina={formKondisi.matiPotongBetina}
                      ba={formKondisi.matiPotongBA}
                      baPdf={formKondisi.matiPotongBAPdf}
                      baPdfName={formKondisi.matiPotongBAName}
                      onJantan={(v: number) => updateKondisi('matiPotongJantan', v)}
                      onBetina={(v: number) => updateKondisi('matiPotongBetina', v)}
                      onBA={(v) => updateKondisi('matiPotongBA', v)}
                      onUploadBAPdf={(e) => handlePdfUploadGeneric(e, 'matiPotongBAPdf', 'matiPotongBAName')}
                      onRemoveBAPdf={() => removePdfGeneric('matiPotongBAPdf', 'matiPotongBAName')}
                    />
                  </div>
                </div>
              </KondisiSection>

              <KondisiSection nomor="3" title="Penjualan Ternak Pokok (c)" total={kalkulasi.c} totalLabel="Total Dijual">
                <BarisTernak
                  label="Jual Ternak Pokok"
                  showBA
                  jantan={formKondisi.jualJantan}
                  betina={formKondisi.jualBetina}
                  ba={formKondisi.jualBA}
                  baPdf={formKondisi.jualBAPdf}
                  baPdfName={formKondisi.jualBAName}
                  onJantan={(v: number) => updateKondisi('jualJantan', v)}
                  onBetina={(v: number) => updateKondisi('jualBetina', v)}
                  onBA={(v) => updateKondisi('jualBA', v)}
                  onUploadBAPdf={(e) => handlePdfUploadGeneric(e, 'jualBAPdf', 'jualBAName')}
                  onRemoveBAPdf={() => removePdfGeneric('jualBAPdf', 'jualBAName')}
                />
              </KondisiSection>

              <KondisiSection nomor="4" title="Pembelian Ternak Pokok (d)" total={kalkulasi.d} totalLabel="Total Dibeli">
                <BarisTernak
                  label="Beli Ternak Pokok"
                  jantan={formKondisi.beliJantan}
                  betina={formKondisi.beliBetina}
                  onJantan={(v: number) => updateKondisi('beliJantan', v)}
                  onBetina={(v: number) => updateKondisi('beliBetina', v)}
                />
              </KondisiSection>

              <KondisiSection nomor="6" title="Kelahiran Anak (f)" total={kalkulasi.f} totalLabel="Total Lahir">
                <div className="space-y-3">
                  <BarisTernak
                    label="Lahir Anak"
                    disabled={(formKondisi.lahirBelumTahu || 0) > 0}
                    jantan={formKondisi.lahirJantan}
                    betina={formKondisi.lahirBetina}
                    onJantan={(v: number) => {
                      updateKondisi('lahirJantan', v);
                      if (v > 0) updateKondisi('lahirBelumTahu', 0);
                    }}
                    onBetina={(v: number) => {
                      updateKondisi('lahirBetina', v);
                      if (v > 0) updateKondisi('lahirBelumTahu', 0);
                    }}
                  />
                  {/* Kolom Belum Diketahui Jenis Kelamin (Hanya Angka & Saling Kunci) */}
                  <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700">
                        Belum Diketahui Kelamin (Hanya Angka)
                      </label>
                      {((formKondisi.lahirJantan || 0) > 0 || (formKondisi.lahirBetina || 0) > 0) && (
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Terkunci (Jantan/Betina telah diisi)
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        disabled={(formKondisi.lahirJantan || 0) > 0 || (formKondisi.lahirBetina || 0) > 0}
                        placeholder="0"
                        value={formKondisi.lahirBelumTahu || ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                          updateKondisi('lahirBelumTahu', val);
                          if (val > 0) {
                            updateKondisi('lahirJantan', 0);
                            updateKondisi('lahirBetina', 0);
                          }
                        }}
                        className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white font-sans font-bold text-center text-sm focus:border-emerald-500 outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold pointer-events-none">Ekor</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      💡 Jika diisi, input Jantan &amp; Betina otomatis dikunci ke 0. Nilai ini otomatis ditambahkan ke Total Lahir (f).
                    </p>
                  </div>
                </div>
              </KondisiSection>

              <KondisiSection nomor="7" title="Kematian Anak (g)" total={kalkulasi.g} totalLabel="Total Mati Anak">
                <div className="space-y-3">
                  <BarisTernak
                    label="Mati Anak"
                    disabled={(formKondisi.matiAnakBelumTahu || 0) > 0}
                    jantan={formKondisi.matiAnakJantan}
                    betina={formKondisi.matiAnakBetina}
                    onJantan={(v: number) => {
                      updateKondisi('matiAnakJantan', v);
                      if (v > 0) updateKondisi('matiAnakBelumTahu', 0);
                    }}
                    onBetina={(v: number) => {
                      updateKondisi('matiAnakBetina', v);
                      if (v > 0) updateKondisi('matiAnakBelumTahu', 0);
                    }}
                  />
                  {/* Kolom Belum Diketahui Jenis Kelamin (Hanya Angka & Saling Kunci) */}
                  <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700">
                        Belum Diketahui Kelamin (Hanya Angka)
                      </label>
                      {((formKondisi.matiAnakJantan || 0) > 0 || (formKondisi.matiAnakBetina || 0) > 0) && (
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Terkunci (Jantan/Betina telah diisi)
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        disabled={(formKondisi.matiAnakJantan || 0) > 0 || (formKondisi.matiAnakBetina || 0) > 0}
                        placeholder="0"
                        value={formKondisi.matiAnakBelumTahu || ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                          updateKondisi('matiAnakBelumTahu', val);
                          if (val > 0) {
                            updateKondisi('matiAnakJantan', 0);
                            updateKondisi('matiAnakBetina', 0);
                          }
                        }}
                        className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white font-sans font-bold text-center text-sm focus:border-emerald-500 outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold pointer-events-none">Ekor</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      💡 Jika diisi, input Jantan &amp; Betina otomatis dikunci ke 0. Nilai ini otomatis ditambahkan ke Total Mati Anak (g).
                    </p>
                  </div>
                </div>
              </KondisiSection>

              <KondisiSection nomor="8" title="Penjualan Anak (h)" total={kalkulasi.h} totalLabel="Total Jual Anak">
                <div className="space-y-3">
                  <BarisTernak
                    label="Jual Anak"
                    disabled={(formKondisi.jualAnakBelumTahu || 0) > 0}
                    jantan={formKondisi.jualAnakJantan}
                    betina={formKondisi.jualAnakBetina}
                    onJantan={(v: number) => {
                      updateKondisi('jualAnakJantan', v);
                      if (v > 0) updateKondisi('jualAnakBelumTahu', 0);
                    }}
                    onBetina={(v: number) => {
                      updateKondisi('jualAnakBetina', v);
                      if (v > 0) updateKondisi('jualAnakBelumTahu', 0);
                    }}
                  />
                  {/* Kolom Belum Diketahui Jenis Kelamin (Hanya Angka & Saling Kunci) */}
                  <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-700">
                        Belum Diketahui Kelamin (Hanya Angka)
                      </label>
                      {((formKondisi.jualAnakJantan || 0) > 0 || (formKondisi.jualAnakBetina || 0) > 0) && (
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Terkunci (Jantan/Betina telah diisi)
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        disabled={(formKondisi.jualAnakJantan || 0) > 0 || (formKondisi.jualAnakBetina || 0) > 0}
                        placeholder="0"
                        value={formKondisi.jualAnakBelumTahu || ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                          updateKondisi('jualAnakBelumTahu', val);
                          if (val > 0) {
                            updateKondisi('jualAnakJantan', 0);
                            updateKondisi('jualAnakBetina', 0);
                          }
                        }}
                        className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white font-sans font-bold text-center text-sm focus:border-emerald-500 outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold pointer-events-none">Ekor</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      💡 Jika diisi, input Jantan &amp; Betina otomatis dikunci ke 0. Nilai ini otomatis ditambahkan ke Total Jual Anak (h).
                    </p>
                  </div>
                </div>
              </KondisiSection>
            </div>

            {/* Total Summary Callout Ruminansia */}
            <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-emerald-800 block">
                  Perhitungan Otomatis Ternak Ruminansia
                </span>
                <p className="text-xs sm:text-sm text-slate-700 font-medium">
                  5. Sisa Pokok (e = a - b - c + d): <span className="font-sans font-bold text-slate-900">{kalkulasi.e} Ekor</span> · Kelahiran (f): <span className="font-sans font-bold text-slate-900">{kalkulasi.f} Ekor</span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-sans block">9. Total Aset Ternak Kelompok (i = e + f - g - h)</span>
                <span className="font-sans font-extrabold text-2xl text-emerald-700">{kalkulasi.i} Ekor</span>
              </div>
            </div>
          </div>

          {/* Bagian 3: GPS (Wajib) & Foto Dokumentasi */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin size={16} strokeWidth={2.5} className="text-emerald-600" />
                <span>3. Titik Koordinat GPS (Wajib) &amp; Foto Dokumentasi</span>
              </span>
              <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                <AlertCircle size={13} /> GPS Wajib Diisi
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600">
                    Titik Koordinat Kandang <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <MapPin size={12} />
                    <span>{isGettingLocation ? 'Mencari GPS...' : 'Ambil GPS Otomatis'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Latitude (cth: -7.668)"
                    value={formLat ?? ''}
                    onChange={(e) => setFormLat(e.target.value ? Number(e.target.value) : null)}
                    className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                  />
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Longitude (cth: 109.651)"
                    value={formLng ?? ''}
                    onChange={(e) => setFormLng(e.target.value ? Number(e.target.value) : null)}
                    className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Foto Lapangan (Maks 2 MB)
                </label>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={cameraInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={galleryInputRef}
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-95"
                  >
                    <Camera size={14} strokeWidth={2.5} className="text-emerald-600" />
                    <span>Kamera HP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs active:scale-95"
                  >
                    <ImageIcon size={14} strokeWidth={2.5} className="text-blue-600" />
                    <span>Galeri Foto</span>
                  </button>

                  {formPhoto && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle2 size={13} strokeWidth={2.5} /> Siap Kirim (&lt; 2 MB)
                    </span>
                  )}
                </div>

                {formPhoto && (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-2xs">
                    <div className="relative group inline-block">
                      <img
                        src={formPhoto}
                        alt="Preview Foto Lapangan"
                        onClick={() => setPreviewPhotoModal({ url: formPhoto, title: `Pratinjau Foto: ${formKtt || 'Data Lapangan'}` })}
                        className="w-48 h-32 sm:w-56 sm:h-36 object-cover rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:opacity-95 transition-opacity"
                      />
                      <button
                        type="button"
                        onClick={() => setFormPhoto(null)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
                        title="Hapus / Ganti Foto"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                Keterangan Lainnya / Catatan Khusus
              </label>
              <textarea
                rows={2}
                placeholder="Catatan pakan, sanitasi kandang, perkembangan kelompok..."
                value={formCatatan}
                onChange={(e) => setFormCatatan(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Bagian 4: Tim Monev & Tanda Tangan */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileCheck size={16} strokeWidth={2.5} className="text-emerald-600" />
              <span>4. Tim Monev &amp; Pengesahan Tanda Tangan / Cap Kelompok</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Nama Petugas Monev 1
                </label>
                <input
                  type="text"
                  placeholder="Nama petugas 1..."
                  value={formKondisi.namaPetugas1 || ''}
                  onChange={(e) => updateKondisi('namaPetugas1', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-emerald-500 outline-none mb-3"
                />

                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Upload Foto Tanda Tangan Petugas (Maks 2 MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadTtdPetugas}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                />
                {formKondisi.fotoTtdPetugas && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={formKondisi.fotoTtdPetugas}
                      alt="TTD Petugas"
                      onClick={() => setPreviewPhotoModal({ url: formKondisi.fotoTtdPetugas!, title: `TTD Petugas: ${formKondisi.namaPetugas1 || 'Petugas Monev'}` })}
                      className="h-12 w-24 object-contain rounded border border-slate-200 bg-white p-1 cursor-pointer hover:opacity-90 shadow-2xs"
                      title="Klik untuk melihat pratinjau / unduh"
                    />
                    <span className="text-xs text-emerald-700 font-bold">✓ TTD Petugas Terunggah</span>
                    <a
                      href={formKondisi.fotoTtdPetugas}
                      download={`TTD_Petugas_${(formKtt || 'Monev').replace(/[^a-zA-Z0-9_-]/g, '_')}.png`}
                      className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline font-bold flex items-center gap-1 ml-auto"
                      title="Unduh Tanda Tangan Petugas"
                    >
                      <Download size={12} strokeWidth={2.5} />
                      <span>Unduh</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => updateKondisi('fotoTtdPetugas', null)}
                      className="text-xs text-red-600 hover:underline cursor-pointer ml-2"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Nama Petugas Monev 2 (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Nama petugas 2..."
                  value={formKondisi.namaPetugas2 || ''}
                  onChange={(e) => updateKondisi('namaPetugas2', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-emerald-500 outline-none mb-3"
                />

                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Upload Foto Tanda Tangan Ketua + Cap Kelompok (1 Foto, Maks 2 MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadTtdKetuaCap}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
                {formKondisi.fotoTtdKetuaCap && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={formKondisi.fotoTtdKetuaCap}
                      alt="TTD + Cap Ketua KTT"
                      onClick={() => setPreviewPhotoModal({ url: formKondisi.fotoTtdKetuaCap!, title: `TTD & Cap: ${formKtt || 'Ketua KTT'}` })}
                      className="h-12 w-24 object-contain rounded border border-slate-200 bg-white p-1 cursor-pointer hover:opacity-90 shadow-2xs"
                      title="Klik untuk melihat pratinjau / unduh"
                    />
                    <span className="text-xs text-blue-700 font-bold">✓ TTD + Cap Ketua Terunggah</span>
                    <a
                      href={formKondisi.fotoTtdKetuaCap}
                      download={`TTD_Cap_${(formKtt || 'Ketua_KTT').replace(/[^a-zA-Z0-9_-]/g, '_')}.png`}
                      className="text-xs text-blue-700 hover:text-blue-800 hover:underline font-bold flex items-center gap-1 ml-auto"
                      title="Unduh Tanda Tangan & Cap"
                    >
                      <Download size={12} strokeWidth={2.5} />
                      <span>Unduh</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => updateKondisi('fotoTtdKetuaCap', null)}
                      className="text-xs text-red-600 hover:underline cursor-pointer ml-2"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="min-h-touch h-11 px-5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Reset Form
            </button>
            <button
              type="button"
              onClick={() => {
                if (!formKtt) {
                  alert('Silakan pilih atau isi nama Kelompok Tani Ternak terlebih dahulu.');
                  return;
                }
                cetakLaporanRuminansia(
                  {
                    id: editingId || 'temp',
                    tahun: formTahun,
                    sumberDana: formSumberDana,
                    kec: formKec,
                    desa: formDesa,
                    namaKtt: formKtt,
                    alamat: formDesa && formKec ? `Desa ${formDesa}, Kec. ${formKec}` : '',
                    kegiatan: 'Monev Hibah Ruminansia',
                    jenis: formJenis,
                    waktuMonev: formWaktuMonev,
                    kondisi: formKondisi,
                    lat: formLat,
                    lng: formLng,
                    photo: formPhoto,
                    catatan: formCatatan,
                  },
                  kttMasterList
                );
              }}
              className="min-h-touch h-11 px-5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              title="Cetak Laporan PDF sesuai template resmi"
            >
              <Printer size={15} strokeWidth={2.5} />
              <span>Cetak Laporan PDF</span>
            </button>
            <button
              type="submit"
              className="min-h-touch h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex-1 cursor-pointer"
            >
              {editingId ? 'Perbarui Data Monev Ruminansia' : 'Simpan Data Monev Ruminansia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
