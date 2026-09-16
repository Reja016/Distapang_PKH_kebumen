'use client';

import React from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { KOMODITAS_LIST } from './types';

interface KomoditasTableTabProps {
  selectedKomoditasFilter: string;
  setSelectedKomoditasFilter: (val: string) => void;
  komoditasSaveMessage: string;
  isLoadingKomoditas: boolean;
  komoditasData: any[];
  selectedYear: number;
  isAdmin: boolean;
  handleKomoditasCellChange: (rowIndex: number, field: string, val: any) => void;
  handleAddKomoditasRow: () => void;
  handleDeleteKomoditasRow: (rowIndex: number) => void;
}

export function KomoditasTableTab({
  selectedKomoditasFilter,
  setSelectedKomoditasFilter,
  komoditasSaveMessage,
  isLoadingKomoditas,
  komoditasData,
  selectedYear,
  isAdmin,
  handleKomoditasCellChange,
  handleAddKomoditasRow,
  handleDeleteKomoditasRow,
}: KomoditasTableTabProps) {
  const months = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];

  return (
    <div className="space-y-4">
      {/* Location Switcher Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'RPH Kebumen', 'Luar RPH Kebumen', 'RPH Gombong', 'Luar RPH Gombong'].map((lok) => (
            <button
              key={lok}
              onClick={() => setSelectedKomoditasFilter(lok)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedKomoditasFilter === lok
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-purple-50 text-slate-700'
              }`}
            >
              {lok === 'ALL' ? 'Semua Lokasi' : lok}
            </button>
          ))}
        </div>

        {komoditasSaveMessage && (
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 animate-in fade-in">
            {komoditasSaveMessage}
          </span>
        )}
      </div>

      {/* Table TPH Komoditas */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-4 sm:p-6">
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1750px] text-center text-xs border-collapse">
            <thead>
              <tr className="bg-purple-900 text-white font-bold border border-purple-950">
                <th rowSpan={2} className="p-3 border border-purple-800 w-12 min-w-[48px] bg-purple-950 sticky left-0 z-20">NO</th>
                <th rowSpan={2} className="p-3 border border-purple-800 text-left min-w-[190px] w-52 bg-purple-950 sticky left-[48px] z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                  NAMA PEMOTONGAN
                </th>
                <th rowSpan={2} className="p-3 border border-purple-800 text-left min-w-[130px] w-36 bg-purple-900">
                  KOMODITAS
                </th>
                {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((m) => (
                  <th key={m} colSpan={2} className="p-2 border border-purple-800 bg-purple-900/90 text-purple-100 text-xs">
                    {m}
                  </th>
                ))}
                <th colSpan={3} className="p-2 border border-purple-800 bg-purple-950 text-purple-100 font-extrabold text-xs">
                  TOTAL TAHUNAN
                </th>
                {isAdmin && (
                  <th rowSpan={2} className="p-2 border border-purple-800 w-14 min-w-[56px] text-center bg-rose-950 text-rose-100">
                    AKSI
                  </th>
                )}
              </tr>
              <tr className="bg-purple-50 text-purple-950 font-bold border border-purple-200 text-[11px]">
                {Array.from({ length: 12 }).map((_, i) => (
                  <React.Fragment key={i}>
                    <th className="p-2 border border-purple-200 min-w-[58px] w-16">J</th>
                    <th className="p-2 border border-purple-200 min-w-[58px] w-16">B</th>
                  </React.Fragment>
                ))}
                <th className="p-2 border border-purple-200 bg-purple-100/70 min-w-[72px] w-20">Jantan</th>
                <th className="p-2 border border-purple-200 bg-purple-100/70 min-w-[72px] w-20">Betina</th>
                <th className="p-2 border border-purple-200 bg-purple-200 text-purple-950 font-black min-w-[85px] w-24">Total</th>
              </tr>
            </thead>

            <tbody>
              {isLoadingKomoditas ? (
                <tr>
                  <td colSpan={isAdmin ? 29 : 28} className="p-8 text-center text-slate-400">
                    <Loader2 className="animate-spin inline-block mr-2 text-purple-600" size={16} />
                    Memuat data komoditas...
                  </td>
                </tr>
              ) : komoditasData.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 29 : 28} className="p-8 text-center text-slate-400">
                    Belum ada data rekap komoditas untuk tahun {selectedYear}.
                  </td>
                </tr>
              ) : (
                komoditasData
                  .filter((row) => selectedKomoditasFilter === 'ALL' || (row.nama_pemotongan || '').toLowerCase().includes(selectedKomoditasFilter.toLowerCase()))
                  .map((row, idx) => {
                    let rowJantan = 0;
                    let rowBetina = 0;
                    months.forEach((m) => {
                      rowJantan += Number(row[`${m}_jantan`]) || 0;
                      rowBetina += Number(row[`${m}_betina`]) || 0;
                    });
                    const grandRowTotal = rowJantan + rowBetina;

                    return (
                      <tr key={idx} className="hover:bg-purple-50/40 transition-colors">
                        {/* Sticky No */}
                        <td className="p-2 border border-slate-200 font-semibold text-slate-500 bg-slate-50 sticky left-0 z-10">
                          {idx + 1}
                        </td>
                        
                        {/* Sticky Nama Pemotongan */}
                        <td className="p-1 border border-slate-200 text-left bg-white sticky left-[48px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                          {isAdmin ? (
                            <input
                              type="text"
                              value={row.nama_pemotongan || ''}
                              onChange={(e) => handleKomoditasCellChange(idx, 'nama_pemotongan', e.target.value)}
                              placeholder="Nama RPH/TPH..."
                              className="w-full h-8 px-2 rounded border border-slate-200/70 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-xs font-bold text-slate-900 outline-none"
                            />
                          ) : (
                            <span className="font-bold text-slate-900 pl-2">{row.nama_pemotongan}</span>
                          )}
                        </td>

                        {/* Komoditas Ternak */}
                        <td className="p-1 border border-slate-200 text-left">
                          {isAdmin ? (
                            <select
                              value={row.komoditas || 'Sapi Potong'}
                              onChange={(e) => handleKomoditasCellChange(idx, 'komoditas', e.target.value)}
                              className="w-full h-8 px-1.5 rounded border border-slate-200/70 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-xs font-bold text-purple-700 outline-none"
                            >
                              {KOMODITAS_LIST.map((k) => (
                                <option key={k} value={k}>{k}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="font-bold text-purple-700 pl-2">{row.komoditas}</span>
                          )}
                        </td>

                        {/* 12 Months Cells (J & B) */}
                        {months.map((m) => (
                          <React.Fragment key={m}>
                            <td className="p-1 border border-slate-200">
                              {isAdmin ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={row[`${m}_jantan`] ?? 0}
                                  onChange={(e) => handleKomoditasCellChange(idx, `${m}_jantan`, Math.max(0, parseInt(e.target.value, 10) || 0))}
                                  className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                                />
                              ) : (
                                <span className="font-mono font-semibold text-slate-800">{(row[`${m}_jantan`] || 0).toLocaleString('id-ID')}</span>
                              )}
                            </td>
                            <td className="p-1 border border-slate-200">
                              {isAdmin ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={row[`${m}_betina`] ?? 0}
                                  onChange={(e) => handleKomoditasCellChange(idx, `${m}_betina`, Math.max(0, parseInt(e.target.value, 10) || 0))}
                                  className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                                />
                              ) : (
                                <span className="font-mono font-semibold text-slate-800">{(row[`${m}_betina`] || 0).toLocaleString('id-ID')}</span>
                              )}
                            </td>
                          </React.Fragment>
                        ))}

                        {/* Subtotal Row */}
                        <td className="p-2 border border-slate-200 font-mono font-bold text-slate-900 bg-purple-50/30">
                          {rowJantan.toLocaleString('id-ID')}
                        </td>
                        <td className="p-2 border border-slate-200 font-mono font-bold text-slate-900 bg-purple-50/30">
                          {rowBetina.toLocaleString('id-ID')}
                        </td>
                        <td className="p-2 border border-slate-200 font-mono font-black text-purple-950 bg-purple-100/70">
                          {grandRowTotal.toLocaleString('id-ID')}
                        </td>

                        {/* Action: Tambah Baris di Samping Hapus */}
                        {isAdmin && (
                          <td className="p-1 border border-slate-200 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={handleAddKomoditasRow}
                                className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center justify-center transition-colors cursor-pointer"
                                title="Tambah Baris Baru"
                              >
                                <Plus size={13} strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={() => handleDeleteKomoditasRow(idx)}
                                className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                                title="Hapus baris"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
