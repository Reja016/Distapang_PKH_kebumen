'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Download,
  Plus,
  PieChart as PieChartIcon,
  Layers,
  X,
  CheckCircle2,
  TrendingUp,
  Scale,
  Egg,
} from 'lucide-react';

const bulan = [
  'JAN', 'FEB', 'MAR', 'APRIL', 'MEI', 'JUNI',
  'JULI', 'AGT', 'SEPT', 'OKT', 'NOV', 'DES',
];

const PALETTE = [
  '#059669', '#2563eb', '#d97706', '#dc2626', '#7c3aed',
  '#0891b2', '#ea580c', '#4f46e5', '#db2777', '#16a34a',
  '#ca8a04', '#9333ea', '#0284c7', '#e11d48', '#65a30d',
  '#475569',
];

// Modern SVG Donut Chart Component with Ranked Progress Legend (2026 & Future Years)
function DonutChart({
  title,
  subtitle,
  icon,
  data,
  unit = 'KG',
}: {
  title: string;
  subtitle: string;
  icon: string;
  data: { label: string; value: number; color: string }[];
  unit?: string;
}) {
  const total = useMemo(() => data.reduce((acc, item) => acc + (item.value || 0), 0), [data]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Filter data yang memiliki nilai > 0
  const activeData = useMemo(() => {
    return data.filter((d) => d.value > 0);
  }, [data]);

  // Urutkan data dari kontribusi terbesar ke terkecil untuk legenda
  const sortedData = useMemo(() => {
    return [...activeData].sort((a, b) => b.value - a.value);
  }, [activeData]);

  // Kalkulasi busur SVG Pie Segments dengan celah pemisah yang rapi
  let cumulativeAngle = 0;
  const slices = activeData.map((item, idx) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const angle = total > 0 ? (item.value / total) * 360 : 0;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    // Celah pemisah antar segmen agar tidak bertumpukan
    const gap = activeData.length > 1 ? Math.min(1.5, angle * 0.1) : 0;
    const adjustedStart = startAngle + gap / 2;
    const adjustedEnd = endAngle - gap / 2;

    const startRad = ((adjustedStart - 90) * Math.PI) / 180;
    const endRad = ((adjustedEnd - 90) * Math.PI) / 180;

    const radius = 70;
    const cx = 100;
    const cy = 100;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArcFlag = angle - gap > 180 ? 1 : 0;
    const pathData =
      angle >= 359.9
        ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius}`
        : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

    return {
      ...item,
      percentage,
      pathData,
      idx,
    };
  });

  const topContributor = sortedData.length > 0 ? sortedData[0] : null;
  const topPercentage = topContributor && total > 0 ? (topContributor.value / total) * 100 : 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between hover:shadow-md transition-shadow">
      {/* Chart Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">{icon}</span>
          <div className="min-w-0">
            <h3 className="font-extrabold text-base text-slate-900 truncate">{title}</h3>
            <p className="text-xs text-slate-500 truncate">{subtitle}</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-extrabold font-sans shrink-0 border border-slate-200">
          {total > 1000 ? `${(total / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Ton` : `${total.toLocaleString('id-ID')} ${unit}`}
        </span>
      </div>

      {total === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
          <PieChartIcon size={36} className="opacity-30 text-slate-400" />
          <span className="font-medium">Belum ada data tonase untuk digambarkan</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Donut SVG Ring (5 cols) */}
          <div className="md:col-span-5 relative flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-52 sm:h-52 transform -rotate-90 select-none">
              {/* Background Ring Halus */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="24"
              />

              {slices.map((slice) => {
                const isHovered = hoveredIdx === slice.idx;
                return (
                  <path
                    key={slice.label}
                    d={slice.pathData}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth={isHovered ? 28 : 22}
                    className="transition-all duration-200 cursor-pointer"
                    style={{
                      opacity: hoveredIdx !== null && !isHovered ? 0.35 : 1,
                      filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))' : 'none',
                    }}
                    onMouseEnter={() => setHoveredIdx(slice.idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                );
              })}
            </svg>

            {/* Pusat Ring Donut yang Sangat Jelas */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
              {hoveredIdx !== null && slices.find((s) => s.idx === hoveredIdx) ? (
                (() => {
                  const activeSlice = slices.find((s) => s.idx === hoveredIdx)!;
                  return (
                    <div className="animate-in fade-in zoom-in-95 duration-150">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block truncate max-w-[110px]">
                        {activeSlice.label}
                      </span>
                      <span className="text-xl font-black text-slate-900 leading-tight">
                        {activeSlice.percentage.toFixed(1)}%
                      </span>
                      <span className="text-[11px] font-bold block mt-0.5" style={{ color: activeSlice.color }}>
                        {activeSlice.value.toLocaleString('id-ID')} {unit}
                      </span>
                    </div>
                  );
                })()
              ) : (
                <div className="animate-in fade-in duration-150">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Total</span>
                  <span className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                    {total > 1000 ? `${(total / 1000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} Ton` : `${total.toLocaleString('id-ID')}`}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 block">
                    {slices.length} Komoditas
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Legenda Horizontal Progress Bar Terurut (7 cols) */}
          <div className="md:col-span-7 space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
            {sortedData.map((item) => {
              const slice = slices.find((s) => s.label === item.label);
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              const isHovered = slice && hoveredIdx === slice.idx;

              return (
                <div
                  key={item.label}
                  onMouseEnter={() => slice && setHoveredIdx(slice.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`p-2 rounded-2xl border transition-all cursor-pointer ${
                    isHovered
                      ? 'bg-slate-50 border-slate-300 shadow-xs'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-bold text-slate-800 truncate">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-black text-slate-900 font-mono">{percentage.toFixed(1)}%</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        ({item.value.toLocaleString('id-ID')} {unit})
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Mini Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.max(percentage, 1)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Footer Pill: Kontributor Terbesar */}
      {topContributor && total > 0 && (
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50/80 px-3.5 py-2.5 rounded-2xl">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-sm">🏆</span>
            <span className="font-semibold">Kontribusi Terbesar:</span>
            <strong className="text-slate-900">{topContributor.label}</strong>
          </div>
          <span className="font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-lg text-[11px]">
            {topPercentage.toFixed(1)}% ({topContributor.value.toLocaleString('id-ID')} {unit})
          </span>
        </div>
      )}
    </div>
  );
}

const DAFTAR_KOMODITAS_IB = [
  // Ruminansia Besar
  'Sapi PO (Peranakan Ongole) Kebumen',
  'Sapi Simmental',
  'Sapi Limousin',
  'Sapi FH (Friesian Holstein) Perah',
  'Sapi Brahman Cross',
  'Sapi Brangus',
  'Sapi Bali / Madura',
  'Kerbau Lumpur Potong',
  'Kerbau Murrah',
  'Kuda Sumbawa / Pacu',
  
  // Ruminansia Kecil
  'Kambing PE (Peranakan Etawah)',
  'Kambing Jawa Randu',
  'Kambing Kacang',
  'Kambing Boer',
  'Domba Batur',
  'Domba Garut',
  'Domba Ekor Gemuk',
  'Domba Texel',
  
  // Unggas
  'Ayam Ras Pedaging (Broiler)',
  'Ayam Ras Petelur (Layer)',
  'Ayam Buras / Kampung',
  'Ayam KUB',
  'Itik Petelur / Bebek',
  'Itik Manila / Entog',
  'Burung Puyuh Petelur',
  'Burung Merpati',
  'Angsa',
  
  // Lainnya
  'Kelinci Pedaging & Hias',
  'Babi Ras Komersial',
];

function Produksi2026Content() {
  const searchParams = useSearchParams();
  const year = searchParams.get('year') || '2026';
  const [dataDaging, setDataDaging] = useState<any[]>([]);
  const [dataTelur, setDataTelur] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Tambah Data Produksi
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showKomoditasSuggestions, setShowKomoditasSuggestions] = useState(false);
  const [formKategori, setFormKategori] = useState<'Daging' | 'Telur'>('Daging');
  const [formJenis, setFormJenis] = useState('');
  const [formBulanan, setFormBulanan] = useState<Record<string, string>>({
    jan: '', feb: '', mar: '', apr: '', mei: '', jun: '',
    jul: '', agt: '', sep: '', okt: '', nov: '', des: '',
  });

  // Filtered Komoditas Suggestions based on IB Database
  const filteredKomoditas = useMemo(() => {
    const q = formJenis.toLowerCase().trim();
    if (!q) return DAFTAR_KOMODITAS_IB.slice(0, 8);
    return DAFTAR_KOMODITAS_IB.filter((k) => k.toLowerCase().includes(q)).slice(0, 10);
  }, [formJenis]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/get-produksi-2026');
      const data = await response.json();
      setDataDaging(data.dataDaging || []);
      setDataTelur(data.dataTelur || []);
    } catch (error) {
      console.error('Gagal menyedot data produksi 2026:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Format data for Pie Charts
  const pieDataDaging = useMemo(() => {
    return dataDaging.map((row, idx) => ({
      label: row.jenis,
      value: Number(row.total) || 0,
      color: PALETTE[idx % PALETTE.length],
    }));
  }, [dataDaging]);

  const pieDataTelur = useMemo(() => {
    return dataTelur.map((row, idx) => ({
      label: row.jenis,
      value: Number(row.total) || 0,
      color: PALETTE[(idx + 4) % PALETTE.length],
    }));
  }, [dataTelur]);

  // Export to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    if (dataDaging.length > 0) {
      const wsDaging = XLSX.utils.json_to_sheet(
        dataDaging.map((d, i) => ({
          No: i + 1,
          'Jenis Ternak': d.jenis,
          Januari: d.jan,
          Februari: d.feb,
          Maret: d.mar,
          April: d.apr,
          Mei: d.mei,
          Juni: d.jun,
          Juli: d.jul,
          Agustus: d.agt,
          September: d.sep,
          Oktober: d.okt,
          November: d.nov,
          Desember: d.des,
          'Total (KG)': d.total,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsDaging, 'Produksi_Daging_2026');
    }

    if (dataTelur.length > 0) {
      const wsTelur = XLSX.utils.json_to_sheet(
        dataTelur.map((d, i) => ({
          No: i + 1,
          'Jenis Ternak': d.jenis,
          Januari: d.jan,
          Februari: d.feb,
          Maret: d.mar,
          April: d.apr,
          Mei: d.mei,
          Juni: d.jun,
          Juli: d.jul,
          Agustus: d.agt,
          September: d.sep,
          Oktober: d.okt,
          November: d.nov,
          Desember: d.des,
          'Total (KG)': d.total,
        }))
      );
      XLSX.utils.book_append_sheet(wb, wsTelur, 'Produksi_Telur_2026');
    }

    XLSX.writeFile(wb, `Laporan_Produksi_Daging_Telur_2026_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Submit Tambah Data Produksi Baru
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJenis.trim()) return alert('Silakan masukkan nama jenis ternak/komoditas!');

    setIsSubmitting(true);
    try {
      const payload = {
        kategori: formKategori,
        jenis: formJenis.trim(),
        jan: Number(formBulanan.jan) || 0,
        feb: Number(formBulanan.feb) || 0,
        mar: Number(formBulanan.mar) || 0,
        apr: Number(formBulanan.apr) || 0,
        mei: Number(formBulanan.mei) || 0,
        jun: Number(formBulanan.jun) || 0,
        jul: Number(formBulanan.jul) || 0,
        agt: Number(formBulanan.agt) || 0,
        sep: Number(formBulanan.sep) || 0,
        okt: Number(formBulanan.okt) || 0,
        nov: Number(formBulanan.nov) || 0,
        des: Number(formBulanan.des) || 0,
      };

      const res = await fetch('/api/get-produksi-2026', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Data komoditas produksi 2026 berhasil ditambahkan!');
        setShowAddModal(false);
        setFormJenis('');
        setFormBulanan({
          jan: '', feb: '', mar: '', apr: '', mei: '', jun: '',
          jul: '', agt: '', sep: '', okt: '', nov: '', des: '',
        });
        fetchData();
      } else {
        alert('Gagal menambahkan data produksi.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-20">
      
      {/* ── TOP HEADER (Tema Hijau Bitpro) ── */}
      <header className="border-b border-emerald-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/bitpro/populasi-dan-produksi"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Menu Produksi"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/bitpro" className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors truncate">
                  Bitpro
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Produksi {year}</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Lembar Kerja Produksi Ternak Tahun {year}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
              onClick={() => setShowAddModal(true)}
              title="Tambah Data Produksi"
              aria-label="Tambah Data Produksi"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Tambah Data Produksi</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64 w-full">
            <span className="font-sans text-xs text-slate-500 uppercase tracking-widest animate-pulse">
              Menyiapkan lembar kerja produksi 2026...
            </span>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* ── 2 DIAGRAM LINGKARAN (PRODUKSI DAGING & PRODUKSI TELUR) ── */}
            <section className="space-y-3">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <PieChartIcon size={20} strokeWidth={2.5} className="text-emerald-600" />
                  <span>Visualisasi Proporsi Kontribusi Produksi 2026</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Perbandingan persentase tonase komoditas daging dan produksi butir telur di Kabupaten Kebumen
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* 1. Diagram Lingkaran Daging */}
                <DonutChart
                  title="Proporsi Produksi Daging"
                  subtitle="Persentase kontribusi daging potong per komoditas"
                  icon="🥩"
                  data={pieDataDaging}
                  unit="KG"
                />

                {/* 2. Diagram Lingkaran Telur */}
                <DonutChart
                  title="Proporsi Produksi Telur"
                  subtitle="Persentase kontribusi telur konsumsi unggas"
                  icon="🥚"
                  data={pieDataTelur}
                  unit="KG"
                />
              </div>
            </section>

            {/* ── PANEL TABEL PRODUKSI DAGING ── */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🥩</span>
                  <div>
                    <h2 className="font-bold text-base text-slate-900">
                      Produksi Daging Siap Potong (Kilogram) — 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Pencatatan data dinamis pemotongan ternak periode berjalan
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {dataDaging.length} Komoditas Daging
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 text-left sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                        JENIS TERNAK
                      </th>
                      {bulan.map((b) => (
                        <th key={b} className="p-3.5">{b}</th>
                      ))}
                      <th className="p-3.5 bg-slate-100 text-slate-900 font-bold border-l border-slate-200">TOTAL (KG)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {dataDaging.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-left text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-100">
                          {row.jenis}
                        </td>
                        <td className="p-3.5 font-sans">{Number(row.jan).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.feb).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.mar).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.apr).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.mei).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.jun).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.jul).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.agt).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.sep).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.okt).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.nov).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.des).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans font-bold text-emerald-700 bg-slate-50/80 border-l border-slate-100">
                          {Number(row.total).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── PANEL TABEL PRODUKSI TELUR ── */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🥚</span>
                  <div>
                    <h2 className="font-bold text-base text-slate-900">
                      Produksi Telur Konsumsi (Kilogram) — 2026
                    </h2>
                    <p className="text-xs text-slate-500">
                      Pencatatan data dinamis komoditas unggas petelur periode berjalan
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {dataTelur.length} Komoditas Telur
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 text-left sticky left-0 bg-slate-50 z-10 border-r border-slate-200">
                        JENIS UNGGAS
                      </th>
                      {bulan.map((b) => (
                        <th key={b} className="p-3.5">{b}</th>
                      ))}
                      <th className="p-3.5 bg-slate-100 text-slate-900 font-bold border-l border-slate-200">TOTAL (KG)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {dataTelur.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-left text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-100">
                          {row.jenis}
                        </td>
                        <td className="p-3.5 font-sans">{Number(row.jan).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.feb).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.mar).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.apr).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.mei).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.jun).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.jul).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.agt).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.sep).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.okt).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.nov).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans">{Number(row.des).toLocaleString('id-ID')}</td>
                        <td className="p-3.5 font-sans font-bold text-emerald-700 bg-slate-50/80 border-l border-slate-100">
                          {Number(row.total).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ── MODAL TAMBAH DATA PRODUKSI BARU ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold">
                  <Plus size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Tambah Data Produksi 2026</h3>
                  <p className="text-xs text-slate-500">Masukkan komoditas dan estimasi/realisasi bulanan</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Kategori Produksi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formKategori}
                    onChange={(e) => setFormKategori(e.target.value as any)}
                    className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-emerald-600 outline-none"
                  >
                    <option value="Daging">🥩 Produksi Daging</option>
                    <option value="Telur">🥚 Produksi Telur</option>
                  </select>
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Nama Komoditas / Ternak <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-emerald-700 font-semibold">
                      Live Search Database IB
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ketik nama komoditas (cth: Sapi PO / Broiler)..."
                      value={formJenis}
                      onFocus={() => setShowKomoditasSuggestions(true)}
                      onChange={(e) => {
                        setFormJenis(e.target.value);
                        setShowKomoditasSuggestions(true);
                      }}
                      className="w-full min-h-touch h-10 px-3.5 pr-8 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-emerald-600 outline-none shadow-2xs"
                    />
                    {formJenis && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormJenis('');
                          setShowKomoditasSuggestions(true);
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown */}
                  {showKomoditasSuggestions && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowKomoditasSuggestions(false)}
                      />
                      <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100 animate-in fade-in duration-150">
                        <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Rekomendasi Bibit & Komoditas IB
                        </div>
                        {filteredKomoditas.map((kom) => (
                          <button
                            key={kom}
                            type="button"
                            onClick={() => {
                              setFormJenis(kom);
                              setShowKomoditasSuggestions(false);
                            }}
                            className="w-full px-3 py-2 text-left hover:bg-emerald-50 text-xs font-bold text-slate-800 hover:text-emerald-900 transition-colors flex items-center justify-between group cursor-pointer"
                          >
                            <span className="truncate">{kom}</span>
                            <span className="text-[10px] text-emerald-700 opacity-0 group-hover:opacity-100 font-semibold">
                              Pilih →
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Rincian Angka Bulanan (KG) */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Input Angka Bulanan (Satuan KG)
                </span>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {bulan.map((b, i) => {
                    const keys = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agt', 'sep', 'okt', 'nov', 'des'];
                    const key = keys[i];
                    return (
                      <div key={b}>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                          {b}
                        </label>
                        <input
                          type="number"
                          step="any"
                          min={0}
                          placeholder="0"
                          value={formBulanan[key] || ''}
                          onChange={(e) => setFormBulanan((prev) => ({ ...prev, [key]: e.target.value }))}
                          className="w-full min-h-touch h-9 px-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-center focus:border-emerald-600 outline-none"
                        />
                      </div>
                    );
                  })}
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
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 min-h-touch h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Data Produksi'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function Produksi2026() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-xs text-slate-500 uppercase tracking-widest animate-pulse">
          Memuat Data Produksi Peternakan...
        </div>
      }
    >
      <Produksi2026Content />
    </Suspense>
  );
}