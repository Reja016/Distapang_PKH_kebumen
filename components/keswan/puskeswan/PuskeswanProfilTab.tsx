'use client';

import React from 'react';
import {
  Search,
  Building2,
  MapPin,
  User,
  Camera,
  ChevronRight,
  Edit2,
  Trash2,
} from 'lucide-react';
import { PuskeswanProfil } from '@/lib/puskeswanData';

interface PuskeswanProfilTabProps {
  filteredProfilList: PuskeswanProfil[];
  searchProfil: string;
  setSearchProfil: (val: string) => void;
  todayName: string;
  canEdit: boolean;
  onSelectProfil: (p: PuskeswanProfil) => void;
  onEditProfil: (p: PuskeswanProfil, e?: React.MouseEvent) => void;
  onDeleteProfil: (id: string | number, nama: string, e?: React.MouseEvent) => void;
}

export function PuskeswanProfilTab({
  filteredProfilList,
  searchProfil,
  setSearchProfil,
  todayName,
  canEdit,
  onSelectProfil,
  onEditProfil,
  onDeleteProfil,
}: PuskeswanProfilTabProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Search Bar */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">
              Jaringan Layanan Veteriner &amp; Foto Lokasi
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Puskeswan Se-Kabupaten Kebumen
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Klik kartu Puskeswan untuk melihat foto lokasi, daftar jam operasional harian, rute Google Maps, dan dokter penanggung jawab.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Cari puskeswan, dokter, kecamatan..."
            value={searchProfil}
            onChange={(e) => setSearchProfil(e.target.value)}
            className="w-full min-h-touch h-11 pl-10 pr-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors shadow-2xs"
          />
        </div>
      </div>

      {/* Grid Kartu Modul Puskeswan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProfilList.map((p) => {
          const fotoUtama =
            (p.galeri_foto && p.galeri_foto.length > 0 ? p.galeri_foto[0] : p.foto) ||
            '/images/modules/keswan.jpg';
          const totalFoto = (p.galeri_foto?.length || (p.foto ? 1 : 0)) || 1;
          const jadwalHariIni = p.jadwal_harian?.find(
            (j) => j.hari.toLowerCase() === todayName.toLowerCase()
          );

          return (
            <div
              key={p.id}
              onClick={() => onSelectProfil(p)}
              className="group relative bg-white border border-slate-200/90 rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-xs"
            >
              {/* Header Foto Puskeswan (Google Maps Card Style) */}
              <div className="relative w-full h-40 bg-slate-100 overflow-hidden">
                {fotoUtama.startsWith('data:') ||
                fotoUtama.startsWith('http') ||
                fotoUtama.startsWith('/') ? (
                  <img
                    src={fotoUtama}
                    alt={p.nama}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white">
                    <Building2 size={36} />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Badges on Image */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-white/90 backdrop-blur-md text-blue-900 border border-white/40 shadow-xs">
                    {p.kode}
                  </span>

                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-slate-900/80 backdrop-blur-md text-white flex items-center gap-1.5 shadow-xs">
                    <Camera size={12} />
                    <span>{totalFoto} Foto</span>
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <span className="text-[10px] font-bold bg-emerald-600/90 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {jadwalHariIni ? `${todayName}: ${jadwalHariIni.jam}` : 'Buka Hari Ini'}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="font-extrabold sm:font-black text-lg text-slate-900 group-hover:text-blue-700 transition-colors tracking-tight leading-snug">
                    {p.nama}
                  </h3>

                  <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                    <MapPin size={13} className="text-blue-600 shrink-0" />
                    <span className="truncate">{p.wilayah_binaan || 'Kabupaten Kebumen'}</span>
                  </p>

                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                    <p className="flex items-center gap-1.5 font-medium text-[11px] text-slate-700">
                      <User size={12} className="text-emerald-600 shrink-0" />
                      <span className="truncate">{p.dokter_hewan || 'Dokter Hewan Penanggung Jawab'}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 line-clamp-1">
                      {p.alamat}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-blue-700 text-xs font-bold">
                  <span className="group-hover:underline flex items-center gap-1">
                    Lihat Foto &amp; Jadwal
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>

                  {canEdit && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => onEditProfil(p, e)}
                        title="Edit Profil"
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-600 flex items-center justify-center transition-colors"
                      >
                        <Edit2 size={12} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={(e) => onDeleteProfil(p.id, p.nama, e)}
                        title="Hapus Profil"
                        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProfilList.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
          <Building2 size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-bold text-slate-700">Puskeswan tidak ditemukan</p>
          <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>
      )}
    </div>
  );
}
