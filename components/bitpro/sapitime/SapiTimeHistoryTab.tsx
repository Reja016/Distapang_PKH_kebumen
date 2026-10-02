'use client';

import React, { useState, useMemo } from 'react';
import {
  Syringe,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Award,
  TrendingUp,
  Layers,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { Cattle, Insemination } from './types';

interface SapiTimeHistoryTabProps {
  cattleList: Cattle[];
  historyList?: any[];
  onTraceCattle?: (cattle: Cattle) => void;
  onEditStatusIb?: (ib: Insemination, cattle: Cattle) => void;
}

export function SapiTimeHistoryTab({
  cattleList,
  onTraceCattle,
  onEditStatusIb,
}: SapiTimeHistoryTabProps) {
  const [inseminatorSearch, setInseminatorSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Berhasil' | 'Tidak Berhasil' | 'Menunggu PKB'>('Semua');
  const [selectedInseminatorFilter, setSelectedInseminatorFilter] = useState<string | null>(null);

  // 1. Ekstraksi seluruh riwayat pelayanan IB dari seluruh sapi
  const allInseminations = useMemo(() => {
    const list: Array<Insemination & { cattleRef: Cattle }> = [];
    cattleList.forEach((cattle) => {
      (cattle.inseminations || []).forEach((ib) => {
        list.push({
          ...ib,
          cattle_id: ib.cattle_id || cattle.id,
          cattleName: ib.cattleName || cattle.name,
          ownerName: ib.ownerName || cattle.ownerName,
          kecamatan: ib.kecamatan || cattle.kecamatan,
          desa: ib.desa || cattle.desa,
          cattleRef: cattle,
        });
      });
    });

    // Urutkan berdasarkan tanggal terbaru di atas
    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [cattleList]);

  // 2. Kalkulasi Performa Inseminator (Total IB, Berhasil, Gagal, % Keberhasilan)
  const inseminatorStats = useMemo(() => {
    const statsMap: Record<
      string,
      {
        name: string;
        totalIb: number;
        berhasil: number;
        gagal: number;
        menunggu: number;
        kecamatans: Set<string>;
        cattleIds: Set<string>;
      }
    > = {};

    allInseminations.forEach((ib) => {
      const name = ib.inseminatorName?.trim() || 'Petugas Tidak Tercatat';
      if (!statsMap[name]) {
        statsMap[name] = {
          name,
          totalIb: 0,
          berhasil: 0,
          gagal: 0,
          menunggu: 0,
          kecamatans: new Set(),
          cattleIds: new Set(),
        };
      }

      statsMap[name].totalIb += 1;
      if (ib.kecamatan) statsMap[name].kecamatans.add(ib.kecamatan);
      if (ib.cattle_id) statsMap[name].cattleIds.add(ib.cattle_id);

      if (ib.status_keberhasilan === 'Berhasil') {
        statsMap[name].berhasil += 1;
      } else if (ib.status_keberhasilan === 'Tidak Berhasil') {
        statsMap[name].gagal += 1;
      } else {
        statsMap[name].menunggu += 1;
      }
    });

    return Object.values(statsMap)
      .map((stat) => {
        // Perhitungan Conception Rate (CR %):
        // Jika ada yang sudah ada hasil (berhasil + gagal), hitung persentase dari yang sudah diperiksa.
        // Jika belum ada yang diperiksa sama sekali, CR = 0%.
        const evaluated = stat.berhasil + stat.gagal;
        const crPercentage = evaluated > 0 ? Math.round((stat.berhasil / evaluated) * 100) : 0;

        return {
          ...stat,
          conceptionRate: crPercentage,
          kecamatanList: Array.from(stat.kecamatans),
          totalCattleHandled: stat.cattleIds.size,
        };
      })
      .sort((a, b) => b.totalIb - a.totalIb);
  }, [allInseminations]);

  // Statistik Ringkasan Dinas
  const summaryDinas = useMemo(() => {
    const totalPetugas = inseminatorStats.length;
    const totalIb = allInseminations.length;
    const totalBerhasil = allInseminations.filter((i) => i.status_keberhasilan === 'Berhasil').length;
    const totalGagal = allInseminations.filter((i) => i.status_keberhasilan === 'Tidak Berhasil').length;
    const totalMenunggu = allInseminations.filter((i) => !i.status_keberhasilan || i.status_keberhasilan === 'Menunggu PKB').length;

    const evaluatedTotal = totalBerhasil + totalGagal;
    const rataRataCr = evaluatedTotal > 0 ? Math.round((totalBerhasil / evaluatedTotal) * 100) : 0;

    return {
      totalPetugas,
      totalIb,
      totalBerhasil,
      totalGagal,
      totalMenunggu,
      rataRataCr,
    };
  }, [inseminatorStats, allInseminations]);

  // Filter Tabel Inseminator
  const filteredInseminators = useMemo(() => {
    if (!inseminatorSearch) return inseminatorStats;
    const q = inseminatorSearch.toLowerCase();
    return inseminatorStats.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.kecamatanList.some((k) => k.toLowerCase().includes(q))
    );
  }, [inseminatorStats, inseminatorSearch]);

  // Filter Tabel Riwayat Pelayanan SapiTime
  const filteredHistory = useMemo(() => {
    return allInseminations.filter((ib) => {
      // Filter Petugas jika dipilih dari tabel atas
      if (selectedInseminatorFilter && ib.inseminatorName?.trim() !== selectedInseminatorFilter) {
        return false;
      }

      // Filter Status Keberhasilan
      if (statusFilter !== 'Semua') {
        const curStatus = ib.status_keberhasilan || 'Menunggu PKB';
        if (curStatus !== statusFilter) return false;
      }

      // Filter Pencarian Teks
      if (historySearch) {
        const q = historySearch.toLowerCase();
        const matchCattle = (ib.cattleName || '').toLowerCase().includes(q);
        const matchOwner = (ib.ownerName || '').toLowerCase().includes(q);
        const matchOfficer = (ib.inseminatorName || '').toLowerCase().includes(q);
        const matchStraw = (ib.strawCode || '').toLowerCase().includes(q);
        const matchKec = (ib.kecamatan || '').toLowerCase().includes(q);
        if (!matchCattle && !matchOwner && !matchOfficer && !matchStraw && !matchKec) {
          return false;
        }
      }

      return true;
    });
  }, [allInseminations, selectedInseminatorFilter, statusFilter, historySearch]);

  return (
    <div className="space-y-8 animate-in fade-in pb-10">
      {/* ── BAGIAN 1: STATISTIK & KINERJA PETUGAS INSEMINATOR ── */}
      <div className="space-y-5">
        {/* Header Kinerja */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-6 sm:p-7 rounded-3xl shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                  Analisis Efektivitas Reproduksi
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight">
                Kinerja Petugas &amp; Riwayat Pelayanan SapiTime
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl">
                Pantau rekam jejak penyuntikan Inseminasi Buatan, tracing siklus kebuntingan per ekor sapi, dan persentase keberhasilan per inseminator.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs px-4 py-2 rounded-2xl border border-white/20 text-right">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">Total Tindakan IB</span>
              <span className="text-2xl font-black">{summaryDinas.totalIb} <span className="text-xs font-semibold text-emerald-200">Kali</span></span>
            </div>
          </div>
        </div>

        {/* 4 Kartu KPI Ringkasan */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Petugas Inseminator</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <User size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-2">{summaryDinas.totalPetugas}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Inseminator tercatat aktif</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Berhasil (Bunting)</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-700 mt-2">{summaryDinas.totalBerhasil}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Konsepsi / bunting tercatat</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Dalam Proses / Menunggu</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-700 mt-2">{summaryDinas.totalMenunggu}</p>
            <p className="text-[11px] text-amber-600 mt-0.5">Menunggu jadwal periksa PKB</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Rata-rata Keberhasilan</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Award size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-teal-800 mt-2">{summaryDinas.rataRataCr}%</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Conception Rate (CR) dinas</p>
          </div>
        </div>

        {/* Tabel Kinerja per Petugas Inseminator */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-700" />
                <span>Tabel Kinerja &amp; Persentase Keberhasilan Petugas</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluasi jumlah penyuntikan yang dilakukan setiap petugas dan tingkat keberhasilan bunting (*Conception Rate*).
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama petugas / kecamatan..."
                value={inseminatorSearch}
                onChange={(e) => setInseminatorSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 w-12 text-center">No</th>
                  <th className="px-5 py-3.5">Nama Petugas Inseminator</th>
                  <th className="px-5 py-3.5">Wilayah Layanan</th>
                  <th className="px-5 py-3.5 text-center">Total IB (Kali)</th>
                  <th className="px-5 py-3.5 text-center text-emerald-700">Jadi / Bunting</th>
                  <th className="px-5 py-3.5 text-center text-rose-700">Tidak Jadi</th>
                  <th className="px-5 py-3.5 text-center text-amber-700">Menunggu PKB</th>
                  <th className="px-5 py-3.5 w-44">Persentase Keberhasilan (CR)</th>
                  <th className="px-5 py-3.5 text-center">Aksi Filter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInseminators.length > 0 ? (
                  filteredInseminators.map((petugas, idx) => {
                    const isSelected = selectedInseminatorFilter === petugas.name;
                    return (
                      <tr
                        key={petugas.name}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? 'bg-emerald-50/70 font-semibold' : ''
                        }`}
                      >
                        <td className="px-5 py-3 text-center font-bold text-slate-500">{idx + 1}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0">
                              {petugas.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{petugas.name}</span>
                              <span className="text-[10px] text-slate-400">{petugas.totalCattleHandled} ekor sapi ditangani</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-slate-600 max-w-[180px] truncate block" title={petugas.kecamatanList.join(', ')}>
                            {petugas.kecamatanList.length > 0 ? petugas.kecamatanList.join(', ') : '-'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center font-black text-slate-900 text-sm">
                          {petugas.totalIb}x
                        </td>
                        <td className="px-5 py-3 text-center font-bold text-emerald-700 bg-emerald-50/30">
                          {petugas.berhasil}x
                        </td>
                        <td className="px-5 py-3 text-center font-bold text-rose-700 bg-rose-50/30">
                          {petugas.gagal}x
                        </td>
                        <td className="px-5 py-3 text-center font-bold text-amber-700 bg-amber-50/30">
                          {petugas.menunggu}x
                        </td>
                        <td className="px-5 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span
                                className={`font-black ${
                                  petugas.conceptionRate >= 70
                                    ? 'text-emerald-700'
                                    : petugas.conceptionRate >= 50
                                    ? 'text-amber-700'
                                    : 'text-rose-700'
                                }`}
                              >
                                {petugas.conceptionRate}%
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {petugas.berhasil}/{petugas.berhasil + petugas.gagal} dievaluasi
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  petugas.conceptionRate >= 70
                                    ? 'bg-emerald-600'
                                    : petugas.conceptionRate >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${Math.min(100, petugas.conceptionRate)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedInseminatorFilter(isSelected ? null : petugas.name);
                            }}
                            className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isSelected ? '✓ Terpilih' : 'Lihat Sapi'}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-5 py-8 text-center text-slate-400">
                      Tidak ditemukan data petugas inseminator.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── BAGIAN 2: RIWAYAT PELAYANAN INSEMINASI BUATAN (SAPITIME) ── */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <Layers size={18} className="text-emerald-700" />
              <span>Riwayat Pelayanan Inseminasi Buatan (SapiTime)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Rekam jejak setiap penyuntikan IB, status keberhasilan, dan trace urutan siklus sapi.
            </p>
          </div>

          {/* Active filter badge if filtering by officer */}
          {selectedInseminatorFilter && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs text-emerald-900 font-bold">
              <span>Filter Petugas: {selectedInseminatorFilter}</span>
              <button
                onClick={() => setSelectedInseminatorFilter(null)}
                className="text-emerald-700 hover:text-rose-600 p-0.5 cursor-pointer"
                title="Hapus filter petugas"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Toolbar Pencarian & Filter Status */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari peternak, sapi, ID, straw, petugas..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['Semua', 'Berhasil', 'Tidak Berhasil', 'Menunggu PKB'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  statusFilter === st
                    ? st === 'Berhasil'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : st === 'Tidak Berhasil'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : st === 'Menunggu PKB'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Tabel Riwayat Pelayanan IB */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">No</th>
                <th className="px-4 py-3.5">Tanggal &amp; Waktu</th>
                <th className="px-4 py-3.5">Peternak &amp; Sapi</th>
                <th className="px-4 py-3.5">Lokasi</th>
                <th className="px-4 py-3.5">Petugas Inseminator</th>
                <th className="px-4 py-3.5">Straw / Pejantan</th>
                <th className="px-4 py-3.5 text-center">Urutan Siklus</th>
                <th className="px-4 py-3.5">Status Keberhasilan</th>
                <th className="px-4 py-3.5 text-center">Aksi Tracing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((ib, idx) => {
                  const isBerhasil = ib.status_keberhasilan === 'Berhasil';
                  const isGagal = ib.status_keberhasilan === 'Tidak Berhasil';
                  const isMenunggu = !ib.status_keberhasilan || ib.status_keberhasilan === 'Menunggu PKB';

                  return (
                    <tr key={ib.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">
                          {new Date(ib.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400">{ib.time || 'Waktu -'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-extrabold text-slate-900 block flex items-center gap-1">
                          <User size={12} className="text-slate-400" />
                          {ib.ownerName || 'Peternak Tanpa Nama'}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Sapi: {ib.cattleName || 'Sapi'} ({ib.cattle_id})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-slate-700 block">{ib.kecamatan || '-'}</span>
                        <span className="text-[10px] text-slate-400">{ib.desa || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800 block">{ib.inseminatorName || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-slate-900 block">{ib.strawCode || '-'}</span>
                        <span className="text-[10px] text-slate-500">
                          {ib.bullBreed || ib.bullName || 'Straw Pejantan'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-black bg-slate-100 text-slate-800 border border-slate-200">
                          IB Ke-{ib.ibOrder || 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                              isBerhasil
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isGagal
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {isBerhasil && <CheckCircle2 size={12} />}
                            {isGagal && <XCircle size={12} />}
                            {isMenunggu && <Clock size={12} />}
                            <span>{ib.status_keberhasilan || 'Menunggu PKB'}</span>
                          </span>

                          <span className="text-[10px] text-slate-400">
                            Mode: {ib.mode_keberhasilan === 'manual' ? 'Manual' : 'Sistem'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {onEditStatusIb && (
                            <button
                              onClick={() => onEditStatusIb(ib, ib.cattleRef)}
                              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              title="Ubah status keberhasilan manual/sistem"
                            >
                              <Edit2 size={11} className="text-emerald-600" />
                              <span>Ubah</span>
                            </button>
                          )}
                          {onTraceCattle && (
                            <button
                              onClick={() => onTraceCattle(ib.cattleRef)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Trace riwayat lengkap sapi ini"
                            >
                              <Syringe size={11} className="text-emerald-700" />
                              <span>Trace</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    Tidak ditemukan data riwayat pelayanan inseminasi buatan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
