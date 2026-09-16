import React from 'react';
import { X } from 'lucide-react';
import {
  KECAMATAN_MAP_ITEMS,
  KEBUMEN_MAP_VIEWBOX,
  PUSKESWAN_ZONES,
  DIAGNOSA_LIST,
  DIAGNOSA_COLOR_MAP,
  PUSKESWAN_HOST_BY_KECAMATAN,
  getZoneByKecamatanId,
} from '@/lib/penyakitData';

interface PenyakitPetaTabProps {
  selectedYear: number;
  selectedKecamatan: any | null;
  setSelectedKecamatan: (kec: any | null) => void;
  hoveredKecamatan: any | null;
  setHoveredKecamatan: (kec: any | null) => void;
  kecAggregates: Record<string, any>;
}

export default function PenyakitPetaTab({
  selectedYear,
  selectedKecamatan,
  setSelectedKecamatan,
  hoveredKecamatan,
  setHoveredKecamatan,
  kecAggregates,
}: PenyakitPetaTabProps) {
  return (
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

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT & CENTER: PETA INTERAKTIF SVG */}
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

          {/* SVG PETA KEBUMEN */}
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

              {/* Label Nama Kecamatan & Simbol Puskeswan */}
              {KECAMATAN_MAP_ITEMS.map((kec) => {
                const rawId = kec.id.toLowerCase();
                const cleanId = rawId.replace('k_', '');

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
                    <text
                      x="0"
                      y={puskeswanHostZone ? '-380' : '0'}
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

                    {puskeswanHostZone && (
                      <g transform="translate(0, 100)" className="pointer-events-none select-none">
                        <circle
                          cx="0"
                          cy="0"
                          r="360"
                          fill={puskeswanHostZone.colorHex}
                          stroke="#FFFFFF"
                          strokeWidth="50"
                          filter="url(#boxShadow)"
                        />
                        <g transform="scale(1.45) translate(0, -5)">
                          <path d="M-110 -15 L0 -125 L110 -15 L110 105 L-110 105 Z" fill="#FFFFFF" />
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

          {/* Detail Box Saat Kecamatan Dipilih */}
          {selectedKecamatan && (
            <div className="mt-4 p-4.5 bg-white rounded-2xl border border-blue-200 shadow-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: getZoneByKecamatanId(selectedKecamatan.id).colorHex }}
                  />
                  <span>Kecamatan {selectedKecamatan.nama}</span>
                </h4>
                <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                  Wilayah {getZoneByKecamatanId(selectedKecamatan.id).nama}
                </span>
              </div>

              <div className="pt-2">
                <p className="text-xs font-bold text-slate-600 mb-2">Diagnosa Penyakit Terlaporkan:</p>
                {Object.keys(
                  (
                    kecAggregates[selectedKecamatan.id.toLowerCase()] ||
                    kecAggregates[selectedKecamatan.id.toLowerCase().replace('k_', '')]
                  )?.cases || {}
                ).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada laporan penyakit pada tahun {selectedYear}.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(
                      (
                        kecAggregates[selectedKecamatan.id.toLowerCase()] ||
                        kecAggregates[selectedKecamatan.id.toLowerCase().replace('k_', '')]
                      ).cases
                    ).map((diag) => (
                      <span
                        key={diag}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 bg-slate-50 text-slate-800 shadow-2xs"
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: DIAGNOSA_COLOR_MAP[diag] || '#64748B' }}
                        />
                        <span>{diag}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: KETERANGAN DIAGNOSA PENYAKIT & ZONASI PUSKESWAN */}
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
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">8 Wilayah Kerja Puskeswan</h4>
            <div className="space-y-1.5">
              {Object.values(PUSKESWAN_ZONES).map((zone) => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between text-xs p-2 rounded-xl bg-white border border-slate-200 shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: zone.colorHex }} />
                    <span className="font-bold text-slate-900">{zone.nama}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Kantor: Kec. {zone.nama.replace('Puskeswan ', '')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
