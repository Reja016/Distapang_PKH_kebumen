'use client';

import React from 'react';
import {
  Map as MapIcon,
  Filter,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';
import { KegiatanKTT, DAFTAR_TIM_PELAKSANA } from './types';

interface KegiatanPetaTabProps {
  filterPetaKec: string;
  setFilterPetaKec: (s: string) => void;
  filterPetaTim: string;
  setFilterPetaTim: (s: string) => void;
  daftarKecamatanPeta: string[];
  kegiatanUntukPeta: KegiatanKTT[];
  mapInstanceRef: React.RefObject<any>;
  setPreviewPhotoModal: (val: { url: string; title: string } | null) => void;
}

export function KegiatanPetaTab({
  filterPetaKec,
  setFilterPetaKec,
  filterPetaTim,
  setFilterPetaTim,
  daftarKecamatanPeta,
  kegiatanUntukPeta,
  mapInstanceRef,
  setPreviewPhotoModal,
}: KegiatanPetaTabProps) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <MapIcon size={20} strokeWidth={2.5} className="text-emerald-600" />
            <span>Peta Interaktif Sebaran Kegiatan &amp; Pembinaan KTT</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualisasi sebaran spasial pendampingan kelompok tani ternak di seluruh wilayah Kabupaten Kebumen
          </p>
        </div>

        {/* Filter Peta */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Filter size={13} className="text-slate-500" />
            <span className="text-xs font-bold text-slate-600">Kecamatan:</span>
            <select
              value={filterPetaKec}
              onChange={(e) => setFilterPetaKec(e.target.value)}
              className="text-xs font-bold bg-transparent outline-none text-emerald-800 cursor-pointer"
            >
              <option value="Semua">Semua Wilayah</option>
              {daftarKecamatanPeta.map((kec) => (
                <option key={kec} value={kec}>{kec}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-bold text-slate-600">Tim:</span>
            <select
              value={filterPetaTim}
              onChange={(e) => setFilterPetaTim(e.target.value)}
              className="text-xs font-bold bg-transparent outline-none text-emerald-800 cursor-pointer max-w-[150px] sm:max-w-none truncate"
            >
              <option value="Semua">Semua Tim</option>
              {DAFTAR_TIM_PELAKSANA.map((tim) => (
                <option key={tim} value={tim}>{tim}</option>
              ))}
            </select>
          </div>

          {(filterPetaKec !== 'Semua' || filterPetaTim !== 'Semua') && (
            <button
              type="button"
              onClick={() => {
                setFilterPetaKec('Semua');
                setFilterPetaTim('Semua');
              }}
              className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Container Peta Leaflet */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 min-h-[420px] sm:min-h-[500px]">
        <div id="map-kegiatan-ktt" className="w-full h-[420px] sm:h-[500px] z-0" />

        {/* Overlay Stat Legend */}
        <div className="absolute top-3 right-3 z-[400] bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md text-xs font-bold text-slate-800 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span>{kegiatanUntukPeta.length} Titik Terpetakan</span>
        </div>
      </div>

      {/* Daftar Ringkas Titik Kegiatan yang Terpetakan */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
          <span>Daftar Kegiatan Berkoordinat GPS ({kegiatanUntukPeta.length})</span>
          <span className="text-[11px] text-slate-400 font-normal">Klik tombol fokus untuk mengarahkan peta</span>
        </h4>

        {kegiatanUntukPeta.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-500">
              Tidak ada data kegiatan dengan koordinat GPS untuk filter ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {kegiatanUntukPeta.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-emerald-300 hover:shadow-sm transition-all space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-extrabold text-xs text-slate-900 line-clamp-1">{item.nama_ktt}</h5>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                      {item.tanggal ? item.tanggal.substring(0, 10) : ''}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-semibold line-clamp-1 mt-0.5">
                    📌 {item.nama_kegiatan}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {item.desa ? `${item.desa}, ` : ''}{item.kecamatan || 'Kebumen'} • {item.tim_pelaksana}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-[10px] font-mono text-slate-500">
                    {Number(item.lat).toFixed(4)}, {Number(item.lng).toFixed(4)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {item.photo && (
                      <button
                        type="button"
                        onClick={() => setPreviewPhotoModal({ url: item.photo!, title: `Dokumentasi: ${item.nama_kegiatan} - ${item.nama_ktt}` })}
                        className="text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <ImageIcon size={11} /> Foto
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const lat = Number(item.lat);
                        const lng = Number(item.lng);
                        if (mapInstanceRef.current && !isNaN(lat) && !isNaN(lng)) {
                          mapInstanceRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
                          window.scrollTo({ top: (document.getElementById('map-kegiatan-ktt')?.offsetTop || 300) - 100, behavior: 'smooth' });
                        }
                      }}
                      className="text-[10px] font-bold text-slate-700 hover:text-emerald-700 bg-white border border-slate-200 px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-2xs hover:border-emerald-300 cursor-pointer"
                    >
                      <MapPin size={10} className="text-emerald-600" /> Fokus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
