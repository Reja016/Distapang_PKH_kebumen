'use client';

import React, { useState } from 'react';
import { Filter, Search, Plus, X, Lock, Unlock, Info, AlertTriangle, ChevronDown, ChevronRight, Calendar } from 'lucide-react';
import { DAFTAR_BULAN } from './types';
import { checkMonthlyDeadline } from '@/lib/deadlineCheck';

interface PuskeswanRekapTabProps {
  filteredData: any[];
  filterTahun: string;
  setFilterTahun: (val: string) => void;
  filterBulan: string;
  setFilterBulan: (val: string) => void;
  currentActiveMonth?: string;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  availableYears: string[];
  groupedData: Record<string, any[]>;
  totalRetribusi: number;
  totalLayanan: number;
  canEdit: boolean;
  isAdmin?: boolean;
  isPuskeswanAllowed?: (puskes: string) => boolean;
  editingCell: { bulan: string; puskeswan: string; field: string; tahun?: string; id_kecamatan?: number } | null;
  editValue: string;
  setEditValue: (val: string) => void;
  inputRef: React.RefObject<any>;
  onStartEdit: (bulan: string, puskeswan: string, field: string, currentValue: any, tahun?: string, id_kecamatan?: number) => void;
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
  currentActiveMonth = 'JANUARI',
  searchQuery,
  setSearchQuery,
  availableYears,
  groupedData,
  totalRetribusi,
  totalLayanan,
  canEdit,
  isAdmin = false,
  isPuskeswanAllowed,
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
  // State accordion: baris puskeswan mana saja yang sedang terbuka
  const [expandedPuskeswan, setExpandedPuskeswan] = useState<Record<string, boolean>>({});

  const togglePuskeswan = (rowKey: string) => {
    setExpandedPuskeswan((prev) => ({
      ...prev,
      [rowKey]: !prev[rowKey],
    }));
  };

