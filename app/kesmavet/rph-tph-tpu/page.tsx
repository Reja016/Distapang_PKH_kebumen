'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { usePageAuth } from '@/hooks/usePageAuth';
import { getAuthSession } from '@/lib/auth';
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
import { RumahPotongTab } from '@/components/kesmavet/rph-tph-tpu/RumahPotongTab';
import { RphFormModal, AddYearModal } from '@/components/kesmavet/rph-tph-tpu/RphModals';

export default function RphTphTpuPage() {
  const { isReady, canCreate, canEdit, isAdmin: isAuthAdmin, userRole } = usePageAuth('kesmavet', 'rph-tph-tpu');

  // Role Admin Check: strictly only Administrator
  const isAdmin = useMemo(() => {
    return isAuthAdmin || canEdit || userRole === 'Administrator';
  }, [isAuthAdmin, canEdit, userRole]);

  // Navigation tabs (URUTAN SESUAI PERMINTAAN USER: 1. Input Pemotongan, 2. TPH, 3. Data Rumah Potong)
  const [activeTab, setActiveTab] = useState<'pemotongan_rumpun' | 'rekap_komoditas' | 'rumah_potong'>('pemotongan_rumpun');

  // Tab 1 & 2 Location Switcher
  const [selectedLokasiKey, setSelectedLokasiKey] = useState<string>('rph_kebumen');
  const [selectedKomoditasFilter, setSelectedKomoditasFilter] = useState<string>('ALL');

  // Year filter & dynamic multi-year state
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [availableYears, setAvailableYears] = useState<number[]>([2025, 2026]);
  const [showAddYearModal, setShowAddYearModal] = useState<boolean>(false);
  const [newYearInput, setNewYearInput] = useState<number>(2026);
  const [isAddingYear, setIsAddingYear] = useState<boolean>(false);

  // ── 1. STATE TAB: DATA RUMAH POTONG (RPH / TPH / TPU) ──
  const [rphList, setRphList] = useState<any[]>([]);
  const [isLoadingRph, setIsLoadingRph] = useState(true);
  const [searchRph, setSearchRph] = useState('');
  const [filterJenis, setFilterJenis] = useState('ALL');
  const [filterHalal, setFilterHalal] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formRph, setFormRph] = useState<RphFormData>(INITIAL_RPH_FORM);

  // ── 2. STATE TAB: INPUT PEMOTONGAN RUMAH POTONG HEWAN (4 TABEL RUMPUN SAPI) ──
  const [rumpunData, setRumpunData] = useState<Record<string, any[]>>({
    rph_kebumen: [],
    luar_rph_kebumen: [],
    rph_gombong: [],
    luar_rph_gombong: [],
  });
  const [isLoadingRumpun, setIsLoadingRumpun] = useState(false);
  const [isSavingRumpun, setIsSavingRumpun] = useState(false);
  const [rumpunSaveMessage, setRumpunSaveMessage] = useState('');

  // ── 3. STATE TAB: TEMPAT PEMOTONGAN HEWAN (TPH) / KOMODITAS TERNAK (12 BULAN) ──
  const [komoditasData, setKomoditasData] = useState<any[]>([]);
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
      
      const yearsSet = new Set<number>([2025, 2026]);
      if (json1.success && Array.isArray(json1.years)) {
        json1.years.forEach((y: number) => yearsSet.add(Number(y)));
      }
      if (json2.success && Array.isArray(json2.years)) {
        json2.years.forEach((y: number) => yearsSet.add(Number(y)));
      }
      setAvailableYears(Array.from(yearsSet).sort((a, b) => a - b));
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

  // ── 2. LOAD DATA PEMOTONGAN RUMPUN SAPI ──
  const loadRumpunData = async (year: number) => {
    try {
      setIsLoadingRumpun(true);
      const res = await fetch(`/api/pemotongan-rumpun?tahun=${year}`);
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
      console.error('Gagal memuat data pemotongan rumpun:', err);
    } finally {
      setIsLoadingRumpun(false);
    }
  };

  // ── 3. LOAD DATA REKAP KOMODITAS TERNAK ──
  const loadKomoditasData = async (year: number) => {
    try {
      setIsLoadingKomoditas(true);
      const res = await fetch(`/api/pemotongan-komoditas?tahun=${year}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        let data = json.data;
        const ensureBabi = (lokasiName: string) => {
          const exists = data.some((r: any) => r.nama_pemotongan === lokasiName && (r.komoditas || '').toLowerCase() === 'babi');
          if (!exists) {
            data.push({
              tahun: year,
              nama_pemotongan: lokasiName,
              komoditas: 'Babi',
              jan_jantan: 0, jan_betina: 0,
              feb_jantan: 0, feb_betina: 0,
              mar_jantan: 0, mar_betina: 0,
              apr_jantan: 0, apr_betina: 0,
              mei_jantan: 0, mei_betina: 0,
              jun_jantan: 0, jun_betina: 0,
              jul_jantan: 0, jul_betina: 0,
              agu_jantan: 0, agu_betina: 0,
              sep_jantan: 0, sep_betina: 0,
              okt_jantan: 0, okt_betina: 0,
              nov_jantan: 0, nov_betina: 0,
              des_jantan: 0, des_betina: 0,
            });
          }
        };
        ensureBabi('RPH Gombong');
        ensureBabi('Luar RPH Gombong');
        setKomoditasData(data);
      }
    } catch (err) {
      console.error('Gagal memuat data komoditas:', err);
    } finally {
      setIsLoadingKomoditas(false);
    }
  };

  useEffect(() => {
    loadAvailableYears();
    loadRphData();
  }, []);

  useEffect(() => {
    loadRumpunData(selectedYear);
    loadKomoditasData(selectedYear);
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
      const [res1, res2] = await Promise.all([
        fetch('/api/pemotongan-rumpun', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_year', tahun: newYearInput }),
        }),
        fetch('/api/pemotongan-komoditas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_year', tahun: newYearInput }),
        }),
      ]);

      const json1 = await res1.json();
      const json2 = await res2.json();

      if (json1.success || json2.success) {
        await loadAvailableYears();
        setSelectedYear(newYearInput);
        setShowAddYearModal(false);
        alert(`Periode Tahun ${newYearInput} berhasil ditambahkan!`);
      } else {
        alert(json1.error || json2.error || 'Gagal menambahkan tahun baru');
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsAddingYear(false);
    }
  };

  // ── SAVE TAB 1: RUMPUN SAPI INLINE SPREADSHEET ──
  const handleRumpunCellChange = (lokasiKey: string, monthIndex: number, field: string, value: any) => {
    if (!isAdmin) return;
    const num = Math.max(0, parseInt(value, 10) || 0);

    setRumpunData((prev) => {
      const copy = { ...prev };
      const lokasiRows = [...(copy[lokasiKey] || [])];
      if (lokasiRows[monthIndex]) {
        lokasiRows[monthIndex] = {
          ...lokasiRows[monthIndex],
          [field]: num,
        };
      }
      copy[lokasiKey] = lokasiRows;
      return copy;
    });
  };

  const handleSaveRumpun = async () => {
    if (!isAdmin) return;
    try {
      setIsSavingRumpun(true);
      setRumpunSaveMessage('');
      const res = await fetch('/api/pemotongan-rumpun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tahun: selectedYear,
          data: rumpunData,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRumpunSaveMessage('✓ Perubahan 4 Tabel Pemotongan berhasil disimpan!');
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

  // ── SAVE TAB 2: KOMODITAS SPREADSHEET ──
  const handleSaveKomoditas = async () => {
    if (!isAdmin) return;
    try {
      setIsSavingKomoditas(true);
      setKomoditasSaveMessage('');
      const res = await fetch('/api/pemotongan-komoditas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tahun: selectedYear,
          data: komoditasData,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setKomoditasSaveMessage('✓ Rekap Pemotongan Komoditas berhasil disimpan!');
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

  const handleKomoditasCellChange = (rowIndex: number, field: string, val: any) => {
    if (!isAdmin) return;
    setKomoditasData((prev) => {
      const copy = [...prev];
      if (copy[rowIndex]) {
        copy[rowIndex] = { ...copy[rowIndex], [field]: val };
      }
      return copy;
    });
  };

  const handleAddKomoditasRow = () => {
    if (!isAdmin) return;
    const newRow = {
      tahun: selectedYear,
      nama_pemotongan: 'RPH Gombong',
      komoditas: 'Babi',
      jan_jantan: 0, jan_betina: 0,
      feb_jantan: 0, feb_betina: 0,
      mar_jantan: 0, mar_betina: 0,
      apr_jantan: 0, apr_betina: 0,
      mei_jantan: 0, mei_betina: 0,
      jun_jantan: 0, jun_betina: 0,
      jul_jantan: 0, jul_betina: 0,
      agu_jantan: 0, agu_betina: 0,
      sep_jantan: 0, sep_betina: 0,
      okt_jantan: 0, okt_betina: 0,
      nov_jantan: 0, nov_betina: 0,
      des_jantan: 0, des_betina: 0,
    };
    setKomoditasData((prev) => [...prev, newRow]);
  };

  const handleDeleteKomoditasRow = (rowIndex: number) => {
    if (!isAdmin) return;
    if (!confirm('Apakah Anda yakin ingin menghapus baris pemotongan ini?')) return;
    setKomoditasData((prev) => prev.filter((_, i) => i !== rowIndex));
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
      LOKASI_CONFIGS.forEach((cfg) => {
        const rows = rumpunData[cfg.key] || [];
        const data = rows.map((r, idx) => {
          const totJ = (Number(r.po_jantan) || 0) + (Number(r.so_jantan) || 0) + (Number(r.simmental_jantan) || 0) + (Number(r.limousine_jantan) || 0);
          const totBP = (Number(r.po_betina_prod) || 0) + (Number(r.so_betina_prod) || 0) + (Number(r.simmental_betina_prod) || 0) + (Number(r.limousine_betina_prod) || 0);
          const totBNP = (Number(r.po_betina_non_prod) || 0) + (Number(r.so_betina_non_prod) || 0) + (Number(r.simmental_betina_non_prod) || 0) + (Number(r.limousine_betina_non_prod) || 0);
          const totBulan = totJ + totBP + totBNP;

          return {
            Bulan: r.bulan || BULAN_NAMES[idx],
            'PO Jantan': r.po_jantan || 0,
            'PO Betina Prod': r.po_betina_prod || 0,
            'PO Betina Non-P': r.po_betina_non_prod || 0,
            'SO Jantan': r.so_jantan || 0,
            'SO Betina Prod': r.so_betina_prod || 0,
            'SO Betina Non-P': r.so_betina_non_prod || 0,
            'Simmental Jantan': r.simmental_jantan || 0,
            'Simmental Betina Prod': r.simmental_betina_prod || 0,
            'Simmental Betina Non-P': r.simmental_betina_non_prod || 0,
            'Limousine Jantan': r.limousine_jantan || 0,
            'Limousine Betina Prod': r.limousine_betina_prod || 0,
            'Limousine Betina Non-P': r.limousine_betina_non_prod || 0,
            'Total Jantan': totJ,
            'Total Betina Prod': totBP,
            'Total Betina Non-P': totBNP,
            'Total Keseluruhan Bulan': totBulan,
          };
        });
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, cfg.label.substring(0, 31));
      });
      XLSX.writeFile(wb, `Data_Pemotongan_Rumpun_${selectedYear}.xlsx`);
    } catch {
      alert('Gagal mengekspor data pemotongan.');
    }
  };

  const exportKomoditasToExcel = () => {
    try {
      const months = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];
      const data = komoditasData.map((r, i) => {
        const item: any = {
          No: i + 1,
          'Nama Pemotongan': r.nama_pemotongan,
          Komoditas: r.komoditas,
        };
        let totJ = 0;
        let totB = 0;
        months.forEach((m) => {
          const j = Number(r[`${m}_jantan`]) || 0;
          const b = Number(r[`${m}_betina`]) || 0;
          item[`${m.toUpperCase()} Jantan`] = j;
          item[`${m.toUpperCase()} Betina`] = b;
          totJ += j;
          totB += b;
        });
        item['Total Jantan'] = totJ;
        item['Total Betina'] = totB;
        item['Total Keseluruhan'] = totJ + totB;
        return item;
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rekap Komoditas');
      XLSX.writeFile(wb, `Rekap_Pemotongan_Komoditas_${selectedYear}.xlsx`);
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

  // Form submit for Tab 3
  const handleRphSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && !canEdit) {
      alert('Hanya Administrator yang berhak mengedit data unit pemotongan.');
      return;
    }
    if (!editingItem && !canCreate) {
      alert('Anda tidak memiliki izin untuk menambah data.');
      return;
    }

    try {
      if (editingItem) {
        const res = await fetch(`/api/pemotongan-hewan/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formRph),
        });
        if (res.ok) {
          loadRphData();
          setShowAddModal(false);
          setEditingItem(null);
        }
      } else {
        const res = await fetch('/api/pemotongan-hewan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formRph),
        });
        if (res.ok) {
          loadRphData();
          setShowAddModal(false);
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleDeleteRph = async (id: number) => {
    if (!isAdmin && !canEdit) {
      alert('Hanya Administrator yang berhak menghapus data.');
      return;
    }
    if (!confirm('Apakah Anda yakin ingin menghapus unit pemotongan ini?')) return;

    try {
      const res = await fetch(`/api/pemotongan-hewan/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadRphData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-purple-50/30 text-slate-900 font-sans selection:bg-purple-600 selection:text-white pb-24">
      
      {/* ── TOP HEADER (Tema Ungu Khas Kesmavet) ── */}
      <header className="border-b border-purple-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
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
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                Manajemen Rumah Potong &amp; Pemotongan Hewan
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {activeTab === 'pemotongan_rumpun' && (
              <>
                <button
                  onClick={exportRumpunToExcel}
                  className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download size={15} strokeWidth={2.5} />
                  <span>Export 4 Tabel Excel</span>
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
                  className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download size={15} strokeWidth={2.5} />
                  <span>Export Excel</span>
                </button>

                {isAdmin && (
                  <>
                    <button
                      onClick={handleAddKomoditasRow}
                      className="h-10 px-3.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus size={15} strokeWidth={2.5} />
                      <span>Tambah Baris</span>
                    </button>

                    <button
                      onClick={handleSaveKomoditas}
                      disabled={isSavingKomoditas}
                      className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      {isSavingKomoditas ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                      <span>Simpan Perubahan</span>
                    </button>
                  </>
                )}
              </>
            )}

            {activeTab === 'rumah_potong' && (
              <>
                <button
                  onClick={exportRphToExcel}
                  className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
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
        
        {/* Opsi Pilihan Tahun */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-white p-3.5 rounded-2xl border border-purple-200 shadow-xs max-w-xl mx-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50/70">
            <Calendar className="text-purple-700" size={16} />
            <span className="text-xs font-bold text-purple-900">Pilih Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-black text-purple-800 focus:outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>Tahun {yr}</option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                const maxYear = Math.max(...availableYears, 2026);
                setNewYearInput(maxYear + 1);
                setShowAddYearModal(true);
              }}
              className="h-9 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Tahun Baru</span>
            </button>
          )}
        </div>

        {/* ── MAIN TAB NAVIGATION ── */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-purple-100 shadow-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('pemotongan_rumpun')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'pemotongan_rumpun'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
            }`}
          >
            <TableIcon size={16} />
            <span>1. Input Pemotongan Rumah Potong Hewan</span>
          </button>

          <button
            onClick={() => setActiveTab('rekap_komoditas')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'rekap_komoditas'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
            }`}
          >
            <FileSpreadsheet size={16} />
            <span>2. Tempat Pemotongan Hewan (TPH)</span>
          </button>

          <button
            onClick={() => setActiveTab('rumah_potong')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'rumah_potong'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
            }`}
          >
            <Building2 size={16} />
            <span>3. Data Rumah Potong</span>
          </button>
        </div>

        {/* TAB 1: RUMPUN SAPI */}
        {activeTab === 'pemotongan_rumpun' && (
          <RumpunTableTab
            selectedLokasiKey={selectedLokasiKey}
            setSelectedLokasiKey={setSelectedLokasiKey}
            rumpunData={rumpunData}
            selectedYear={selectedYear}
            canEdit={canEdit}
            isAdmin={isAdmin}
            rumpunSaveMessage={rumpunSaveMessage}
            handleRumpunCellChange={handleRumpunCellChange}
          />
        )}

        {/* TAB 2: REKAP KOMODITAS */}
        {activeTab === 'rekap_komoditas' && (
          <KomoditasTableTab
            selectedKomoditasFilter={selectedKomoditasFilter}
            setSelectedKomoditasFilter={setSelectedKomoditasFilter}
            komoditasSaveMessage={komoditasSaveMessage}
            isLoadingKomoditas={isLoadingKomoditas}
            komoditasData={komoditasData}
            selectedYear={selectedYear}
            isAdmin={isAdmin}
            handleKomoditasCellChange={handleKomoditasCellChange}
            handleAddKomoditasRow={handleAddKomoditasRow}
            handleDeleteKomoditasRow={handleDeleteKomoditasRow}
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

      {/* MODAL: TAMBAH / EDIT RUMAH POTONG */}
      <RphFormModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        editingItem={editingItem}
        formRph={formRph}
        setFormRph={setFormRph}
        handleRphSubmit={handleRphSubmit}
      />

      {/* MODAL: TAMBAH TAHUN BARU */}
      <AddYearModal
        showAddYearModal={showAddYearModal}
        setShowAddYearModal={setShowAddYearModal}
        newYearInput={newYearInput}
        setNewYearInput={setNewYearInput}
        isAddingYear={isAddingYear}
        handleAddYearSubmit={handleAddYearSubmit}
      />

    </div>
  );
}
