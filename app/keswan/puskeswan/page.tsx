'use client';

import { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  RefreshCw,
  Download,
  Check,
  AlertCircle,
  Info,
  Plus,
  Search,
  Filter,
  Calendar,
  Building2,
} from 'lucide-react';

const DAFTAR_PUSKESWAN = [
  'MIRIT',
  'KLIRONG',
  'GOMBONG',
  'BUAYAN',
  'ALIAN',
  'PREMBUN',
  'KEBUMEN',
  'KARANGANYAR',
];

const DAFTAR_BULAN = [
  'JANUARI',
  'FEBRUARI',
  'MARET',
  'APRIL',
  'MEI',
  'JUNI',
  'JULI',
  'AGUSTUS',
  'SEPTEMBER',
  'OKTOBER',
  'NOVEMBER',
  'DESEMBER',
];

const dataAwal = [
  { id: 1, tahun: '2026', bulan: 'JANUARI', no: 1, puskeswan: 'MIRIT', bef: 2, cacingan: 70, scabies: 0, orf: 0, pmk_diag: 0, lsd_diag: 5, aktif: 127, semi_aktif: 5, pasif: 0, pusling: 127, ib: 160, pkb: 12, pmk_vaks: 0, lsd_vaks: 0, retribusi: 1750000 },
  { id: 2, tahun: '2026', bulan: 'JANUARI', no: 2, puskeswan: 'KLIRONG', bef: 10, cacingan: 60, scabies: 7, orf: 0, pmk_diag: 5, lsd_diag: 3, aktif: 125, semi_aktif: 6, pasif: 4, pusling: 125, ib: 94, pkb: 25, pmk_vaks: 25, lsd_vaks: 0, retribusi: 2500000 },
  { id: 3, tahun: '2026', bulan: 'JANUARI', no: 3, puskeswan: 'GOMBONG', bef: 0, cacingan: 16, scabies: 5, orf: 0, pmk_diag: 3, lsd_diag: 0, aktif: 140, semi_aktif: 43, pasif: 22, pusling: 30, ib: 196, pkb: 31, pmk_vaks: 75, lsd_vaks: 0, retribusi: 3970000 },
  { id: 4, tahun: '2026', bulan: 'JANUARI', no: 4, puskeswan: 'BUAYAN', bef: 5, cacingan: 16, scabies: 2, orf: 0, pmk_diag: 0, lsd_diag: 0, aktif: 51, semi_aktif: 3, pasif: 0, pusling: 51, ib: 198, pkb: 23, pmk_vaks: 51, lsd_vaks: 0, retribusi: 670000 },
  { id: 5, tahun: '2026', bulan: 'JANUARI', no: 5, puskeswan: 'ALIAN', bef: 1, cacingan: 25, scabies: 5, orf: 0, pmk_diag: 1, lsd_diag: 4, aktif: 48, semi_aktif: 5, pasif: 7, pusling: 64, ib: 15, pkb: 2, pmk_vaks: 0, lsd_vaks: 0, retribusi: 0 },
  { id: 6, tahun: '2026', bulan: 'JANUARI', no: 6, puskeswan: 'PREMBUN', bef: 3, cacingan: 70, scabies: 2, orf: 0, pmk_diag: 0, lsd_diag: 3, aktif: 70, semi_aktif: 18, pasif: 4, pusling: 70, ib: 0, pkb: 0, pmk_vaks: 0, lsd_vaks: 0, retribusi: 1360000 },
  { id: 7, tahun: '2026', bulan: 'JANUARI', no: 7, puskeswan: 'KEBUMEN', bef: 10, cacingan: 77, scabies: 2, orf: 0, pmk_diag: 0, lsd_diag: 10, aktif: 77, semi_aktif: 20, pasif: 3, pusling: 51, ib: 47, pkb: 47, pmk_vaks: 71, lsd_vaks: 60, retribusi: 1600000 },
  { id: 8, tahun: '2026', bulan: 'JANUARI', no: 8, puskeswan: 'KARANGANYAR', bef: 8, cacingan: 16, scabies: 9, orf: 7, pmk_diag: 4, lsd_diag: 2, aktif: 38, semi_aktif: 5, pasif: 0, pusling: 38, ib: 72, pkb: 26, pmk_vaks: 30, lsd_vaks: 0, retribusi: 565000 },
];

