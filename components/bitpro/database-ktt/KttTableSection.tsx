import React from 'react';
import { Search, User, Edit2, Trash2, ChevronLeft, ChevronRight, FolderOpen } from 'lucide-react';
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
  docCounts?: Record<number, number>;
  onSelectKttForDocs: (ktt: KelompokTani) => void;
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
  docCounts = {},
  onSelectKttForDocs,
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
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors">
        {/* Mobile Scroll Hint */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 sm:hidden flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ChevronRight size={13} className="text-slate-400" />
            Geser tabel ke samping untuk melihat kolom lengkap
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 w-12 text-center">NO</th>
                <th className="p-4">NAMA KELOMPOK &amp; DOKUMEN</th>
                <th className="p-4">LOKASI DESA / KEC</th>
                <th className="p-4">KETUA KELOMPOK</th>
                <th className="p-4 text-center">KELAS</th>
                <th className="p-4 text-right">ANGGOTA</th>
                <th className="p-4 text-center w-28">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {paginated.length > 0 ? (
                paginated.map((row, idx) => {
                  const docCount = docCounts[row.id] || 0;

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors group">
                      <td className="p-4 text-center font-sans text-slate-400 dark:text-slate-500 text-xs">
                        {(currentPage - 1) * PAGE_SIZE + idx + 1}
                      </td>
                      <td
                        className="p-4 cursor-pointer"
                        onClick={() => onSelectKttForDocs(row)}
                        title="Klik untuk membuka arsip dokumen KTT ini"
                      >
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {row.namaKelompok || '-'}
                          </span>
                          {docCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0 shadow-2xs">
                              <FolderOpen size={11} />
                              <span>{docCount} Berkas</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                              <span>0 Berkas</span>
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-sans text-slate-500 dark:text-slate-400 block mt-0.5">
                          Reg: {row.nomorRegister || '-'} • <span className="text-emerald-600 font-bold hover:underline inline-flex items-center gap-1"><FolderOpen size={11} /> Buka Berkas &raquo;</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-800 dark:text-slate-200 font-medium block text-xs">
                          {row.desa || '-'}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                          Kec. {row.kecamatan || '-'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 text-xs font-medium">
                        <span className="flex items-center gap-1.5">
                          <User size={13} className="text-slate-400 shrink-0" />
                          <span>{row.namaKetuaKelompok || '-'}</span>
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <KelasBadge kelas={row.kelasKelompok} />
                      </td>
                      <td className="p-4 text-right font-sans text-xs">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {(row.anggotaLaki || 0) + (row.anggotaPerempuan || 0)}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 text-[11px] block">
                          {row.anggotaLaki || 0}L · {row.anggotaPerempuan || 0}P
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Tombol Buka Berkas Dokumen */}
                          <button
                            type="button"
                            onClick={() => onSelectKttForDocs(row)}
                            className="min-h-touch h-8 px-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Buka Arsip Dokumen KTT"
                          >
                            <FolderOpen size={13} />
                            <span className="hidden xl:inline">Berkas</span>
                          </button>

                          {canEdit && (
                            <>
                              <button
                                type="button"
                                onClick={() => onEdit(row)}
                                className="min-h-touch h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                                aria-label="Edit"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDelete(row)}
                                className="min-h-touch h-8 w-8 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                                aria-label="Hapus"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400 dark:text-slate-500 font-medium text-sm">
                    Tidak ada kelompok tani yang sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-300">
          <span className="font-sans">
            Menampilkan {paginated.length} dari {filteredCount} kelompok terdaftar
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="min-h-touch h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1 cursor-pointer"
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
              className="min-h-touch h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1 cursor-pointer"
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
