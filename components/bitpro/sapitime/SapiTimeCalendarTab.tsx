'use client';

import React from 'react';
import {
  Info,
  Syringe,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Cattle } from './types';

interface SapiTimeCalendarTabProps {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  selectedDay: number | null;
  setSelectedDay: (val: number | null) => void;
  cattleList: Cattle[];
  onOpenEstrusModal: () => void;
}

export function SapiTimeCalendarTab({
  currentDate,
  setCurrentDate,
  selectedDay,
  setSelectedDay,
  cattleList,
  onOpenEstrusModal,
}: SapiTimeCalendarTabProps) {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const getCalendarEvents = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    let events: any[] = [];

    cattleList.forEach((c) => {
      if (c.lastEstrus) {
        const eDate = new Date(c.lastEstrus);
        if (eDate.getFullYear() === year && eDate.getMonth() === month) {
          events.push({ day: eDate.getDate(), type: 'estrus', name: c.name, id: c.id, colorHex: '#F87171', desc: 'Estrus Tercatat' });
        }
        const nextE = new Date(eDate);
        nextE.setDate(nextE.getDate() + (c.cycleLength || 21));
        if (nextE.getFullYear() === year && nextE.getMonth() === month && c.status !== 'Bunting') {
          events.push({ day: nextE.getDate(), type: 'next_estrus', name: c.name, id: c.id, colorHex: '#FBBF24', desc: 'Perkiraan Estrus' });
        }
      }
      if (c.inseminations) {
        c.inseminations.forEach((ib) => {
          const ibDate = new Date(ib.date);
          if (ibDate.getFullYear() === year && ibDate.getMonth() === month) {
            events.push({ day: ibDate.getDate(), type: 'ib', name: c.name, id: c.id, colorHex: '#34D399', desc: `IB oleh ${ib.inseminatorName}` });
          }
          const pkbDate = new Date(ibDate);
          pkbDate.setDate(pkbDate.getDate() + 90);
          if (pkbDate.getFullYear() === year && pkbDate.getMonth() === month) {
            events.push({ day: pkbDate.getDate(), type: 'pkb', name: c.name, id: c.id, colorHex: '#60A5FA', desc: 'Jadwal PKB (90 Hari)' });
          }
        });
      }
      if (c.status === 'Bunting' && c.pregnancyDate) {
        const bDate = new Date(c.pregnancyDate);
        bDate.setDate(bDate.getDate() + 285);
        if (bDate.getFullYear() === year && bDate.getMonth() === month) {
          events.push({ day: bDate.getDate(), type: 'birth', name: c.name, id: c.id, colorHex: '#A78BFA', desc: 'Estimasi Kelahiran' });
        }
      }
    });

    const groupedEvents: { [key: number]: any[] } = {};
    events.forEach((e) => {
      if (!groupedEvents[e.day]) groupedEvents[e.day] = [];
      groupedEvents[e.day].push(e);
    });
    return groupedEvents;
  };

  const monthEvents = getCalendarEvents();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const allIBs = cattleList
    .flatMap((c) => (c.inseminations || []).map((ib) => ({ ...ib, cattle: c })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="animate-in fade-in space-y-6">
      <div className="flex justify-end">
        <button
          onClick={onOpenEstrusModal}
          className="flex items-center gap-2 px-4 py-2.5 border border-amber-200 bg-amber-50 text-amber-900 rounded-xl font-bold hover:bg-amber-100 transition-colors text-xs sm:text-sm shadow-xs"
        >
          <Info size={16} className="text-amber-700" />
          <span>Cek Tanda-Tanda Birahi (Estrus 3A)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs border-t-4 border-t-emerald-600">
          <h3 className="text-slate-900 font-bold text-base mb-3 flex items-center gap-2">
            <Syringe size={18} className="text-emerald-700" />
            <span>Riwayat Inseminasi Buatan Terbaru</span>
          </h3>
          <div className="space-y-2.5">
            {allIBs.slice(0, 2).map((ib, i) => {
              const diffDays = Math.floor((new Date().getTime() - new Date(ib.date).getTime()) / (1000 * 3600 * 24));
              return (
                <div
                  key={i}
                  className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{ib.cattle.name}</p>
                      <p className="text-[11px] font-semibold text-emerald-700">ID: {ib.cattle.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-xs">{new Date(ib.date).toLocaleDateString('id-ID')}</p>
                    <p className="text-[11px] font-medium text-slate-500">
                      {diffDays === 0 ? 'Hari ini' : `${diffDays} hari lalu`}
                    </p>
                  </div>
                </div>
              );
            })}
            {allIBs.length === 0 && <p className="text-xs text-slate-400 italic text-center py-3">Belum ada riwayat IB</p>}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs border-t-4 border-t-blue-600">
          <h3 className="text-slate-900 font-bold text-base mb-3 flex items-center gap-2">
            <Stethoscope size={18} className="text-blue-600" />
            <span>Jadwal Pemeriksaan Kebuntingan (PKB)</span>
          </h3>
          <div className="space-y-2.5">
            {allIBs.slice(0, 2).map((ib, i) => {
              const pkbDate = new Date(ib.date);
              pkbDate.setDate(pkbDate.getDate() + 90);
              const diffDays = Math.ceil((pkbDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
              return (
                <div
                  key={i}
                  className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{ib.cattle.name}</p>
                      <p className="text-[11px] font-semibold text-blue-600">
                        IB: {new Date(ib.date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-xs">{pkbDate.toLocaleDateString('id-ID')}</p>
                    <p className={`text-[11px] font-bold ${diffDays < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                      {diffDays < 0 ? `Terlewat ${Math.abs(diffDays)} hari` : `${diffDays} hari lagi`}
                    </p>
                  </div>
                </div>
              );
            })}
            {allIBs.length === 0 && <p className="text-xs text-slate-400 italic text-center py-3">Belum ada jadwal PKB</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Board Calendar */}
        <div className="bg-emerald-950 border border-emerald-900 rounded-2xl p-5 sm:p-7 lg:col-span-2 text-white shadow-md">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-emerald-300/60 text-[10px] font-bold uppercase tracking-wider mb-0.5">Papan Reproduksi</p>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {monthNames[currentDate.getMonth()]}{' '}
                <span className="text-emerald-400 font-normal text-lg">{currentDate.getFullYear()}</span>
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)));
                  setSelectedDay(null);
                }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors border border-white/10"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => {
                  setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
                  setSelectedDay(null);
                }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors border border-white/10"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-emerald-200/60 font-bold text-xs uppercase tracking-wider mb-3">
            <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-11 sm:h-14 rounded-xl bg-transparent"></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDay === day;
              const dayEvents = monthEvents[day] || [];
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`h-11 sm:h-14 flex flex-col items-center justify-start pt-1 rounded-xl relative cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-white text-emerald-950 border-white scale-[1.04] shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
                  }`}
                >
                  <span className="font-bold text-xs sm:text-sm">{day}</span>
                  <div className="flex gap-0.5 absolute bottom-1.5">
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <div
                        key={idx}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: e.colorHex }}
                      ></div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold text-emerald-100">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div> Estrus
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div> Inseminasi (IB)
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div> Jadwal PKB
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div> Perkiraan Lahir
            </div>
          </div>
        </div>

        {/* Activity Sidebar for Selected Day */}
        <div className="bg-emerald-950 border border-emerald-900 rounded-2xl p-5 sm:p-6 flex flex-col max-h-[500px] text-white shadow-md">
          <h3 className="font-bold text-base text-white mb-4 border-b border-white/10 pb-3">
            {selectedDay ? `Aktivitas Tanggal ${selectedDay}` : 'Daftar Aktivitas Bulan Ini'}
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {Object.keys(monthEvents).length === 0 ? (
              <p className="text-emerald-200/50 text-center font-medium mt-10 text-xs">
                Tidak ada jadwal tercatat bulan ini.
              </p>
            ) : (
              Object.keys(monthEvents)
                .sort((a, b) => Number(a) - Number(b))
                .filter((day) => (selectedDay ? Number(day) === selectedDay : true))
                .map((day) =>
                  monthEvents[Number(day)].map((e, idx) => (
                    <div
                      key={`${day}-${idx}`}
                      className="flex gap-3 items-center bg-white/10 p-3 rounded-xl border border-white/10 text-white"
                    >
                      <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm text-white shrink-0">
                        {day}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.colorHex }}></div>
                          <span className="font-bold text-white text-xs truncate">{e.name}</span>
                        </div>
                        <span className="text-[11px] text-emerald-200/80 font-medium ml-3.5 truncate">{e.desc}</span>
                      </div>
                    </div>
                  ))
                )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
