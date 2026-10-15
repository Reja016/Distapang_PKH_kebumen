'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { usePageAuth } from '@/hooks/usePageAuth';
import {
  ArrowLeft,
  Download,
  Plus,
  Building2,
  Save,
  Loader2,
  Calendar,
  Table as TableIcon,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BULAN_NAMES,
  LOKASI_CONFIGS,
  RphFormData,
  INITIAL_RPH_FORM,
} from '@/components/kesmavet/rph-tph-tpu/types';
import { RumpunTableTab } from '@/components/kesmavet/rph-tph-tpu/RumpunTableTab';
import { KomoditasTableTab } from '@/components/kesmavet/rph-tph-tpu/KomoditasTableTab';
import { showToast, showConfirm } from '@/components/common/CustomToast';
import { RumahPotongTab } from '@/components/kesmavet/rph-tph-tpu/RumahPotongTab';
import { RphFormModal } from '@/components/kesmavet/rph-tph-tpu/RphModals';

export default function RphTphTpuPage() {
  const { isReady, canCreate, canEdit, isAdmin: isAuthAdmin, userRole } = usePageAuth('kesmavet', 'rph-tph-tpu');

  // Role Admin Check: strictly only Administrator
  const isAdmin = useMemo(() => {
    return isAuthAdmin || canEdit || userRole === 'Administrator';
  }, [isAuthAdmin, canEdit, userRole]);

  // Navigation tabs (1. Input Pemotongan, 2. TPH, 3. Data Rumah Potong)
  const [activeTab, setActiveTab] = useState<'pemotongan_rumpun' | 'rekap_komoditas' | 'rumah_potong'>('pemotongan_rumpun');

  // Tab 1 & 2 Location Switcher
  const [selectedLokasiKey, setSelectedLokasiKey] = useState<string>('rph_kebumen');

  // Year & Month filter
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [availableYears, setAvailableYears] = useState<number[]>([2027, 2026, 2025, 2024]);

  // ── 1. STATE TAB: DATA RUMAH POTONG (RPH / TPH / TPU) ──
  const [rphList, setRphList] = useState<any[]>([]);
  const [isLoadingRph, setIsLoadingRph] = useState(true);
  const [searchRph, setSearchRph] = useState('');
  const [filterJenis, setFilterJenis] = useState('ALL');
  const [filterHalal, setFilterHalal] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formRph, setFormRph] = useState<RphFormData>(INITIAL_RPH_FORM);

  // ── 2. STATE TAB: INPUT PEMOTONGAN RUMAH POTONG HEWAN (4 TABEL RUMPUN SAPI HARIAN) ──
  const [rumpunData, setRumpunData] = useState<Record<string, any[]>>({
    rph_kebumen: [],
    luar_rph_kebumen: [],
    rph_gombong: [],
    luar_rph_gombong: [],
  });
  const [isLoadingRumpun, setIsLoadingRumpun] = useState(false);
  const [isSavingRumpun, setIsSavingRumpun] = useState(false);
  const [rumpunSaveMessage, setRumpunSaveMessage] = useState('');

  // ── 3. STATE TAB: TEMPAT PEMOTONGAN HEWAN (TPH) / KOMODITAS TERNAK HARIAN ──
  const [komoditasData, setKomoditasData] = useState<Record<string, any[]>>({
    rph_kebumen: [],
    luar_rph_kebumen: [],
    rph_gombong: [],
    luar_rph_gombong: [],
  });
  const [isLoadingKomoditas, setIsLoadingKomoditas] = useState(false);
  const [isSavingKomoditas, setIsSavingKomoditas] = useState(false);
  const [komoditasSaveMessage, setKomoditasSaveMessage] = useState('');

  // ── FETCH AVAILABLE YEARS ──
  const loadAvailableYears = async () => {
    try {
      const [res1, res2] = await Promise.all([
        fetch('/api/pemotongan-rumpun?action=years'),
        fetch('/api/pemotongan-komoditas?action=years'),
      ]);
      const json1 = await res1.json();
      const json2 = await res2.json();

      const yearsSet = new Set<number>([2027, 2026, 2025, 2024]);
      if (json1.success && Array.isArray(json1.years)) {
        json1.years.forEach((y: number) => yearsSet.add(Number(y)));
      }
      if (json2.success && Array.isArray(json2.years)) {
        json2.years.forEach((y: number) => yearsSet.add(Number(y)));
      }
      setAvailableYears(Array.from(yearsSet).sort((a, b) => b - a));
    } catch (err) {
      console.warn('Gagal memuat tahun unik:', err);
    }
  };

  // ── 1. LOAD DATA RUMAH POTONG ──
  const loadRphData = async () => {
    try {
      setIsLoadingRph(true);
      const res = await fetch('/api/pemotongan-hewan');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRphList(json.data);
      }
    } catch (err) {
      console.error('Gagal memuat data RPH:', err);
    } finally {
      setIsLoadingRph(false);
    }
  };

  // ── 2. LOAD DATA PEMOTONGAN RUMPUN SAPI HARIAN ──
  const loadRumpunData = async (year: number, month: number) => {
    try {
      setIsLoadingRumpun(true);
      const res = await fetch(`/api/pemotongan-rumpun?tahun=${year}&bulan=${month}&mode=daily&_t=${Date.now()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setRumpunData({
          rph_kebumen: json.data.rph_kebumen || [],
          luar_rph_kebumen: json.data.luar_rph_kebumen || [],
          rph_gombong: json.data.rph_gombong || [],
          luar_rph_gombong: json.data.luar_rph_gombong || [],
        });
      }
    } catch (err) {
      console.error('Gagal memuat data pemotongan rumpun harian:', err);
    } finally {
      setIsLoadingRumpun(false);
    }
  };

  // ── 3. LOAD DATA REKAP KOMODITAS TERNAK HARIAN ──
  const loadKomoditasData = async (year: number, month: number) => {
    try {
      setIsLoadingKomoditas(true);
      const res = await fetch(`/api/pemotongan-komoditas?tahun=${year}&bulan=${month}&mode=daily&_t=${Date.now()}`);
      const json = await res.json();
      if (json.success && json.data) {
        setKomoditasData({
          rph_kebumen: json.data.rph_kebumen || [],
          luar_rph_kebumen: json.data.luar_rph_kebumen || [],
          rph_gombong: json.data.rph_gombong || [],
          luar_rph_gombong: json.data.luar_rph_gombong || [],
        });
      }
    } catch (err) {
      console.error('Gagal memuat data komoditas harian:', err);
    } finally {
      setIsLoadingKomoditas(false);
    }
  };

  useEffect(() => {
    loadAvailableYears();
    loadRphData();
  }, []);

  useEffect(() => {
    loadRumpunData(selectedYear, selectedMonth);
    loadKomoditasData(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // ── CELL CHANGE TAB 1: RUMPUN SAPI HARIAN ──
  const handleRumpunCellChange = (lokasiKey: string, dayIndex: number, field: string, value: any) => {
    const num = Math.max(0, parseInt(value, 10) || 0);

    setRumpunData((prev) => {
      const copy = { ...prev };
      const lokasiRows = [...(copy[lokasiKey] || [])];
      if (lokasiRows[dayIndex]) {
        lokasiRows[dayIndex] = {
          ...lokasiRows[dayIndex],
          [field]: num,
        };
      }
      copy[lokasiKey] = lokasiRows;
      return copy;
    });
  };

  // ── CELL CHANGE TAB 2: KOMODITAS HARIAN ──
  const handleKomoditasCellChange = (lokasiKey: string, dayIndex: number, field: string, value: any) => {
    const num = Math.max(0, parseInt(value, 10) || 0);

    setKomoditasData((prev) => {
      const copy = { ...prev };
      const lokasiRows = [...(copy[lokasiKey] || [])];
      if (lokasiRows[dayIndex]) {
        lokasiRows[dayIndex] = {
          ...lokasiRows[dayIndex],
          [field]: num,
        };
      }
      copy[lokasiKey] = lokasiRows;
      return copy;
    });
  };

  // ── SAVE TAB 1: RUMPUN SAPI HARIAN ──
  const handleSaveRumpun = async () => {
    try {
      setIsSavingRumpun(true);
      setRumpunSaveMessage('');
      const res = await fetch('/api/pemotongan-rumpun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tahun: selectedYear,
          bulan: selectedMonth,
          data: rumpunData,
          isAdmin,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRumpunSaveMessage('✓ Data Pemotongan Rumpun Harian berhasil disimpan!');
        setTimeout(() => setRumpunSaveMessage(''), 4000);
      } else {
        alert('Gagal menyimpan: ' + json.error);
      }
    } catch (err: any) {
      alert('Terjadi kesalahan saat menyimpan: ' + err.message);
    } finally {
      setIsSavingRumpun(false);
    }
  };

  // ── SAVE TAB 2: KOMODITAS HARIAN ──
  const handleSaveKomoditas = async () => {
    try {
      setIsSavingKomoditas(true);
      setKomoditasSaveMessage('');
      const res = await fetch('/api/pemotongan-komoditas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tahun: selectedYear,
          bulan: selectedMonth,
          data: komoditasData,
          isAdmin,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setKomoditasSaveMessage('✓ Data Pemotongan Komoditas Harian berhasil disimpan!');
        setTimeout(() => setKomoditasSaveMessage(''), 4000);
      } else {
        alert('Gagal menyimpan: ' + json.error);
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsSavingKomoditas(false);
    }
  };

  // ── EXPORT EXCEL HANDLERS ──
  const exportRphToExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(
        rphList.map((r, i) => ({
          No: i + 1,
          'Nama Usaha': r.nama_usaha,
          Jenis: r.jenis,
          Pemilik: r.pemilik,
          Kontak: r.kontak,
          Lokasi: r.lokasi || r.alamat_pemilik,
          'Sertifikat Halal': r.sertifikat_halal ? 'Sudah' : 'Belum',
          'Sertifikat NKV': r.sertifikat_nkv || 'Belum',
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data Rumah Potong');
      XLSX.writeFile(wb, `Data_Rumah_Potong_Kebumen_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch {
      alert('Gagal mengekspor data RPH.');
    }
  };

  const exportRumpunToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const bulanName = BULAN_NAMES[selectedMonth - 1];

      LOKASI_CONFIGS.forEach((cfg) => {
        const rows = rumpunData[cfg.key] || [];
        const isGombong = cfg.key === 'rph_gombong' || cfg.key === 'luar_rph_gombong';

        const data = rows.map((r) => {
          const pj = Number(r.po_jantan) || 0;
          const pbp = Number(r.po_betina_prod) || 0;
          const pbnp = Number(r.po_betina_non_prod) || 0;
          const sj = Number(r.so_jantan) || 0;
          const sbp = Number(r.so_betina_prod) || 0;
          const sbnp = Number(r.so_betina_non_prod) || 0;
          const smj = Number(r.simmental_jantan) || 0;
          const smbp = Number(r.simmental_betina_prod) || 0;
          const smbnp = Number(r.simmental_betina_non_prod) || 0;
          const lj = Number(r.limousine_jantan) || 0;
          const lbp = Number(r.limousine_betina_prod) || 0;
          const lbnp = Number(r.limousine_betina_non_prod) || 0;
          const bj = Number(r.babi_jantan) || 0;
          const bb = Number(r.babi_betina_prod) || Number(r.babi_betina) || 0;

          const totJ = pj + sj + smj + lj + (isGombong ? bj : 0);
          const totBP = pbp + sbp + smbp + lbp + (isGombong ? bb : 0);
          const totBNP = pbnp + sbnp + smbnp + lbnp;
          const totHari = totJ + totBP + totBNP;

          const item: any = {
            Hari: `Tgl ${r.hari}`,
            'PO Jantan': pj,
            'PO Betina Prod': pbp,
            'PO Betina Non-P': pbnp,
            'SO Jantan': sj,
            'SO Betina Prod': sbp,
            'SO Betina Non-P': sbnp,
            'Simmental Jantan': smj,
            'Simmental Betina Prod': smbp,
            'Simmental Betina Non-P': smbnp,
            'Limousine Jantan': lj,
            'Limousine Betina Prod': lbp,
            'Limousine Betina Non-P': lbnp,
          };

          if (isGombong) {
            item['Babi Jantan'] = bj;
            item['Babi Betina'] = bb;
          }

          item['Total Jantan'] = totJ;
          item['Total Betina Prod'] = totBP;
          item['Total Betina Non-P'] = totBNP;
          item['Total Hari'] = totHari;

          return item;
        });

        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, cfg.label.substring(0, 31));
      });

      XLSX.writeFile(wb, `Pemotongan_Rumpun_${bulanName}_${selectedYear}.xlsx`);
    } catch {
      alert('Gagal mengekspor data pemotongan.');
    }
  };

  const exportKomoditasToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const bulanName = BULAN_NAMES[selectedMonth - 1];

      LOKASI_CONFIGS.forEach((cfg) => {
        const rows = komoditasData[cfg.key] || [];
        const data = rows.map((r) => {
          const sj = Number(r.sapi_jantan) || 0;
          const sb = Number(r.sapi_betina) || 0;
          const kj = Number(r.kuda_jantan) || 0;
          const kb = Number(r.kuda_betina) || 0;
          const bj = Number(r.babi_jantan) || 0;
          const bb = Number(r.babi_betina) || 0;
          const kmj = Number(r.kambing_jantan) || 0;
          const kmb = Number(r.kambing_betina) || 0;
          const dj = Number(r.domba_jantan) || 0;
          const db = Number(r.domba_betina) || 0;

          const totJ = sj + kj + bj + kmj + dj;
          const totB = sb + kb + bb + kmb + db;

          return {
            Hari: `Tgl ${r.hari}`,
            'Sapi Potong J': sj,
            'Sapi Potong B': sb,
            'Kuda J': kj,
            'Kuda B': kb,
            'Babi J': bj,
            'Babi B': bb,
            'Kambing J': kmj,
            'Kambing B': kmb,
            'Domba J': dj,
            'Domba B': db,
            'Total Jantan': totJ,
            'Total Betina': totB,
            'Total Hari': totJ + totB,
          };
        });

        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, cfg.label.substring(0, 31));
      });

      XLSX.writeFile(wb, `Pemotongan_Komoditas_${bulanName}_${selectedYear}.xlsx`);
    } catch {
      alert('Gagal mengekspor rekap komoditas.');
    }
  };

  const filteredRph = useMemo(() => {
    return rphList.filter((r) => {
      const matchSearch =
        !searchRph ||
        (r.nama_usaha && r.nama_usaha.toLowerCase().includes(searchRph.toLowerCase())) ||
        (r.pemilik && r.pemilik.toLowerCase().includes(searchRph.toLowerCase())) ||
        (r.lokasi && r.lokasi.toLowerCase().includes(searchRph.toLowerCase()));

      const matchJenis = filterJenis === 'ALL' || r.jenis === filterJenis;
      const matchHalal = filterHalal === 'ALL' || (filterHalal === 'Sudah' ? r.sertifikat_halal : !r.sertifikat_halal);

      return matchSearch && matchJenis && matchHalal;
    });
  }, [rphList, searchRph, filterJenis, filterHalal]);

  const handleSaveRph = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate && !canEdit) {
      alert('Anda tidak memiliki hak akses untuk menambah/mengedit data RPH.');
      return;
    }

    try {
      const method = editingItem ? 'PUT' : 'POST';
      const body = editingItem ? { ...formRph, id: editingItem.id } : formRph;
      const res = await fetch('/api/pemotongan-hewan', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowAddModal(false);
        loadRphData();
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDeleteRph = async (id: number) => {
    if (!isAdmin) {
      showToast.error('Hanya Administrator yang berhak menghapus unit pemotongan.');
      return;
    }
    const ok = await showConfirm({
      title: 'Hapus Unit Pemotongan',
      message: 'Apakah Anda yakin ingin menghapus unit pemotongan ini?',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger',
    });
    if (!ok) return;

    try {
      const res = await fetch(`/api/pemotongan-hewan/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast.success('Unit pemotongan berhasil dihapus.');
        loadRphData();
      } else {
        showToast.error('Gagal menghapus unit pemotongan.');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showToast.error('Terjadi kesalahan saat menghapus data.');
    }
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-purple-600 selection:text-white pb-24">
      {/* ── TOP HEADER (Tema Ungu Khas Kesmavet) ── */}
      <header className="border-b border-purple-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/kesmavet"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Modul Kesmavet"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/kesmavet" className="text-xs font-semibold text-slate-500 hover:text-purple-700 transition-colors truncate">
                  Kesmavet
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-purple-700 whitespace-nowrap">RPH, TPH &amp; TPU</span>
              </div>
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                Manajemen Rumah Potong &amp; Pemotongan Hewan
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {activeTab === 'pemotongan_rumpun' && (
              <>
                <button
                  onClick={exportRumpunToExcel}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download size={15} strokeWidth={2.5} />
                  <span>Export Excel</span>
                </button>

                {(canEdit || isAdmin) && (
                  <button
                    onClick={handleSaveRumpun}
                    disabled={isSavingRumpun}
                    className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    {isSavingRumpun ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    <span>Simpan Perubahan</span>
                  </button>
                )}
              </>
            )}

            {activeTab === 'rekap_komoditas' && (
              <>
                <button
                  onClick={exportKomoditasToExcel}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download size={15} strokeWidth={2.5} />
                  <span>Export Excel</span>
                </button>

                {(canEdit || isAdmin) && (
                  <button
                    onClick={handleSaveKomoditas}
                    disabled={isSavingKomoditas}
                    className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    {isSavingKomoditas ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    <span>Simpan Perubahan</span>
                  </button>
                )}
              </>
            )}

            {activeTab === 'rumah_potong' && (
              <>
                <button
                  onClick={exportRphToExcel}
                  className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download size={15} strokeWidth={2.5} />
                  <span>Export Excel</span>
                </button>

                {canCreate && (
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setFormRph(INITIAL_RPH_FORM);
                      setShowAddModal(true);
                    }}
                    className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    <span>Tambah Rumah Potong</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Opsi Pilihan Tahun & Bulan (Output Per Hari) */}
        <div className="flex flex-wrap items-center justify-center gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-purple-200 dark:border-slate-800 shadow-xs max-w-2xl mx-auto">
          {/* Pilih Tahun */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/70 dark:bg-purple-950/30">
            <Calendar className="text-purple-700 dark:text-purple-400" size={16} />
            <span className="text-xs font-bold text-purple-900 dark:text-purple-200">Pilih Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-black text-purple-800 dark:text-purple-300 focus:outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  Tahun {yr}
                </option>
              ))}
            </select>
          </div>

          {/* Pilih Bulan */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/70 dark:bg-purple-950/30">
            <Calendar className="text-purple-700 dark:text-purple-400" size={16} />
            <span className="text-xs font-bold text-purple-900 dark:text-purple-200">Pilih Bulan:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-xs font-black text-purple-800 dark:text-purple-300 focus:outline-none cursor-pointer"
            >
              {BULAN_NAMES.map((bln, idx) => (
                <option key={bln} value={idx + 1} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {bln}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── MAIN TAB NAVIGATION ── */}
        <div className="flex gap-2 border-b border-purple-200 dark:border-slate-800 pb-px overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab('pemotongan_rumpun')}
            className={`min-h-touch h-11 px-4 sm:px-6 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-t border-x transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'pemotongan_rumpun'
                ? 'bg-white dark:bg-slate-900 border-purple-200 dark:border-slate-800 text-purple-700 dark:text-purple-400 border-b-white dark:border-b-slate-900 translate-y-px shadow-xs'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-purple-50/60 dark:bg-slate-800/60'
            }`}
          >
            <TableIcon size={16} strokeWidth={2.5} />
            <span>1. Input Pemotongan Rumah Potong Hewan</span>
          </button>

          <button
            onClick={() => setActiveTab('rekap_komoditas')}
            className={`min-h-touch h-11 px-4 sm:px-6 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-t border-x transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'rekap_komoditas'
                ? 'bg-white dark:bg-slate-900 border-purple-200 dark:border-slate-800 text-purple-700 dark:text-purple-400 border-b-white dark:border-b-slate-900 translate-y-px shadow-xs'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-purple-50/60 dark:bg-slate-800/60'
            }`}
          >
            <FileSpreadsheet size={16} strokeWidth={2.5} />
            <span>2. Tempat Pemotongan Hewan (TPH)</span>
          </button>

          <button
            onClick={() => setActiveTab('rumah_potong')}
            className={`min-h-touch h-11 px-4 sm:px-6 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-t border-x transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === 'rumah_potong'
                ? 'bg-white dark:bg-slate-900 border-purple-200 dark:border-slate-800 text-purple-700 dark:text-purple-400 border-b-white dark:border-b-slate-900 translate-y-px shadow-xs'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-purple-50/60 dark:bg-slate-800/60'
            }`}
          >
            <Building2 size={16} strokeWidth={2.5} />
            <span>3. Data Rumah Potong</span>
          </button>
        </div>

        {/* TAB 1: RUMPUN SAPI HARIAN */}
        {activeTab === 'pemotongan_rumpun' && (
          <RumpunTableTab
            selectedLokasiKey={selectedLokasiKey}
            setSelectedLokasiKey={setSelectedLokasiKey}
            rumpunData={rumpunData}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            canEdit={canEdit}
            isAdmin={isAdmin}
            rumpunSaveMessage={rumpunSaveMessage}
            handleRumpunCellChange={handleRumpunCellChange}
          />
        )}

        {/* TAB 2: REKAP KOMODITAS HARIAN */}
        {activeTab === 'rekap_komoditas' && (
          <KomoditasTableTab
            selectedLokasiKey={selectedLokasiKey}
            setSelectedLokasiKey={setSelectedLokasiKey}
            komoditasSaveMessage={komoditasSaveMessage}
            isLoadingKomoditas={isLoadingKomoditas}
            komoditasData={komoditasData}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            canEdit={canEdit}
            isAdmin={isAdmin}
            handleKomoditasCellChange={handleKomoditasCellChange}
          />
        )}

        {/* TAB 3: DATA RUMAH POTONG */}
        {activeTab === 'rumah_potong' && (
          <RumahPotongTab
            searchRph={searchRph}
            setSearchRph={setSearchRph}
            filterJenis={filterJenis}
            setFilterJenis={setFilterJenis}
            filterHalal={filterHalal}
            setFilterHalal={setFilterHalal}
            filteredRph={filteredRph}
            isLoadingRph={isLoadingRph}
            isAdmin={isAdmin}
            onEditRph={(item) => {
              setEditingItem(item);
              setFormRph({
                nama_usaha: item.nama_usaha || '',
                jenis: item.jenis || 'TPU',
                pemilik: item.pemilik || '',
                alamat_pemilik: item.alamat_pemilik || '',
                kontak: item.kontak || '',
                lokasi: item.lokasi || '',
                status_perijinan: item.status_perijinan || '',
                sertifikat_halal: item.sertifikat_halal || '',
                sertifikat_nkv: item.sertifikat_nkv || 'belum',
              });
              setShowAddModal(true);
            }}
            onDeleteRph={handleDeleteRph}
          />
        )}
      </main>

      {/* MODAL INPUT / EDIT RPH */}
      <RphFormModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        editingItem={editingItem}
        formRph={formRph}
        setFormRph={setFormRph}
        handleRphSubmit={handleSaveRph}
      />
    </div>
  );
}
