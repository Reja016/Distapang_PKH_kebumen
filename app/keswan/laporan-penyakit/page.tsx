'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePageAuth } from '@/hooks/usePageAuth';
import { getAuthSession } from '@/lib/auth';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Download,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Building2,
  Save,
  Loader2,
  Calendar,
  Map as MapIcon,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  Printer,
  Filter,
  Activity,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import {
  KECAMATAN_MAP_ITEMS,
  KEBUMEN_MAP_VIEWBOX,
  PUSKESWAN_ZONES,
  DIAGNOSA_LIST,
  DIAGNOSA_COLOR_MAP,
  PUSKESWAN_HOST_BY_KECAMATAN,
  getZoneByKecamatanId,
} from '@/lib/penyakitData';

export default function LaporanPenyakitPage() {
  const { isReady, canEdit, userRole } = usePageAuth('keswan', 'laporan-penyakit');

  // Role Admin Check
  const isAdmin = useMemo(() => {
    const session = getAuthSession();
    const roleFromSession = (session?.role || '').toLowerCase();
    const roleFromHook = (userRole || '').toLowerCase();
    return (
      roleFromSession.includes('admin') ||
      roleFromHook.includes('admin') ||
      session?.role === 'Administrator' ||
      userRole === 'Administrator' ||
      canEdit
    );
  }, [userRole, canEdit]);

  // View state: 'map' (Peta Spasial) or 'table' (Rekapitulasi CRUD)
  const [activeView, setActiveView] = useState<'map' | 'table'>('map');

  // Year filter & dynamic multi-year state
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [availableYears, setAvailableYears] = useState<number[]>([2025, 2026]);
  const [showAddYearModal, setShowAddYearModal] = useState<boolean>(false);
  const [newYearInput, setNewYearInput] = useState<number>(2027);
  const [isAddingYear, setIsAddingYear] = useState<boolean>(false);

  // Data Kasus Penyakit dari Database
  const [casesList, setCasesList] = useState<any[]>([]);
  const [kecAggregates, setKecAggregates] = useState<Record<string, any>>({});
  const [totalKasus, setTotalKasus] = useState<number>(0);
  const [isLoadingCases, setIsLoadingCases] = useState<boolean>(true);

  // State Peta: Terpilih & Hover
  const [selectedKecamatan, setSelectedKecamatan] = useState<any | null>(null);
  const [hoveredKecamatan, setHoveredKecamatan] = useState<any | null>(null);

  // Table Filter & Search
  const [searchTable, setSearchTable] = useState<string>('');
  const [filterPuskeswan, setFilterPuskeswan] = useState<string>('ALL');
  const [filterDiagnosa, setFilterDiagnosa] = useState<string>('ALL');

  // Modal Tambah / Edit Kasus
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formValues, setFormValues] = useState({
    kecamatan_id: 'k_alian',
    kecamatan_nama: 'Alian',
    puskeswan_id: 'alian',
    diagnosa_nama: 'Scabies',
    jumlah_kasus: 1,
    keterangan: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ── LOAD AVAILABLE YEARS ──
  const loadAvailableYears = async () => {
    try {
      const res = await fetch('/api/laporan-penyakit?action=years');
      const json = await res.json();
      if (json.success && Array.isArray(json.years)) {
        setAvailableYears(json.years);
      }
    } catch (err) {
      console.warn('Gagal memuat tahun laporan penyakit:', err);
    }
  };

  // ── LOAD CASES FOR SELECTED YEAR ──
  const loadCasesData = async (year: number) => {
    try {
      setIsLoadingCases(true);
      const res = await fetch(`/api/laporan-penyakit?tahun=${year}`);
      const json = await res.json();
      if (json.success) {
        setCasesList(json.data || []);
        setKecAggregates(json.kecAggregates || {});
        setTotalKasus(json.totalKasus || 0);
      }
    } catch (err) {
      console.error('Gagal memuat data kasus:', err);
    } finally {
      setIsLoadingCases(false);
    }
  };

  useEffect(() => {
    loadAvailableYears();
    loadCasesData(selectedYear);
  }, []);

  useEffect(() => {
    loadCasesData(selectedYear);
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
      const res = await fetch('/api/laporan-penyakit', {
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

  // Submit Tambah / Edit Kasus
  const handleCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin && !canEdit) return;

    try {
      setIsSubmitting(true);
      const kec = KECAMATAN_MAP_ITEMS.find((k) => k.id === formValues.kecamatan_id);
      const zone = getZoneByKecamatanId(formValues.kecamatan_id);

      const payload = {
        tahun: selectedYear,
        kecamatan_id: formValues.kecamatan_id,
        kecamatan_nama: kec ? kec.nama : formValues.kecamatan_nama,
        puskeswan_id: zone ? zone.id : formValues.puskeswan_id,
        diagnosa_nama: formValues.diagnosa_nama,
        jumlah_kasus: Number(formValues.jumlah_kasus) || 0,
        keterangan: formValues.keterangan || null,
      };

      if (editingItem) {
        const res = await fetch(`/api/laporan-penyakit/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          setShowAddModal(false);
          setEditingItem(null);
          loadCasesData(selectedYear);
        } else {
          alert('Gagal memperbarui: ' + json.error);
        }
      } else {
        const res = await fetch('/api/laporan-penyakit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          setShowAddModal(false);
          loadCasesData(selectedYear);
        } else {
          alert('Gagal menambahkan: ' + json.error);
        }
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Case
  const handleDeleteCase = async (id: number) => {
    if (!isAdmin) return;
    if (!confirm('Apakah Anda yakin ingin menghapus data kasus penyakit ini?')) return;

    try {
      const res = await fetch(`/api/laporan-penyakit/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadCasesData(selectedYear);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Filtered Table Data
  const filteredCases = useMemo(() => {
    return casesList.filter((c) => {
      const q = searchTable.toLowerCase();
      const matchSearch =
        (c.kecamatan_nama || '').toLowerCase().includes(q) ||
        (c.diagnosa_nama || '').toLowerCase().includes(q) ||
        (c.keterangan || '').toLowerCase().includes(q);

      const zone = getZoneByKecamatanId(c.kecamatan_id);
      const matchPuskeswan = filterPuskeswan === 'ALL' || zone.id === filterPuskeswan || c.puskeswan_id === filterPuskeswan;
      const matchDiagnosa = filterDiagnosa === 'ALL' || c.diagnosa_nama === filterDiagnosa;

      return matchSearch && matchPuskeswan && matchDiagnosa;
    });
  }, [casesList, searchTable, filterPuskeswan, filterDiagnosa]);

  // Diagnosa & Kecamatan Tertinggi
  const topDiagnosa = useMemo(() => {
    const counts: Record<string, number> = {};
    casesList.forEach((c) => {
      counts[c.diagnosa_nama] = (counts[c.diagnosa_nama] || 0) + (c.jumlah_kasus || 1);
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { nama: sorted[0][0], count: sorted[0][1] } : { nama: '-', count: 0 };
  }, [casesList]);

  const topKecamatan = useMemo(() => {
    const counts: Record<string, number> = {};
    casesList.forEach((c) => {
      counts[c.kecamatan_nama] = (counts[c.kecamatan_nama] || 0) + (c.jumlah_kasus || 1);
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { nama: sorted[0][0], count: sorted[0][1] } : { nama: '-', count: 0 };
  }, [casesList]);

  // Export to Excel
  const handleExportExcel = () => {
    try {
      const wsData = casesList.map((c, i) => {
        const zone = getZoneByKecamatanId(c.kecamatan_id);
        return {
          No: i + 1,
          Tahun: selectedYear,
          Kecamatan: c.kecamatan_nama,
          'Wilayah Puskeswan': zone ? zone.nama : c.puskeswan_id,
          'Diagnosa Penyakit': c.diagnosa_nama,
          'Jumlah Kasus (Ekor)': c.jumlah_kasus,
          Keterangan: c.keterangan || '-',
        };
      });
      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Kasus_Penyakit_${selectedYear}`);
      XLSX.writeFile(wb, `Laporan_Penyakit_Hewan_Kebumen_${selectedYear}.xlsx`);
    } catch {
      alert('Gagal mengekspor file Excel.');
    }
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-blue-50/20 text-slate-900 font-sans selection:bg-blue-600 selection:text-white pb-24">
      
      {/* ── TOP HEADER (Tema Biru Khas Keswan) ── */}
      <header className="border-b border-blue-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/keswan"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Modul Keswan"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/keswan" className="text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors truncate">
                  Kesehatan Hewan (Keswan)
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-blue-700 whitespace-nowrap">Laporan Penyakit Hewan</span>
              </div>
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                Peta &amp; Rekapitulasi Kasus Penyakit Hewan
              </h1>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Print PDF Button */}
            <button
              onClick={() => window.print()}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer size={15} />
              <span>Cetak / PDF</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={handleExportExcel}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Download size={15} />
              <span>Export Excel</span>
            </button>

            {/* Tambah Kasus Penyakit (Admin / Operator) */}
            {(isAdmin || canEdit) && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setFormValues({
                    kecamatan_id: 'k_alian',
                    kecamatan_nama: 'Alian',
                    puskeswan_id: 'alian',
                    diagnosa_nama: 'Scabies',
                    jumlah_kasus: 1,
                    keterangan: '',
                  });
                  setShowAddModal(true);
                }}
                className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Tambah Kasus</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ── WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* ═══════════════════════════════════════════════════════════════
            Opsi Pilihan Tahun di Tengah di Atas Konten/Peta (Sesuai Permintaan)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-white p-3.5 rounded-2xl border border-blue-200 shadow-xs max-w-xl mx-auto print:hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70">
            <Calendar className="text-blue-700" size={16} />
            <span className="text-xs font-bold text-blue-900">Pilih Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-black text-blue-800 focus:outline-none cursor-pointer"
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
              className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>+ Tambah Tahun Baru</span>
            </button>
          )}
        </div>

        {/* KPI Metrik Ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 print:hidden">
          <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Activity size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">Total Kasus Penyakit</p>
              <p className="text-xl font-black text-slate-900">{totalKasus.toLocaleString('id-ID')} <span className="text-xs text-slate-500 font-semibold">Kasus</span></p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">Diagnosa Tertinggi</p>
              <p className="text-base font-extrabold text-slate-900 truncate">
                {topDiagnosa.nama} <span className="text-xs text-rose-600 font-bold">({topDiagnosa.count})</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <MapPin size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">Wilayah Kasus Terbanyak</p>
              <p className="text-base font-extrabold text-slate-900 truncate">
                Kec. {topKecamatan.nama} <span className="text-xs text-amber-600 font-bold">({topKecamatan.count})</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">Status Hak Akses</p>
              <p className="text-xs font-black text-slate-900 flex items-center gap-1.5 truncate">
                <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-blue-600' : 'bg-emerald-500'}`} />
                <span>{isAdmin ? 'Administrator (Full CRUD)' : canEdit ? 'Operator (Bisa Edit)' : 'Pengunjung (View-Only)'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── VIEW SWITCHER TABS (Peta vs Tabel) ── */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-blue-100 shadow-xs print:hidden">
          <button
            onClick={() => setActiveView('map')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === 'map'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            <MapIcon size={16} />
            <span>Peta Sebaran Spasial &amp; Legenda Diagnosa</span>
          </button>

          <button
            onClick={() => setActiveView('table')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === 'table'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            <FileSpreadsheet size={16} />
            <span>Tabel Rekapitulasi Data Kasus ({filteredCases.length} Baris)</span>
          </button>
        </div>

        {/* ───────────────────────────────────────────────────────────
            VIEW 1: PETA SPASIAL & LEGENDA WARNA
        ─────────────────────────────────────────────────────────── */}
        {activeView === 'map' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
            
            {/* Header Judul Peta */}
            <div className="text-center pb-4 border-b border-slate-100">
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
                PETA SEBARAN PENYAKIT HEWAN
              </h2>
              <p className="text-lg sm:text-2xl font-extrabold text-blue-700 tracking-tight uppercase">
                DI KABUPATEN KEBUMEN TAHUN {selectedYear}
              </p>
            </div>

            {/* Layout Grid: Peta Sebaran Diperbesar & Keterangan Diagnosa */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* ── LEFT & CENTER: PETA INTERAKTIF SVG DENGAN IKON PUSKESWAN DIBESARKAN ── */}
              <div className="lg:col-span-8 bg-slate-50/70 rounded-3xl border border-slate-200/90 p-4 sm:p-6 relative overflow-hidden shadow-inner">
                
                {/* Reset button when kecamatan is selected */}
                {selectedKecamatan && (
                  <div className="absolute top-6 right-6 z-20">
                    <button
                      onClick={() => setSelectedKecamatan(null)}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 shadow-md text-xs font-extrabold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <X size={14} />
                      <span>Reset Fokus</span>
                    </button>
                  </div>
                )}

                {/* SVG PETA KEBUMEN (IKON PUSKESWAN DIPERBESAR & TITIK DIAGNOSA DIHAPUS SESUAI PERMINTAAN) */}
                <div className="relative w-full aspect-[16/11] min-h-[520px] sm:min-h-[640px] flex items-center justify-center">
                  <svg
                    viewBox={KEBUMEN_MAP_VIEWBOX}
                    className="w-full h-full select-none"
                    style={{ filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.08))' }}
                  >
                    <defs>
                      <filter id="boxShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000000" floodOpacity="0.25" />
                      </filter>
                    </defs>

                    {/* Area Background Reset */}
                    <rect
                      x="-6000"
                      y="1000"
                      width="35000"
                      height="28000"
                      fill="transparent"
                      onClick={() => setSelectedKecamatan(null)}
                    />

                    {/* 26 Poligon Kecamatan */}
                    {KECAMATAN_MAP_ITEMS.map((kec) => {
                      const zone = getZoneByKecamatanId(kec.id);
                      const isSelected = selectedKecamatan?.id === kec.id;
                      const isHovered = hoveredKecamatan?.id === kec.id;

                      const commonProps = {
                        fill: zone.colorHex,
                        stroke: isSelected ? '#1E1B4B' : isHovered ? '#FFFFFF' : '#FFFFFF',
                        strokeWidth: isSelected ? 90 : isHovered ? 60 : 40,
                        strokeLinejoin: 'round' as const,
                        strokeLinecap: 'round' as const,
                        className: 'cursor-pointer transition-all duration-150 opacity-95 hover:opacity-100',
                        onMouseEnter: () => setHoveredKecamatan(kec),
                        onMouseLeave: () => setHoveredKecamatan(null),
                        onClick: (e: React.MouseEvent) => {
                          e.stopPropagation();
                          setSelectedKecamatan(kec);
                        },
                      };

                      if (kec.tagName === 'polygon' && kec.points) {
                        return <polygon key={kec.id} points={kec.points} {...commonProps} />;
                      } else if (kec.d) {
                        return <path key={kec.id} d={kec.d} {...commonProps} />;
                      }
                      return null;
                    })}

                    {/* Label Nama Kecamatan & Simbol Puskeswan Diperbesar (Titik Diagnosa Dihapus) */}
                    {KECAMATAN_MAP_ITEMS.map((kec) => {
                      const rawId = kec.id.toLowerCase();
                      const cleanId = rawId.replace('k_', '');

                      // Cek apakah kecamatan ini adalah lokasi kantor Puskeswan
                      const hostPuskeswanKey = PUSKESWAN_HOST_BY_KECAMATAN[rawId] || PUSKESWAN_HOST_BY_KECAMATAN[cleanId];
                      const puskeswanHostZone = hostPuskeswanKey ? PUSKESWAN_ZONES[hostPuskeswanKey] : null;

                      return (
                        <g
                          key={`label-${kec.id}`}
                          transform={`translate(${kec.centerX}, ${kec.centerY})`}
                          className="cursor-pointer pointer-events-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedKecamatan(kec);
                          }}
                          onMouseEnter={() => setHoveredKecamatan(kec)}
                          onMouseLeave={() => setHoveredKecamatan(null)}
                        >
                          {/* 1. Label Nama Kecamatan dengan Outline Tebal */}
                          <text
                            x="0"
                            y={puskeswanHostZone ? "-380" : "0"}
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize="380"
                            fontWeight="900"
                            fontFamily="system-ui, -apple-system, sans-serif"
                            letterSpacing="6"
                            style={{ paintOrder: 'stroke', stroke: '#0F172A', strokeWidth: '80px' }}
                          >
                            {kec.nama}
                          </text>

                          {/* 2. Simbol Ikon Puskeswan Diperbesar (Besar & Jelas) */}
                          {puskeswanHostZone && (
                            <g transform="translate(0, 100)" className="pointer-events-none select-none">
                              {/* Circle Badge Besar */}
                              <circle
                                cx="0"
                                cy="0"
                                r="360"
                                fill={puskeswanHostZone.colorHex}
                                stroke="#FFFFFF"
                                strokeWidth="50"
                                filter="url(#boxShadow)"
                              />
                              {/* Simbol Gedung / Puskeswan Putih Bersih di Tengah Diperbesar */}
                              <g transform="scale(1.45) translate(0, -5)">
                                <path
                                  d="M-110 -15 L0 -125 L110 -15 L110 105 L-110 105 Z"
                                  fill="#FFFFFF"
                                />
                                <rect x="-16" y="-10" width="32" height="85" fill={puskeswanHostZone.colorHex} rx="5" />
                                <rect x="-42" y="16" width="84" height="32" fill={puskeswanHostZone.colorHex} rx="5" />
                              </g>
                            </g>
                          )}
                        </g>
                      );
                    })}

                  </svg>
                </div>

                {/* Detail Box Saat Kecamatan Dipilih (Angka Kasus Dihapus, Nama Diagnosa Tetap Tampil) */}
                {selectedKecamatan && (
                  <div className="mt-4 p-4.5 bg-white rounded-2xl border border-blue-200 shadow-xs space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: getZoneByKecamatanId(selectedKecamatan.id).colorHex }} />
                        <span>Kecamatan {selectedKecamatan.nama}</span>
                      </h4>
                      <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                        Wilayah {getZoneByKecamatanId(selectedKecamatan.id).nama}
                      </span>
                    </div>

                    {/* Rincian Nama Diagnosa Penyakit (Jumlah Angka Dihapus Sesuai Permintaan) */}
                    <div className="pt-2">
                      <p className="text-xs font-bold text-slate-600 mb-2">Diagnosa Penyakit Terlaporkan:</p>
                      {Object.keys((kecAggregates[selectedKecamatan.id.toLowerCase()] || kecAggregates[selectedKecamatan.id.toLowerCase().replace('k_', '')])?.cases || {}).length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Belum ada laporan penyakit pada tahun {selectedYear}.</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {Object.keys((kecAggregates[selectedKecamatan.id.toLowerCase()] || kecAggregates[selectedKecamatan.id.toLowerCase().replace('k_', '')]).cases).map((diag) => (
                            <span
                              key={diag}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 bg-slate-50 text-slate-800 shadow-2xs"
                            >
                              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: DIAGNOSA_COLOR_MAP[diag] || '#64748B' }} />
                              <span>{diag}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── RIGHT: KETERANGAN DIAGNOSA PENYAKIT & ZONASI PUSKESWAN ── */}
              <div className="lg:col-span-4 bg-slate-50/80 rounded-3xl border border-slate-200 p-5 space-y-5">
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-wider uppercase border-b border-slate-200 pb-2">
                    KETERANGAN DIAGNOSA
                  </h3>
                  <p className="text-xs font-extrabold text-blue-900 mt-2">Daftar Diagnosa Penyakit Hewan</p>
                </div>

                {/* Grid Diagnosa Dots */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-2 max-h-[360px] overflow-y-auto pr-1 text-[11px] font-semibold text-slate-800">
                  {DIAGNOSA_LIST.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 py-0.5 truncate" title={d.nama}>
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border border-black/10 shadow-2xs"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="truncate">{d.nama}</span>
                    </div>
                  ))}
                </div>

                {/* Zonasi Puskeswan */}
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    8 Wilayah Kerja Puskeswan
                  </h4>
                  <div className="space-y-1.5">
                    {Object.values(PUSKESWAN_ZONES).map((zone) => (
                      <div key={zone.id} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
                        <div className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: zone.colorHex }} />
                          <span className="font-bold text-slate-900">{zone.nama}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">Kantor: Kec. {zone.nama.replace('Puskeswan ', '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ───────────────────────────────────────────────────────────
            VIEW 2: TABEL REKAPITULASI KASUS CRUD (EXISTING)
        ─────────────────────────────────────────────────────────── */}
        {activeView === 'table' && (
          <div className="space-y-4">
            
            {/* Toolbar Filter & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={searchTable}
                    onChange={(e) => setSearchTable(e.target.value)}
                    placeholder="Cari kecamatan, diagnosa, atau keterangan..."
                    className="w-full h-10 pl-10 pr-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Filter Puskeswan */}
                <select
                  value={filterPuskeswan}
                  onChange={(e) => setFilterPuskeswan(e.target.value)}
                  className="h-10 px-3.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  <option value="ALL">Semua Puskeswan</option>
                  {Object.values(PUSKESWAN_ZONES).map((z) => (
                    <option key={z.id} value={z.id}>{z.nama}</option>
                  ))}
                </select>

                {/* Filter Diagnosa */}
                <select
                  value={filterDiagnosa}
                  onChange={(e) => setFilterDiagnosa(e.target.value)}
                  className="h-10 px-3.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:border-blue-600"
                >
                  <option value="ALL">Semua Diagnosa</option>
                  {DIAGNOSA_LIST.map((d) => (
                    <option key={d.nama} value={d.nama}>{d.nama}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table CRUD */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-blue-900 text-white font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3.5 w-12 text-center">NO</th>
                      <th className="p-3.5">KECAMATAN</th>
                      <th className="p-3.5">WILAYAH PUSKESWAN</th>
                      <th className="p-3.5">DIAGNOSA PENYAKIT</th>
                      <th className="p-3.5 text-center">JUMLAH KASUS</th>
                      <th className="p-3.5">KETERANGAN</th>
                      {(isAdmin || canEdit) && <th className="p-3.5 text-center w-24">AKSI</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {isLoadingCases ? (
                      <tr>
                        <td colSpan={(isAdmin || canEdit) ? 7 : 6} className="p-8 text-center text-slate-400">
                          <Loader2 className="animate-spin inline-block mr-2 text-blue-600" size={16} />
                          Memuat data laporan penyakit...
                        </td>
                      </tr>
                    ) : filteredCases.length === 0 ? (
                      <tr>
                        <td colSpan={(isAdmin || canEdit) ? 7 : 6} className="p-8 text-center text-slate-400">
                          Belum ada data kasus penyakit yang sesuai.
                        </td>
                      </tr>
                    ) : (
                      filteredCases.map((row, idx) => {
                        const zone = getZoneByKecamatanId(row.kecamatan_id);
                        return (
                          <tr key={row.id || idx} className="hover:bg-blue-50/30 transition-colors">
                            <td className="p-3.5 text-center font-semibold text-slate-400">{idx + 1}</td>
                            <td className="p-3.5 font-bold text-slate-900">{row.kecamatan_nama}</td>
                            <td className="p-3.5">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                {zone ? zone.nama : row.puskeswan_id}
                              </span>
                            </td>
                            <td className="p-3.5 font-extrabold flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{ backgroundColor: DIAGNOSA_COLOR_MAP[row.diagnosa_nama] || '#64748B' }}
                              />
                              <span>{row.diagnosa_nama}</span>
                            </td>
                            <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                              {row.jumlah_kasus || 1} Ekor
                            </td>
                            <td className="p-3.5 text-slate-500 max-w-xs truncate">
                              {row.keterangan || '-'}
                            </td>
                            {(isAdmin || canEdit) && (
                              <td className="p-3.5 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setEditingItem(row);
                                      setFormValues({
                                        kecamatan_id: row.kecamatan_id,
                                        kecamatan_nama: row.kecamatan_nama,
                                        puskeswan_id: row.puskeswan_id,
                                        diagnosa_nama: row.diagnosa_nama,
                                        jumlah_kasus: row.jumlah_kasus || 1,
                                        keterangan: row.keterangan || '',
                                      });
                                      setShowAddModal(true);
                                    }}
                                    className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center justify-center transition-colors cursor-pointer"
                                    title="Edit"
                                  >
                                    <Edit2 size={13} />
                                  </button>
                                  {isAdmin && (
                                    <button
                                      onClick={() => handleDeleteCase(row.id)}
                                      className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                                      title="Hapus"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ───────────────────────────────────────────────────────────
          MODAL: TAMBAH / EDIT KASUS PENYAKIT
      ─────────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute top-5 right-5 cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingItem ? 'Edit Laporan Kasus Penyakit' : 'Tambah Laporan Kasus Penyakit Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Input data kasus diagnosa penyakit hewan per kecamatan tahun {selectedYear}.
            </p>

            <form onSubmit={handleCaseSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Kecamatan <span className="text-red-500">*</span></label>
                  <select
                    value={formValues.kecamatan_id}
                    onChange={(e) => {
                      const kec = KECAMATAN_MAP_ITEMS.find((k) => k.id === e.target.value);
                      const zone = getZoneByKecamatanId(e.target.value);
                      setFormValues({
                        ...formValues,
                        kecamatan_id: e.target.value,
                        kecamatan_nama: kec ? kec.nama : e.target.value,
                        puskeswan_id: zone ? zone.id : formValues.puskeswan_id,
                      });
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    {KECAMATAN_MAP_ITEMS.map((k) => (
                      <option key={k.id} value={k.id}>{k.nama}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-700">Diagnosa Penyakit <span className="text-red-500">*</span></label>
                  <select
                    value={formValues.diagnosa_nama}
                    onChange={(e) => setFormValues({ ...formValues, diagnosa_nama: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    {DIAGNOSA_LIST.map((d) => (
                      <option key={d.nama} value={d.nama}>{d.nama}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700">Jumlah Kasus (Ekor) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formValues.jumlah_kasus}
                  onChange={(e) => setFormValues({ ...formValues, jumlah_kasus: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-600 text-sm"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700">Keterangan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan penanganan / lokasi desa..."
                  value={formValues.keterangan}
                  onChange={(e) => setFormValues({ ...formValues, keterangan: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-blue-600 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Simpan Laporan Kasus</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          MODAL: TAMBAH TAHUN BARU
      ─────────────────────────────────────────────────────────── */}
      {showAddYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAddYearModal(false)}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute top-5 right-5 cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Tambah Periode Tahun Baru</h3>
            <p className="text-xs text-slate-500 mb-5">
              Buat periode laporan kasus penyakit untuk tahun berikutnya.
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
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-blue-600 text-sm"
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
                  className="flex-1 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  {isAddingYear ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>{isAddingYear ? 'Menambahkan...' : 'Buat Tahun Baru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