  const sum = (rows: any[], key: string) =>
    rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);
  const formatRp = (val: number) =>
    new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(Number(val) || 0);

  // Render sel nilai total Puskeswan (Parent Row)
  const renderParentCell = (row: any, field: string, isCurrency = false, extraClass = '') => {
    const value = row[field] ?? 0;
    const rowYear = row.tahun ? String(row.tahun) : '2026';
    const rowKey = `${rowYear}-${row.bulan}-${row.puskeswan}`;

    return (
      <td
        onClick={() => {
          if (!expandedPuskeswan[rowKey]) {
            togglePuskeswan(rowKey);
          }
        }}
        title="Total akumulasi kecamatan binaan + umum (Klik untuk buka rincian)"
        className={`p-3 border-r border-slate-200 font-sans text-center select-none font-black cursor-pointer hover:bg-blue-50/70 transition-colors ${
          isCurrency ? 'text-right text-blue-900' : 'text-slate-900'
        } ${extraClass}`}
      >
        <span>{isCurrency ? `Rp ${formatRp(value)}` : (value ?? 0)}</span>
      </td>
    );
  };

  // Render sel yang dapat diedit langsung untuk rincian sub-baris (Kecamatan / Tanpa Kecamatan)
  const renderEditableSubCell = (row: any, sub: any, field: string, isCurrency = false, extraClass = '') => {
    const rowYear = row.tahun ? String(row.tahun) : '2026';
    const isEditing =
      editingCell?.bulan === row.bulan &&
      editingCell?.puskeswan === row.puskeswan &&
      editingCell?.field === field &&
      (!editingCell?.tahun || editingCell.tahun === rowYear) &&
      (editingCell?.id_kecamatan === sub.id_kecamatan);

    const value = sub[field] ?? 0;

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

    const isAllowed = isAdmin || (isPuskeswanAllowed ? isPuskeswanAllowed(row.puskeswan) : false);
    const deadline = checkMonthlyDeadline(row.bulan, rowYear, isAdmin);
    const isLocked = !isAdmin && deadline.isLocked;
    const isCellEditable = isAllowed && !isLocked;

    let tooltip = `Klik untuk mengubah angka (${sub.nama_kecamatan})`;
    let cellStyle = 'cursor-pointer hover:bg-blue-100/70 hover:text-blue-800';

    if (!isAllowed) {
      tooltip = `Akses Ditolak: Puskeswan ${row.puskeswan} di luar wilayah penugasan Anda.`;
      cellStyle = 'bg-slate-50/80 text-slate-400 cursor-not-allowed';
    } else if (isLocked) {
      tooltip = deadline.reason || `Periode ${row.bulan} ${rowYear} telah dikunci (Batas waktu 3 hari berakhir). Hubungi Administrator.`;
      cellStyle = 'bg-slate-100/90 text-slate-500 cursor-not-allowed';
    }

    return (
      <td
        onClick={() => isCellEditable && onStartEdit(row.bulan, row.puskeswan, field, value, rowYear, sub.id_kecamatan)}
        title={tooltip}
        className={`p-2.5 border-r border-slate-100 font-sans transition-colors group select-none ${cellStyle} ${
          isCurrency ? 'text-right font-medium text-slate-900' : 'text-center'
        } ${extraClass}`}
      >
        <span className={isCellEditable ? 'group-hover:underline decoration-blue-500 underline-offset-2' : ''}>
          {isCurrency ? `Rp ${formatRp(value)}` : (value ?? 0)}
        </span>
      </td>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Retribusi</span>
          <span className="text-lg sm:text-2xl font-black text-blue-700 font-sans mt-1 sm:mt-2 truncate">
            Rp {formatRp(totalRetribusi)}
          </span>
          <span className="text-[10px] font-bold text-slate-500 mt-1">Akumulasi pendapatan PAD</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Pelayanan</span>
          <span className="text-lg sm:text-2xl font-black text-emerald-700 font-sans mt-1 sm:mt-2">
            {totalLayanan.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] font-bold text-slate-500 mt-1">Aktif + Semi Aktif + Pasif</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Inseminasi Buatan</span>
          <span className="text-lg sm:text-2xl font-black text-purple-700 font-sans mt-1 sm:mt-2">
            {sum(filteredData, 'ib').toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] font-bold text-slate-500 mt-1">Total Dosis Straw IB</span>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Vaksinasi PMK &amp; LSD</span>
          <span className="text-lg sm:text-2xl font-black text-amber-700 font-sans mt-1 sm:mt-2">
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

          {/* Pembatasan Bulan untuk Petugas: Petugas hanya melihat bulan berjalan */}
          {!isAdmin ? (
            <div className="min-h-touch h-10 px-3.5 rounded-xl border border-blue-200 bg-blue-50/90 flex items-center gap-2 text-xs font-black text-blue-900 shadow-2xs">
              <Calendar size={14} className="text-blue-600" />
              <span>Bulan Berjalan: <strong>{currentActiveMonth}</strong></span>
            </div>
          ) : (
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
          )}

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="min-h-touch h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer ml-auto sm:ml-0"
            >
              <Plus size={15} />
              <span>+ Periode Baru</span>
            </button>
          )}
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
        (Object.entries(groupedData) as [string, any[]][]).map(([groupTitle, rows]) => {
          const [grpYear, grpMonth] = groupTitle.split(' - ');
          const deadline = checkMonthlyDeadline(grpMonth, grpYear, isAdmin);
          const isGroupLocked = !isAdmin && deadline.isLocked;

          return (
            <div key={groupTitle} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {grpMonth?.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm sm:text-base tracking-tight flex items-center gap-2">
                      <span>Lembar Kerja Rekapitulasi: Bulan {groupTitle}</span>
                      {isGroupLocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                          <Lock size={12} className="text-amber-700" />
                          <span>Terkunci</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Unlock size={12} className="text-emerald-700" />
                          <span>Dapat Diisi</span>
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] font-medium text-slate-500">
                      {isGroupLocked
                        ? 'Batas toleransi pengisian 3 hari telah berakhir. Hanya Administrator yang dapat mengubah data.'
                        : 'Klik nama Puskeswan untuk membuka rincian kecamatan binaan. Angka Puskeswan otomatis menjumlahkan seluruh kecamatan.'}
                    </p>
                  </div>
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
                      <th className="p-3 border-r border-slate-200 sticky left-0 bg-slate-100 z-10 shadow-2xs">PUSKESWAN / KECAMATAN</th>
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
                    {rows.map((row, idx) => {
                      const rowYear = row.tahun ? String(row.tahun) : '2026';
                      const rowKey = `${rowYear}-${row.bulan}-${row.puskeswan}`;
                      const isExpanded = !!expandedPuskeswan[rowKey];

                      return (
                        <React.Fragment key={row.id || rowKey}>
                          {/* ── BARIS INDUK PUSKESWAN (AKUMULASI TOTAL) ── */}
                          <tr className={`transition-colors ${isExpanded ? 'bg-blue-50/50 font-bold' : 'hover:bg-blue-50/30'}`}>
                            <td className="p-3 text-center text-slate-400 font-sans border-r border-slate-200">
                              {row.no_urut || row.no || idx + 1}
                            </td>
                            <td className="p-3 font-black text-slate-900 border-r border-slate-200 sticky left-0 bg-white z-10 shadow-2xs">
                              <div className="flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => togglePuskeswan(rowKey)}
                                  className="flex items-center gap-2 font-black text-slate-900 hover:text-blue-600 transition-colors cursor-pointer group text-left"
                                >
                                  <span className={`p-1 rounded-md transition-colors ${isExpanded ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-700'}`}>
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                  </span>
                                  <span className="text-xs uppercase tracking-tight">{row.puskeswan}</span>
                                </button>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-sans">
                                  {(row.subRows || []).length} wilayah
                                </span>
                              </div>
                            </td>
                            {renderParentCell(row, 'bef')}
                            {renderParentCell(row, 'cacingan')}
                            {renderParentCell(row, 'scabies')}
                            {renderParentCell(row, 'orf')}
                            {renderParentCell(row, 'pmk_diag')}
                            {renderParentCell(row, 'lsd_diag')}
                            {renderParentCell(row, 'aktif', false, 'bg-emerald-50/20 text-emerald-900')}
                            {renderParentCell(row, 'semi_aktif', false, 'bg-emerald-50/20 text-emerald-900')}
                            {renderParentCell(row, 'pasif', false, 'bg-emerald-50/20 text-emerald-900')}
                            {renderParentCell(row, 'pusling', false, 'bg-emerald-50/20 text-emerald-900')}
                            {renderParentCell(row, 'ib', false, 'bg-purple-50/20 text-purple-900')}
                            {renderParentCell(row, 'pkb', false, 'bg-purple-50/20 text-purple-900')}
                            {renderParentCell(row, 'pmk_vaks', false, 'bg-amber-50/20 text-amber-900')}
                            {renderParentCell(row, 'lsd_vaks', false, 'bg-amber-50/20 text-amber-900')}
                            {renderParentCell(row, 'retribusi', true, 'bg-blue-50/20 font-black text-blue-900')}
                          </tr>

                          {/* ── BARIS ANAK / RINCIAN KECAMATAN BINAAN (ACCORDION) ── */}
                          {isExpanded && (row.subRows || []).map((sub: any, subIdx: number) => (
                            <tr
                              key={`${rowKey}-sub-${sub.id_kecamatan}`}
                              className="bg-slate-50/80 hover:bg-blue-50/40 border-b border-slate-100 transition-colors"
                            >
                              <td className="p-2.5 text-center text-slate-400 font-sans border-r border-slate-100 text-[11px]">
                                {subIdx + 1}
                              </td>
                              <td className="p-2.5 font-bold text-slate-800 border-r border-slate-100 sticky left-0 bg-slate-50/95 z-10 shadow-2xs pl-6">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-blue-500 font-mono text-xs">↳</span>
                                  <span className={sub.isUnassigned ? 'italic text-slate-600 font-semibold' : 'text-slate-900'}>
                                    {sub.nama_kecamatan}
                                  </span>
                                  {sub.isUnassigned && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold ml-1">
                                      Bebas
                                    </span>
                                  )}
                                </div>
                              </td>
                              {renderEditableSubCell(row, sub, 'bef')}
                              {renderEditableSubCell(row, sub, 'cacingan')}
                              {renderEditableSubCell(row, sub, 'scabies')}
                              {renderEditableSubCell(row, sub, 'orf')}
                              {renderEditableSubCell(row, sub, 'pmk_diag')}
                              {renderEditableSubCell(row, sub, 'lsd_diag')}
                              {renderEditableSubCell(row, sub, 'aktif', false, 'bg-emerald-50/20 text-emerald-900 font-semibold')}
                              {renderEditableSubCell(row, sub, 'semi_aktif', false, 'bg-emerald-50/20 text-emerald-900')}
                              {renderEditableSubCell(row, sub, 'pasif', false, 'bg-emerald-50/20 text-emerald-900')}
                              {renderEditableSubCell(row, sub, 'pusling', false, 'bg-emerald-50/20 text-emerald-900 font-semibold')}
                              {renderEditableSubCell(row, sub, 'ib', false, 'bg-purple-50/20 text-purple-900 font-semibold')}
                              {renderEditableSubCell(row, sub, 'pkb', false, 'bg-purple-50/20 text-purple-900')}
                              {renderEditableSubCell(row, sub, 'pmk_vaks', false, 'bg-amber-50/20 text-amber-900 font-semibold')}
                              {renderEditableSubCell(row, sub, 'lsd_vaks', false, 'bg-amber-50/20 text-amber-900')}
                              {renderEditableSubCell(row, sub, 'retribusi', true, 'bg-blue-50/20 font-bold text-blue-900')}
                            </tr>
                          ))}
                        </React.Fragment>
                      );
                    })}
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
          );
        })
      )}

      {/* ── MODAL TAMBAH PERIODE BULAN BARU (ADMIN ONLY) ── */}
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

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Periode</label>
                <input
                  type="text"
                  value={addTahun}
                  onChange={(e) => setAddTahun(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Bulan</label>
                <select
                  value={addBulan}
                  onChange={(e) => setAddBulan(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-600 cursor-pointer"
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
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={onCreateNewPeriod}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Buka Periode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
