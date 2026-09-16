'use client';

import React from 'react';
import {
  FileText,
  Search,
  Users,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { KegiatanKTT, DAFTAR_TIM_PELAKSANA } from './types';

interface KegiatanTableProps {
  listKegiatan: KegiatanKTT[];
  filteredKegiatan: KegiatanKTT[];
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  filterKtt: string;
  setFilterKtt: (s: string) => void;
  filterTim: string;
  setFilterTim: (s: string) => void;
  selectedDateFilter: string | null;
  setSelectedDateFilter: (s: string | null) => void;
  isLoading: boolean;
  canEdit: boolean;
  onEdit: (item: KegiatanKTT) => void;
  onDelete: (id: string) => void;
  setPreviewPhotoModal: (val: { url: string; title: string } | null) => void;
}

export function KegiatanTable({
  listKegiatan,
  filteredKegiatan,
  searchTerm,
  setSearchTerm,
  filterKtt,
  setFilterKtt,
  filterTim,
  setFilterTim,
  selectedDateFilter,
  setSelectedDateFilter,
  isLoading,
  canEdit,
  onEdit,
  onDelete,
  setPreviewPhotoModal,
}: KegiatanTableProps) {
  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText size={18} strokeWidth={2.5} className="text-emerald-600" />
            <span>Riwayat Log Aktivitas &amp; Hasil Pendampingan</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              {filteredKegiatan.length} Catatan
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Pencatatan rekam jejak penyuluhan, vaksinasi, pembinaan, dan monev di tingkat kelompok tani
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} strokeWidth={2.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama KTT, jenis kegiatan, hasil, atau kecamatan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full min-h-touch h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterKtt}
            onChange={(e) => setFilterKtt(e.target.value)}
            className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 focus:bg-white cursor-pointer"
          >
            <option value="">Semua Kelompok Tani</option>
            {Array.from(new Set(listKegiatan.map((k) => k.nama_ktt))).map((ktt) => (
              <option key={ktt} value={ktt}>
                {ktt}
              </option>
            ))}
          </select>

          <select
            value={filterTim}
            onChange={(e) => setFilterTim(e.target.value)}
            className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 focus:bg-white cursor-pointer"
          >
            <option value="">Semua Tim Pelaksana</option>
            {DAFTAR_TIM_PELAKSANA.map((tim) => (
              <option key={tim} value={tim}>
                {tim}
              </option>
            ))}
          </select>

          {(filterKtt || filterTim || searchTerm || selectedDateFilter) && (
            <button
              onClick={() => {
                setFilterKtt('');
                setFilterTim('');
                setSearchTerm('');
                setSelectedDateFilter(null);
              }}
              className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Activity Cards List */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
          <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-bold">Memuat log kegiatan KTT...</p>
        </div>
      ) : filteredKegiatan.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <p className="text-sm font-bold text-slate-700">Belum ada catatan log kegiatan.</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Klik tombol &quot;+ Catat Kegiatan Baru&quot; untuk mencatat pendampingan, sosialisasi, atau monitoring kelompok.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredKegiatan.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-extrabold text-sm shrink-0">
                    <Users size={18} strokeWidth={2.5} />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">{item.nama_ktt}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{item.desa ? `${item.desa}, ` : ''}{item.kecamatan || 'Kabupaten Kebumen'}</span>
                      <span>•</span>
                      <span className="font-bold text-emerald-800">{item.tim_pelaksana}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5">
                    <Clock size={13} strokeWidth={2.5} />
                    {item.tanggal ? item.tanggal.substring(0, 10) : '-'}
                  </span>

                  {canEdit && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => onEdit(item)}
                        className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 size={14} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="w-8 h-8 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                        title="Hapus"
                      >
                        <Trash2 size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3 space-y-2">
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold">
                    📌 {item.nama_kegiatan}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {item.hasil_kegiatan || 'Belum ada uraian hasil kegiatan.'}
                  </p>
                </div>

                {/* Side Info: GPS & Foto */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                  <span className="font-bold text-slate-600 block text-[11px] uppercase tracking-wider">
                    Dokumentasi &amp; Titik
                  </span>
                  {item.lat ? (
                    <div className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 size={14} strokeWidth={2.5} />
                      <span>Lat: {item.lat}, Lng: {item.lng}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400">Titik GPS tidak dicatat</span>
                  )}

                  {item.photo && (
                    <div className="mt-2">
                      <img
                        src={item.photo}
                        alt="Foto Lapangan"
                        onClick={() => setPreviewPhotoModal({ url: item.photo!, title: `Dokumentasi: ${item.nama_kegiatan} - ${item.nama_ktt}` })}
                        className="w-full h-24 object-cover rounded-lg border border-slate-200 shadow-2xs cursor-pointer hover:opacity-90 hover:scale-[1.02] transition-all"
                        title="Klik untuk memperbesar foto dokumentasi"
                      />
                      <span className="block text-[10px] text-center text-slate-500 mt-1 font-medium">Klik foto untuk perbesar</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
