import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Bulanan, BULAN_LABEL, BULAN_LONG, daysInMonth } from './types';

interface VaksinasiHarianTabProps {
  selectedYear: number;
  setSelectedYear: (yr: number) => void;
  daftarTahun: number[];
  canEdit: boolean;
  canCreate?: boolean;
  activeMonth: number;

  setActiveMonth: (m: number) => void;
  bulanan: Bulanan[];
  harianMap: Record<string, Record<string, { id: number; jumlah: number }>>;
  editingHarian: { puskeswan: string; tanggal: string } | null;
  editHarianValue: string;
  setEditHarianValue: (val: string) => void;
  saveEditHarian: () => void;
  setEditingHarian: (val: { puskeswan: string; tanggal: string } | null) => void;
  startEditHarian: (puskeswan: string, tanggal: string) => void;
  harianInputRef: React.RefObject<HTMLInputElement | null>;
  setShowAddYearModal: (show: boolean) => void;
  setFormHarianManual: (form: { puskeswan: string; tanggal: string; jumlah: number }) => void;
  setModalHarianManual: (show: boolean) => void;
  fetchAll: (yr: number) => void;
}

export default function VaksinasiHarianTab({
  selectedYear,
  setSelectedYear,
  daftarTahun,
  canEdit,
  canCreate,
  activeMonth,

  setActiveMonth,
  bulanan,
  harianMap,
  editingHarian,
  editHarianValue,
  setEditHarianValue,
  saveEditHarian,
  setEditingHarian,
  startEditHarian,
  harianInputRef,
  setShowAddYearModal,
  setFormHarianManual,
  setModalHarianManual,
  fetchAll,
}: VaksinasiHarianTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Control Bar: Selector Tahun & Tambah Tahun (Centered) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-slate-300 shadow-xs max-w-xl mx-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70">
          <Calendar size={16} className="text-blue-700" />
          <span className="text-xs font-bold text-blue-950">Pilih Tahun:</span>
          <select
            value={selectedYear}
            onChange={(e) => {
              const yr = Number(e.target.value);
              setSelectedYear(yr);
              fetchAll(yr);
            }}
            className="bg-transparent text-xs font-black text-blue-900 focus:outline-none cursor-pointer font-mono"
          >
            {daftarTahun.map((yr) => (
              <option key={yr} value={yr}>
                Tahun {yr} {yr === 2026 ? '(Aktif)' : ''}
              </option>
            ))}
          </select>
        </div>

        {(canCreate ?? canEdit) && (
          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={() => setShowAddYearModal(true)}
              className="h-9 px-3.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Tahun Baru</span>
            </button>

            <button
              onClick={() => {
                setFormHarianManual({
                  puskeswan: bulanan[0]?.puskeswan || 'MIRIT',
                  tanggal: `${selectedYear}-${String(activeMonth).padStart(2, '0')}-01`,
                  jumlah: 0,
                });
                setModalHarianManual(true);
              }}
              className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Harian</span>
            </button>
          </div>
        )}
      </div>

      {/* Month Filter Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
        {BULAN_LABEL.slice(1).map((label, idx) => {
          const isSelected = activeMonth === idx + 1;
          return (
            <button
              key={label}
              onClick={() => setActiveMonth(idx + 1)}
              className={`min-h-touch h-9 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {label} {selectedYear}
            </button>
          );
        })}
      </div>

      {/* Matrix Table with Click-to-Edit */}
      <div className="border-2 border-slate-700 bg-white shadow-md rounded-xl overflow-hidden -mx-4 sm:mx-0">
        <div className="p-3.5 sm:p-5 border-b-2 border-slate-700 flex flex-wrap items-center justify-between gap-3 bg-slate-100">
          <div>
            <h3 className="font-black text-sm sm:text-base text-slate-900">
              Matriks Log Harian — Bulan {BULAN_LONG[activeMonth]} {selectedYear}
            </h3>
            <p className="text-xs font-semibold text-slate-700">
              Klik langsung pada kotak sel tanggal untuk mengisi/mengubah dosis vaksinasi (Click-to-Edit)
            </p>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-blue-700 text-white font-black text-xs shadow-xs">
            {daysInMonth(activeMonth, selectedYear)} Hari Aktif
          </span>
        </div>

        <div className="overflow-x-auto touch-pan-x max-h-[70vh]">
          <table className="w-full text-xs text-left whitespace-nowrap border-collapse">
            <thead className="bg-slate-200 text-slate-900 font-extrabold uppercase tracking-wider sticky top-0 z-20 border-b-2 border-slate-700">
              <tr>
                <th className="p-3 sticky left-0 bg-slate-300 z-30 border-r-2 border-slate-700 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.15)] font-black text-slate-950">PUSKESWAN</th>
                <th className="p-3 text-right font-sans border-r-2 border-slate-500 font-black">TARGET</th>
                <th className="p-3 text-right font-sans border-r-2 border-slate-500 font-black">AMBIL</th>
                <th className="p-3 text-right font-sans text-emerald-950 bg-emerald-100 border-r-2 border-slate-500 font-black">REALISASI</th>
                {Array.from({ length: daysInMonth(activeMonth, selectedYear) }, (_, i) => i + 1).map((d) => (
                  <th key={d} className="p-2 text-center font-sans w-11 min-w-[44px] border-r-2 border-slate-500 bg-slate-200 font-black text-slate-950">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-400 text-slate-900 font-medium">
              {bulanan.map((row) => {
                const days = Array.from({ length: daysInMonth(activeMonth, selectedYear) }, (_, i) => i + 1);
                const realisasiBulanIni = Object.entries(harianMap[row.puskeswan] || {})
                  .filter(([tgl]) => tgl.startsWith(`${selectedYear}-${String(activeMonth).padStart(2, '0')}`))
                  .reduce((sum, [, v]) => sum + v.jumlah, 0);

                return (
                  <tr key={row.id || row.puskeswan} className="hover:bg-blue-50/50 transition-colors border-b-2 border-slate-400">
                    <td className="p-3 font-black text-slate-950 sticky left-0 bg-white z-10 border-r-2 border-slate-700 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.12)]">
                      {row.puskeswan}
                    </td>
                    <td className="p-3 text-right font-sans font-bold border-r-2 border-slate-400 bg-slate-50/70">{row.target.toLocaleString('id-ID')}</td>
                    <td className="p-3 text-right font-sans font-bold border-r-2 border-slate-400 bg-slate-50/70">{row.pengambilan}</td>
                    <td className="p-3 text-right font-sans font-black text-emerald-950 bg-emerald-100/70 border-r-2 border-slate-400">
                      {realisasiBulanIni.toLocaleString('id-ID')}
                    </td>
                    {days.map((d) => {
                      const dateStr = `${selectedYear}-${String(activeMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                      const val = harianMap[row.puskeswan]?.[dateStr]?.jumlah;
                      const isEditing = editingHarian?.puskeswan === row.puskeswan && editingHarian?.tanggal === dateStr;

                      if (isEditing) {
                        return (
                          <td key={d} className="p-0.5 text-center font-sans border-r-2 border-blue-600 bg-blue-100">
                            <input
                              ref={harianInputRef as any}
                              type="number"
                              value={editHarianValue}
                              onChange={(e) => setEditHarianValue(e.target.value)}
                              onBlur={saveEditHarian}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditHarian();
                                else if (e.key === 'Escape') setEditingHarian(null);
                              }}
                              className="w-full text-center py-1 px-1 text-xs font-black font-sans bg-white border-2 border-blue-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-blue-900 shadow-sm"
                            />
                          </td>
                        );
                      }

                      return (
                        <td
                          key={d}
                          onClick={() => startEditHarian(row.puskeswan, dateStr)}
                          title={`Klik untuk ubah dosis ${row.puskeswan} tgl ${d}`}
                          className={`p-1.5 text-center font-sans border-r-2 border-slate-400 cursor-pointer select-none transition-all ${
                            val && val > 0
                              ? 'bg-blue-100 text-blue-950 font-black hover:bg-blue-200'
                              : 'bg-white hover:bg-blue-100/60 text-slate-400 hover:text-blue-900 font-bold'
                          }`}
                        >
                          {val && val > 0 ? (
                            <span className="inline-block py-0.5 px-1.5 rounded-md bg-blue-600 text-white font-mono font-black shadow-2xs">
                              {val}
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
