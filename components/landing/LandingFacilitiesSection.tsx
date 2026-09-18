'use client';

import React from 'react';
import Link from 'next/link';
import {
  Stethoscope,
  Building2,
  ChevronRight,
  MapPin,
  Users,
  Search,
  X,
  LayoutGrid,
  List,
  Navigation,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface LandingFacilitiesSectionProps {
  facilityTab: 'puskeswan' | 'rph';
  setFacilityTab: (tab: 'puskeswan' | 'rph') => void;
  puskeswanList: any[];
  searchPuskeswan: string;
  setSearchPuskeswan: (val: string) => void;
  filteredPuskeswan: any[];
  puskeswanViewMode: 'cards' | 'table';
  setPuskeswanViewMode: (mode: 'cards' | 'table') => void;
  expandedPuskeswanLayanan: number | null;
  setExpandedPuskeswanLayanan: React.Dispatch<React.SetStateAction<number | null>>;
  expandedTableLayanan: number | null;
  setExpandedTableLayanan: React.Dispatch<React.SetStateAction<number | null>>;
  searchRphFilter: string;
  setSearchRphFilter: (val: string) => void;
  rphViewMode: 'cards' | 'table';
  setRphViewMode: (mode: 'cards' | 'table') => void;
}

export default function LandingFacilitiesSection({
  facilityTab,
  setFacilityTab,
  puskeswanList,
  searchPuskeswan,
  setSearchPuskeswan,
  filteredPuskeswan,
  puskeswanViewMode,
  setPuskeswanViewMode,
  expandedPuskeswanLayanan,
  setExpandedPuskeswanLayanan,
  expandedTableLayanan,
  setExpandedTableLayanan,
  searchRphFilter,
  setSearchRphFilter,
  rphViewMode,
  setRphViewMode,
}: LandingFacilitiesSectionProps) {
  return (
    <section id="puskeswan" className="space-y-4 sm:space-y-5 scroll-mt-20">
      {/* TAB NAVIGASI FASILITAS PELAYANAN (KIRI & KANAN) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border-2 border-slate-200 dark:border-slate-700 shadow-xs">
        <button
          type="button"
          onClick={() => setFacilityTab('puskeswan')}
          className={`min-h-[44px] h-auto py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            facilityTab === 'puskeswan'
              ? 'bg-blue-600 text-white shadow-xs scale-[1.01]'
              : 'bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 border-2 border-slate-200 dark:border-slate-700'
          }`}
        >
          <Stethoscope size={18} className="shrink-0" />
          <span>Unit Puskeswan (8 Unit Aktif)</span>
        </button>

        <button
          type="button"
          onClick={() => setFacilityTab('rph')}
          className={`min-h-[44px] h-auto py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer text-center ${
            facilityTab === 'rph'
              ? 'bg-blue-600 text-white shadow-xs scale-[1.01]'
              : 'bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 border-2 border-slate-200 dark:border-slate-700'
          }`}
        >
          <Building2 size={18} className="shrink-0" />
          <span>Rumah Potong Hewan (RPH Kebumen &amp; Gombong)</span>
        </button>
      </div>

      {/* ── KONTEN TAB 1: UNIT PUSKESWAN ── */}
      {facilityTab === 'puskeswan' && (
        <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-xs font-bold text-sky-800 dark:text-sky-300 mb-1.5">
                  <Stethoscope size={14} className="text-sky-600 dark:text-sky-400" />
                  <span>Cakupan Pelayanan Kesehatan Hewan Terpadu</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Data {puskeswanList.length} Unit Puskeswan Aktif Kabupaten Kebumen
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  Rekapitulasi resmi cakupan kecamatan binaan, koordinator dokter hewan, dan pos pelayanan keliling (Pusling)
                </p>
              </div>
            </div>

            <Link
              href="/keswan/puskeswan"
              className="text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors self-start xs:self-auto"
            >
              <span>Buka Lembar Kerja Kinerja</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* 3 Stat Ringkasan Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-xs">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 truncate">Unit Puskeswan Aktif</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{puskeswanList.length} Unit</p>
                <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  100% Beroperasi Aktif
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Building2 size={24} />
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-xs">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 truncate">Cakupan Wilayah</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">26 Kecamatan</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 truncate">
                  Seluruh Kab. Kebumen
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Users size={24} />
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-xs">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1 truncate">Puskeswan Keliling (Pusling)</p>
                <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">8 Unit</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 truncate">
                  Pelayanan Aktif Door-to-Door Peternak
                </p>
              </div>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MapPin size={24} />
              </div>
            </div>
          </div>

          {/* Search & View Switcher Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                value={searchPuskeswan}
                onChange={(e) => setSearchPuskeswan(e.target.value)}
                placeholder="Cari puskeswan, kecamatan binaan, atau dokter..."
                className="w-full h-9 pl-9 pr-8 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
              {searchPuskeswan && (
                <button
                  type="button"
                  onClick={() => setSearchPuskeswan('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1 hidden xs:inline">
                Menampilkan <span className="font-bold text-blue-700 dark:text-blue-400">{filteredPuskeswan.length}</span> dari {puskeswanList.length} unit
              </span>

              <div className="inline-flex rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPuskeswanViewMode('cards')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    puskeswanViewMode === 'cards'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <LayoutGrid size={13} />
                  <span>Daftar Visual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPuskeswanViewMode('table')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    puskeswanViewMode === 'table'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <List size={13} />
                  <span>Tabel</span>
                </button>
              </div>
            </div>
          </div>

          {/* CARD GRID VIEW */}
          {puskeswanViewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPuskeswan.length === 0 ? (
                <div className="col-span-full p-8 text-center bg-slate-50/60 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
                  Tidak ditemukan Puskeswan dengan kata kunci &quot;<span className="font-semibold text-slate-800 dark:text-slate-200">{searchPuskeswan}</span>&quot;
                </div>
              ) : (
                filteredPuskeswan.map((item: any, idx: number) => (
                  <div
                    key={item.no || idx}
                    className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between group space-y-4 shadow-xs"
                  >
                    <div className="space-y-3">
                      {/* Card Top */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border-2 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 flex items-center justify-center shrink-0 font-extrabold text-sm sm:text-base shadow-2xs sm:group-hover:scale-105 transition-transform">
                            {(idx + 1) < 10 ? `0${idx + 1}` : idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-extrabold text-base sm:text-xl text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                              <span>{item.nama}</span>
                            </h4>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800 text-xs sm:text-sm font-bold text-blue-800 dark:text-blue-300">
                                <Stethoscope size={13} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                <span className="truncate">{item.koordinator}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 self-start shrink-0">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          {item.status || 'Aktif Melayani'}
                        </span>
                      </div>

                      {/* Wilayah Pelayanan Binaan */}
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                          <MapPin size={14} className="text-sky-600 dark:text-sky-400" />
                          <span>Wilayah Pelayanan Binaan ({item.kecamatan?.length || 1} Kecamatan):</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(item.kecamatan || ['Kebumen']).map((kec: string) => (
                            <span
                              key={kec}
                              className="px-3 py-1 rounded-lg text-xs sm:text-sm font-bold bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-slate-100 shadow-2xs"
                            >
                              Kec. {kec}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Lokasi Google Maps */}
                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-700">
                        <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                          <Navigation size={14} className="text-emerald-600 dark:text-emerald-400" />
                          <span>Lokasi Google Maps:</span>
                        </p>
                        <a
                          href={item.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-between gap-2 w-full px-3.5 py-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm font-bold transition-all group/map shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs sm:group-hover/map:scale-105 transition-transform">
                              <MapPin size={14} />
                            </div>
                            <span className="truncate">{item.alamat}</span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 shrink-0 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800">
                            <span>Buka Maps</span>
                            <ExternalLink size={12} />
                          </span>
                        </a>
                      </div>
                    </div>

                    {/* Card Bottom: Dropdown Fasilitas & Layanan Medis */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPuskeswanLayanan(
                            expandedPuskeswanLayanan === (item.no || idx + 1) ? null : (item.no || idx + 1)
                          )
                        }
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 transition-all text-left cursor-pointer group/drop shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs sm:group-hover/drop:scale-105 transition-transform">
                            <Stethoscope size={14} />
                          </div>
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                            Fasilitas &amp; Layanan Medis
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 text-xs font-bold shrink-0 hidden xs:inline">
                            {item.layanan?.length || 4}
                          </span>
                        </div>
                        <div
                          className={`w-6 h-6 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-transform duration-200 shadow-2xs shrink-0 ${
                            expandedPuskeswanLayanan === (item.no || idx + 1) ? 'rotate-180 bg-blue-600 text-white' : ''
                          }`}
                        >
                          <ChevronDown size={14} />
                        </div>
                      </button>

                      {/* Dropdown Menu Content */}
                      {expandedPuskeswanLayanan === (item.no || idx + 1) && (
                        <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200 space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <span>Daftar Layanan Medis:</span>
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">{item.layanan?.length || 4} Layanan</span>
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                            {(item.layanan || ['Pelayanan Klinik', 'Pusling', 'IB & PKB', 'Vaksinasi']).map((lay: string, layIdx: number) => (
                              <div
                                key={layIdx}
                                className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs"
                              >
                                <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                <span className="truncate">{lay}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* TABLE VIEW PUSKESWAN */
            <div className="overflow-x-auto rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-xs bg-white dark:bg-slate-800">
              <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold border-b-2 border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3 sm:p-3.5 w-12 text-center">NO</th>
                    <th className="p-3 sm:p-3.5">NAMA PUSKESWAN</th>
                    <th className="p-3 sm:p-3.5">WILAYAH PELAYANAN BINAAN</th>
                    <th className="p-3 sm:p-3.5">KOORDINATOR MEDIK</th>
                    <th className="p-3 sm:p-3.5">LOKASI GOOGLE MAPS</th>
                    <th className="p-3 sm:p-3.5">FASILITAS &amp; LAYANAN MEDIS</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
                  {filteredPuskeswan.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/40 transition-colors">
                      <td className="p-3 sm:p-3.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                            <Stethoscope size={14} />
                          </div>
                          <span>{row.nama}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {(row.kecamatan || ['Kebumen']).map((kec: string) => (
                            <span key={kec} className="px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              Kec. {kec}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          {row.koordinator}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <a
                          href={row.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-all group/tabmap"
                        >
                          <MapPin size={13} className="text-emerald-600 dark:text-emerald-400 sm:group-hover/tabmap:scale-110 transition-transform" />
                          <span>Buka Maps</span>
                          <ExternalLink size={11} className="text-emerald-600 dark:text-emerald-400" />
                        </a>
                      </td>
                      <td className="p-3.5">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedTableLayanan(
                                expandedTableLayanan === (row.no || idx + 1) ? null : (row.no || idx + 1)
                              )
                            }
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold transition-all cursor-pointer"
                          >
                            <Stethoscope size={13} className="text-blue-600 dark:text-blue-400" />
                            <span>Fasilitas &amp; Layanan ({row.layanan?.length || 4})</span>
                            <ChevronDown
                              size={13}
                              className={`transition-transform duration-200 ${
                                expandedTableLayanan === (row.no || idx + 1) ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          {/* Table Dropdown Menu */}
                          {expandedTableLayanan === (row.no || idx + 1) && (
                            <div className="absolute right-0 top-full mt-1.5 w-64 p-3 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-xl z-30 animate-in fade-in zoom-in-95 duration-150 space-y-1.5">
                              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <span>{row.nama}</span>
                                <span className="text-blue-600 dark:text-blue-400 font-semibold">{row.layanan?.length || 4} Layanan</span>
                              </p>
                              <div className="space-y-1">
                                {(row.layanan || ['Pelayanan Klinik', 'Pusling', 'IB & PKB', 'Vaksinasi']).map((lay: string, layIdx: number) => (
                                  <div
                                    key={layIdx}
                                    className="flex items-center gap-2 text-xs font-medium text-slate-800 dark:text-slate-200 py-1 px-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700"
                                  >
                                    <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                                    <span className="truncate">{lay}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── KONTEN TAB 2: RUMAH POTONG HEWAN (RPH KEBUMEN & GOMBONG) ── */}
      {facilityTab === 'rph' && (
        <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 sm:gap-3">
            <div className="flex items-center flex-wrap gap-2 sm:gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                  <Building2 size={13} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Fasilitas Rumah Potong Hewan (RPH) Resmi Daerah</span>
                </div>
                <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Rumah Potong Hewan (RPH) Kabupaten Kebumen
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  Fasilitas pemotongan ternak resmi berstandar ASUH (Aman, Sehat, Utuh, Halal) di RPH Kebumen dan RPH Gombong
                </p>
              </div>
            </div>

            <Link
              href="/kesmavet/rph-tph-tpu"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors self-start xs:self-auto"
            >
              <span>Buka Modul RPH-TPH-TPU</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          {/* Search & View Switcher Toolbar RPH */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                value={searchRphFilter}
                onChange={(e) => setSearchRphFilter(e.target.value)}
                placeholder="Cari RPH Kebumen, Gombong, atau lokasi..."
                className="w-full h-9 pl-9 pr-8 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
              />
              {searchRphFilter && (
                <button
                  type="button"
                  onClick={() => setSearchRphFilter('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Hapus pencarian"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="inline-flex rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setRphViewMode('cards')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    rphViewMode === 'cards'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <LayoutGrid size={13} />
                  <span>Daftar Visual</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRphViewMode('table')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    rphViewMode === 'table'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  <List size={13} />
                  <span>Tabel</span>
                </button>
              </div>
            </div>
          </div>

          {/* DAFTAR VISUAL RPH */}
          {rphViewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CARD 1: RPH KEBUMEN */}
              {('rph kebumen'.includes(searchRphFilter.toLowerCase()) ||
                'kebumen'.includes(searchRphFilter.toLowerCase()) ||
                searchRphFilter === '') && (
                <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between group space-y-4 shadow-xs">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-2xs sm:group-hover:scale-105 transition-transform">
                          01
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                            <span>RPH Unit Kebumen</span>
                          </h4>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Rumah Potong Hewan Resmi Wilayah Kebumen
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        Sertifikat Halal Resmi
                      </span>
                    </div>

                    {/* Fasilitas & Standar Higienis */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Fasilitas &amp; Standar Higienis:</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
                          <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                          <span>Juru Sembelih Halal (Juleha)</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
                          <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                          <span>Pengawasan Medik Veteriner</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
                          <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                          <span>Pemeriksaan Antemortem</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
                          <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                          <span>Pemeriksaan Postmortem</span>
                        </div>
                      </div>
                    </div>

                    {/* Lokasi & Google Maps */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                        <Navigation size={12} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Lokasi Fasilitas:</span>
                      </p>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=RPH+Kebumen"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between gap-2 w-full px-3 py-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-all group/map shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs sm:group-hover/map:scale-105 transition-transform">
                            <MapPin size={13} />
                          </div>
                          <span className="truncate">Kecamatan Kebumen, Kabupaten Kebumen</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                          <span>Buka Maps</span>
                          <ExternalLink size={11} />
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* CARD 2: RPH GOMBONG */}
              {('rph gombong'.includes(searchRphFilter.toLowerCase()) ||
                'gombong'.includes(searchRphFilter.toLowerCase()) ||
                searchRphFilter === '') && (
                <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between group space-y-4 shadow-xs">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-sm shadow-2xs sm:group-hover:scale-105 transition-transform">
                          02
                        </div>
                        <div>
                          <h4 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                            <span>RPH Unit Gombong</span>
                          </h4>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Rumah Potong Hewan Resmi Wilayah Gombong
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        Sertifikat Halal Resmi
                      </span>
                    </div>

                    {/* Fasilitas & Standar Higienis */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700 space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Fasilitas &amp; Standar Higienis:</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
                          <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                          <span>Jalur Halal Ruminansia</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
                          <CheckCircle2 size={12} className="text-amber-600 shrink-0" />
                          <span>Tempat Terpisah Khusus Babi</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
                          <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                          <span>Juru Sembelih Halal (Juleha)</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600">
                          <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                          <span>Pengawasan Medik Veteriner</span>
                        </div>
                      </div>
                    </div>

                    {/* Lokasi & Google Maps */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                        <Navigation size={12} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Lokasi Fasilitas:</span>
                      </p>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=RPH+Gombong+Kebumen"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-between gap-2 w-full px-3 py-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-all group/map shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs sm:group-hover/map:scale-105 transition-transform">
                            <MapPin size={13} />
                          </div>
                          <span className="truncate">Kecamatan Gombong, Kabupaten Kebumen</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shrink-0 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                          <span>Buka Maps</span>
                          <ExternalLink size={11} />
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TABEL VIEW RPH */
            <div className="overflow-x-auto rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-xs bg-white dark:bg-slate-800">
              <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 font-semibold border-b-2 border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3 sm:p-3.5 w-12 text-center">NO</th>
                    <th className="p-3 sm:p-3.5">NAMA RUMAH POTONG HEWAN</th>
                    <th className="p-3 sm:p-3.5">LOKASI KECAMATAN</th>
                    <th className="p-3 sm:p-3.5">STANDAR HYGIENE &amp; HALAL</th>
                    <th className="p-3 sm:p-3.5">LOKASI MAPS</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 dark:divide-slate-700 text-slate-800 dark:text-slate-200">
                  <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="p-3.5 text-center text-slate-400 font-bold">1</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-blue-600 shrink-0" />
                        <span>RPH Unit Kebumen</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300">Kecamatan Kebumen</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 size={12} />
                        Sertifikat Halal Resmi &amp; Juleha
                      </span>
                    </td>
                    <td className="p-3.5">
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=RPH+Kebumen"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-all"
                      >
                        <MapPin size={13} className="text-emerald-600" />
                        <span>Buka Maps</span>
                        <ExternalLink size={11} className="text-emerald-600" />
                      </a>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="p-3.5 text-center text-slate-400 font-bold">2</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-indigo-600 shrink-0" />
                        <span>RPH Unit Gombong</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300">Kecamatan Gombong</td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 size={12} />
                        Sertifikat Halal &amp; Tempat Khusus Babi
                      </span>
                    </td>
                    <td className="p-3.5">
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=RPH+Gombong+Kebumen"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition-all"
                      >
                        <MapPin size={13} className="text-emerald-600" />
                        <span>Buka Maps</span>
                        <ExternalLink size={11} className="text-emerald-600" />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
