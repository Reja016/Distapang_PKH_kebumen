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
  Edit2,
  Trash2,
  FileCheck,
  AlertCircle,
  Egg,
  Download,
  Printer,
} from 'lucide-react';
import {
  DATA_WILAYAH,
  DAFTAR_JENIS_UNGGAS,
  FieldData,
  KondisiUnggas,
  KONDISI_UNGGAS_KOSONG,
  hitungKondisiUnggas,
} from './types';
import { compressImageFile } from '@/lib/file-compressor';
import { cetakLaporanUnggas } from './monev-pdf-printer';

interface MonevUnggasTabProps {
  tahunBantuanFilter: string;
  onSelectTahunBantuan: (th: string) => void;
  daftarTahunAktif: string[];
  dbLapangan: FieldData[];
  canEdit: boolean;
  onSaveUnggas: (data: any) => Promise<void>;
  onEdit: (data: FieldData) => void;
  onDelete: (id: string) => void;
  setPreviewPhotoModal: (val: { url: string; title: string } | null) => void;
  kttMasterList: Array<{ id: any; namaKelompok: string; kecamatan: string; desa: string; ketua?: string }>;
}

export function MonevUnggasTab({
  tahunBantuanFilter,
  onSelectTahunBantuan,
  daftarTahunAktif,
  dbLapangan,
  canEdit,
  onSaveUnggas,
  onEdit,
  onDelete,
  setPreviewPhotoModal,
  kttMasterList,
}: MonevUnggasTabProps) {
  // ── FILTER KECAMATAN ──
  const [filterKecamatan, setFilterKecamatan] = useState<string>('Semua Kecamatan');
  const daftarKecamatan = useMemo(() => Object.keys(DATA_WILAYAH).sort(), []);

  // Filter Data Unggas
  const dbUnggasTabel = useMemo(() => {
    return dbLapangan.filter((d) => {
      const isUnggas = d.kategori === 'Unggas' || DAFTAR_JENIS_UNGGAS.some((u) => d.jenis?.toLowerCase().includes(u.toLowerCase()) || (d.jenis || '').toLowerCase().includes('ayam') || (d.jenis || '').toLowerCase().includes('itik') || (d.jenis || '').toLowerCase().includes('unggas'));
      if (!isUnggas) return false;
      if (tahunBantuanFilter !== 'Semua Tahun' && d.tahun !== tahunBantuanFilter) return false;
      if (filterKecamatan !== 'Semua Kecamatan' && (d.kec || '').toUpperCase() !== filterKecamatan.toUpperCase()) return false;
      return true;
    });
  }, [dbLapangan, tahunBantuanFilter, filterKecamatan]);

  // Form State Unggas
  const [formTahun, setFormTahun] = useState<string>(tahunBantuanFilter === 'Semua Tahun' ? '2026' : tahunBantuanFilter);
  const [formSumberDana, setFormSumberDana] = useState<string>('APBD');
  const [formKec, setFormKec] = useState<string>('');
  const [formDesa, setFormDesa] = useState<string>('');
  const [formKtt, setFormKtt] = useState<string>('');
  const [formJenis, setFormJenis] = useState<string>(DAFTAR_JENIS_UNGGAS[0]);
  const [formWaktuMonev, setFormWaktuMonev] = useState<string>('');
  const [formLat, setFormLat] = useState<number | null>(null);
  const [formLng, setFormLng] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [formPhoto, setFormPhoto] = useState<string | null>(null);
  const [formCatatan, setFormCatatan] = useState<string>('');

  // Kondisi Unggas State
  const [kondisiUnggas, setKondisiUnggas] = useState<KondisiUnggas>({ ...KONDISI_UNGGAS_KOSONG });

  const updateKondisiUnggas = (field: keyof KondisiUnggas, value: any) => {
    setKondisiUnggas((prev) => ({ ...prev, [field]: value }));
  };

  const kalkulasiUnggas = hitungKondisiUnggas(kondisiUnggas);

  // Live Search KTT
  const [showKttSuggestions, setShowKttSuggestions] = useState(false);
  const kttInputRef = useRef<HTMLDivElement>(null);

  const filteredKttSuggestions = useMemo(() => {
    const q = (formKtt || '').trim().toLowerCase();
    if (!q) {
      if (formKec) {
        return kttMasterList.filter((k) => k.kecamatan === formKec.toUpperCase()).slice(0, 8);
      }
      return kttMasterList.slice(0, 8);
    }
    return kttMasterList
      .filter((k) => k.namaKelompok.toLowerCase().includes(q) || k.desa.toLowerCase().includes(q) || k.kecamatan.toLowerCase().includes(q))
      .slice(0, 10);
  }, [kttMasterList, formKtt, formKec]);

  const handleSelectKtt = (ktt: { namaKelompok: string; kecamatan: string; desa: string }) => {
    setFormKtt(ktt.namaKelompok);
    if (ktt.kecamatan && DATA_WILAYAH[ktt.kecamatan]) {
      setFormKec(ktt.kecamatan);
    }
    if (ktt.desa) {
      setFormDesa(ktt.desa);
    }
    setShowKttSuggestions(false);
  };

  // GPS Location Handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser tidak mendukung pendeteksian lokasi GPS.');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormLat(Number(pos.coords.latitude.toFixed(6)));
        setFormLng(Number(pos.coords.longitude.toFixed(6)));
        setIsGettingLocation(false);
      },
      (err) => {
        alert('Gagal mendeteksi lokasi GPS: ' + err.message);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Photo handlers
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1600, 0.8, 2 * 1024 * 1024);
      setFormPhoto(compressed);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses foto dokumentasi');
    }
  };

  const handleUploadTtdPetugas = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1400, 0.85, 2 * 1024 * 1024);
      updateKondisiUnggas('fotoTtdPetugas', compressed);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses foto tanda tangan petugas');
    }
  };

  const handleUploadTtdKetuaCap = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 1400, 0.85, 2 * 1024 * 1024);
      updateKondisiUnggas('fotoTtdKetuaCap', compressed);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses foto tanda tangan + cap ketua');
    }
  };

  const resetForm = () => {
    setFormSumberDana('APBD');
    setFormKec('');
    setFormDesa('');
    setFormKtt('');
    setFormJenis(DAFTAR_JENIS_UNGGAS[0]);
    setFormWaktuMonev('');
    setFormLat(null);
    setFormLng(null);
    setFormPhoto(null);
    setFormCatatan('');
    setKondisiUnggas({ ...KONDISI_UNGGAS_KOSONG });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formLat === null || formLng === null || isNaN(formLat) || isNaN(formLng)) {
      alert('⚠️ Titik Koordinat GPS Wajib Diklik / Diisi!\nSilakan klik tombol "📍 Ambil GPS Otomatis" atau ketik koordinat lokasi kandang KTT.');
      return;
    }

    const payload = {
      id: 'unggas_' + Date.now(),
      tahun: formTahun,
      sumberDana: formSumberDana,
      kec: formKec,
      desa: formDesa,
      namaKtt: formKtt,
      alamat: '',
      kegiatan: 'Monev Hibah Unggas',
      jenis: formJenis,
      kategori: 'Unggas',
      waktuMonev: formWaktuMonev,
      lat: formLat,
      lng: formLng,
      photo: formPhoto,
      catatan: formCatatan,
      kondisiUnggas: kondisiUnggas,
      kondisi: {
        sumberDana: formSumberDana,
        awalJantan: kondisiUnggas.awalTotal,
        awalBetina: 0,
        matiBangkaiJantan: kondisiUnggas.kematian,
        matiBangkaiBetina: 0,
        jualJantan: kondisiUnggas.dijual,
        jualBetina: 0,
        beliJantan: 0,
        beliBetina: 0,
        lahirJantan: 0,
        lahirBetina: 0,
        matiAnakJantan: 0,
        matiAnakBetina: 0,
        jualAnakJantan: 0,
        jualAnakBetina: 0,
        fotoTtdPetugas: kondisiUnggas.fotoTtdPetugas,
        fotoTtdKetuaCap: kondisiUnggas.fotoTtdKetuaCap,
        namaPetugas1: kondisiUnggas.namaPetugas1,
        namaPetugas2: kondisiUnggas.namaPetugas2,
      },
    };

    await onSaveUnggas(payload);
    resetForm();
    alert('✓ Data Monev Ternak Hibah Unggas berhasil disimpan!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ── 1. FILTER TAHUN BANTUAN & KECAMATAN ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Filter size={16} strokeWidth={2.5} className="text-amber-600" />
              <span>Filter Data Lapangan Unggas (Tahun &amp; Kecamatan)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Saring daftar kelompok penerima hibah unggas berdasarkan tahun bantuan dan kecamatan
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
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
              className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-800 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all shadow-2xs cursor-pointer"
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
              className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-800 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all shadow-2xs cursor-pointer"
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

      {/* ── 2. TABEL DAFTAR DATA UNGGAS (REPOSISI KE ATAS FORM) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <span>Daftar Data Lapangan Unggas ({tahunBantuanFilter} · {filterKecamatan})</span>
              <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {dbUnggasTabel.length} Kelompok
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pencatatan evaluasi komoditas ayam KUB, petelur, broiler, dan itik
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
                <th className="px-4 py-3.5 text-right">Awal Total</th>
                <th className="px-4 py-3.5 text-right">Mati</th>
                <th className="px-4 py-3.5 text-right">Dijual</th>
                <th className="px-4 py-3.5 text-right">Populasi Saat Ini</th>
                <th className="px-4 py-3.5 text-right">Prod. Telur / Hari</th>
                <th className="px-4 py-3.5 text-center">GPS &amp; TTD</th>
                <th className="px-4 py-3.5 text-center">Aksi / Cetak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dbUnggasTabel.map((d, idx) => {
                const ku = d.kondisiUnggas || {
                  awalTotal: d.kondisi?.awalJantan || 0,
                  kematian: d.kondisi?.matiBangkaiJantan || 0,
                  dijual: d.kondisi?.jualJantan || 0,
                  rataanTelur: 0,
                  konsumsiPakan: 0,
                  fotoTtdPetugas: d.kondisi?.fotoTtdPetugas,
                  fotoTtdKetuaCap: d.kondisi?.fotoTtdKetuaCap,
                };
                const sisa = Math.max(0, (ku.awalTotal || 0) - (ku.kematian || 0) - (ku.dijual || 0));

                return (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 text-center font-bold text-amber-700 text-xs">{idx + 1}</td>
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
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                        {d.jenis}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-700">{ku.awalTotal}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-red-600">{ku.kematian}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-700">{ku.dijual}</td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-amber-700">{sisa} Ekor</td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-700">{ku.rataanTelur || 0} Butir</td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs">
                        {d.lat ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                            <CheckCircle2 size={13} strokeWidth={2.5} /> GPS
                          </span>
                        ) : (
                          <span className="text-red-500 font-bold text-[11px]">Belum GPS</span>
                        )}

                        {d.photo && (
                          <button
                            type="button"
                            onClick={() => setPreviewPhotoModal({ url: d.photo!, title: `Foto Dokumentasi Unggas: ${d.namaKtt}` })}
                            className="text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Klik untuk melihat / unduh foto dokumentasi"
                          >
                            <ImageIcon size={11} strokeWidth={2.5} className="text-amber-600" />
                            <span>Foto</span>
                          </button>
                        )}

                        {(ku.fotoTtdPetugas || d.kondisi?.fotoTtdPetugas) && (
                          <button
                            type="button"
                            onClick={() => setPreviewPhotoModal({ url: (ku.fotoTtdPetugas || d.kondisi?.fotoTtdPetugas)!, title: `TTD Petugas Monev: ${d.namaKtt}` })}
                            className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 cursor-pointer"
                            title="Lihat / Unduh Tanda Tangan Petugas"
                          >
                            <FileCheck size={11} strokeWidth={2.5} className="text-emerald-600" />
                            <span>TTD Petugas</span>
                          </button>
                        )}

                        {(ku.fotoTtdKetuaCap || d.kondisi?.fotoTtdKetuaCap) && (
                          <button
                            type="button"
                            onClick={() => setPreviewPhotoModal({ url: (ku.fotoTtdKetuaCap || d.kondisi?.fotoTtdKetuaCap)!, title: `TTD & Cap: ${d.namaKtt}` })}
                            className="text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 cursor-pointer"
                            title="Lihat / Unduh Tanda Tangan & Cap Kelompok"
                          >
                            <FileCheck size={11} strokeWidth={2.5} className="text-blue-600" />
                            <span>TTD+Cap</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => cetakLaporanUnggas(d, kttMasterList)}
                          className="w-8 h-8 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
                          title="Cetak / Unduh Laporan PDF Template Resmi"
                        >
                          <Printer size={13} strokeWidth={2.5} />
                        </button>
                        {canEdit && (
                          <>
                            <button
                              onClick={() => onEdit(d)}
                              className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 size={13} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => onDelete(d.id)}
                              className="w-8 h-8 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 flex items-center justify-center transition-colors cursor-pointer"
                              title="Hapus"
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

              {dbUnggasTabel.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-5 py-10 text-center text-slate-400 font-medium">
                    Belum ada data monev unggas tersimpan untuk filter {tahunBantuanFilter} · {filterKecamatan}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 3. FORMULIR INPUT MONEV TERNAK HIBAH UNGGAS ── */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
              <Egg size={20} className="text-amber-600" />
              <span>Formulir Monev Perkembangan Ternak Hibah Unggas (Tahun Bantuan {formTahun})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pencatatan kondisi populasi, mortalitas, penjualan, produksi telur, dan konsumsi pakan unggas
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Bagian 1: Informasi Wilayah & Kelompok Unggas */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
              1. Informasi Kelompok &amp; Komoditas Unggas
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Tahun Bantuan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formTahun}
                  onChange={(e) => setFormTahun(e.target.value)}
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-amber-500 outline-none cursor-pointer"
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
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-amber-500 outline-none"
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
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-amber-500 outline-none cursor-pointer"
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
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-amber-500 outline-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
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
                  <span className="text-[10px] font-semibold text-amber-700">🔍 Live Search Master</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ketik nama kelompok unggas..."
                    value={formKtt}
                    onChange={(e) => {
                      setFormKtt(e.target.value);
                      setShowKttSuggestions(true);
                    }}
                    onFocus={() => setShowKttSuggestions(true)}
                    className="w-full min-h-touch h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-amber-500 outline-none"
                  />
                  <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>

                {showKttSuggestions && filteredKttSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
                    {filteredKttSuggestions.map((item) => (
                      <div
                        key={item.id}
                        onMouseDown={() => handleSelectKtt(item)}
                        className="p-2.5 hover:bg-amber-50/80 cursor-pointer text-xs transition-colors"
                      >
                        <p className="font-bold text-slate-900">{item.namaKelompok}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded-md font-semibold">
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
                  Jenis Komoditas Unggas <span className="text-red-500">*</span>
                </label>
                <select
                  value={formJenis}
                  onChange={(e) => setFormJenis(e.target.value)}
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-amber-500 outline-none cursor-pointer"
                >
                  {DAFTAR_JENIS_UNGGAS.map((j) => (
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
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs focus:border-amber-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bagian 2: Kondisi Ternak Unggas (Sesuai Page 2 PDF) */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs">
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700">
              2. Kondisi Perkembangan Ternak Unggas (Sesuai Lembar Monev Unggas)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  1. Jumlah Ternak Awal Total (a)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={kondisiUnggas.awalTotal}
                    onChange={(e) => updateKondisiUnggas('awalTotal', Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white font-bold text-center text-sm focus:border-amber-500 outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold pointer-events-none">Ekor</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  2. Kematian Ternak (b)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={kondisiUnggas.kematian}
                    onChange={(e) => updateKondisiUnggas('kematian', Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white font-bold text-center text-sm text-red-600 focus:border-amber-500 outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold pointer-events-none">Ekor</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  3. Ternak Dijual (c)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={kondisiUnggas.dijual}
                    onChange={(e) => updateKondisiUnggas('dijual', Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white font-bold text-center text-sm focus:border-amber-500 outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold pointer-events-none">Ekor</span>
                </div>
              </div>
            </div>

            {/* Perhitungan Populasi Unggas Saat Ini */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-900 block uppercase tracking-wider">
                  4. Populasi Ternak Saat Ini (a - b - c)
                </span>
                <span className="text-xs text-slate-600">Terhitung otomatis oleh sistem monev</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-2xl text-amber-800">{kalkulasiUnggas.populasiSaatIni} Ekor</span>
              </div>
            </div>

            {/* Produksi Telur & Konsumsi Pakan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  5. Rataan Produksi Telur / Hari
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={kondisiUnggas.rataanTelur}
                    onChange={(e) => updateKondisiUnggas('rataanTelur', Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white font-bold text-center text-sm focus:border-amber-500 outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold pointer-events-none">Butir / Hari</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  6. Konsumsi Pakan / Hari
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={kondisiUnggas.konsumsiPakan}
                    onChange={(e) => updateKondisiUnggas('konsumsiPakan', Number(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white font-bold text-center text-sm focus:border-amber-500 outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold pointer-events-none">Gram / Ekor / Hari</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                Keterangan Lainnya
              </label>
              <textarea
                rows={3}
                placeholder="Catatan pakan, kesehatan ayam/itik, kebersihan kandang, produksi..."
                value={formCatatan}
                onChange={(e) => setFormCatatan(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          {/* Bagian 3: GPS (Wajib) & Foto Dokumentasi Unggas */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin size={16} strokeWidth={2.5} className="text-amber-600" />
                <span>3. Titik Koordinat GPS (Wajib) &amp; Foto Dokumentasi Unggas</span>
              </span>
              <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                <AlertCircle size={13} /> GPS Wajib Diisi
              </span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600">
                    Titik Koordinat Kandang Unggas <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isGettingLocation}
                    className="text-xs text-amber-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
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
                    placeholder="Latitude"
                    value={formLat ?? ''}
                    onChange={(e) => setFormLat(e.target.value ? Number(e.target.value) : null)}
                    className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                  />
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Longitude"
                    value={formLng ?? ''}
                    onChange={(e) => setFormLng(e.target.value ? Number(e.target.value) : null)}
                    className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Foto Lapangan Unggas (Maks 2 MB)
                </label>

                <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handlePhotoUpload} className="hidden" />
                <input type="file" accept="image/*" ref={galleryInputRef} onChange={handlePhotoUpload} className="hidden" />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  >
                    <Camera size={14} strokeWidth={2.5} className="text-amber-600" />
                    <span>Kamera HP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  >
                    <ImageIcon size={14} strokeWidth={2.5} className="text-blue-600" />
                    <span>Galeri Foto</span>
                  </button>

                  {formPhoto && (
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle2 size={13} strokeWidth={2.5} /> Siap Kirim (&lt; 2 MB)
                    </span>
                  )}
                </div>

                {formPhoto && (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-2xs">
                    <div className="relative group inline-block">
                      <img
                        src={formPhoto}
                        alt="Preview Foto Unggas"
                        onClick={() => setPreviewPhotoModal({ url: formPhoto, title: `Pratinjau Foto: ${formKtt}` })}
                        className="w-48 h-32 sm:w-56 sm:h-36 object-cover rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:opacity-95"
                      />
                      <button
                        type="button"
                        onClick={() => setFormPhoto(null)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md cursor-pointer"
                        title="Hapus / Ganti Foto"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bagian 4: Tim Monev & Pengesahan TTD / Cap Kelompok */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FileCheck size={16} strokeWidth={2.5} className="text-amber-600" />
              <span>4. Tim Monev &amp; Pengesahan Tanda Tangan / Cap Kelompok Unggas</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Nama Petugas Monev 1
                </label>
                <input
                  type="text"
                  placeholder="Nama petugas 1..."
                  value={kondisiUnggas.namaPetugas1 || ''}
                  onChange={(e) => updateKondisiUnggas('namaPetugas1', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-amber-500 outline-none mb-3"
                />

                <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Upload Foto Tanda Tangan Petugas (Maks 2 MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadTtdPetugas}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white hover:file:bg-amber-700 cursor-pointer"
                />
                {kondisiUnggas.fotoTtdPetugas && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={kondisiUnggas.fotoTtdPetugas}
                      alt="TTD Petugas"
                      onClick={() => setPreviewPhotoModal({ url: kondisiUnggas.fotoTtdPetugas!, title: `TTD Petugas: ${kondisiUnggas.namaPetugas1 || 'Petugas Monev'}` })}
                      className="h-12 w-24 object-contain rounded border border-slate-200 bg-white p-1 cursor-pointer hover:opacity-90 shadow-2xs"
                      title="Klik untuk melihat pratinjau / unduh"
                    />
                    <span className="text-xs text-amber-700 font-bold">✓ TTD Petugas Terunggah</span>
                    <a
                      href={kondisiUnggas.fotoTtdPetugas}
                      download={`TTD_Petugas_${(formKtt || 'Monev_Unggas').replace(/[^a-zA-Z0-9_-]/g, '_')}.png`}
                      className="text-xs text-amber-700 hover:text-amber-800 hover:underline font-bold flex items-center gap-1 ml-auto"
                      title="Unduh Tanda Tangan Petugas"
                    >
                      <Download size={12} strokeWidth={2.5} />
                      <span>Unduh</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => updateKondisiUnggas('fotoTtdPetugas', null)}
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
                  value={kondisiUnggas.namaPetugas2 || ''}
                  onChange={(e) => updateKondisiUnggas('namaPetugas2', e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-amber-500 outline-none mb-3"
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
                {kondisiUnggas.fotoTtdKetuaCap && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={kondisiUnggas.fotoTtdKetuaCap}
                      alt="TTD + Cap Ketua KTT"
                      onClick={() => setPreviewPhotoModal({ url: kondisiUnggas.fotoTtdKetuaCap!, title: `TTD & Cap: ${formKtt || 'Ketua KTT'}` })}
                      className="h-12 w-24 object-contain rounded border border-slate-200 bg-white p-1 cursor-pointer hover:opacity-90 shadow-2xs"
                      title="Klik untuk melihat pratinjau / unduh"
                    />
                    <span className="text-xs text-blue-700 font-bold">✓ TTD + Cap Ketua Terunggah</span>
                    <a
                      href={kondisiUnggas.fotoTtdKetuaCap}
                      download={`TTD_Cap_${(formKtt || 'Ketua_KTT').replace(/[^a-zA-Z0-9_-]/g, '_')}.png`}
                      className="text-xs text-blue-700 hover:text-blue-800 hover:underline font-bold flex items-center gap-1 ml-auto"
                      title="Unduh Tanda Tangan & Cap"
                    >
                      <Download size={12} strokeWidth={2.5} />
                      <span>Unduh</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => updateKondisiUnggas('fotoTtdKetuaCap', null)}
                      className="text-xs text-red-600 hover:underline cursor-pointer ml-2"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
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
                cetakLaporanUnggas(
                  {
                    id: 'temp',
                    tahun: formTahun,
                    sumberDana: formSumberDana,
                    kec: formKec,
                    desa: formDesa,
                    namaKtt: formKtt,
                    alamat: '',
                    kegiatan: 'Monev Hibah Unggas',
                    jenis: formJenis,
                    waktuMonev: formWaktuMonev,
                    kondisi: {
                      ...KONDISI_UNGGAS_KOSONG,
                      awalJantan: kondisiUnggas.awalTotal,
                      awalBetina: 0,
                      matiBangkaiJantan: kondisiUnggas.kematian,
                      matiBangkaiBetina: 0,
                      jualJantan: kondisiUnggas.dijual,
                      jualBetina: 0,
                      beliJantan: 0,
                      beliBetina: 0,
                      lahirJantan: 0,
                      lahirBetina: 0,
                      lahirBelumTahu: 0,
                      matiAnakJantan: 0,
                      matiAnakBetina: 0,
                      matiAnakBelumTahu: 0,
                      jualAnakJantan: 0,
                      jualAnakBetina: 0,
                      jualAnakBelumTahu: 0,
                      matiBangkaiBA: 'Tidak',
                      matiBangkaiBAPdf: null,
                      matiBangkaiBAName: null,
                      matiPotongBA: 'Tidak',
                      matiPotongBAPdf: null,
                      matiPotongBAName: null,
                      matiPotongJantan: 0,
                      matiPotongBetina: 0,
                      jualBA: 'Tidak',
                      jualBAPdf: null,
                      jualBAName: null,
                      fotoTtdPetugas: kondisiUnggas.fotoTtdPetugas,
                      fotoTtdKetuaCap: kondisiUnggas.fotoTtdKetuaCap,
                      namaPetugas1: kondisiUnggas.namaPetugas1,
                      namaPetugas2: kondisiUnggas.namaPetugas2,
                    },
                    kondisiUnggas: kondisiUnggas,
                    lat: formLat,
                    lng: formLng,
                    photo: formPhoto,
                    catatan: formCatatan,
                  },
                  kttMasterList
                );
              }}
              className="min-h-touch h-11 px-5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              title="Cetak Laporan PDF Unggas sesuai template resmi"
            >
              <Printer size={15} strokeWidth={2.5} />
              <span>Cetak Laporan PDF</span>
            </button>
            <button
              type="submit"
              className="min-h-touch h-11 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex-1 cursor-pointer"
            >
              Simpan Data Monev Unggas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
