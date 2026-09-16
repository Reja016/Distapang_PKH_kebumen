'use client';

import React from 'react';
import {
  Car,
  Key,
  Shield,
  Search,
  Edit2,
  Trash2,
} from 'lucide-react';
import { KendaraanRecord } from './types';

interface KendaraanTableProps {
  dataKendaraan: KendaraanRecord[];
  filteredData: KendaraanRecord[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  canEdit: boolean;
  onEdit: (item: KendaraanRecord) => void;
  onDelete: (id: string) => void;
}

export function KendaraanTable({
  dataKendaraan,
  filteredData,
  searchTerm,
  setSearchTerm,
  canEdit,
  onEdit,
  onDelete,
}: KendaraanTableProps) {
  return (
    <div className="space-y-6">
      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Car size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Kendaraan Terdata</p>
            <p className="text-2xl font-extrabold text-slate-900">{dataKendaraan.length} <span className="text-xs text-slate-500 font-semibold">Unit</span></p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Key size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pemegang Aktif</p>
            <p className="text-2xl font-extrabold text-emerald-700">
              {new Set(dataKendaraan.map((d) => d.namaPemegang)).size} <span className="text-xs text-slate-500 font-semibold">Petugas/Pejabat</span>
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Shield size={24} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Kelengkapan Nopol Baru</p>
            <p className="text-2xl font-extrabold text-blue-700">
              {dataKendaraan.filter((d) => Boolean(d.nopolBaru)).length} <span className="text-xs text-slate-500 font-semibold">Unit</span>
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={16} strokeWidth={2.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari pemegang, merk/tipe, tahun, plat nomor, nomor mesin, atau no rangka..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full min-h-touch h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
          />
        </div>

        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="min-h-touch h-11 px-4 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors shrink-0 cursor-pointer"
          >
            Reset Pencarian
          </button>
        )}
      </div>

      {/* ── TABEL INVENTARIS KENDARAAN (8 KOLOM) ── */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-amber-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Car size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Daftar Inventaris Kendaraan Dinas Operasional
              </h3>
              <p className="text-xs text-slate-500">
                Rekapitulasi nomor polisi lama &amp; baru, nomor mesin, dan nomor rangka
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            {filteredData.length} Kendaraan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 text-center w-12 border-r border-slate-200">No</th>
                <th className="p-3.5 border-r border-slate-200">Nama Pemegang</th>
                <th className="p-3.5 border-r border-slate-200">Merk / Type</th>
                <th className="p-3.5 text-center border-r border-slate-200">Tahun</th>
                <th className="p-3.5 border-r border-slate-200 text-center bg-amber-50/50">Nopol Lama</th>
                <th className="p-3.5 border-r border-slate-200 text-center bg-emerald-50/50 text-emerald-900">Nopol Baru</th>
                <th className="p-3.5 border-r border-slate-200 font-mono">Nomor Mesin</th>
                <th className="p-3.5 border-r border-slate-200 font-mono">Nomor Rangka</th>
                {canEdit && <th className="p-3.5 text-center sticky right-0 bg-slate-50 z-10">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 9 : 8} className="p-8 text-center text-slate-400 font-medium text-xs">
                    Tidak ditemukan data kendaraan dinas yang cocok.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, index) => (
                  <tr key={row.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="p-3.5 text-center font-bold text-slate-500 border-r border-slate-100">
                      {index + 1}
                    </td>
                    <td className="p-3.5 font-extrabold text-slate-900 border-r border-slate-100">
                      {row.namaPemegang}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800 border-r border-slate-100">
                      {row.merkType || '-'}
                    </td>
                    <td className="p-3.5 text-center font-bold font-sans text-slate-600 border-r border-slate-100">
                      {row.tahun || '-'}
                    </td>
                    <td className="p-3.5 text-center border-r border-slate-100">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-extrabold font-mono text-[11px] border border-slate-200">
                        {row.nopolLama || '-'}
                      </span>
                    </td>
                    <td className="p-3.5 text-center border-r border-slate-100">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold font-mono text-[11px] border border-emerald-300 shadow-2xs">
                        {row.nopolBaru || '-'}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-xs font-bold text-slate-700 border-r border-slate-100">
                      {row.nomorMesin || '-'}
                    </td>
                    <td className="p-3.5 font-mono text-xs font-bold text-slate-700 border-r border-slate-100">
                      {row.nomorRangka || '-'}
                    </td>
                    {canEdit && (
                      <td className="p-3.5 text-center sticky right-0 bg-white z-10 border-l border-slate-100">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEdit(row)}
                            title="Edit Data Kendaraan"
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Edit2 size={13} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => onDelete(row.id)}
                            title="Hapus Data Kendaraan"
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
