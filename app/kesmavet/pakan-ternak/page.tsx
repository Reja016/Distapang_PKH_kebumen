'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { usePageAuth } from '@/hooks/usePageAuth';
import {
  ArrowLeft,
  Search,
  Download,
  Edit2,
  Wheat,
  Check,
  AlertCircle,
  X,
  Compass,
  Sparkles,
  Info,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  Map as MapIcon,
  Table as TableIcon,
  ChevronUp,
} from 'lucide-react';
import {
  KapasitasPakanKecamatan,
  INITIAL_KAPASITAS_PAKAN,
  KEBUMEN_MAP_VIEWBOX,
  getKapasitasPakanColor,
  LEGENDA_KAPASITAS_PAKAN,
} from '@/lib/pakanData';

export default function PakanTernakPage() {
  const { isReady, canEdit } = usePageAuth('kesmavet', 'pakan-ternak');

  // State Mobile Tab: 'map' (Peta Visual) atau 'table' (Tabel Data)
  const [mobileTab, setMobileTab] = useState<'map' | 'table'>('map');

  // State Data Kapasitas Pakan 26 Kecamatan
  const [dataPakan, setDataPakan] = useState<KapasitasPakanKecamatan[]>(INITIAL_KAPASITAS_PAKAN);
  const [selectedKecamatan, setSelectedKecamatan] = useState<KapasitasPakanKecamatan | null>(null);
  const [hoveredKecamatan, setHoveredKecamatan] = useState<KapasitasPakanKecamatan | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Modal Edit / Tambah Data
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<KapasitasPakanKecamatan | null>(null);
  const [formValues, setFormValues] = useState<{
    potensi_pakan_kg: number;
    kapasitas_tampung_ekor: number;
    jumlah_ternak_st: number;
    keterangan: string;
  }>({
    potensi_pakan_kg: 0,
    kapasitas_tampung_ekor: 0,
    jumlah_ternak_st: 0,
    keterangan: '',
  });

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // Muat Data dari API
  const loadData = async () => {
    try {
      const res = await fetch('/api/pakan-ternak');
      const result = await res.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        setDataPakan(result.data);
      }
    } catch {
      console.warn('Gagal memuat data dari API, menggunakan fallback 2025');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update selectedKecamatan jika dataPakan berubah
  useEffect(() => {
    if (selectedKecamatan) {
      const updated = dataPakan.find((k) => k.id === selectedKecamatan.id);
      if (updated && updated !== selectedKecamatan) {
        setSelectedKecamatan(updated);
      }
    }
  }, [dataPakan, selectedKecamatan]);

  // Kalkulasi Total Agregat Kabupaten (Persis sesuai Dokumen PDF)
  const totalPotensiPakan = useMemo(() => {
    return dataPakan.reduce((acc, k) => acc + (Number(k.potensi_pakan_kg) || 0), 0);
  }, [dataPakan]);

  const totalKapasitasTampung = useMemo(() => {
    return dataPakan.reduce((acc, k) => acc + (Number(k.kapasitas_tampung_ekor) || 0), 0);
  }, [dataPakan]);

  const totalJumlahTernak = useMemo(() => {
    return dataPakan.reduce((acc, k) => acc + (Number(k.jumlah_ternak_st) || 0), 0);
  }, [dataPakan]);

  const totalPotensiPenambahan = useMemo(() => {
    return totalKapasitasTampung - totalJumlahTernak;
  }, [totalKapasitasTampung, totalJumlahTernak]);

  const totalSurplusCount = useMemo(() => {
    return dataPakan.filter((k) => (k.potensi_penambahan_st ?? 0) >= 0).length;
  }, [dataPakan]);

  const totalDefisitCount = useMemo(() => {
    return dataPakan.filter((k) => (k.potensi_penambahan_st ?? 0) < 0).length;
  }, [dataPakan]);

  // Filter Data untuk Tabel
  const filteredData = useMemo(() => {
    return dataPakan.filter((k) => {
      const matchSearch =
        !searchQuery ||
        k.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.corelId.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === 'Semua' ||
        (filterStatus === 'Surplus' && (k.potensi_penambahan_st ?? 0) >= 0) ||
        (filterStatus === 'Defisit' && (k.potensi_penambahan_st ?? 0) < 0);
      return matchSearch && matchStatus;
    });
  }, [dataPakan, searchQuery, filterStatus]);

  // Handler Edit Modal
  const handleOpenEdit = (item: KapasitasPakanKecamatan) => {
    setEditingItem(item);
    setFormValues({
      potensi_pakan_kg: item.potensi_pakan_kg,
      kapasitas_tampung_ekor: item.kapasitas_tampung_ekor,
      jumlah_ternak_st: item.jumlah_ternak_st,
      keterangan: item.keterangan || '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const potPakan = Number(formValues.potensi_pakan_kg) || 0;
    const kapTampung = Number(formValues.kapasitas_tampung_ekor) || 0;
    const jmlTernak = Number(formValues.jumlah_ternak_st) || 0;
    const potPenambahan = Number((kapTampung - jmlTernak).toFixed(2));
    const status = potPenambahan >= 0 ? 'Surplus' : 'Defisit';

    // Optimistic Update
    setDataPakan((prev) =>
      prev.map((k) =>
        k.id === editingItem.id
          ? {
              ...k,
              potensi_pakan_kg: potPakan,
              kapasitas_tampung_ekor: kapTampung,
              jumlah_ternak_st: jmlTernak,
              potensi_penambahan_st: potPenambahan,
              status,
              keterangan: formValues.keterangan,
            }
          : k
      )
    );

    try {
      await fetch('/api/pakan-ternak', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          potensi_pakan_kg: potPakan,
          kapasitas_tampung_ekor: kapTampung,
          jumlah_ternak_st: jmlTernak,
          keterangan: formValues.keterangan,
        }),
      });
      showToast('success', `Data Kecamatan ${editingItem.nama} berhasil diperbarui!`);
      setShowEditModal(false);
    } catch {
      showToast('error', 'Gagal menyimpan perubahan ke database.');
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    const rows = dataPakan.map((k, index) => ({
      No: index + 1,
      Kecamatan: k.nama,
      'Potensi Pakan (kg)': k.potensi_pakan_kg,
      'Kapasitas Tampung (ekor)': k.kapasitas_tampung_ekor,
      'Jumlah Ternak Sekarang (ST)': k.jumlah_ternak_st,
      'Potensi Penambahan (ST)': k.potensi_penambahan_st,
      Status: k.potensi_penambahan_st >= 0 ? 'Surplus' : 'Defisit',
    }));

    // Tambahkan Baris TOTAL
    rows.push({
      No: 'TOTAL' as any,
      Kecamatan: 'TOTAL (Kabupaten Kebumen)',
      'Potensi Pakan (kg)': totalPotensiPakan,
      'Kapasitas Tampung (ekor)': totalKapasitasTampung,
      'Jumlah Ternak Sekarang (ST)': totalJumlahTernak,
      'Potensi Penambahan (ST)': totalPotensiPenambahan,
      Status: totalPotensiPenambahan >= 0 ? 'Surplus' : 'Defisit',
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kapasitas_Pakan_2025');
    XLSX.writeFile(wb, `Data_Kapasitas_Pakan_Kebumen_2025_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-purple-600 selection:text-white pb-24">
      
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-bold text-white flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'success' ? 'bg-purple-700' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── TOP HEADER (Tema Ungu Kesmavet) ── */}
      <header className="border-b border-purple-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/kesmavet"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Kesmavet"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/kesmavet" className="text-xs font-semibold text-slate-500 hover:text-purple-700 transition-colors truncate">
                  Kesmavet
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-purple-700 whitespace-nowrap">Pakan Ternak</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Data Kapasitas Pakan Kabupaten Kebumen Tahun 2025
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportExcel}
              title="Export Excel"
              className="min-h-touch min-w-touch h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Download size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* ═══════════════════════════════════════════════════════════════
            TAB SWITCHER KHUSUS MOBILE (OPSI 1)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="sm:hidden flex items-center bg-slate-200/80 p-1 rounded-2xl shadow-inner">
          <button
            onClick={() => setMobileTab('map')}
            className={`flex-1 min-h-touch py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === 'map'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapIcon size={15} />
            <span>Peta Sebaran</span>
          </button>
          <button
            onClick={() => setMobileTab('table')}
            className={`flex-1 min-h-touch py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              mobileTab === 'table'
                ? 'bg-purple-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TableIcon size={15} />
            <span>Tabel Data 2025</span>
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            PETA SEBARAN CHOROPLETH KABUPATEN KEBUMEN (100% VEKTOR COREL)
        ═══════════════════════════════════════════════════════════════ */}
        <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-8 space-y-6 relative overflow-hidden ${
          mobileTab !== 'map' ? 'hidden sm:block' : 'block'
        }`}>
          
          {/* Header Peta */}
          <div className="text-center space-y-1 pb-4 border-b border-slate-100 relative">
            <h2 className="text-lg sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
              Peta Sebaran Kapasitas Pakan Kabupaten Kebumen
            </h2>
            <p className="text-[11px] sm:text-sm font-semibold text-slate-500">
              Analisis Daya Tampung &amp; Potensi Penambahan Populasi Ternak Berdasarkan Ketersediaan Pakan Lokal (Tahun 2025)
            </p>
          </div>

          {/* Container Peta & Komponen Samping */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* 1. AREA PETA INTERAKTIF SVG (26 KECAMATAN PRESISI COREL) */}
            <div className="lg:col-span-9 relative bg-slate-50/70 border border-slate-200 rounded-3xl p-3 sm:p-6 overflow-hidden flex flex-col items-center">
              
              {/* Petunjuk Interaksi */}
              <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2 mb-2">
                <span className="flex items-center gap-1.5 font-bold text-purple-900 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
                  <Sparkles size={14} className="text-purple-600 shrink-0" />
                  <span>Sentuh/klik kecamatan untuk detail &amp; edit data</span>
                </span>

                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span>
                    Surplus ({totalSurplusCount} Kec)
                  </span>
                  <span className="flex items-center gap-1 text-red-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                    Defisit ({totalDefisitCount} Kec)
                  </span>
                </div>
              </div>

              {/* Peta SVG Kebumen */}
              <div 
                onClick={() => setSelectedKecamatan(null)}
                className="relative w-full aspect-[16/11] bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex items-center justify-center cursor-default"
              >
                
                <svg
                  viewBox={KEBUMEN_MAP_VIEWBOX}
                  className="w-full h-full select-none"
                  style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.04))' }}
                >
                  <defs>
                    <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#000000" floodOpacity="0.2" />
                    </filter>
                  </defs>

                  {/* Area Background Reset (Klik di luar poligon mereset pilihan) */}
                  <rect
                    x="-6000"
                    y="1000"
                    width="35000"
                    height="28000"
                    fill="transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedKecamatan(null);
                    }}
                  />

                  {/* 26 Poligon Kecamatan Resmi dari CorelDRAW */}
                  {dataPakan.map((kec) => {
                    const color = getKapasitasPakanColor(kec);
                    const isSelected = selectedKecamatan?.id === kec.id;
                    const isHovered = hoveredKecamatan?.id === kec.id;

                    const commonProps = {
                      fill: color.bgHex,
                      stroke: isSelected ? '#1E1B4B' : isHovered ? '#0F172A' : '#FFFFFF',
                      strokeWidth: isSelected ? 60 : isHovered ? 45 : 30,
                      strokeLinejoin: 'round' as const,
                      strokeLinecap: 'round' as const,
                      className: 'cursor-pointer transition-colors duration-150',
                      onMouseEnter: () => setHoveredKecamatan(kec),
                      onMouseLeave: () => setHoveredKecamatan(null),
                      onClick: (e: React.MouseEvent) => {
                        e.stopPropagation();
                        setSelectedKecamatan(kec);
                        const el = document.getElementById(`row-${kec.id}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      },
                    };

                    if (kec.tagName === 'polygon' && kec.points) {
                      return (
                        <polygon
                          key={kec.id}
                          points={kec.points}
                          {...commonProps}
                        />
                      );
                    } else if (kec.d) {
                      return (
                        <path
                          key={kec.id}
                          d={kec.d}
                          {...commonProps}
                        />
                      );
                    }
                    return null;
                  })}

                  {/* Label Nama & Angka Potensi Penambahan Tiap Kecamatan (Posisi Presisi Tanpa Bug Terbang) */}
                  {dataPakan.map((kec) => {
                    const isSelected = selectedKecamatan?.id === kec.id;
                    const isHovered = hoveredKecamatan?.id === kec.id;
                    const isDefisit = kec.potensi_penambahan_st < 0;

                    return (
                      <g
                        key={`label-${kec.id}`}
                        transform={`translate(${kec.centerX}, ${kec.centerY})`}
                        className="cursor-pointer pointer-events-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedKecamatan(kec);
                          const el = document.getElementById(`row-${kec.id}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        onMouseEnter={() => setHoveredKecamatan(kec)}
                        onMouseLeave={() => setHoveredKecamatan(null)}
                      >
                        {/* Background Badge Bersih, Rapi & Stabil */}
                        <rect
                          x="-950"
                          y="-550"
                          width="1900"
                          height="1100"
                          rx="220"
                          fill={isSelected ? '#1E1B4B' : '#FFFFFF'}
                          stroke={isSelected ? '#C084FC' : isHovered ? '#1E1B4B' : isDefisit ? '#EF4444' : '#16A34A'}
                          strokeWidth={isSelected ? 65 : isHovered ? 50 : 35}
                          filter="url(#badgeShadow)"
                        />

                        {/* Nama Kecamatan (Font Bold & Jelas) */}
                        <text
                          x="0"
                          y="-140"
                          textAnchor="middle"
                          fill={isSelected ? '#FFFFFF' : '#0F172A'}
                          fontSize="330"
                          fontWeight="900"
                          fontFamily="system-ui, -apple-system, 'Inter', 'Segoe UI', Arial, sans-serif"
                          letterSpacing="6"
                        >
                          {kec.nama}
                        </text>

                        {/* Angka Potensi Penambahan (ST) */}
                        <text
                          x="0"
                          y="200"
                          textAnchor="middle"
                          fill={isSelected ? (isDefisit ? '#FCA5A5' : '#86EFAC') : (isDefisit ? '#DC2626' : '#15803D')}
                          fontSize="320"
                          fontWeight="900"
                          fontFamily="system-ui, -apple-system, 'Inter', 'Segoe UI', Arial, sans-serif"
                        >
                          {kec.potensi_penambahan_st > 0 ? `+${kec.potensi_penambahan_st.toLocaleString('id-ID')}` : kec.potensi_penambahan_st.toLocaleString('id-ID')} <tspan fontSize="210" fontWeight="bold">ST</tspan>
                        </text>

                        {/* Status Label (Surplus / Defisit) */}
                        <text
                          x="0"
                          y="430"
                          textAnchor="middle"
                          fill={isSelected ? '#E2E8F0' : (isDefisit ? '#991B1B' : '#166534')}
                          fontSize="180"
                          fontWeight="800"
                          fontFamily="system-ui, -apple-system, 'Inter', 'Segoe UI', Arial, sans-serif"
                          letterSpacing="4"
                        >
                          {isDefisit ? '● DEFISIT' : '● SURPLUS'}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip Saat Hover di Desktop */}
                {hoveredKecamatan && (
                  <div
                    className="hidden sm:block absolute z-20 pointer-events-none bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl text-xs space-y-1.5 animate-in fade-in max-w-sm"
                    style={{
                      left: '50%',
                      bottom: '24px',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-4 border-b border-slate-700 pb-1.5">
                      <span className="font-extrabold text-sm text-purple-300">KECAMATAN {hoveredKecamatan.nama}</span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${
                        hoveredKecamatan.potensi_penambahan_st >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}>
                        {hoveredKecamatan.potensi_penambahan_st >= 0 ? 'SURPLUS' : 'DEFISIT'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-300">
                      <div>Potensi Pakan: <strong className="text-white">{hoveredKecamatan.potensi_pakan_kg.toLocaleString('id-ID')} kg</strong></div>
                      <div>Kapasitas Tampung: <strong className="text-white">{hoveredKecamatan.kapasitas_tampung_ekor.toLocaleString('id-ID')} ekor</strong></div>
                      <div>Jumlah Ternak (ST): <strong className="text-white">{hoveredKecamatan.jumlah_ternak_st.toLocaleString('id-ID')} ST</strong></div>
                      <div>Potensi Penambahan: <strong className={hoveredKecamatan.potensi_penambahan_st >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {hoveredKecamatan.potensi_penambahan_st > 0 ? `+${hoveredKecamatan.potensi_penambahan_st.toLocaleString('id-ID')}` : hoveredKecamatan.potensi_penambahan_st.toLocaleString('id-ID')} ST
                      </strong></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Peta: Total Agregat & Skala */}
              <div className="w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
                
                {/* Kotak Total */}
                <div className="w-full sm:w-auto flex items-center gap-3 sm:gap-4 bg-white px-4 sm:px-5 py-3 rounded-2xl border border-purple-200 shadow-xs">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
                    <Wheat size={22} />
                  </div>
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      TOTAL POTENSI PENAMBAHAN
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl sm:text-3xl font-black text-emerald-700 font-sans">
                        +{totalPotensiPenambahan.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ST
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metadata & Skala */}
                <div className="text-[10px] sm:text-[11px] text-slate-400 space-y-0.5 text-center sm:text-right">
                  <p className="font-semibold text-slate-600">Vektor Peta: Batas Administrasi Resmi CorelDRAW</p>
                  <p>Basis Evaluasi: Standar Daya Tampung Satuan Ternak (ST) 2025</p>
                </div>
              </div>

            </div>

            {/* 2. LEGENDA & KOMPAS */}
            <div className="lg:col-span-3 space-y-5">
              
              {/* Kompas Arah Mata Angin */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:p-5 text-center flex flex-col items-center justify-center shadow-2xs">
                <div className="relative w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center">
                  <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-full border-2 border-dashed border-purple-200 flex items-center justify-center">
                    <Compass size={32} className="text-purple-700 animate-spin-slow" />
                  </div>
                  <span className="absolute -top-1 font-black text-xs text-purple-900">U</span>
                  <span className="absolute -bottom-1 font-black text-xs text-slate-500">S</span>
                  <span className="absolute -left-1 font-black text-xs text-slate-500">B</span>
                  <span className="absolute -right-1 font-black text-xs text-slate-500">T</span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-700 mt-2 uppercase tracking-wider">
                  Orientasi Wilayah Kebumen
                </span>
              </div>

              {/* Legenda Status Kapasitas */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    Legenda Status Kapasitas
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Potensi Penambahan Satuan Ternak (ST)
                  </p>
                </div>

                <div className="space-y-2">
                  {LEGENDA_KAPASITAS_PAKAN.map((leg, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div
                        className="w-7 h-5 rounded-md border border-slate-300/80 shadow-2xs shrink-0"
                        style={{ backgroundColor: leg.bgHex }}
                      />
                      <div className="flex-1 text-xs">
                        <span className="font-extrabold text-slate-900">{leg.range}</span>
                        <span className="text-[11px] text-slate-500 block leading-tight">{leg.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-purple-900 bg-purple-50 p-3 rounded-2xl space-y-1">
                  <strong className="flex items-center gap-1 text-purple-800">
                    <Info size={13} />
                    Tips Interaksi:
                  </strong>
                  <p className="text-[11px] leading-relaxed">
                    Sentuh wilayah di peta atau klik tombol <strong>Edit</strong> pada tabel untuk memperbarui data angka kapasitas pakan.
                  </p>
                </div>
              </div>

              {/* Ringkasan Status */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-2.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Ringkasan 26 Kecamatan
                </span>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <TrendingUp size={15} className="text-emerald-600" />
                      Kecamatan Surplus
                    </span>
                    <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {totalSurplusCount} Kec
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <TrendingDown size={15} className="text-rose-600" />
                      Kecamatan Defisit
                    </span>
                    <span className="font-extrabold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                      {totalDefisitCount} Kec
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════
            TABEL RESMI DATA KAPASITAS PAKAN KABUPATEN KEBUMEN TAHUN 2025
        ═══════════════════════════════════════════════════════════════ */}
        <div className={`bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-8 space-y-6 ${
          mobileTab !== 'table' ? 'hidden sm:block' : 'block'
        }`}>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl text-xs font-black bg-purple-100 text-purple-900">
                  Tahun 2025
                </span>
                <span className="text-xs font-bold text-slate-400">26 Kecamatan</span>
              </div>
              <h3 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight mt-1 uppercase">
                DATA KAPASITAS PAKAN KABUPATEN KEBUMEN TAHUN 2025
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:border-purple-600 shadow-2xs cursor-pointer"
              >
                <option value="Semua">Semua Status (Surplus &amp; Defisit)</option>
                <option value="Surplus">Hanya Surplus (Hijau)</option>
                <option value="Defisit">Hanya Defisit (Merah)</option>
              </select>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Cari kecamatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full min-h-touch h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-purple-600 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Tabel Responsive dengan Sticky Kolom Pertama */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-100/90 text-slate-800 font-extrabold uppercase text-[11px] border-b border-slate-200">
                  <th className="py-3.5 px-4 text-center w-12 sticky left-0 bg-slate-100 z-10">No</th>
                  <th className="py-3.5 px-4 sticky left-12 bg-slate-100 z-10">Kecamatan</th>
                  <th className="py-3.5 px-4 text-right">Potensi Pakan (kg)</th>
                  <th className="py-3.5 px-4 text-right">Kapasitas Tampung (ekor)</th>
                  <th className="py-3.5 px-4 text-right">Jumlah Ternak Sekarang (Satuan Ternak)</th>
                  <th className="py-3.5 px-4 text-right">Potensi Penambahan (ST)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  {canEdit && <th className="py-3.5 px-4 text-center w-24">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredData.map((item, index) => {
                  const isDefisit = item.potensi_penambahan_st < 0;
                  const isSelected = selectedKecamatan?.id === item.id;

                  return (
                    <tr
                      id={`row-${item.id}`}
                      key={item.id}
                      onClick={() => setSelectedKecamatan(item)}
                      className={`hover:bg-purple-50/60 transition-colors cursor-pointer ${
                        isSelected ? 'bg-purple-50/90 font-semibold' : index % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                      }`}
                    >
                      <td className={`py-3 px-4 text-center font-bold text-slate-400 sticky left-0 z-10 ${
                        isSelected ? 'bg-purple-100' : index % 2 === 1 ? 'bg-slate-50' : 'bg-white'
                      }`}>{index + 1}</td>
                      <td className={`py-3 px-4 font-black text-slate-900 tracking-wide sticky left-12 z-10 ${
                        isSelected ? 'bg-purple-100' : index % 2 === 1 ? 'bg-slate-50' : 'bg-white'
                      }`}>
                        {item.nama}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold font-mono">
                        {item.potensi_pakan_kg.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold font-mono">
                        {item.kapasitas_tampung_ekor.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold font-mono">
                        {item.jumlah_ternak_st.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`py-3 px-4 text-right font-black font-mono ${
                        isDefisit ? 'text-rose-600' : 'text-emerald-700'
                      }`}>
                        {item.potensi_penambahan_st > 0 ? `+${item.potensi_penambahan_st.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : item.potensi_penambahan_st.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          isDefisit ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {isDefisit ? 'Defisit' : 'Surplus'}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(item);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-900 text-slate-700 text-[11px] font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}

                {/* BARIS TOTAL (KABUPATEN) */}
                <tr className="bg-purple-900 text-white font-black text-xs border-t-2 border-purple-950">
                  <td colSpan={2} className="py-4 px-4 font-black uppercase tracking-wider text-purple-100 text-left sm:text-center sticky left-0 bg-purple-900 z-10">
                    TOTAL (Kabupaten)
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-white text-sm">
                    {totalPotensiPakan.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-white text-sm">
                    {totalKapasitasTampung.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-white text-sm">
                    {totalJumlahTernak.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-emerald-300 text-sm">
                    +{totalPotensiPenambahan.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-500 text-white uppercase">
                      Surplus
                    </span>
                  </td>
                  {canEdit && <td></td>}
                </tr>
              </tbody>
            </table>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              PANDUAN MEMBACA DATA (PERSIS SEPERTI DOKUMEN PDF)
          ═══════════════════════════════════════════════════════════════ */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-7 space-y-3">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <HelpCircle size={17} className="text-purple-600" />
              <span>Panduan Membaca Data:</span>
            </h4>
            
            <ul className="space-y-2 text-xs text-slate-700 leading-relaxed list-disc list-inside">
              <li>
                <strong>ST (Satuan Ternak):</strong> Satuan ukur standar kebutuhan pakan (Misal: 1 ekor sapi dewasa = 1 ST).
              </li>
              <li>
                <strong>Daya Tampung / Kapasitas Tampung:</strong> Jumlah maksimal ternak yang mampu diberi makan dari sumber daya lokal.
              </li>
              <li>
                <strong className="text-emerald-700">Surplus (Hijau):</strong> Pakan berlebih. Sangat aman untuk penambahan populasi ternak.
              </li>
              <li>
                <strong className="text-rose-600">Defisit (Merah):</strong> Ternak sudah melebihi ketersediaan pakan. Butuh subsidi pakan dari luar wilayah.
              </li>
            </ul>
          </div>

        </div>

      </main>

      {/* ═══════════════════════════════════════════════════════════════
          BOTTOM SHEET DRAWER UNTUK MOBILE (OPSI 3)
      ═══════════════════════════════════════════════════════════════ */}
      {selectedKecamatan && (
        <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 animate-in slide-in-from-bottom duration-200">
          {/* Backdrop gelap halus */}
          <div 
            onClick={() => setSelectedKecamatan(null)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-40"
          />

          {/* Drawer Container */}
          <div className="relative z-50 bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Handle Bar */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto" />

            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
                  Detail Kapasitas Pakan 2025
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  KECAMATAN {selectedKecamatan.nama}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase ${
                  selectedKecamatan.potensi_penambahan_st >= 0
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-100 text-rose-700 border border-rose-200'
                }`}>
                  {selectedKecamatan.potensi_penambahan_st >= 0 ? 'Surplus' : 'Defisit'}
                </span>
                <button
                  onClick={() => setSelectedKecamatan(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 4 Kartu Metrik Ringkas 2x2 */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Potensi Pakan</span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {selectedKecamatan.potensi_pakan_kg.toLocaleString('id-ID')} <span className="text-[10px] font-sans text-slate-500">kg</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Daya Tampung</span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {selectedKecamatan.kapasitas_tampung_ekor.toLocaleString('id-ID')} <span className="text-[10px] font-sans text-slate-500">ekor</span>
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Jumlah Ternak</span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {selectedKecamatan.jumlah_ternak_st.toLocaleString('id-ID')} <span className="text-[10px] font-sans text-slate-500">ST</span>
                </span>
              </div>

              <div className={`p-3 rounded-2xl border ${
                selectedKecamatan.potensi_penambahan_st >= 0
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-900'
                  : 'bg-rose-50 border-rose-100 text-rose-900'
              }`}>
                <span className="text-[10px] opacity-75 block font-bold uppercase">Potensi Tambah</span>
                <span className="text-sm font-black font-mono">
                  {selectedKecamatan.potensi_penambahan_st > 0 ? `+${selectedKecamatan.potensi_penambahan_st.toLocaleString('id-ID')}` : selectedKecamatan.potensi_penambahan_st.toLocaleString('id-ID')} ST
                </span>
              </div>
            </div>

            {/* Tombol Aksi di Mobile */}
            <div className="pt-2 flex gap-2">
              {canEdit && (
                <button
                  onClick={() => {
                    handleOpenEdit(selectedKecamatan);
                  }}
                  className="flex-1 min-h-touch h-11 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Edit2 size={14} />
                  <span>Edit Angka Kecamatan</span>
                </button>
              )}
              <button
                onClick={() => setSelectedKecamatan(null)}
                className="min-h-touch h-11 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── MODAL EDIT DATA KAPASITAS PAKAN KECAMATAN (CRUD) ── */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <Wheat size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Edit Data Kapasitas Pakan
                  </h3>
                  <p className="text-xs text-slate-500">Kecamatan {editingItem.nama} (Tahun 2025)</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Potensi Pakan (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formValues.potensi_pakan_kg}
                  onChange={(e) => setFormValues({ ...formValues, potensi_pakan_kg: parseFloat(e.target.value) || 0 })}
                  className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:border-purple-600 outline-none shadow-2xs font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kapasitas Tampung (ekor) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formValues.kapasitas_tampung_ekor}
                    onChange={(e) => setFormValues({ ...formValues, kapasitas_tampung_ekor: parseFloat(e.target.value) || 0 })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:border-purple-600 outline-none shadow-2xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jumlah Ternak Sekarang (ST) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formValues.jumlah_ternak_st}
                    onChange={(e) => setFormValues({ ...formValues, jumlah_ternak_st: parseFloat(e.target.value) || 0 })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:border-purple-600 outline-none shadow-2xs font-mono"
                  />
                </div>
              </div>

              {/* Kalkulasi Potensi Penambahan Otomatis */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                  Hasil Kalkulasi Potensi Penambahan:
                </span>
                <div className="flex items-center justify-between">
                  <span className={`text-base font-black font-mono ${
                    (formValues.kapasitas_tampung_ekor - formValues.jumlah_ternak_st) >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {(formValues.kapasitas_tampung_ekor - formValues.jumlah_ternak_st).toFixed(2)} ST
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    (formValues.kapasitas_tampung_ekor - formValues.jumlah_ternak_st) >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {(formValues.kapasitas_tampung_ekor - formValues.jumlah_ternak_st) >= 0 ? 'Surplus' : 'Defisit'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan / Keterangan Wilayah
                </label>
                <textarea
                  rows={2}
                  value={formValues.keterangan}
                  onChange={(e) => setFormValues({ ...formValues, keterangan: e.target.value })}
                  placeholder="Catatan pakan hijauan atau sentra peternakan..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-purple-600 outline-none shadow-2xs text-xs"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="min-h-touch h-11 px-5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-touch h-11 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