export default function LaporanPuskeswanPage() {
  const [dataLaporan, setDataLaporan] = useState<any[]>(dataAwal);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Filter & Search State (Tahun & Bulan)
  const [filterTahun, setFilterTahun] = useState<string>('2026');
  const [filterBulan, setFilterBulan] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal Tambah Periode Baru
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addTahun, setAddTahun] = useState<string>('2026');
  const [addBulan, setAddBulan] = useState<string>('FEBRUARI');

  // State untuk Inline Editing
  const [editingCell, setEditingCell] = useState<{ bulan: string; puskeswan: string; field: string; tahun?: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // Muat data dari database web saat halaman pertama kali dibuka
  const loadDataFromDB = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/puskeswan');
      const result = await res.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        // Ensure every row has a tahun property
        const withTahun = result.data.map((r: any) => ({
          ...r,
          tahun: r.tahun ? String(r.tahun) : '2026',
        }));
        setDataLaporan(withTahun);
      }
    } catch {
      console.warn('Gagal memuat dari database, menggunakan data default');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDataFromDB();
  }, []);

  // Auto fokus dan seleksi teks saat sel diedit
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const sum = (rows: any[], key: string) => rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
  const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(Number(val) || 0);

  // Mulai proses edit saat sel diklik
  const handleStartEdit = (bulan: string, puskeswan: string, field: string, currentValue: any, tahun: string = '2026') => {
    setEditingCell({ bulan, puskeswan, field, tahun });
    setEditValue(String(currentValue ?? 0));
  };

  // Simpan nilai perubahan sel ke State & Database
  const handleSaveEdit = async () => {
    if (!editingCell) return;

    const { bulan, puskeswan, field, tahun } = editingCell;
    const numValue = Number(editValue) || 0;

    // 1. Optimistic Update
    setDataLaporan((prev) =>
      prev.map((row) => {
        const matchYear = !tahun || (row.tahun || '2026') === tahun;
        if (row.bulan === bulan && row.puskeswan === puskeswan && matchYear) {
          return { ...row, [field]: numValue };
        }
        return row;
      })
    );

    setEditingCell(null);

    // 2. Kirim update ke API Database
    try {
      const res = await fetch('/api/puskeswan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulan, puskeswan, field, value: numValue, tahun }),
      });
      const resData = await res.json();
      if (!resData.success) {
        showToast('error', resData.error || 'Gagal menyimpan perubahan ke database.');
      } else {
        showToast('success', `Tersimpan: ${puskeswan} - ${field.toUpperCase()} (${numValue.toLocaleString('id-ID')})`);
      }
    } catch {
      showToast('success', 'Perubahan disimpan di sesi web.');
    }
  };

  // Batalkan edit saat tombol Escape ditekan
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync-puskeswan', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        showToast('success', result.message);
        setDataLaporan(result.data);
      } else {
        showToast('error', 'Gagal: ' + result.error);
      }
    } catch {
      showToast('error', 'Terjadi kesalahan jaringan saat sinkronisasi.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Tambah Periode Baru (Tahun & Bulan)
  const handleCreateNewPeriod = () => {
    // Check if period already exists
    const exists = dataLaporan.some(
      (r) => (r.tahun || '2026') === addTahun && r.bulan === addBulan
    );

    if (exists) {
      alert(`Data untuk Tahun ${addTahun} Bulan ${addBulan} sudah ada di tabel!`);
      setFilterTahun(addTahun);
      setFilterBulan(addBulan);
      setShowAddModal(false);
      return;
    }

    // Generate 8 puskeswan rows for this period
    const newRows = DAFTAR_PUSKESWAN.map((puskeswan, idx) => ({
      id: Date.now() + idx,
      tahun: addTahun,
      bulan: addBulan,
      no: idx + 1,
      puskeswan,
      bef: 0,
      cacingan: 0,
      scabies: 0,
      orf: 0,
      pmk_diag: 0,
      lsd_diag: 0,
      aktif: 0,
      semi_aktif: 0,
      pasif: 0,
      pusling: 0,
      ib: 0,
      pkb: 0,
      pmk_vaks: 0,
      lsd_vaks: 0,
      retribusi: 0,
    }));

    setDataLaporan((prev) => [...prev, ...newRows]);
    setFilterTahun(addTahun);
    setFilterBulan(addBulan);
    setShowAddModal(false);
    showToast('success', `Berhasil menambahkan lembar kerja ${addBulan} ${addTahun}!`);
  };

  // Filtered dataset based on Tahun, Bulan, and Search Query
  const filteredData = useMemo(() => {
    return dataLaporan.filter((row) => {
      const rowTahun = row.tahun ? String(row.tahun) : '2026';
      const matchTahun = !filterTahun || rowTahun === filterTahun;
      const matchBulan = !filterBulan || row.bulan === filterBulan;
      const matchSearch = !searchQuery || 
        row.puskeswan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.bulan.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTahun && matchBulan && matchSearch;
    });
  }, [dataLaporan, filterTahun, filterBulan, searchQuery]);

  // Unique Tahun List
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(dataLaporan.map((r) => (r.tahun ? String(r.tahun) : '2026'))));
    if (!years.includes('2026')) years.push('2026');
    if (!years.includes('2025')) years.push('2025');
    if (!years.includes('2027')) years.push('2027');
    return years.sort();
  }, [dataLaporan]);

  // Group filtered data by Bulan
  const groupedData = useMemo(() => {
    return filteredData.reduce((acc, row) => {
      const key = `${row.tahun || '2026'} - ${row.bulan}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {} as Record<string, any[]>);
  }, [filteredData]);

  const totalRetribusi = sum(filteredData, 'retribusi');
  const totalLayanan = sum(filteredData, 'aktif') + sum(filteredData, 'semi_aktif') + sum(filteredData, 'pasif');

  const handleExportExcel = () => {
    if (!filteredData || filteredData.length === 0) return alert('Belum ada data laporan untuk diekspor!');
    const rows = filteredData.map((row) => ({
      Tahun: row.tahun || '2026',
      Bulan: row.bulan,
      No: row.no_urut || row.no,
      Puskeswan: row.puskeswan,
      'BEF (Demam 3 Hari)': row.bef,
      Cacingan: row.cacingan,
      Scabies: row.scabies,
      ORF: row.orf,
      'PMK (Kasus)': row.pmk_diag,
      'LSD (Kasus)': row.lsd_diag,
      'Pelayanan Aktif': row.aktif,
      'Pelayanan Semi Aktif': row.semi_aktif,
      'Pelayanan Pasif': row.pasif,
      Pusling: row.pusling,
      'Inseminasi Buatan': row.ib,
      'Pemeriksaan Kebuntingan': row.pkb,
      'Vaksinasi PMK': row.pmk_vaks,
      'Vaksinasi LSD': row.lsd_vaks,
      'Retribusi (Rp)': row.retribusi,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan_Puskeswan');
    XLSX.writeFile(wb, `Rekap_Kinerja_Puskeswan_${filterTahun || 'Semua'}_${filterBulan || 'Semua'}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Helper render sel yang bisa diklik untuk edit
  const renderEditableCell = (row: any, field: string, isCurrency = false, extraClass = '') => {
    const rowYear = row.tahun ? String(row.tahun) : '2026';
    const isEditing =
      editingCell?.bulan === row.bulan &&
      editingCell?.puskeswan === row.puskeswan &&
      editingCell?.field === field &&
      (!editingCell?.tahun || editingCell.tahun === rowYear);

    const value = row[field] ?? 0;

    if (isEditing) {
      return (
        <td className={`p-1 border-r border-blue-400 bg-blue-50/90 font-sans ${extraClass}`}>
          <input
            ref={inputRef}
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
            className="w-full text-center py-1 px-1.5 text-xs font-bold font-sans bg-white border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-900 shadow-sm"
          />
        </td>
      );
    }

    return (
      <td
        onClick={() => handleStartEdit(row.bulan, row.puskeswan, field, value, rowYear)}
        title="Klik untuk mengubah angka"
        className={`p-3 border-r border-slate-100 font-sans cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors group select-none ${
          isCurrency ? 'text-right font-medium text-slate-900' : 'text-center'
        } ${extraClass}`}
      >
        <span className="group-hover:underline decoration-blue-400 underline-offset-2">
          {isCurrency ? `Rp ${formatRp(value)}` : (value ?? 0)}
        </span>
      </td>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white pb-20">
      
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-bold text-white flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── TOP HEADER ── */}
      <header className="border-b border-blue-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/keswan"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Keswan"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/keswan" className="text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors truncate">
                  Keswan
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-blue-700 whitespace-nowrap">Puskeswan</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Rekapitulasi Kinerja Bulanan Puskeswan
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="min-h-touch min-w-touch h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>+ Periode Baru</span>
            </button>

            <button
              onClick={handleExportExcel}
              title="Export Excel"
              aria-label="Export Excel"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Download size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            <button
              onClick={handleSync}
              disabled={isSyncing}
              title="Tarik Data Live Sheets"
              aria-label="Tarik Data Live Sheets"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 hover:bg-blue-100 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw size={15} strokeWidth={2.5} className={isSyncing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{isSyncing ? 'Menyinkronkan...' : 'Sync Live'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        
        {/* Banner Info Inline Edit */}
        <div className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 text-xs sm:text-sm shadow-2xs">
          <Info size={18} className="text-blue-600 shrink-0" />
          <p>
            <strong>Mode Click-to-Edit Aktif:</strong> Klik langsung pada angka tabel mana saja untuk mengubah nilainya. Tekan <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded font-mono text-xs font-bold text-blue-700">Enter</kbd> atau klik di luar sel untuk menyimpan otomatis.
          </p>
        </div>

        {/* ── FILTER & PENCARIAN TAHUN & BULAN ── */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} strokeWidth={2.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama Puskeswan (cth: Mirit, Klirong, Gombong)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-touch h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filter Tahun */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
              <Calendar size={14} className="text-slate-400" />
              <select
                value={filterTahun}
                onChange={(e) => setFilterTahun(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none py-1.5 cursor-pointer"
              >
                <option value="">Semua Tahun</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Bulan */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
              <Filter size={14} className="text-slate-400" />
              <select
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none py-1.5 cursor-pointer"
              >
                <option value="">Semua Bulan</option>
                {DAFTAR_BULAN.map((bln) => (
                  <option key={bln} value={bln}>
                    {bln}
                  </option>
                ))}
              </select>
            </div>

            {(filterTahun || filterBulan || searchQuery) && (
              <button
                onClick={() => {
                  setFilterTahun('');
                  setFilterBulan('');
                  setSearchQuery('');
                }}
                className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
            <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Puskeswan Terpantau
            </p>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-900">
              {new Set(filteredData.map((d) => d.puskeswan)).size} <span className="text-xs font-semibold text-slate-400">Unit Wilayah</span>
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
            <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Total Pelayanan
            </p>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-blue-600">
              {totalLayanan.toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-400">Kasus</span>
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
            <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Vaksinasi Terlaksana
            </p>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {(sum(filteredData, 'pmk_vaks') + sum(filteredData, 'lsd_vaks')).toLocaleString('id-ID')} <span className="text-xs font-semibold text-slate-400">Dosis</span>
            </p>
          </div>

          <div className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm">
            <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Penerimaan Retribusi
            </p>
            <p className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-900">
              Rp {formatRp(totalRetribusi)}
            </p>
          </div>
        </div>

        {/* Master Table */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900">
                Tabel Rekapitulasi Pelayanan, Diagnosa, &amp; Retribusi Puskeswan
              </h2>
              <p className="text-xs text-slate-500">Klik sel angka untuk mengedit langsung di tempat</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                Periode: {filterTahun || 'Semua Tahun'} {filterBulan ? `- ${filterBulan}` : ''}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[70vh]">
            <table className="w-full text-xs text-center whitespace-nowrap border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider sticky top-0 z-20 border-b border-slate-200 shadow-sm">
                <tr>
                  <th rowSpan={2} className="p-3.5 border-r border-slate-200 w-28 bg-slate-100">PERIODE</th>
                  <th rowSpan={2} className="p-3.5 border-r border-slate-200 w-12 bg-slate-100">NO</th>
                  <th rowSpan={2} className="p-3.5 text-left border-r border-slate-200 bg-slate-100">PUSKESWAN</th>
                  <th colSpan={6} className="p-2.5 border-r border-slate-200 bg-rose-50/80 text-rose-900">DIAGNOSA PENYAKIT HEWAN</th>
                  <th colSpan={4} className="p-2.5 border-r border-slate-200 bg-blue-50/80 text-blue-900">BENTUK PELAYANAN</th>
                  <th colSpan={2} className="p-2.5 border-r border-slate-200 bg-amber-50/80 text-amber-900">REPRODUKSI</th>
                  <th colSpan={2} className="p-2.5 border-r border-slate-200 bg-emerald-50/80 text-emerald-900">VAKSINASI</th>
                  <th rowSpan={2} className="p-3.5 border-l border-slate-200 bg-slate-100 text-right">RETRIBUSI (RP)</th>
                </tr>
                <tr className="text-[10px] text-slate-600">
                  <th className="p-2 border-r border-slate-200 bg-rose-50/40">BEF</th>
                  <th className="p-2 border-r border-slate-200 bg-rose-50/40">CACINGAN</th>
                  <th className="p-2 border-r border-slate-200 bg-rose-50/40">SCABIES</th>
                  <th className="p-2 border-r border-slate-200 bg-rose-50/40">ORF</th>
                  <th className="p-2 border-r border-slate-200 bg-rose-50/40">PMK</th>
                  <th className="p-2 border-r border-slate-200 bg-rose-50/40">LSD</th>

                  <th className="p-2 border-r border-slate-200 bg-blue-50/40">AKTIF</th>
                  <th className="p-2 border-r border-slate-200 bg-blue-50/40">SEMI AKTIF</th>
                  <th className="p-2 border-r border-slate-200 bg-blue-50/40">PASIF</th>
                  <th className="p-2 border-r border-slate-200 bg-blue-50/40">PUSLING</th>

                  <th className="p-2 border-r border-slate-200 bg-amber-50/40">IB</th>
                  <th className="p-2 border-r border-slate-200 bg-amber-50/40">PKB</th>

                  <th className="p-2 border-r border-slate-200 bg-emerald-50/40">PMK</th>
                  <th className="p-2 border-r border-slate-200 bg-emerald-50/40">LSD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {Object.keys(groupedData).length === 0 ? (
                  <tr>
                    <td colSpan={18} className="p-8 text-center text-slate-400 font-medium">
                      Tidak ada data puskeswan yang cocok dengan filter Tahun &amp; Bulan yang dipilih.
                    </td>
                  </tr>
                ) : (
                  Object.keys(groupedData).map((periodKey) => {
                    const rows = groupedData[periodKey];
                    return (
                      <Fragment key={periodKey}>
                        {rows.map((row: any, idx: number) => (
                          <tr key={`${periodKey}-${row.puskeswan}-${idx}`} className="hover:bg-slate-50 transition-colors">
                            {idx === 0 && (
                              <td
                                rowSpan={rows.length}
                                className="p-3 border-r border-slate-200 font-bold text-slate-900 bg-slate-50/50 align-top text-center"
                              >
                                <span className="block text-xs font-extrabold text-blue-700">{row.bulan}</span>
                                <span className="block text-[10px] text-slate-500 font-sans">{row.tahun || '2026'}</span>
                              </td>
                            )}
                            <td className="p-3 border-r border-slate-100 font-sans text-slate-500">{idx + 1}</td>
                            <td className="p-3 text-left font-bold text-slate-900 border-r border-slate-100">
                              {row.puskeswan}
                            </td>

                            {renderEditableCell(row, 'bef')}
                            {renderEditableCell(row, 'cacingan')}
                            {renderEditableCell(row, 'scabies')}
                            {renderEditableCell(row, 'orf')}
                            {renderEditableCell(row, 'pmk_diag')}
                            {renderEditableCell(row, 'lsd_diag')}

                            {renderEditableCell(row, 'aktif')}
                            {renderEditableCell(row, 'semi_aktif')}
                            {renderEditableCell(row, 'pasif')}
                            {renderEditableCell(row, 'pusling')}

                            {renderEditableCell(row, 'ib')}
                            {renderEditableCell(row, 'pkb')}

                            {renderEditableCell(row, 'pmk_vaks')}
                            {renderEditableCell(row, 'lsd_vaks')}

                            {renderEditableCell(row, 'retribusi', true, 'border-l border-slate-200')}
                          </tr>
                        ))}
                        {/* Subtotal Periode */}
                        <tr className="bg-slate-100/70 font-bold text-slate-900 border-t-2 border-b-2 border-slate-200">
                          <td colSpan={3} className="p-3 text-right pr-4 uppercase tracking-wider text-[11px] border-r border-slate-200 font-extrabold">
                            TOTAL {periodKey}
                          </td>
                          <td className="p-3 border-r border-slate-200 font-sans">{sum(rows, 'bef')}</td>
                          <td className="p-3 border-r border-slate-200 font-sans">{sum(rows, 'cacingan')}</td>
                          <td className="p-3 border-r border-slate-200 font-sans">{sum(rows, 'scabies')}</td>
                          <td className="p-3 border-r border-slate-200 font-sans">{sum(rows, 'orf')}</td>
                          <td className="p-3 border-r border-slate-200 font-sans">{sum(rows, 'pmk_diag')}</td>
                          <td className="p-3 border-r border-slate-200 font-sans">{sum(rows, 'lsd_diag')}</td>

                          <td className="p-3 border-r border-slate-200 font-sans">{sum(rows, 'aktif')}</td>
                          <td className="p-3 border-r border-slate-200 font-sans">{sum(rows, 'semi_aktif')}</td>
                          <td className="p-3 border-r border-slate-200 font-sans">{sum(rows, 'pasif')}</td>
                          <td className="p-3 border-r border-slate-200 font-sans">{sum(rows, 'pusling')}</td>

                          <td className="p-3 border-r border-slate-200 font-sans">{sum(rows, 'ib')}</td>
                          <td className="p-3 border-r border-slate-200 font-sans">{sum(rows, 'pkb')}</td>

                          <td className="p-3 border-r border-slate-200 font-sans">{sum(rows, 'pmk_vaks')}</td>
                          <td className="p-3 border-r border-slate-200 font-sans">{sum(rows, 'lsd_vaks')}</td>

                          <td className="p-3 text-right font-sans font-extrabold text-blue-700 bg-blue-50/50">
                            Rp {formatRp(sum(rows, 'retribusi'))}
                          </td>
                        </tr>
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* ── MODAL TAMBAH PERIODE BARU (TAHUN & BULAN) ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Calendar size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Tambah Periode Rekapitulasi
                  </h3>
                  <p className="text-xs text-slate-500">Pilih Tahun &amp; Bulan untuk lembar kerja baru</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tahun Anggaran
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2100"
                  value={addTahun}
                  onChange={(e) => setAddTahun(e.target.value)}
                  className="w-full min-h-touch h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:border-blue-600 outline-none shadow-2xs"
                  placeholder="Contoh: 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Bulan Laporan
                </label>
                <select
                  value={addBulan}
                  onChange={(e) => setAddBulan(e.target.value)}
                  className="w-full min-h-touch h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-blue-600 outline-none shadow-2xs"
                >
                  {DAFTAR_BULAN.map((bln) => (
                    <option key={bln} value={bln}>
                      {bln}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">8 Puskeswan yang akan disiapkan:</p>
                <p className="text-[11px] text-slate-500">{DAFTAR_PUSKESWAN.join(', ')}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="min-h-touch h-11 px-5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateNewPeriod}
                className="flex-1 min-h-touch h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                Buat Lembar Kerja
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}