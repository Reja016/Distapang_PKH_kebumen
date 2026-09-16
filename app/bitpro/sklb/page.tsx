'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePageAuth } from '@/hooks/usePageAuth';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Plus,
  Calendar,
} from 'lucide-react';
import { KECAMATAN_ITEMS } from '@/lib/sklbPetaData';
import {
  SapiPOFormData,
  ModalRekapState,
  ModalDetailState,
} from '@/components/bitpro/sklb/types';
import { SklbPetaSection } from '@/components/bitpro/sklb/SklbPetaSection';
import { SklbRekapTab } from '@/components/bitpro/sklb/SklbRekapTab';
import { SklbDetailTab } from '@/components/bitpro/sklb/SklbDetailTab';
import {
  ModalSapiPO,
  ModalAddYear,
  ModalRekap,
  ModalDetail,
} from '@/components/bitpro/sklb/SklbModals';

export default function UnifiedSKLBPage() {
  const { isReady, canCreate, canEdit } = usePageAuth('bitpro', 'sklb');

  // ── SAPI PO PETA & MULTI-YEAR STATE ──
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [availableYears, setAvailableYears] = useState<number[]>([2025, 2026]);
  const [showAddYearModal, setShowAddYearModal] = useState<boolean>(false);
  const [newYearInput, setNewYearInput] = useState<number>(2027);
  const [isAddingYear, setIsAddingYear] = useState<boolean>(false);

  const [sapiPOData, setSapiPOData] = useState<any[]>([]);
  const [sapiPOKecMap, setSapiPOKecMap] = useState<Record<string, number>>({});
  const [totalSapiPO, setTotalSapiPO] = useState<number>(50450);
  const [triwulanText, setTriwulanText] = useState<string>('Triwulan 2');
  const [isLoadingSapiPO, setIsLoadingSapiPO] = useState<boolean>(true);

  const [selectedKecamatan, setSelectedKecamatan] = useState<any | null>(null);
  const [hoveredKecamatan, setHoveredKecamatan] = useState<any | null>(null);

  // Modal Input / Edit Populasi Sapi PO
  const [modalSapiPO, setModalSapiPO] = useState<{ open: boolean; item: any | null }>({
    open: false,
    item: null,
  });
  const [formSapiPO, setFormSapiPO] = useState<SapiPOFormData>({
    kecamatan_id: 'ayah',
    kecamatan_nama: 'Ayah',
    populasi: 3070,
    triwulan: 'Triwulan 2',
    keterangan: '',
  });
  const [isSavingSapiPO, setIsSavingSapiPO] = useState<boolean>(false);

  // ── EXISTING SKLB TABS & DATA STATE ──
  const [activeTab, setActiveTab] = useState<'rekap' | 'detail'>('rekap');

  // Rekapitulasi State
  const [dataRekap, setDataRekap] = useState<any[]>([]);
  const [isSyncingRekap, setIsSyncingRekap] = useState(false);
  const [modalRekap, setModalRekap] = useState<ModalRekapState>({
    open: false,
    mode: 'tambah',
    data: null,
  });

  // Master Detail Sapi State
  const [dataDetail, setDataDetail] = useState<any[]>([]);
  const [isSyncingDetail, setIsSyncingDetail] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDesa, setFilterDesa] = useState('Semua');
  const [modalDetail, setModalDetail] = useState<ModalDetailState>({
    open: false,
    mode: 'tambah',
    data: null,
  });

  // ── LOAD AVAILABLE YEARS ──
  const loadAvailableYears = async () => {
    try {
      const res = await fetch('/api/sklb-sapi-po?action=years');
      const json = await res.json();
      if (json.success && Array.isArray(json.years)) {
        setAvailableYears(json.years);
      }
    } catch (err) {
      console.warn('Gagal memuat tahun SKLB:', err);
    }
  };

  // ── LOAD SAPI PO MAP DATA PER TAHUN ──
  const loadSapiPOData = async (year: number) => {
    try {
      setIsLoadingSapiPO(true);
      const res = await fetch(`/api/sklb-sapi-po?tahun=${year}`);
      const json = await res.json();
      if (json.success) {
        setSapiPOData(json.data || []);
        setSapiPOKecMap(json.kecMap || {});
        setTotalSapiPO(json.totalPopulasi || 0);
        if (json.triwulan) setTriwulanText(json.triwulan);
      }
    } catch (err) {
      console.error('Gagal memuat data populasi Sapi PO:', err);
    } finally {
      setIsLoadingSapiPO(false);
    }
  };

  // ── LOAD TABEL REKAP & DETAIL PER TAHUN ──
  const loadTablesData = async (year: number) => {
    try {
      const [resRekap, resDetail] = await Promise.all([
        fetch(`/api/sync-sklb-summary?tahun=${year}`),
        fetch(`/api/sync-sklb-detail?tahun=${year}`),
      ]);
      const jsonRekap = await resRekap.json();
      const jsonDetail = await resDetail.json();

      if (jsonRekap.success && Array.isArray(jsonRekap.data)) {
        setDataRekap(jsonRekap.data);
      }
      if (jsonDetail.success && Array.isArray(jsonDetail.data)) {
        setDataDetail(jsonDetail.data);
      }
    } catch (err) {
      console.error('Gagal memuat data tabel SKLB:', err);
    }
  };

  useEffect(() => {
    loadAvailableYears();
  }, []);

  useEffect(() => {
    loadSapiPOData(selectedYear);
    loadTablesData(selectedYear);
  }, [selectedYear]);

  // ── TAMBAH TAHUN BARU HANDLER ──
  const handleAddYearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearInput || newYearInput < 2000) {
      alert('Masukkan tahun yang valid');
      return;
    }

    try {
      setIsAddingYear(true);
      const res = await fetch('/api/sklb-sapi-po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_year', tahun: newYearInput }),
      });
      const json = await res.json();
      if (json.success) {
        await loadAvailableYears();
        setSelectedYear(newYearInput);
        setShowAddYearModal(false);
        alert(`Periode Tahun ${newYearInput} berhasil ditambahkan!`);
      } else {
        alert(json.error || 'Gagal menambahkan tahun baru');
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsAddingYear(false);
    }
  };

  // ── SAVE POPULASI SAPI PO HANDLER ──
  const handleSaveSapiPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      alert('Hanya Administrator yang berhak mengedit data populasi Sapi PO.');
      return;
    }

    try {
      setIsSavingSapiPO(true);
      const kecItem = KECAMATAN_ITEMS.find((k) => k.id === formSapiPO.kecamatan_id || k.id.replace('k_', '') === formSapiPO.kecamatan_id);
      const payload = {
        tahun: selectedYear,
        kecamatan_id: formSapiPO.kecamatan_id,
        kecamatan_nama: kecItem ? kecItem.nama : formSapiPO.kecamatan_nama,
        populasi: Number(formSapiPO.populasi) || 0,
        triwulan: formSapiPO.triwulan || 'Triwulan 2',
        keterangan: formSapiPO.keterangan || null,
      };

      const res = await fetch('/api/sklb-sapi-po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setModalSapiPO({ open: false, item: null });
        loadSapiPOData(selectedYear);
      } else {
        alert('Gagal menyimpan: ' + json.error);
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsSavingSapiPO(false);
    }
  };

  // ── STATS HIGHLIGHT ──
  const topKecamatan = useMemo(() => {
    const entries = Object.entries(sapiPOKecMap);
    if (entries.length === 0) return { nama: '-', pop: 0 };
    entries.sort((a, b) => b[1] - a[1]);
    const topItem = KECAMATAN_ITEMS.find((k) => k.id.toLowerCase() === entries[0][0] || k.id.toLowerCase().replace('k_', '') === entries[0][0]);
    return { nama: topItem ? topItem.nama : entries[0][0], pop: entries[0][1] };
  }, [sapiPOKecMap]);

  // ── SYNC & EXPORT HANDLERS ──
  const handleSyncRekap = async () => {
    setIsSyncingRekap(true);
    try {
      const res = await fetch(`/api/sync-sklb-summary?tahun=${selectedYear}`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        setDataRekap(result.data);
        alert('Data rekapitulasi SKLB berhasil disinkronkan!');
      } else {
        alert('Gagal: ' + result.error);
      }
    } catch {
      alert('Gagal terhubung ke API Rekap.');
    } finally {
      setIsSyncingRekap(false);
    }
  };

  const handleSyncDetail = async () => {
    setIsSyncingDetail(true);
    try {
      const res = await fetch(`/api/sync-sklb-detail?tahun=${selectedYear}`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        setDataDetail(result.data);
        alert(result.message);
      } else {
        alert('Gagal: ' + result.error);
      }
    } catch {
      alert('Gagal terhubung ke API Detail.');
    } finally {
      setIsSyncingDetail(false);
    }
  };

  const handleExportExcel = () => {
    try {
      const wsSapiPO = XLSX.utils.json_to_sheet(
        KECAMATAN_ITEMS.map((k, i) => {
          const cleanId = k.id.toLowerCase().replace('k_', '');
          const pop = sapiPOKecMap[cleanId] || sapiPOKecMap[k.id] || 0;
          return {
            No: i + 1,
            Tahun: selectedYear,
            Kecamatan: k.nama,
            'Populasi Sapi PO (Ekor)': pop,
            Triwulan: triwulanText,
          };
        })
      );

      const wsRekap = XLSX.utils.json_to_sheet(
        dataRekap.map((d) => ({
          No: d.no_urut,
          Tahun: selectedYear,
          Tanggal: d.tanggal,
          Desa: d.desa,
          Kecamatan: d.kecamatan,
          Target: d.target,
          Capaian: d.capaian,
          Selisih: d.selisih,
          'Grup Tim': d.grup,
        }))
      );

      const wsDetail = XLSX.utils.json_to_sheet(
        dataDetail.map((d) => ({
          Desa: d.desa_lokasi,
          Pemilik: d.nama_pemilik,
          Dusun: d.dusun,
          RT: d.rt,
          RW: d.rw,
          'Nama Sapi': d.nama_sapi,
          Kelamin: d.jenis_kelamin,
          'Umur (Bulan)': d.umur_bulan,
          'Tinggi Pundak (cm)': d.tinggi_pundak,
          'Panjang Badan (cm)': d.panjang_badan,
          'Lingkar Dada (cm)': d.lingkar_dada,
          'Berat Badan (kg)': d.berat_badan,
        }))
      );

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsSapiPO, `Populasi_Sapi_PO_${selectedYear}`);
      XLSX.utils.book_append_sheet(wb, wsRekap, `Rekap_SKLB_${selectedYear}`);
      XLSX.utils.book_append_sheet(wb, wsDetail, `Master_Detail_${selectedYear}`);
      XLSX.writeFile(wb, `Data_SKLB_Sapi_PO_Kebumen_${selectedYear}.xlsx`);
    } catch {
      alert('Gagal mengekspor file Excel.');
    }
  };

  // ── REKAP CRUD HANDLERS ──
  const handleSaveRekap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalRekap.mode === 'edit' && !canEdit) {
      alert('Hanya Administrator yang berhak mengedit data rekapitulasi.');
      return;
    }
    if (modalRekap.mode === 'tambah' && !canCreate) {
      alert('Anda tidak memiliki izin untuk menambah data.');
      return;
    }
    const formData = { ...modalRekap.data, tahun: selectedYear };
    try {
      if (modalRekap.mode === 'tambah') {
        const res = await fetch('/api/sync-sklb-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          alert('Data rekapitulasi berhasil ditambahkan ke database!');
          loadTablesData(selectedYear);
        } else {
          alert('Gagal menyimpan: ' + json.error);
        }
      } else {
        const res = await fetch('/api/sync-sklb-summary', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          alert('Data rekapitulasi berhasil diperbarui di database!');
          loadTablesData(selectedYear);
        } else {
          alert('Gagal memperbarui: ' + json.error);
        }
      }
    } catch {
      alert('Terjadi kesalahan saat menyimpan ke database.');
    }
    setModalRekap({ open: false, mode: 'tambah', data: null });
  };

  const handleDeleteRekap = async (id: number) => {
    if (!canEdit) {
      alert('Hanya Administrator yang berhak menghapus data rekapitulasi.');
      return;
    }
    if (confirm('Hapus data rekap ini dari database?')) {
      try {
        const res = await fetch(`/api/sync-sklb-summary?id=${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          setDataRekap((prev) => prev.filter((d) => d.id !== id));
        } else {
          alert('Gagal menghapus: ' + json.error);
        }
      } catch {
        alert('Terjadi kesalahan saat menghapus data.');
      }
    }
  };

  // ── DETAIL CRUD HANDLERS ──
  const handleSaveDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalDetail.mode === 'edit' && !canEdit) {
      alert('Hanya Administrator yang berhak mengedit data detail ternak.');
      return;
    }
    if (modalDetail.mode === 'tambah' && !canCreate) {
      alert('Anda tidak memiliki izin untuk menambah data.');
      return;
    }
    const formData = { ...modalDetail.data, tahun: selectedYear };
    try {
      if (modalDetail.mode === 'tambah') {
        const res = await fetch('/api/sync-sklb-detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          alert('Data sapi berhasil disimpan ke database!');
          loadTablesData(selectedYear);
        } else {
          alert('Gagal menyimpan: ' + json.error);
        }
      } else {
        const res = await fetch('/api/sync-sklb-detail', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          alert('Data sapi berhasil diperbarui di database!');
          loadTablesData(selectedYear);
        } else {
          alert('Gagal memperbarui: ' + json.error);
        }
      }
    } catch {
      alert('Terjadi kesalahan saat menyimpan ke database.');
    }
    setModalDetail({ open: false, mode: 'tambah', data: null });
  };

  const handleDeleteDetail = async (id: any) => {
    if (!canEdit) {
      alert('Hanya Administrator yang berhak menghapus data sapi.');
      return;
    }
    if (confirm('Hapus data sapi ini dari database?')) {
      try {
        const res = await fetch(`/api/sync-sklb-detail?id=${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          setDataDetail((prev) => prev.filter((d) => d.id !== id));
        } else {
          alert('Gagal menghapus: ' + json.error);
        }
      } catch {
        alert('Terjadi kesalahan saat menghapus data.');
      }
    }
  };

  const tabelKiri = dataRekap.filter((d) => d.grup === 'Tabel Kiri').sort((a, b) => a.no_urut - b.no_urut);
  const tabelKanan = dataRekap.filter((d) => d.grup === 'Tabel Kanan').sort((a, b) => a.no_urut - b.no_urut);

  const daftarDesa = useMemo(() => {
    const unik = Array.from(new Set(dataDetail.map((d) => d.desa_lokasi)));
    return ['Semua', ...unik];
  }, [dataDetail]);

  const filteredData = useMemo(() => {
    return dataDetail.filter((item) => {
      const matchDesa = filterDesa === 'Semua' || item.desa_lokasi === filterDesa;
      const matchSearch =
        item.nama_pemilik?.toLowerCase().includes(search.toLowerCase()) ||
        item.nama_sapi?.toLowerCase().includes(search.toLowerCase());
      return matchDesa && matchSearch;
    });
  }, [dataDetail, filterDesa, search]);

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-24">
      
      {/* ── TOP HEADER (Tema Hijau Bitpro) ── */}
      <header className="border-b border-emerald-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/bitpro"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Bitpro"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/bitpro" className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors truncate">
                  Bitpro
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Sertifikat SKLB &amp; Sapi PO</span>
              </div>
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                Surat Keterangan Layak Bibit (SKLB)
              </h1>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {canEdit && (
              <button
                onClick={() => {
                  setModalSapiPO({ open: true, item: null });
                  setFormSapiPO({
                    kecamatan_id: 'ayah',
                    kecamatan_nama: 'Ayah',
                    populasi: sapiPOKecMap['ayah'] || 3070,
                    triwulan: triwulanText,
                    keterangan: '',
                  });
                }}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Input Data Sapi PO</span>
              </button>
            )}

            <button
              onClick={handleExportExcel}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Download size={15} />
              <span>Export Excel</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Opsi Pilihan Tahun */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-xs max-w-xl mx-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70">
            <Calendar className="text-emerald-700" size={16} />
            <span className="text-xs font-bold text-emerald-900">Pilih Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-black text-emerald-900 focus:outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>Tahun {yr}</option>
              ))}
            </select>
          </div>

          {canEdit && (
            <button
              onClick={() => {
                const maxYear = Math.max(...availableYears, 2026);
                setNewYearInput(maxYear + 1);
                setShowAddYearModal(true);
              }}
              className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Tahun Baru</span>
            </button>
          )}
        </div>

        {/* 1. PETA SEBARAN POPULASI SAPI PO */}
        <SklbPetaSection
          selectedYear={selectedYear}
          triwulanText={triwulanText}
          totalSapiPO={totalSapiPO}
          sapiPOKecMap={sapiPOKecMap}
          selectedKecamatan={selectedKecamatan}
          setSelectedKecamatan={setSelectedKecamatan}
          hoveredKecamatan={hoveredKecamatan}
          setHoveredKecamatan={setHoveredKecamatan}
          canEdit={canEdit}
          topKecamatan={topKecamatan}
          onOpenEditSapiPO={(kec) => {
            const cleanId = kec.id.toLowerCase().replace('k_', '');
            setFormSapiPO({
              kecamatan_id: cleanId,
              kecamatan_nama: kec.nama,
              populasi: sapiPOKecMap[cleanId] || 0,
              triwulan: triwulanText,
              keterangan: '',
            });
            setModalSapiPO({ open: true, item: kec });
          }}
        />

        {/* 2. TABEL CAPAIAN SKLB & DETAIL TERNAK */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">Tabel Capaian &amp; Database SKLB {selectedYear}</h3>
              <p className="text-xs text-slate-500">Rekapitulasi jadwal lapangan dan daftar ternak layak bibit</p>
            </div>

            {/* Sync Buttons */}
            <div className="flex items-center gap-2">
              {activeTab === 'rekap' ? (
                <button
                  onClick={handleSyncRekap}
                  disabled={isSyncingRekap}
                  title="Tarik Data Rekap"
                  className="h-9 px-4 bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
                >
                  <RefreshCw size={13} className={isSyncingRekap ? 'animate-spin' : ''} />
                  <span>{isSyncingRekap ? 'Menyinkronkan...' : 'Tarik Data Rekap'}</span>
                </button>
              ) : (
                <button
                  onClick={handleSyncDetail}
                  disabled={isSyncingDetail}
                  title="Tarik Data Detail"
                  className="h-9 px-4 bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
                >
                  <RefreshCw size={13} className={isSyncingDetail ? 'animate-spin' : ''} />
                  <span>{isSyncingDetail ? 'Menyinkronkan Data...' : 'Tarik Data Detail'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 border-b-2 border-slate-300 pb-px overflow-x-auto">
            {[
              { key: 'rekap', label: `Rekapitulasi Capaian Tim (${dataRekap.length})` },
              { key: 'detail', label: `Master Detail Ternak (${dataDetail.length})` },
            ].map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`min-h-touch h-10 px-5 text-xs sm:text-sm font-extrabold border-t-2 border-x-2 transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-white border-slate-300 text-emerald-800 border-b-white translate-y-0.5'
                      : 'border-transparent text-slate-600 hover:text-slate-900 bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: REKAPITULASI CAPAIAN TIM */}
          {activeTab === 'rekap' && (
            <SklbRekapTab
              tabelKiri={tabelKiri}
              tabelKanan={tabelKanan}
              selectedYear={selectedYear}
              canCreate={canCreate}
              canEdit={canEdit}
              onOpenModalRekap={(mode, data) => setModalRekap({ open: true, mode, data })}
              onDeleteRekap={handleDeleteRekap}
            />
          )}

          {/* TAB 2: MASTER DETAIL TERNAK */}
          {activeTab === 'detail' && (
            <SklbDetailTab
              search={search}
              setSearch={setSearch}
              filterDesa={filterDesa}
              setFilterDesa={setFilterDesa}
              daftarDesa={daftarDesa}
              filteredData={filteredData}
              canCreate={canCreate}
              canEdit={canEdit}
              selectedYear={selectedYear}
              onOpenModalDetail={(mode, data) => setModalDetail({ open: true, mode, data })}
              onDeleteDetail={handleDeleteDetail}
            />
          )}
        </section>

      </main>

      {/* MODAL: INPUT / EDIT POPULASI SAPI PO PER KECAMATAN */}
      <ModalSapiPO
        modalSapiPO={modalSapiPO}
        setModalSapiPO={setModalSapiPO}
        formSapiPO={formSapiPO}
        setFormSapiPO={setFormSapiPO}
        sapiPOKecMap={sapiPOKecMap}
        selectedYear={selectedYear}
        isSavingSapiPO={isSavingSapiPO}
        handleSaveSapiPO={handleSaveSapiPO}
      />

      {/* MODAL: TAMBAH TAHUN BARU */}
      <ModalAddYear
        showAddYearModal={showAddYearModal}
        setShowAddYearModal={setShowAddYearModal}
        newYearInput={newYearInput}
        setNewYearInput={setNewYearInput}
        isAddingYear={isAddingYear}
        handleAddYearSubmit={handleAddYearSubmit}
      />

      {/* MODAL: REKAP TIM */}
      <ModalRekap
        modalRekap={modalRekap}
        setModalRekap={setModalRekap}
        handleSaveRekap={handleSaveRekap}
      />

      {/* MODAL: DETAIL SAPI */}
      <ModalDetail
        modalDetail={modalDetail}
        setModalDetail={setModalDetail}
        handleSaveDetail={handleSaveDetail}
      />

    </div>
  );
}