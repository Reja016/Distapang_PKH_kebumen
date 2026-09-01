'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePageAuth } from '@/hooks/usePageAuth';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function UnifiedSKLBPage() {
  const [activeTab, setActiveTab] = useState<'rekap' | 'detail'>('rekap');

  // Rekapitulasi State
  const [dataRekap, setDataRekap] = useState<any[]>([]);
  const [isSyncingRekap, setIsSyncingRekap] = useState(false);
  const [modalRekap, setModalRekap] = useState<{ open: boolean; mode: 'tambah' | 'edit'; data: any }>({
    open: false,
    mode: 'tambah',
    data: null,
  });

  // Master Detail Sapi State
  const [dataDetail, setDataDetail] = useState<any[]>([]);
  const [isSyncingDetail, setIsSyncingDetail] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDesa, setFilterDesa] = useState('Semua');
  const [modalDetail, setModalDetail] = useState<{ open: boolean; mode: 'tambah' | 'edit'; data: any }>({
    open: false,
    mode: 'tambah',
    data: null,
  });

  // API Sync & Auto Load
  const { isReady, canEdit, handleLogout: authLogout } = usePageAuth('bitpro', 'sklb');

  // Load Data Rekap & Detail dari Database saat halaman dibuka
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [resRekap, resDetail] = await Promise.all([
          fetch('/api/sync-sklb-summary'),
          fetch('/api/sync-sklb-detail'),
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
        console.error('Gagal memuat data SKLB:', err);
      }
    };

    fetchInitialData();
  }, []);

  const handleSyncRekap = async () => {
    setIsSyncingRekap(true);
    try {
      const res = await fetch('/api/sync-sklb-summary', { method: 'POST' });
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
      const res = await fetch('/api/sync-sklb-detail', { method: 'POST' });
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
      const wsRekap = XLSX.utils.json_to_sheet(
        dataRekap.map((d) => ({
          No: d.no_urut,
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
      XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekapitulasi SKLB');
      XLSX.utils.book_append_sheet(wb, wsDetail, 'Master Detail Sapi');
      XLSX.writeFile(wb, `Data_SKLB_2026_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch {
      alert('Gagal mengekspor file Excel.');
    }
  };

  const handleSaveRekap = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = modalRekap.data;
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
          const fetchRes = await fetch('/api/sync-sklb-summary');
          const fetchJson = await fetchRes.json();
          if (fetchJson.success) setDataRekap(fetchJson.data);
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
          const fetchRes = await fetch('/api/sync-sklb-summary');
          const fetchJson = await fetchRes.json();
          if (fetchJson.success) setDataRekap(fetchJson.data);
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

  const handleSaveDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = modalDetail.data;
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
          const fetchRes = await fetch('/api/sync-sklb-detail');
          const fetchJson = await fetchRes.json();
          if (fetchJson.success) setDataDetail(fetchJson.data);
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
          const fetchRes = await fetch('/api/sync-sklb-detail');
          const fetchJson = await fetchRes.json();
          if (fetchJson.success) setDataDetail(fetchJson.data);
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
  const sum = (data: any[], key: string) => data.reduce((acc, row) => acc + (row[key] || 0), 0);

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

  const TabelRekapCapaian = ({ data, judul, grup }: { data: any[]; judul: string; grup: string }) => (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900">{judul}</h3>
          <span className="text-xs font-sans text-slate-500">{data.length} Lokasi Terjadwal</span>
        </div>
        <button
          onClick={() =>
            setModalRekap({ open: true, mode: 'tambah', data: { grup, no_urut: data.length + 1 } })
          }
          className="min-h-touch h-8 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-600/90 flex items-center gap-1 shadow-sm"
        >
          <Plus size={14} />
          <span>Tambah</span>
        </button>
      </div>

      <div className="overflow-x-auto flex-grow">
        <table className="w-full text-xs text-center whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3 w-12">NO</th>
              <th className="p-3">TANGGAL</th>
              <th className="p-3 text-left">DESA</th>
              <th className="p-3 text-left">KECAMATAN</th>
              <th className="p-3 font-sans">TARGET</th>
              <th className="p-3 font-sans">CAPAIAN</th>
              <th className="p-3 font-sans">SELISIH</th>
              <th className="p-3 w-20">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                  Belum ada data. Klik &quot;Tarik Data Rekap&quot; atau &quot;+ Tambah&quot;.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id || row.no_urut} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-sans text-slate-400">{row.no_urut}</td>
                  <td className="p-3 font-sans">{row.tanggal}</td>
                  <td className="p-3 font-semibold text-slate-900 text-left">{row.desa}</td>
                  <td className="p-3 text-slate-600 text-left">{row.kecamatan}</td>
                  <td className="p-3 font-sans font-medium">{row.target}</td>
                  <td className="p-3 font-sans font-bold text-emerald-600">{row.capaian}</td>
                  <td className="p-3 font-sans font-semibold text-slate-700">{row.selisih}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setModalRekap({ open: true, mode: 'edit', data: row })}
                        className="min-h-touch h-7 w-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-center"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteRekap(row.id)}
                        className="min-h-touch h-7 w-7 rounded-lg border border-red-200 bg-red-50 text-red-600 flex items-center justify-center"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {data.length > 0 && (
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <td colSpan={4} className="p-3 text-right font-sans uppercase">
                  Total
                </td>
                <td className="p-3 font-sans">{sum(data, 'target')}</td>
                <td className="p-3 font-sans text-emerald-600 font-black">{sum(data, 'capaian')}</td>
                <td className="p-3 font-sans font-black text-slate-800">{sum(data, 'selisih')}</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-20">
      
      {/* ── TOP HEADER (Tema Hijau - Lega & Bernapas) ── */}
      <header className="border-b border-emerald-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          
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
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Sertifikat SKLB</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Surat Keterangan Layak Bibit (SKLB)
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportExcel}
              title="Export Excel"
              aria-label="Export Excel"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            {activeTab === 'rekap' ? (
              <button
                onClick={handleSyncRekap}
                disabled={isSyncingRekap}
                title="Tarik Data Rekap"
                aria-label="Tarik Data Rekap"
                className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw size={15} className={isSyncingRekap ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{isSyncingRekap ? 'Menyinkronkan...' : 'Tarik Data Rekap'}</span>
              </button>
            ) : (
              <button
                onClick={handleSyncDetail}
                disabled={isSyncingDetail}
                title="Tarik Data Detail"
                aria-label="Tarik Data Detail"
                className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw size={15} className={isSyncingDetail ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">{isSyncingDetail ? 'Menyinkronkan 29 Desa...' : 'Tarik Data Detail'}</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-px overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { key: 'rekap', label: 'Rekapitulasi Capaian Tim' },
            { key: 'detail', label: `Master Detail Ternak (${dataDetail.length})` },
          ].map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`min-h-touch h-11 px-4 sm:px-5 rounded-t-xl text-xs sm:text-sm font-bold border-t border-x transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-white border-slate-200 text-emerald-600 border-b-white translate-y-px shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-900 bg-slate-100/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: REKAPITULASI CAPAIAN TIM ── */}
        {activeTab === 'rekap' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start animate-in fade-in duration-200">
            <TabelRekapCapaian data={tabelKiri} judul="Capaian SKLB 2026 — Tim Timur" grup="Tabel Kiri" />
            <TabelRekapCapaian data={tabelKanan} judul="Capaian SKLB 2026 — Tim Barat" grup="Tabel Kanan" />
          </div>
        )}

        {/* ── TAB 2: MASTER DETAIL TERNAK ── */}
        {activeTab === 'detail' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            
            {/* Filter & Search Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
                <div className="relative w-full sm:w-72">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama peternak atau sapi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full min-h-touch h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="w-full sm:w-52">
                  <select
                    value={filterDesa}
                    onChange={(e) => setFilterDesa(e.target.value)}
                    className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    {daftarDesa.map((desa) => (
                      <option key={desa} value={desa}>
                        {desa === 'Semua' ? 'Semua Desa' : desa}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setModalDetail({ open: true, mode: 'tambah', data: {} })}
                className="min-h-touch h-10 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-600/90 shadow-sm w-full sm:w-auto justify-center"
              >
                <Plus size={15} />
                <span>Tambah Data Sapi</span>
              </button>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">DESA</th>
                      <th className="p-3.5">PETERNAK</th>
                      <th className="p-3.5">DUSUN (RT/RW)</th>
                      <th className="p-3.5">NAMA SAPI</th>
                      <th className="p-3.5 text-center">KELAMIN</th>
                      <th className="p-3.5 text-center font-sans">UMUR (BLN)</th>
                      <th className="p-3.5 text-right font-sans">TP (CM)</th>
                      <th className="p-3.5 text-right font-sans">PB (CM)</th>
                      <th className="p-3.5 text-right font-sans">LD (CM)</th>
                      <th className="p-3.5 text-right font-sans font-bold text-slate-900 bg-slate-100">BB (KG)</th>
                      <th className="p-3.5 text-center w-24">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="p-12 text-center text-slate-400 font-medium">
                          Data masih kosong. Klik &quot;Tarik Data Detail&quot; untuk mengunduh dari server.
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-emerald-600">{row.desa_lokasi}</td>
                          <td className="p-3.5 font-semibold text-slate-900">{row.nama_pemilik}</td>
                          <td className="p-3.5 text-slate-600">
                            {row.dusun || '-'} ({row.rt || '-'}/{row.rw || '-'})
                          </td>
                          <td className="p-3.5 font-bold text-slate-800">{row.nama_sapi || '-'}</td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                row.jenis_kelamin === 'JANTAN'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {row.jenis_kelamin || '-'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-sans">{row.umur_bulan || '-'}</td>
                          <td className="p-3.5 text-right font-sans">{row.tinggi_pundak || '-'}</td>
                          <td className="p-3.5 text-right font-sans">{row.panjang_badan || '-'}</td>
                          <td className="p-3.5 text-right font-sans">{row.lingkar_dada || '-'}</td>
                          <td className="p-3.5 text-right font-sans font-bold text-emerald-700 bg-emerald-50/40">
                            {row.berat_badan || '-'}
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setModalDetail({ open: true, mode: 'edit', data: row })}
                                className="min-h-touch h-7 w-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-center"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteDetail(row.id)}
                                className="min-h-touch h-7 w-7 rounded-lg border border-red-200 bg-red-50 text-red-600 flex items-center justify-center"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ── MODAL REKAP ── */}
      {modalRekap.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">
                {modalRekap.mode === 'tambah' ? 'Tambah Data Jadwal Rekap' : 'Edit Data Rekap'}
              </h3>
              <button onClick={() => setModalRekap({ open: false, mode: 'tambah', data: null })}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveRekap} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">No Urut</label>
                  <input
                    type="number"
                    required
                    value={modalRekap.data?.no_urut || ''}
                    onChange={(e) =>
                      setModalRekap({ ...modalRekap, data: { ...modalRekap.data, no_urut: e.target.value } })
                    }
                    className="w-full h-10 px-3 rounded-xl border bg-slate-50 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={modalRekap.data?.tanggal || ''}
                    onChange={(e) =>
                      setModalRekap({ ...modalRekap, data: { ...modalRekap.data, tanggal: e.target.value } })
                    }
                    className="w-full h-10 px-3 rounded-xl border bg-slate-50 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Desa</label>
                  <input
                    type="text"
                    required
                    value={modalRekap.data?.desa || ''}
                    onChange={(e) =>
                      setModalRekap({ ...modalRekap, data: { ...modalRekap.data, desa: e.target.value } })
                    }
                    className="w-full h-10 px-3 rounded-xl border bg-slate-50 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Kecamatan</label>
                  <input
                    type="text"
                    required
                    value={modalRekap.data?.kecamatan || ''}
                    onChange={(e) =>
                      setModalRekap({ ...modalRekap, data: { ...modalRekap.data, kecamatan: e.target.value } })
                    }
                    className="w-full h-10 px-3 rounded-xl border bg-slate-50 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Target</label>
                  <input
                    type="number"
                    required
                    value={modalRekap.data?.target || ''}
                    onChange={(e) =>
                      setModalRekap({ ...modalRekap, data: { ...modalRekap.data, target: e.target.value } })
                    }
                    className="w-full h-10 px-3 rounded-xl border bg-slate-50 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Capaian</label>
                  <input
                    type="number"
                    required
                    value={modalRekap.data?.capaian || ''}
                    onChange={(e) =>
                      setModalRekap({ ...modalRekap, data: { ...modalRekap.data, capaian: e.target.value } })
                    }
                    className="w-full h-10 px-3 rounded-xl border bg-slate-50 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Grup Tim</label>
                <select
                  required
                  value={modalRekap.data?.grup || ''}
                  onChange={(e) =>
                    setModalRekap({ ...modalRekap, data: { ...modalRekap.data, grup: e.target.value } })
                  }
                  className="w-full h-10 px-3 rounded-xl border bg-slate-50 text-sm outline-none"
                >
                  <option value="">Pilih Tim...</option>
                  <option value="Tabel Kiri">Tabel Kiri (Tim Timur)</option>
                  <option value="Tabel Kanan">Tabel Kanan (Tim Barat)</option>
                </select>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalRekap({ open: false, mode: 'tambah', data: null })}
                  className="h-10 px-4 rounded-xl border bg-slate-100 text-xs font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="h-10 px-5 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL DETAIL SAPI ── */}
      {modalDetail.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">
                {modalDetail.mode === 'tambah' ? 'Tambah Master Data Sapi' : 'Edit Data Sapi'}
              </h3>
              <button onClick={() => setModalDetail({ open: false, mode: 'tambah', data: null })}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveDetail} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Nama Pemilik *</label>
                  <input
                    type="text"
                    required
                    value={modalDetail.data?.nama_pemilik || ''}
                    onChange={(e) =>
                      setModalDetail({ ...modalDetail, data: { ...modalDetail.data, nama_pemilik: e.target.value } })
                    }
                    className="w-full h-10 px-3 rounded-xl border bg-slate-50 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Desa *</label>
                  <input
                    type="text"
                    required
                    value={modalDetail.data?.desa_lokasi || ''}
                    onChange={(e) =>
                      setModalDetail({ ...modalDetail, data: { ...modalDetail.data, desa_lokasi: e.target.value } })
                    }
                    className="w-full h-10 px-3 rounded-xl border bg-slate-50 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Dusun</label>
                  <input
                    type="text"
                    value={modalDetail.data?.dusun || ''}
                    onChange={(e) =>
                      setModalDetail({ ...modalDetail, data: { ...modalDetail.data, dusun: e.target.value } })
                    }
                    className="w-full h-10 px-3 rounded-xl border bg-slate-50 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">RT</label>
                  <input
                    type="text"
                    value={modalDetail.data?.rt || ''}
                    onChange={(e) =>
                      setModalDetail({ ...modalDetail, data: { ...modalDetail.data, rt: e.target.value } })
                    }
                    className="w-full h-10 px-3 rounded-xl border bg-slate-50 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">RW</label>
                  <input
                    type="text"
                    value={modalDetail.data?.rw || ''}
                    onChange={(e) =>
                      setModalDetail({ ...modalDetail, data: { ...modalDetail.data, rw: e.target.value } })
                    }
                    className="w-full h-10 px-3 rounded-xl border bg-slate-50 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Nama Sapi</label>
                  <input
                    type="text"
                    value={modalDetail.data?.nama_sapi || ''}
                    onChange={(e) =>
                      setModalDetail({ ...modalDetail, data: { ...modalDetail.data, nama_sapi: e.target.value } })
                    }
                    className="w-full h-10 px-3 rounded-xl border bg-slate-50 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Kelamin</label>
                  <select
                    required
                    value={modalDetail.data?.jenis_kelamin || ''}
                    onChange={(e) =>
                      setModalDetail({ ...modalDetail, data: { ...modalDetail.data, jenis_kelamin: e.target.value } })
                    }
                    className="w-full h-10 px-3 rounded-xl border bg-slate-50 text-sm outline-none"
                  >
                    <option value="">Pilih...</option>
                    <option value="JANTAN">Jantan</option>
                    <option value="BETINA">Betina</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Umur (Bulan)</label>
                  <input
                    type="number"
                    value={modalDetail.data?.umur_bulan || ''}
                    onChange={(e) =>
                      setModalDetail({ ...modalDetail, data: { ...modalDetail.data, umur_bulan: e.target.value } })
                    }
                    className="w-full h-10 px-3 rounded-xl border bg-slate-50 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-bold mb-1">TP (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={modalDetail.data?.tinggi_pundak || ''}
                    onChange={(e) =>
                      setModalDetail({ ...modalDetail, data: { ...modalDetail.data, tinggi_pundak: e.target.value } })
                    }
                    className="w-full h-10 px-2 rounded-xl border bg-slate-50 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">PB (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={modalDetail.data?.panjang_badan || ''}
                    onChange={(e) =>
                      setModalDetail({ ...modalDetail, data: { ...modalDetail.data, panjang_badan: e.target.value } })
                    }
                    className="w-full h-10 px-2 rounded-xl border bg-slate-50 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">LD (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={modalDetail.data?.lingkar_dada || ''}
                    onChange={(e) =>
                      setModalDetail({ ...modalDetail, data: { ...modalDetail.data, lingkar_dada: e.target.value } })
                    }
                    className="w-full h-10 px-2 rounded-xl border bg-slate-50 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1 text-emerald-700">BB (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={modalDetail.data?.berat_badan || ''}
                    onChange={(e) =>
                      setModalDetail({ ...modalDetail, data: { ...modalDetail.data, berat_badan: e.target.value } })
                    }
                    className="w-full h-10 px-2 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-900 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalDetail({ open: false, mode: 'tambah', data: null })}
                  className="h-10 px-4 rounded-xl border bg-slate-100 text-xs font-bold"
                >
                  Batal
                </button>
                <button type="submit" className="h-10 px-5 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                  Simpan Sapi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}