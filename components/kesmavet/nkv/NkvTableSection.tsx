'use client';

import React from 'react';
import { Search, Edit2, Trash2 } from 'lucide-react';
import { NKVRecord } from './types';

interface NkvTableSectionProps {
  filteredData: NKVRecord[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterJenis: string;
  setFilterJenis: (val: string) => void;
  uniqueJenis: string[];
  canEdit: boolean;
  onEdit: (item: NKVRecord) => void;
  onDelete: (id: string) => void;
}

export default function NkvTableSection({
  filteredData,
  searchTerm,
  setSearchTerm,
  filterJenis,
  setFilterJenis,
  uniqueJenis,
  canEdit,
  onEdit,
  onDelete,
}: NkvTableSectionProps) {
  return (
    <div className="space-y-6">
      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} strokeWidth={2.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama usaha, jenis, proses audit, atau keterangan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full min-h-touch h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="min-h-touch h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-purple-600 focus:bg-white"
          >
            <option value="">Semua Jenis Usaha</option>
            {uniqueJenis.map((jenis) => (
              <option key={jenis} value={jenis}>
                {jenis}
              </option>
            ))}
          </select>

          {(searchTerm || filterJenis) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterJenis('');
              }}
              className="min-h-touch h-11 px-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* ── TABEL DATA NOMOR KONTROL VETERINER (11 KOLOM) ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-purple-50/50">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📋</span>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Rekapitulasi Usaha &amp; Pembinaan Sertifikasi NKV
              </h3>
              <p className="text-xs text-slate-500">
                Daftar pembinaan higiene sanitasi, proses audit, dan status pengeluaran rekomendasi
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
            {filteredData.length} Data Ditampilkan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 text-center w-12 border-r border-slate-200">No</th>
                <th className="p-3.5 border-r border-slate-200">Nama Usaha</th>
                <th className="p-3.5 border-r border-slate-200">Jenis Usaha</th>
                <th className="p-3.5 border-r border-slate-200">Proses</th>
                <th className="p-3.5 border-r border-slate-200">Pembinaan 1</th>
                <th className="p-3.5 border-r border-slate-200">Hasil (1)</th>
                <th className="p-3.5 border-r border-slate-200">Pembinaan 2</th>
                <th className="p-3.5 border-r border-slate-200">Hasil (2)</th>
                <th className="p-3.5 border-r border-slate-200">Pelatihan Higiene Sanitasi</th>
                <th className="p-3.5 border-r border-slate-200">Pengeluaran Rekomendasi</th>
                <th className="p-3.5 border-r border-slate-200">Keterangan</th>
                {canEdit && <th className="p-3.5 text-center sticky right-0 bg-slate-50 z-10">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 12 : 11} className="p-8 text-center text-slate-400 font-medium text-xs">
                    Tidak ditemukan data Nomor Kontrol Veteriner (NKV).
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr key={row.id} className="hover:bg-purple-50/40 transition-colors">
                    <td className="p-3.5 text-center font-bold text-slate-500 border-r border-slate-100">
                      {index + 1}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 border-r border-slate-100">
                      {row.namaUsaha}
                    </td>
                    <td className="p-3.5 font-semibold text-purple-700 border-r border-slate-100">
                      {row.jenisUsaha || '-'}
                    </td>
                    <td className="p-3.5 border-r border-slate-100">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {row.proses || '-'}
                      </span>
                    </td>
                    <td className="p-3.5 border-r border-slate-100 text-slate-600">
                      {row.pembinaan1 || '-'}
                    </td>
                    <td className="p-3.5 border-r border-slate-100 text-slate-700 max-w-[200px] truncate" title={row.hasil1}>
                      {row.hasil1 || '-'}
                    </td>
                    <td className="p-3.5 border-r border-slate-100 text-slate-600">
                      {row.pembinaan2 || '-'}
                    </td>
                    <td className="p-3.5 border-r border-slate-100 text-slate-700 max-w-[200px] truncate" title={row.hasil2}>
                      {row.hasil2 || '-'}
                    </td>
                    <td className="p-3.5 border-r border-slate-100 font-semibold text-slate-800">
                      {row.pelatihanHigiene || '-'}
                    </td>
                    <td className="p-3.5 border-r border-slate-100">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                          row.pengeluaranRekomendasi.toLowerCase().includes('diterbitkan')
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {row.pengeluaranRekomendasi || '-'}
                      </span>
                    </td>
                    <td className="p-3.5 border-r border-slate-100 text-slate-500 max-w-[220px] truncate" title={row.keterangan}>
                      {row.keterangan || '-'}
                    </td>
                    {canEdit && (
                      <td className="p-3.5 text-center sticky right-0 bg-white z-10 border-l border-slate-100">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEdit(row)}
                            title="Edit Data"
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-800 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Edit2 size={13} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => onDelete(row.id)}
                            title="Hapus Data"
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} strokeWidth={2.5} />
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
