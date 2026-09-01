'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Download,
  PieChart as PieChartIcon,
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

// SVG Donut Chart Component
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

  // Calculate SVG Pie Segments
  let cumulativeAngle = 0;
  const slices = data
    .filter((d) => d.value > 0)
    .map((item, idx) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0;
      const angle = total > 0 ? (item.value / total) * 360 : 0;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle += angle;

      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const x1 = 100 + 75 * Math.cos(startRad);
      const y1 = 100 + 75 * Math.sin(startRad);
      const x2 = 100 + 75 * Math.cos(endRad);
      const y2 = 100 + 75 * Math.sin(endRad);

      const largeArcFlag = angle > 180 ? 1 : 0;
      const pathData =
        angle >= 359.99
          ? `M 100 25 A 75 75 0 1 1 99.99 25`
          : `M ${x1} ${y1} A 75 75 0 ${largeArcFlag} 1 ${x2} ${y2}`;

      return {
        ...item,
        percentage,
        pathData,
        idx,
      };
    });

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-sans">
          Total: {total.toLocaleString('id-ID')} {unit}
        </span>
      </div>

      {total === 0 ? (
        <div className="h-56 flex flex-col items-center justify-center text-slate-400 text-xs space-y-1">
          <PieChartIcon size={32} className="opacity-40" />
          <span>Belum ada data tonase untuk digambarkan</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          
          {/* Donut SVG */}
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-52 sm:h-52 transform -rotate-90">
              {slices.map((slice) => (
                <path
                  key={slice.label}
                  d={slice.pathData}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={hoveredIdx === slice.idx ? 32 : 26}
                  strokeLinecap="round"
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(slice.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              ))}
            </svg>

            {/* Inner Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
              {hoveredIdx !== null && slices.find((s) => s.idx === hoveredIdx) ? (
                (() => {
                  const activeSlice = slices.find((s) => s.idx === hoveredIdx)!;
                  return (
                    <>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate max-w-[110px]">
                        {activeSlice.label}
                      </span>
                      <span className="text-base font-extrabold text-slate-900">
                        {activeSlice.percentage.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold">
                        {activeSlice.value.toLocaleString('id-ID')} {unit}
                      </span>
                    </>
                  );
                })()
              ) : (
                <>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Produksi</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {total > 1000 ? `${(total / 1000).toFixed(1)} Ton` : `${total.toLocaleString('id-ID')} ${unit}`}
                  </span>
                  <span className="text-[10px] text-slate-400">{slices.length} Komoditas</span>
                </>
              )}
            </div>
          </div>

          {/* Color Legend List */}
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {slices.map((slice) => (
              <div
                key={slice.label}
                onMouseEnter={() => setHoveredIdx(slice.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`flex items-center justify-between p-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                  hoveredIdx === slice.idx ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="truncate text-slate-700">{slice.label}</span>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <span className="font-extrabold text-slate-900">{slice.percentage.toFixed(1)}%</span>
                  <span className="text-[10px] text-slate-400 block">
                    {slice.value.toLocaleString('id-ID')} {unit}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}

export default function Produksi2025() {
  const [dataDaging, setDataDaging] = useState<any[]>([]);
  const [dataTelur, setDataTelur] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/get-produksi');
        const data = await response.json();
        setDataDaging(data.dataDaging || []);
        setDataTelur(data.dataTelur || []);
      } catch (error) {
        console.error('Gagal menyedot data produksi 2025:', error);
      } finally {
        setIsLoading(false);
      }
    };
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
      XLSX.utils.book_append_sheet(wb, wsDaging, 'Produksi_Daging_2025');
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
      XLSX.utils.book_append_sheet(wb, wsTelur, 'Produksi_Telur_2025');
    }

    XLSX.writeFile(wb, `Laporan_Produksi_Daging_Telur_2025_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-20">
      
      {/* ── TOP HEADER (Tema Hijau - Lega & Bernapas) ── */}
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
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Produksi 2025 (Paten)</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Laporan Produksi Daging &amp; Telur Tahun 2025
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
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64 w-full">
            <span className="font-sans text-xs text-slate-500 uppercase tracking-widest animate-pulse">
              Memuat data produksi peternakan 2025...
            </span>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* ── 2 DIAGRAM LINGKARAN (PRODUKSI DAGING & PRODUKSI TELUR 2025) ── */}
            <section className="space-y-3">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <PieChartIcon size={20} strokeWidth={2.5} className="text-emerald-600" />
                  <span>Visualisasi Proporsi Kontribusi Produksi 2025</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Perbandingan persentase tonase komoditas daging dan produksi butir telur di Kabupaten Kebumen tahun 2025
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* 1. Diagram Lingkaran Daging */}
                <DonutChart
                  title="Proporsi Produksi Daging 2025"
                  subtitle="Persentase kontribusi daging potong per komoditas"
                  icon="🥩"
                  data={pieDataDaging}
                  unit="KG"
                />

                {/* 2. Diagram Lingkaran Telur */}
                <DonutChart
                  title="Proporsi Produksi Telur 2025"
                  subtitle="Persentase kontribusi telur konsumsi unggas"
                  icon="🥚"
                  data={pieDataTelur}
                  unit="KG"
                />
              </div>
            </section>

            {/* PANEL PRODUKSI DAGING */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🥩</span>
                  <div>
                    <h2 className="font-bold text-base text-slate-900">
                      Produksi Daging Siap Potong (Kilogram) — 2025
                    </h2>
                    <p className="text-xs text-slate-500">
                      Rekapitulasi bulanan pemotongan ternak tahun 2025 (Data Paten)
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

            {/* PANEL PRODUKSI TELUR */}
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🥚</span>
                  <div>
                    <h2 className="font-bold text-base text-slate-900">
                      Produksi Telur Konsumsi (Kilogram) — 2025
                    </h2>
                    <p className="text-xs text-slate-500">
                      Rekapitulasi bulanan komoditas unggas petelur tahun 2025 (Data Paten)
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

    </div>
  );
}