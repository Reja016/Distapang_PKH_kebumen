'use client';

import React from 'react';
import { Search, User, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { KelompokTani, JENIS_KELOMPOK_OPTIONS, PAGE_SIZE } from './types';
import KelasBadge from './KelasBadge';

interface KttTableSectionProps {
  dataCount: number;
  paginated: KelompokTani[];
  filteredCount: number;
  search: string;
  setSearch: (val: string) => void;
  filterKecamatan: string;
  filterDesa: string;
  setFilterDesa: (val: string) => void;
  filterJenis: string;
  setFilterJenis: (val: string) => void;
  desaList: string[];
  page: number;
  totalPages: number;
  currentPage: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  canEdit: boolean;
  onEdit: (row: KelompokTani) => void;
  onDelete: (row: KelompokTani) => void;
}

export default function KttTableSection({
  paginated,
  filteredCount,
  search,
  setSearch,
  filterKecamatan,
  filterDesa,
  setFilterDesa,
  filterJenis,
  setFilterJenis,
  desaList,
  totalPages,
  currentPage,
  setPage,
  canEdit,
  onEdit,
  onDelete,
}: KttTableSectionProps) {
  return (
    <div className="space-y-4">
      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kelompok, ketua, desa, nomor register..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full min-h-touch h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filterKecamatan && desaList.length > 0 && (
            <select
              value={filterDesa}
              onChange={(e) => {
                setFilterDesa(e.target.value);
                setPage(1);
              }}
              className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 focus:border-emerald-500 outline-none"
            >
              <option value="">Semua Desa ({filterKecamatan})</option>
              {desaList.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}

          <select
            value={filterJenis}
            onChange={(e) => {
              setFilterJenis(e.target.value);
              setPage(1);
            }}
            className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 focus:border-emerald-500 outline-none"
          >
            <option value="">Semua Jenis</option>
            {JENIS_KELOMPOK_OPTIONS.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-4 w-12 text-center">NO</th>
                <th className="p-4">NAMA KELOMPOK & REG</th>
                <th className="p-4">LOKASI DESA / KEC</th>
                <th className="p-4">KETUA KELOMPOK</th>
                <th className="p-4 text-center">KELAS</th>
                <th className="p-4 text-right">ANGGOTA</th>
                {canEdit && <th className="p-4 text-center w-24">AKSI</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {paginated.length > 0 ? (
                paginated.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 text-center font-sans text-slate-400 text-xs">
                      {(currentPage - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block text-sm">
                        {row.namaKelompok || '-'}
                      </span>
                      <span className="text-xs font-sans text-slate-500 block">
                        Reg: {row.nomorRegister || '-'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-800 font-medium block text-xs">
                        {row.desa || '-'}
                      </span>
                      <span className="text-xs text-slate-500 font-sans">
                        Kec. {row.kecamatan || '-'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 text-xs font-medium">
                      <span className="flex items-center gap-1.5">
                        <User size={13} className="text-slate-400 shrink-0" />
                        <span>{row.namaKetuaKelompok || '-'}</span>
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <KelasBadge kelas={row.kelasKelompok} />
                    </td>
                    <td className="p-4 text-right font-sans text-xs">
                      <span className="font-bold text-slate-900">
                        {(row.anggotaLaki || 0) + (row.anggotaPerempuan || 0)}
                      </span>
                      <span className="text-slate-400 text-[11px] block">
                        {row.anggotaLaki || 0}L · {row.anggotaPerempuan || 0}P
                      </span>
                    </td>
                    {canEdit && (
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEdit(row)}
                            className="min-h-touch h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                            aria-label="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => onDelete(row)}
                            className="min-h-touch h-8 w-8 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                            aria-label="Hapus"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canEdit ? 7 : 6} className="p-12 text-center text-slate-400 font-medium text-sm">
                    Tidak ada kelompok tani yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <span className="font-sans">
            Menampilkan {paginated.length} dari {filteredCount} kelompok terdaftar
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="min-h-touch h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Sebelumnya</span>
            </button>

            <span className="font-sans px-2">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="min-h-touch h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Selanjutnya</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
