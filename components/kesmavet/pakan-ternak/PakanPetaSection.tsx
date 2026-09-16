import React from 'react';
import {
  Wheat,
  Compass,
  Sparkles,
  Info,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  KapasitasPakanKecamatan,
  KEBUMEN_MAP_VIEWBOX,
  getKapasitasPakanColor,
  LEGENDA_KAPASITAS_PAKAN,
} from '@/lib/pakanData';

interface PakanPetaSectionProps {
  mobileTab: 'map' | 'table';
  selectedYear: number;
  dataPakan: KapasitasPakanKecamatan[];
  selectedKecamatan: KapasitasPakanKecamatan | null;
  setSelectedKecamatan: (kec: KapasitasPakanKecamatan | null) => void;
  hoveredKecamatan: KapasitasPakanKecamatan | null;
  setHoveredKecamatan: (kec: KapasitasPakanKecamatan | null) => void;
  totalSurplusCount: number;
  totalDefisitCount: number;
  totalPotensiPenambahan: number;
}

export default function PakanPetaSection({
  mobileTab,
  selectedYear,
  dataPakan,
  selectedKecamatan,
  setSelectedKecamatan,
  hoveredKecamatan,
  setHoveredKecamatan,
  totalSurplusCount,
  totalDefisitCount,
  totalPotensiPenambahan,
}: PakanPetaSectionProps) {
  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-8 space-y-6 relative overflow-hidden ${
        mobileTab !== 'map' ? 'hidden sm:block' : 'block'
      }`}
    >
      {/* Header Peta */}
      <div className="text-center space-y-1 pb-4 border-b border-slate-100 relative">
        <h2 className="text-lg sm:text-3xl font-black text-slate-900 tracking-tight uppercase">
          Peta Sebaran Kapasitas Pakan Kabupaten Kebumen
        </h2>
        <p className="text-[11px] sm:text-sm font-semibold text-slate-500">
          Analisis Daya Tampung &amp; Potensi Penambahan Populasi Ternak Berdasarkan Ketersediaan Pakan Lokal (Tahun {selectedYear})
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

              {/* 26 Poligon Kecamatan Resmi */}
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
                  return <polygon key={kec.id} points={kec.points} {...commonProps} />;
                } else if (kec.d) {
                  return <path key={kec.id} d={kec.d} {...commonProps} />;
                }
                return null;
              })}

              {/* Label Nama & Angka Potensi Penambahan Tiap Kecamatan */}
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

                    {/* Nama Kecamatan */}
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
                      fill={isSelected ? (isDefisit ? '#FCA5A5' : '#86EFAC') : isDefisit ? '#DC2626' : '#15803D'}
                      fontSize="320"
                      fontWeight="900"
                      fontFamily="system-ui, -apple-system, 'Inter', 'Segoe UI', Arial, sans-serif"
                    >
                      {kec.potensi_penambahan_st > 0
                        ? `+${kec.potensi_penambahan_st.toLocaleString('id-ID')}`
                        : kec.potensi_penambahan_st.toLocaleString('id-ID')}{' '}
                      <tspan fontSize="210" fontWeight="bold">
                        ST
                      </tspan>
                    </text>

                    {/* Status Label */}
                    <text
                      x="0"
                      y="430"
                      textAnchor="middle"
                      fill={isSelected ? '#E2E8F0' : isDefisit ? '#991B1B' : '#166534'}
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
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${
                      hoveredKecamatan.potensi_penambahan_st >= 0 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}
                  >
                    {hoveredKecamatan.potensi_penambahan_st >= 0 ? 'SURPLUS' : 'DEFISIT'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-300">
                  <div>
                    Potensi Pakan:{' '}
                    <strong className="text-white">{hoveredKecamatan.potensi_pakan_kg.toLocaleString('id-ID')} kg</strong>
                  </div>
                  <div>
                    Kapasitas Tampung:{' '}
                    <strong className="text-white">{hoveredKecamatan.kapasitas_tampung_ekor.toLocaleString('id-ID')} ekor</strong>
                  </div>
                  <div>
                    Jumlah Ternak (ST):{' '}
                    <strong className="text-white">{hoveredKecamatan.jumlah_ternak_st.toLocaleString('id-ID')} ST</strong>
                  </div>
                  <div>
                    Potensi Penambahan:{' '}
                    <strong className={hoveredKecamatan.potensi_penambahan_st >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {hoveredKecamatan.potensi_penambahan_st > 0
                        ? `+${hoveredKecamatan.potensi_penambahan_st.toLocaleString('id-ID')}`
                        : hoveredKecamatan.potensi_penambahan_st.toLocaleString('id-ID')}{' '}
                      ST
                    </strong>
                  </div>
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
                    +{totalPotensiPenambahan.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                    ST
                  </span>
                </div>
              </div>
            </div>

            {/* Metadata & Skala */}
            <div className="text-[10px] sm:text-[11px] text-slate-400 space-y-0.5 text-center sm:text-right">
              <p className="font-semibold text-slate-600">Vektor Peta: https://tanahair.indonesia.go.id</p>
              <p>Basis Evaluasi: Standar Daya Tampung Satuan Ternak (ST) {selectedYear}</p>
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
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Legenda Status Kapasitas</h3>
              <p className="text-[11px] text-slate-500">Potensi Penambahan Satuan Ternak (ST)</p>
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
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Ringkasan 26 Kecamatan</span>

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
  );
}
