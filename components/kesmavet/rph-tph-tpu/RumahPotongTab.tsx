'use client';

import React from 'react';
import { Search, Loader2, Edit2, Trash2 } from 'lucide-react';

interface RumahPotongTabProps {
  searchRph: string;
  setSearchRph: (val: string) => void;
  filterJenis: string;
  setFilterJenis: (val: string) => void;
  filterHalal: string;
  setFilterHalal: (val: string) => void;
  filteredRph: any[];
  isLoadingRph: boolean;
  isAdmin: boolean;
  onEditRph: (item: any) => void;
  onDeleteRph: (id: number) => void;
}

export function RumahPotongTab({
  searchRph,
  setSearchRph,
  filterJenis,
  setFilterJenis,
  filterHalal,
  setFilterHalal,
  filteredRph,
  isLoadingRph,
  isAdmin,
  onEditRph,
  onDeleteRph,
}: RumahPotongTabProps) {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchRph}
              onChange={(e) => setSearchRph(e.target.value)}
              placeholder="Cari nama usaha, pemilik, atau lokasi..."
              className="w-full h-10 pl-10 pr-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="h-10 px-3.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:border-purple-600"
          >
            <option value="ALL">Semua Jenis Unit</option>
            <option value="RPH">RPH (Rumah Potong Hewan)</option>
            <option value="TPU">TPU (Tempat Pemotongan Unggas)</option>
            <option value="RPU">RPU (Rumah Potong Unggas)</option>
            <option value="TPH">TPH (Tempat Pemotongan Hewan)</option>
          </select>

          <select
            value={filterHalal}
            onChange={(e) => setFilterHalal(e.target.value)}
            className="h-10 px-3.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:border-purple-600"
          >
            <option value="ALL">Semua Status Halal</option>
            <option value="Sudah">Sudah Bersertifikat</option>
            <option value="Belum">Belum Bersertifikat</option>
          </select>
        </div>
      </div>

      {/* Table RPH List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-purple-900 text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3.5 w-12 text-center">NO</th>
                <th className="p-3.5">NAMA USAHA</th>
                <th className="p-3.5 text-center">JENIS</th>
                <th className="p-3.5">PEMILIK</th>
                <th className="p-3.5">KONTAK</th>
                <th className="p-3.5">LOKASI / ALAMAT</th>
                <th className="p-3.5 text-center">SERTIFIKAT HALAL</th>
                <th className="p-3.5 text-center">NKV</th>
                {isAdmin && <th className="p-3.5 text-center w-24">AKSI</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoadingRph ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="p-8 text-center text-slate-400">
                    <Loader2 className="animate-spin inline-block mr-2 text-purple-600" size={16} />
                    Memuat data rumah potong...
                  </td>
                </tr>
              ) : filteredRph.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 9 : 8} className="p-8 text-center text-slate-400">
                    Tidak ada data yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredRph.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-purple-50/30 transition-colors">
                    <td className="p-3.5 text-center font-semibold text-slate-400">{idx + 1}</td>
                    <td className="p-3.5 font-bold text-slate-900">{item.nama_usaha}</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                        {item.jenis}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium">{item.pemilik || '-'}</td>
                    <td className="p-3.5 text-slate-500">{item.kontak || '-'}</td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate">{item.lokasi || item.alamat_pemilik || '-'}</td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.sertifikat_halal
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {item.sertifikat_halal ? 'Sudah' : 'Belum'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.sertifikat_nkv && !item.sertifikat_nkv.includes('belum')
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-50 text-slate-500 border-slate-200'
                        }`}
                      >
                        {item.sertifikat_nkv || 'Belum'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditRph(item)}
                            className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 flex items-center justify-center transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => onDeleteRph(item.id)}
                            className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
