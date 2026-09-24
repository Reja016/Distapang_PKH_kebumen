'use client';

import React from 'react';
import { Sparkles, X, MapPin, Edit2 } from 'lucide-react';
import {
  KECAMATAN_ITEMS,
  KEBUMEN_MAP_VIEWBOX,
  getSapiPOColor,
  SAPI_PO_LEGEND,
} from '@/lib/sklbPetaData';

interface SklbPetaSectionProps {
  selectedYear: number;
  triwulanText: string;
  totalSapiPO: number;
  sapiPOKecMap: Record<string, number>;
  selectedKecamatan: any | null;
  setSelectedKecamatan: (val: any | null) => void;
  hoveredKecamatan: any | null;
  setHoveredKecamatan: (val: any | null) => void;
  canEdit: boolean;
  topKecamatan: { nama: string; pop: number };
  onOpenEditSapiPO: (kec: any) => void;
  onShowHistory?: (row: any) => void;
}

export function SklbPetaSection({
  selectedYear,
  triwulanText,
  totalSapiPO,
  sapiPOKecMap,
  selectedKecamatan,
  setSelectedKecamatan,
  hoveredKecamatan,
  setHoveredKecamatan,
  canEdit,
  topKecamatan,
  onOpenEditSapiPO,
  onShowHistory,
}: SklbPetaSectionProps) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-8 space-y-6 relative overflow-hidden">
      {/* Header Judul Peta Rapi */}
      <div className="text-center space-y-1 pb-4 border-b border-slate-100">
        <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
          Peta Sebaran Populasi Sapi PO di Kabupaten Kebumen
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-emerald-800">
          Peranakan Ongole &bull; Agregasi Tingkat Kecamatan &bull; Tahun {selectedYear}
        </p>
      </div>

      {/* Grid Layout: Peta di Kiri & Panel Samping di Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── AREA PETA INTERAKTIF SVG ── */}
        <div className="lg:col-span-8 xl:col-span-9 bg-slate-50/70 border border-slate-200/90 rounded-3xl p-4 sm:p-6 relative overflow-hidden flex flex-col items-center">
          {/* Petunjuk & Reset Button */}
          <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-3">
            <span className="flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              <Sparkles size={14} className="text-emerald-600 shrink-0" />
              <span>Klik kecamatan di peta untuk melihat rincian &amp; edit data</span>
            </span>

            {selectedKecamatan && (
              <button
                onClick={() => setSelectedKecamatan(null)}
                className="px-3 py-1 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                <X size={13} />
                <span>Reset Fokus</span>
              </button>
            )}
          </div>

          {/* Peta SVG Kebumen */}
          <div className="relative w-full aspect-[16/11] min-h-[480px] sm:min-h-[580px] flex items-center justify-center select-none">
            <svg
              viewBox={KEBUMEN_MAP_VIEWBOX}
              className="w-full h-full"
              style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.05))' }}
            >
              {/* Background Reset Area */}
              <rect
                x="-6000"
                y="1000"
                width="35000"
                height="28000"
                fill="transparent"
                onClick={() => setSelectedKecamatan(null)}
              />

              {/* 26 Poligon Kecamatan */}
              {KECAMATAN_ITEMS.map((kec) => {
                const cleanId = kec.id.toLowerCase().replace('k_', '');
                const pop = sapiPOKecMap[cleanId] || sapiPOKecMap[kec.id] || 0;
                const colorInfo = getSapiPOColor(pop);

                const isSelected = selectedKecamatan?.id === kec.id;
                const isHovered = hoveredKecamatan?.id === kec.id;

                const commonProps = {
                  fill: colorInfo.fill,
                  stroke: isSelected ? '#451A03' : isHovered ? '#78350F' : '#FFFFFF',
                  strokeWidth: isSelected ? 90 : isHovered ? 60 : 35,
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

              {/* Label Nama Kecamatan & Angka Populasi */}
              {KECAMATAN_ITEMS.map((kec) => {
                const cleanId = kec.id.toLowerCase().replace('k_', '');
                const pop = sapiPOKecMap[cleanId] || sapiPOKecMap[kec.id] || 0;
                const colorInfo = getSapiPOColor(pop);

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
                      y="-160"
                      textAnchor="middle"
                      fill={colorInfo.textColor}
                      fontSize="320"
                      fontWeight="800"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      style={
                        colorInfo.textColor === '#FFFFFF'
                          ? { paintOrder: 'stroke', stroke: '#451A03', strokeWidth: '55px' }
                          : { paintOrder: 'stroke', stroke: '#FFFFFF', strokeWidth: '40px' }
                      }
                    >
                      {kec.nama}
                    </text>

                    <text
                      x="0"
                      y="180"
                      textAnchor="middle"
                      fill={colorInfo.textColor}
                      fontSize="440"
                      fontWeight="900"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      style={
                        colorInfo.textColor === '#FFFFFF'
                          ? { paintOrder: 'stroke', stroke: '#451A03', strokeWidth: '65px' }
                          : { paintOrder: 'stroke', stroke: '#FFFFFF', strokeWidth: '50px' }
                      }
                    >
                      {pop.toLocaleString('id-ID')}
                    </text>

                    <text
                      x="0"
                      y="420"
                      textAnchor="middle"
                      fill={colorInfo.textColor}
                      fontSize="240"
                      fontWeight="700"
                      fontFamily="system-ui, -apple-system, sans-serif"
                      style={
                        colorInfo.textColor === '#FFFFFF'
                          ? { paintOrder: 'stroke', stroke: '#451A03', strokeWidth: '45px' }
                          : { paintOrder: 'stroke', stroke: '#FFFFFF', strokeWidth: '35px' }
                      }
                    >
                      ekor
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Detail Box Saat Kecamatan Dipilih */}
          {selectedKecamatan && (
            <div className="w-full mt-4 p-4.5 bg-white rounded-2xl border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-xs shrink-0"
                  style={{ backgroundColor: getSapiPOColor(sapiPOKecMap[selectedKecamatan.id.toLowerCase().replace('k_', '')] || 0).fill }}
                >
                  <MapPin size={22} className={getSapiPOColor(sapiPOKecMap[selectedKecamatan.id.toLowerCase().replace('k_', '')] || 0).textColor === '#78350F' ? 'text-amber-950' : 'text-white'} />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Kecamatan {selectedKecamatan.nama}</h4>
                  <p className="text-xs font-semibold text-slate-500">
                    Populasi Sapi PO Tahun {selectedYear}:{' '}
                    <span className="text-amber-900 font-black text-sm">
                      {(sapiPOKecMap[selectedKecamatan.id.toLowerCase().replace('k_', '')] || 0).toLocaleString('id-ID')} Ekor
                    </span>
                  </p>
                </div>
              </div>

              {canEdit && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenEditSapiPO(selectedKecamatan)}
                    className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Edit2 size={13} />
                    <span>Edit Data Kec. {selectedKecamatan.nama}</span>
                  </button>
                  {onShowHistory && (
                    <button
                      onClick={() => onShowHistory(selectedKecamatan)}
                      className="h-9 px-3.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span>Riwayat</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── PANEL KANAN: CARD TOTAL POPULASI & LEGENDA HIJAU ── */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {/* Card Ringkasan Total Populasi */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100 bg-white/15 px-3 py-1 rounded-xl backdrop-blur-xs">
                  {triwulanText} {selectedYear}
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider">TOTAL POPULASI SAPI PO</p>
                <p className="text-[11px] font-semibold text-emerald-200">KABUPATEN KEBUMEN</p>
              </div>

              <div className="pt-1">
                <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  {totalSapiPO.toLocaleString('id-ID')}
                  <span className="text-base font-bold text-emerald-200 ml-1.5">Ekor</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-emerald-100 font-semibold">
                <span>Wilayah Tertinggi:</span>
                <span className="font-extrabold text-white">Kec. {topKecamatan.nama} ({topKecamatan.pop.toLocaleString('id-ID')})</span>
              </div>
            </div>
          </div>

          {/* Panel Legenda Gradasi Hijau */}
          <div className="bg-slate-50/90 rounded-3xl border border-slate-200 p-5 space-y-3">
            <div>
              <h3 className="text-xs font-black text-slate-900 tracking-wider uppercase">
                LEGENDA POPULASI
              </h3>
              <p className="text-[11px] font-bold text-emerald-800">Rentang Jumlah Sapi PO (Ekor)</p>
            </div>

            <div className="space-y-2 pt-1">
              {SAPI_PO_LEGEND.map((leg) => (
                <div key={leg.label} className="flex items-center justify-between text-xs font-bold text-slate-800 py-0.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-5 h-5 rounded-lg shrink-0 border border-slate-300 shadow-2xs"
                      style={{ backgroundColor: leg.color }}
                    />
                    <span>{leg.label} Ekor</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
