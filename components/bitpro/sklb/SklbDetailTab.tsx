'use client';

import React from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

interface SklbDetailTabProps {
  search: string;
  setSearch: (val: string) => void;
  filterDesa: string;
  setFilterDesa: (val: string) => void;
  daftarDesa: string[];
  filteredData: any[];
  canCreate?: boolean;
  canEdit: boolean;
  selectedYear: number;
  onOpenModalDetail: (mode: 'tambah' | 'edit', data: any) => void;
  onDeleteDetail: (id: any) => void;
}

export function SklbDetailTab({
  search,
  setSearch,
  filterDesa,
  setFilterDesa,
  daftarDesa,
  filteredData,
  canCreate,
  canEdit,
  selectedYear,
  onOpenModalDetail,
  onDeleteDetail,
}: SklbDetailTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Filter & Search Toolbar */}
      <div className="bg-white p-3.5 border-2 border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama peternak atau sapi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-h-touch h-10 pl-9 pr-4 border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="w-full sm:w-52">
            <select
              value={filterDesa}
              onChange={(e) => setFilterDesa(e.target.value)}
              className="w-full min-h-touch h-10 px-3 border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              {daftarDesa.map((desa) => (
                <option key={desa} value={desa}>
                  {desa === 'Semua' ? 'Semua Desa' : desa}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(canCreate ?? canEdit) && (
          <button
            onClick={() =>
              onOpenModalDetail('tambah', {
                desa_lokasi: filterDesa !== 'Semua' ? filterDesa : '',
                jenis_kelamin: 'Betina',
                tahun: selectedYear,
              })
            }
            className="min-h-touch h-10 px-4 bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus size={15} />
            <span>Tambah Data Sapi</span>
          </button>
        )}
      </div>

      {/* Data Table Kotak */}
      <div className="border-2 border-slate-300 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs whitespace-nowrap border-collapse">
            <thead className="bg-slate-200 text-slate-800 font-bold uppercase tracking-wider border-b-2 border-slate-300">
              <tr>
                <th className="p-3 text-center w-10 border border-slate-300">NO</th>
                <th className="p-3 text-left border border-slate-300">DESA LOKASI</th>
                <th className="p-3 text-left border border-slate-300">PEMILIK</th>
                <th className="p-3 text-left border border-slate-300">ALAMAT (DUSUN/RT/RW)</th>
                <th className="p-3 text-left border border-slate-300">NAMA SAPI</th>
                <th className="p-3 text-center border border-slate-300">KELAMIN</th>
                <th className="p-3 text-center border border-slate-300">UMUR (BLN)</th>
                <th className="p-3 text-center border border-slate-300">TINGGI (CM)</th>
                <th className="p-3 text-center border border-slate-300">PANJANG (CM)</th>
                <th className="p-3 text-center border border-slate-300">DADA (CM)</th>
                <th className="p-3 text-center border border-slate-300">BERAT (KG)</th>
                {canEdit && <th className="p-3 text-center w-20 border border-slate-300">AKSI</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-900 font-medium">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 12 : 11} className="p-12 text-center text-slate-400 font-semibold">
                    Tidak ada data sapi yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 text-center font-sans text-slate-500 border border-slate-200">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-emerald-800 border border-slate-200">{row.desa_lokasi}</td>
                    <td className="p-2.5 font-bold text-slate-900 border border-slate-200">{row.nama_pemilik}</td>
                    <td className="p-2.5 text-slate-700 border border-slate-200">
                      {row.dusun || '-'} (RT {row.rt || '-'}/RW {row.rw || '-'})
                    </td>
                    <td className="p-2.5 font-semibold text-slate-800 border border-slate-200">{row.nama_sapi}</td>
                    <td className="p-2.5 text-center border border-slate-200">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold ${
                          row.jenis_kelamin === 'Jantan'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {row.jenis_kelamin}
                      </span>
                    </td>
                    <td className="p-2.5 text-center font-sans border border-slate-200">{row.umur_bulan}</td>
                    <td className="p-2.5 text-center font-sans border border-slate-200">{row.tinggi_pundak}</td>
                    <td className="p-2.5 text-center font-sans border border-slate-200">{row.panjang_badan}</td>
                    <td className="p-2.5 text-center font-sans border border-slate-200">{row.lingkar_dada}</td>
                    <td className="p-2.5 text-center font-sans font-bold text-slate-900 border border-slate-200">{row.berat_badan}</td>
                    {canEdit && (
                      <td className="p-2.5 text-center border border-slate-200">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenModalDetail('edit', row)}
                            className="h-7 w-7 border border-slate-300 bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => onDeleteDetail(row.id)}
                            className="h-7 w-7 border border-rose-300 bg-rose-50 text-rose-700 flex items-center justify-center hover:bg-rose-100 cursor-pointer"
                          >
                            <Trash2 size={12} />
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
