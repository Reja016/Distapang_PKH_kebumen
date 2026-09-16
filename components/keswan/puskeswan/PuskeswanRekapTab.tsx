'use client';

import React from 'react';
import { Filter, Search, Plus, X } from 'lucide-react';
import { DAFTAR_BULAN } from './types';

interface PuskeswanRekapTabProps {
  filteredData: any[];
  filterTahun: string;
  setFilterTahun: (val: string) => void;
  filterBulan: string;
  setFilterBulan: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  availableYears: string[];
  groupedData: Record<string, any[]>;
  totalRetribusi: number;
  totalLayanan: number;
  canEdit: boolean;
  editingCell: { bulan: string; puskeswan: string; field: string; tahun?: string } | null;
  editValue: string;
  setEditValue: (val: string) => void;
  inputRef: React.RefObject<any>;
  onStartEdit: (bulan: string, puskeswan: string, field: string, currentValue: any, tahun?: string) => void;
  onSaveEdit: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  showAddModal: boolean;
  setShowAddModal: (val: boolean) => void;
  addTahun: string;
  setAddTahun: (val: string) => void;
  addBulan: string;
  setAddBulan: (val: string) => void;
  onCreateNewPeriod: () => void;
}

export function PuskeswanRekapTab({
  filteredData,
  filterTahun,
  setFilterTahun,
  filterBulan,
  setFilterBulan,
  searchQuery,
  setSearchQuery,
  availableYears,
  groupedData,
  totalRetribusi,
  totalLayanan,
  canEdit,
  editingCell,
  editValue,
  setEditValue,
  inputRef,
  onStartEdit,
  onSaveEdit,
  onKeyDown,
  showAddModal,
  setShowAddModal,
  addTahun,
  setAddTahun,
  addBulan,
  setAddBulan,
  onCreateNewPeriod,
}: PuskeswanRekapTabProps) {
  const sum = (rows: any[], key: string) =>
    rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
  const formatRp = (val: number) =>
    new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(Number(val) || 0);

  const renderEditableCell = (row: any, field: string, isCurrency = false, extraClass = '') => {
    const rowYear = row.tahun ? String(row.tahun) : '2026';
    const isEditing =
      editingCell?.bulan === row.bulan &&
      editingCell?.puskeswan === row.puskeswan &&
      editingCell?.field === field &&
      (!editingCell?.tahun || editingCell.tahun === rowYear);

    const value = row[field] ?? 0;

    if (isEditing) {
      return (
        <td className={`p-1 border-r border-blue-400 bg-blue-50/90 font-sans ${extraClass}`}>
          <input
            ref={inputRef}
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={onSaveEdit}
            onKeyDown={onKeyDown}
            className="w-full text-center py-1 px-1.5 text-xs font-bold font-sans bg-white border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-900 shadow-sm"
          />
        </td>
      );
    }

    return (
      <td
        onClick={() => onStartEdit(row.bulan, row.puskeswan, field, value, rowYear)}
        title={canEdit ? 'Klik untuk mengubah angka' : undefined}
        className={`p-3 border-r border-slate-100 font-sans ${
          canEdit ? 'cursor-pointer hover:bg-blue-50 hover:text-blue-700' : ''
        } transition-colors group select-none ${
          isCurrency ? 'text-right font-medium text-slate-900' : 'text-center'
        } ${extraClass}`}
      >
        <span className={canEdit ? 'group-hover:underline decoration-blue-400 underline-offset-2' : ''}>
          {isCurrency ? `Rp ${formatRp(value)}` : (value ?? 0)}
        </span>
      </td>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Retribusi</span>
          <span className="text-xl sm:text-2xl font-black text-blue-700 font-sans mt-2">
            Rp {formatRp(totalRetribusi)}
          </span>
          <span className="text-[10px] font-bold text-slate-500 mt-1">Akumulasi pendapatan PAD</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Pelayanan</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 font-sans mt-2">
            {totalLayanan.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] font-bold text-slate-500 mt-1">Aktif + Semi Aktif + Pasif</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inseminasi Buatan</span>
          <span className="text-xl sm:text-2xl font-black text-purple-700 font-sans mt-2">
            {sum(filteredData, 'ib').toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] font-bold text-slate-500 mt-1">Total Dosis Straw IB</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Vaksinasi PMK &amp; LSD</span>
          <span className="text-xl sm:text-2xl font-black text-amber-700 font-sans mt-2">
            {(sum(filteredData, 'pmk_vaks') + sum(filteredData, 'lsd_vaks')).toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] font-bold text-slate-500 mt-1">Total Hewan Tervaksinasi</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <span className="text-xs font-bold uppercase text-slate-500">Filter:</span>
          </div>

          <select
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
            className="min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
          >
            <option value="">Semua Tahun</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                Tahun {yr}
              </option>
            ))}
          </select>

          <select
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
            className="min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
          >
            <option value="">Semua Bulan</option>
            {DAFTAR_BULAN.map((bln) => (
              <option key={bln} value={bln}>
                {bln}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Cari puskeswan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-touch h-10 pl-9 pr-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 shadow-2xs"
          />
        </div>
      </div>

      {/* Matriks Data per Bulan */}
      {Object.keys(groupedData).length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 font-bold">
          Tidak ada data rekapitulasi yang cocok dengan filter yang dipilih.
        </div>
      ) : (
        (Object.entries(groupedData) as [string, any[]][]).map(([groupTitle, rows]) => (
          <div key={groupTitle} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
            <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  {groupTitle.split(' - ')[1]?.slice(0, 3)}
                </div>
                <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
                  Lembar Kerja Rekapitulasi: Bulan {groupTitle}
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500 font-sans">
                {rows.length} Puskeswan Terdata
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left whitespace-nowrap border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3 text-center w-12 border-r border-slate-200">NO</th>
                    <th className="p-3 border-r border-slate-200 sticky left-0 bg-slate-100 z-10 shadow-2xs">PUSKESWAN</th>
                    <th className="p-3 text-center border-r border-slate-200 bg-red-50/50">BEF</th>
                    <th className="p-3 text-center border-r border-slate-200 bg-red-50/50">CACING</th>
                    <th className="p-3 text-center border-r border-slate-200 bg-red-50/50">SCABIES</th>
                    <th className="p-3 text-center border-r border-slate-200 bg-red-50/50">ORF</th>
                    <th className="p-3 text-center border-r border-slate-200 bg-red-50/50">PMK (KASUS)</th>
                    <th className="p-3 text-center border-r border-slate-200 bg-red-50/50">LSD (KASUS)</th>
                    <th className="p-3 text-center border-r border-slate-200 bg-emerald-50/50">AKTIF</th>
                    <th className="p-3 text-center border-r border-slate-200 bg-emerald-50/50">SEMI AKTIF</th>
                    <th className="p-3 text-center border-r border-slate-200 bg-emerald-50/50">PASIF</th>
                    <th className="p-3 text-center border-r border-slate-200 bg-emerald-50/50">PUSLING</th>
                    <th className="p-3 text-center border-r border-slate-200 bg-purple-50/50">IB</th>
                    <th className="p-3 text-center border-r border-slate-200 bg-purple-50/50">PKB</th>
                    <th className="p-3 text-center border-r border-slate-200 bg-amber-50/50">PMK (VAKS)</th>
                    <th className="p-3 text-center border-r border-slate-200 bg-amber-50/50">LSD (VAKS)</th>
                    <th className="p-3 text-right border-r border-slate-200 bg-blue-50/50">RETRIBUSI (RP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-semibold">
                  {rows.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-blue-50/40 transition-colors">
                      <td className="p-3 text-center text-slate-400 font-sans border-r border-slate-100">
                        {row.no_urut || row.no || idx + 1}
                      </td>
                      <td className="p-3 font-extrabold text-slate-900 border-r border-slate-100 sticky left-0 bg-white z-10 shadow-2xs">
                        {row.puskeswan}
                      </td>
                      {renderEditableCell(row, 'bef')}
                      {renderEditableCell(row, 'cacingan')}
                      {renderEditableCell(row, 'scabies')}
                      {renderEditableCell(row, 'orf')}
                      {renderEditableCell(row, 'pmk_diag')}
                      {renderEditableCell(row, 'lsd_diag')}
                      {renderEditableCell(row, 'aktif', false, 'bg-emerald-50/20 text-emerald-900 font-bold')}
                      {renderEditableCell(row, 'semi_aktif', false, 'bg-emerald-50/20 text-emerald-900')}
                      {renderEditableCell(row, 'pasif', false, 'bg-emerald-50/20 text-emerald-900')}
                      {renderEditableCell(row, 'pusling', false, 'bg-emerald-50/20 text-emerald-900 font-bold')}
                      {renderEditableCell(row, 'ib', false, 'bg-purple-50/20 text-purple-900 font-bold')}
                      {renderEditableCell(row, 'pkb', false, 'bg-purple-50/20 text-purple-900')}
                      {renderEditableCell(row, 'pmk_vaks', false, 'bg-amber-50/20 text-amber-900 font-bold')}
                      {renderEditableCell(row, 'lsd_vaks', false, 'bg-amber-50/20 text-amber-900')}
                      {renderEditableCell(row, 'retribusi', true, 'bg-blue-50/20 font-bold text-blue-900')}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={2} className="p-3 text-center uppercase tracking-wider sticky left-0 bg-slate-100 z-10 border-r border-slate-300">
                      TOTAL KABUPATEN
                    </td>
                    <td className="p-3 text-center font-sans border-r border-slate-200">{sum(rows, 'bef')}</td>
                    <td className="p-3 text-center font-sans border-r border-slate-200">{sum(rows, 'cacingan')}</td>
                    <td className="p-3 text-center font-sans border-r border-slate-200">{sum(rows, 'scabies')}</td>
                    <td className="p-3 text-center font-sans border-r border-slate-200">{sum(rows, 'orf')}</td>
                    <td className="p-3 text-center font-sans border-r border-slate-200">{sum(rows, 'pmk_diag')}</td>
                    <td className="p-3 text-center font-sans border-r border-slate-200">{sum(rows, 'lsd_diag')}</td>
                    <td className="p-3 text-center font-sans border-r border-slate-200 text-emerald-800">{sum(rows, 'aktif')}</td>
                    <td className="p-3 text-center font-sans border-r border-slate-200 text-emerald-800">{sum(rows, 'semi_aktif')}</td>
                    <td className="p-3 text-center font-sans border-r border-slate-200 text-emerald-800">{sum(rows, 'pasif')}</td>
                    <td className="p-3 text-center font-sans border-r border-slate-200 text-emerald-800">{sum(rows, 'pusling')}</td>
                    <td className="p-3 text-center font-sans border-r border-slate-200 text-purple-800">{sum(rows, 'ib')}</td>
                    <td className="p-3 text-center font-sans border-r border-slate-200 text-purple-800">{sum(rows, 'pkb')}</td>
                    <td className="p-3 text-center font-sans border-r border-slate-200 text-amber-800">{sum(rows, 'pmk_vaks')}</td>
                    <td className="p-3 text-center font-sans border-r border-slate-200 text-amber-800">{sum(rows, 'lsd_vaks')}</td>
                    <td className="p-3 text-right font-sans text-blue-900 border-r border-slate-200">
                      Rp {formatRp(sum(rows, 'retribusi'))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ))
      )}

      {/* ── MODAL TAMBAH PERIODE BULAN BARU ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-slate-900">Buka Lembar Kerja Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1.5 font-bold text-slate-800">Tahun Periode</label>
                <select
                  value={addTahun}
                  onChange={(e) => setAddTahun(e.target.value)}
                  className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 font-bold text-slate-800">Bulan Periode</label>
                <select
                  value={addBulan}
                  onChange={(e) => setAddBulan(e.target.value)}
                  className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs cursor-pointer"
                >
                  {DAFTAR_BULAN.map((bln) => (
                    <option key={bln} value={bln}>
                      {bln}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="min-h-touch px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={onCreateNewPeriod}
                className="min-h-touch px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Buat Periode Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
