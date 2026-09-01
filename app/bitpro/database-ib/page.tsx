'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Search,
  Download,
  Plus,
  Activity,
  Calendar,
  Clock,
  Baby,
  Stethoscope,
  CheckCircle2,
  AlertCircle,
  X,
  FileSpreadsheet,
  ChevronRight,
  Smartphone,
  User,
  Sparkles,
  RefreshCw,
  Info,
  TrendingUp,
} from 'lucide-react';

// ─────────────────────────────────────────────
// KONSTANTA & TIPE DATA
// ─────────────────────────────────────────────
const GESTASI_SAPI_HARI = 283;

type Insemination = {
  id: number;
  date: string;
  time: string;
  kecamatan: string;
  desa: string;
  inseminatorName: string;
  strawCode: string;
  bullName: string;
  bullBreed: string;
  rekomendasiPkb: string;
  notes: string;

  pkbStatus?: 'Sudah Diperiksa' | 'Tidak Diperiksa';
  pkbSkipDate?: string;
  pkbSkipReason?: string;

  pkbDateActual?: string;
  pkbResult?: 'Bunting' | 'Tidak Bunting';
  pkbOfficer?: string;
  pkbNotes?: string;

  birthDate?: string;
  calfGender?: 'Jantan' | 'Betina';
  birthNotes?: string;
};

type IBRecord = Insemination & {
  cattleName: string;
  ownerName: string;
  cattleId: string;
};

type CalvingIntervalRow = {
  cattleId: string;
  cattleName: string;
  ownerName: string;
  calvingKe: number;
  kelahiranSebelumnya: string;
  kelahiranSekarang: string;
  intervalHari: number;
  intervalBulan: number;
  kategori: string;
};

// ─────────────────────────────────────────────
// HELPER PERHITUNGAN REPRODUKSI
// ─────────────────────────────────────────────
const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString('id-ID') : '-';

function estimateBirthInfo(ib: IBRecord) {
  const estDate = new Date(ib.date);
  estDate.setDate(estDate.getDate() + GESTASI_SAPI_HARI);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const estDay = new Date(estDate);
  estDay.setHours(0, 0, 0, 0);
  const daysRemaining = Math.round((estDay.getTime() - today.getTime()) / 86400000);

  return {
    estimatedDate: estDate,
    estimatedDateLabel: estDate.toLocaleDateString('id-ID'),
    daysRemaining,
    isOverdue: daysRemaining < 0,
  };
}

function kategoriCalvingInterval(hari: number): string {
  if (hari <= 365) return 'Sangat Baik';
  if (hari <= 425) return 'Ideal / Baik';
  if (hari <= 450) return 'Cukup';
  return 'Perlu Perhatian';
}

function calculateCalvingIntervals(list: IBRecord[]): CalvingIntervalRow[] {
  const byCattle: Record<string, { cattleName: string; ownerName: string; births: Date[] }> = {};
  list.forEach((ib) => {
    if (ib.birthDate) {
      if (!byCattle[ib.cattleId]) {
        byCattle[ib.cattleId] = { cattleName: ib.cattleName, ownerName: ib.ownerName, births: [] };
      }
      byCattle[ib.cattleId].births.push(new Date(ib.birthDate));
    }
  });

  const rows: CalvingIntervalRow[] = [];
  Object.entries(byCattle).forEach(([cattleId, data]) => {
    const sorted = [...data.births].sort((a, b) => a.getTime() - b.getTime());
    for (let i = 1; i < sorted.length; i++) {
      const intervalHari = Math.round((sorted[i].getTime() - sorted[i - 1].getTime()) / 86400000);
      rows.push({
        cattleId,
        cattleName: data.cattleName,
        ownerName: data.ownerName,
        calvingKe: i,
        kelahiranSebelumnya: sorted[i - 1].toLocaleDateString('id-ID'),
        kelahiranSekarang: sorted[i].toLocaleDateString('id-ID'),
        intervalHari,
        intervalBulan: +(intervalHari / 30.44).toFixed(1),
        kategori: kategoriCalvingInterval(intervalHari),
      });
    }
  });
  return rows;
}

export default function DatabaseIBPage() {
  const [ibList, setIbList] = useState<IBRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [showPkbModal, setShowPkbModal] = useState(false);
  const [selectedIbForPkb, setSelectedIbForPkb] = useState<IBRecord | null>(null);
  const [pkbFormData, setPkbFormData] = useState({ date: '', result: 'Bunting', officer: '', notes: '' });

  const [showSkipPkbModal, setShowSkipPkbModal] = useState(false);
  const [selectedIbForSkip, setSelectedIbForSkip] = useState<IBRecord | null>(null);
  const [skipFormData, setSkipFormData] = useState({ date: '', reason: '' });

  const [showBirthModal, setShowBirthModal] = useState(false);
  const [selectedIbForBirth, setSelectedIbForBirth] = useState<IBRecord | null>(null);
  const [birthFormData, setBirthFormData] = useState({ date: '', gender: 'Jantan', notes: '' });

  // 1. Tarik Data dari MySQL (API)
  const loadData = async () => {
    try {
      const res = await fetch('/api/sapitime');
      const json = await res.json();
      if (json.success && json.cattle) {
        const allIBs: IBRecord[] = [];
        json.cattle.forEach((cattle: any) => {
          if (cattle.inseminations && cattle.inseminations.length > 0) {
            cattle.inseminations.forEach((ib: any) => {
              allIBs.push({
                ...ib,
                cattleName: cattle.name,
                ownerName: cattle.ownerName || '',
                cattleId: cattle.id,
              });
            });
          }
        });
        allIBs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setIbList(allIBs);
      }
    } catch (e) {
      console.error('Gagal mengambil data IB dari database', e);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('cattleDataUpdated', loadData);
    return () => window.removeEventListener('cattleDataUpdated', loadData);
  }, []);

  // 2. Fungsi Tembak Eksekusi ke MySQL
  const executeApi = async (action: string, payload: any, historyObj?: any) => {
    try {
      await fetch('/api/sapitime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload, history: historyObj }),
      });
      loadData();
      window.dispatchEvent(new Event('cattleDataUpdated'));
    } catch (e) {
      console.error('Gagal menyimpan data ke database', e);
    }
  };

  // Simpan Hasil PKB
  const handleSavePkb = async () => {
    if (!selectedIbForPkb) return;

    const payload = {
      ib_id: selectedIbForPkb.id,
      cattle_id: selectedIbForPkb.cattleId,
      pkbDateActual: pkbFormData.date,
      pkbResult: pkbFormData.result,
      pkbOfficer: pkbFormData.officer,
      pkbNotes: pkbFormData.notes,
      pregnancyDate: pkbFormData.result === 'Bunting' ? selectedIbForPkb.date : null,
      newCattleStatus: pkbFormData.result === 'Bunting' ? 'Bunting' : 'Estrus',
    };

    const historyObj = {
      type: 'pkb_recorded',
      cattle: selectedIbForPkb.cattleName,
      cattleId: selectedIbForPkb.cattleId,
      description: `PKB Dicatat: Hasil ${pkbFormData.result} (Oleh: ${pkbFormData.officer})`,
      icon: pkbFormData.result === 'Bunting' ? '🤰' : '❌',
    };

    await executeApi('record_pkb', payload, historyObj);

    setShowPkbModal(false);
    setPkbFormData({ date: '', result: 'Bunting', officer: '', notes: '' });
    setSelectedIbForPkb(null);
  };

  // Tandai Tidak PKB
  const handleSkipPkb = async () => {
    if (!selectedIbForSkip) return;

    const payload = {
      ib_id: selectedIbForSkip.id,
      pkbSkipDate: skipFormData.date,
      pkbSkipReason: skipFormData.reason,
    };

    const historyObj = {
      type: 'pkb_skipped',
      cattle: selectedIbForSkip.cattleName,
      cattleId: selectedIbForSkip.cattleId,
      description: `PKB Tidak Dilakukan${skipFormData.reason ? ` (Alasan: ${skipFormData.reason})` : ''}`,
      icon: '🚫',
    };

    await executeApi('skip_pkb', payload, historyObj);

    setShowSkipPkbModal(false);
    setSkipFormData({ date: '', reason: '' });
    setSelectedIbForSkip(null);
  };

  // Simpan Kelahiran
  const handleSaveBirth = async () => {
    if (!selectedIbForBirth) return;

    const payload = {
      ib_id: selectedIbForBirth.id,
      cattle_id: selectedIbForBirth.cattleId,
      birthDate: birthFormData.date,
      calfGender: birthFormData.gender,
      birthNotes: birthFormData.notes,
    };

    const historyObj = {
      type: 'birth_recorded',
      cattle: selectedIbForBirth.cattleName,
      cattleId: selectedIbForBirth.cattleId,
      description: `Kelahiran Pedet ${birthFormData.gender} sukses!`,
      icon: '🍼',
    };

    await executeApi('record_birth', payload, historyObj);

    setShowBirthModal(false);
    setBirthFormData({ date: '', gender: 'Jantan', notes: '' });
    setSelectedIbForBirth(null);
  };

  const calvingIntervals = useMemo(() => calculateCalvingIntervals(ibList), [ibList]);

  const avgCalvingIntervalDays = useMemo(() => {
    if (calvingIntervals.length === 0) return null;
    const total = calvingIntervals.reduce((sum, r) => sum + r.intervalHari, 0);
    return Math.round(total / calvingIntervals.length);
  }, [calvingIntervals]);

  // Export ke Excel Multi-Sheet
  const handleExportExcel = () => {
    const dataSheet = ibList.map((ib) => {
      const birthInfo = ib.pkbResult === 'Bunting' && !ib.birthDate ? estimateBirthInfo(ib) : null;
      return {
        'Nama Peternak': ib.ownerName || '-',
        'Nama Sapi': ib.cattleName,
        'ID Sapi': ib.cattleId,
        Kecamatan: ib.kecamatan,
        Desa: ib.desa,
        'Tanggal IB': fmtDate(ib.date),
        'Jam IB': ib.time,
        'Nama Inseminator': ib.inseminatorName,
        'Kode Straw': ib.strawCode,
        'Nama Pejantan': ib.bullName,
        'Ras Pejantan': ib.bullBreed,
        'Rekomendasi PKB': ib.rekomendasiPkb,
        'Status PKB': ib.pkbResult
          ? 'Sudah Diperiksa'
          : ib.pkbStatus === 'Tidak Diperiksa'
          ? 'Tidak Diperiksa'
          : 'Menunggu',
        'Tanggal PKB Aktual': fmtDate(ib.pkbDateActual),
        'Hasil PKB': ib.pkbResult || '-',
        'Petugas PKB': ib.pkbOfficer || '-',
        'Catatan PKB': ib.pkbNotes || '-',
        'Tanggal PKB Dilewati': fmtDate(ib.pkbSkipDate),
        'Alasan PKB Dilewati': ib.pkbSkipReason || '-',
        'Estimasi Tanggal Lahir': birthInfo ? birthInfo.estimatedDateLabel : '-',
        'Estimasi Sisa Hari': birthInfo ? birthInfo.daysRemaining : '-',
        'Tanggal Lahir Aktual': fmtDate(ib.birthDate),
        'Jenis Kelamin Pedet': ib.calfGender || '-',
        'Catatan Kelahiran': ib.birthNotes || '-',
        'Catatan IB': ib.notes || '-',
      };
    });

    const calvingSheet = calvingIntervals.map((row) => ({
      'Nama Peternak': row.ownerName || '-',
      'Nama Sapi': row.cattleName,
      'ID Sapi': row.cattleId,
      'Kelahiran Ke-': row.calvingKe + 1,
      'Kelahiran Sebelumnya': row.kelahiranSebelumnya,
      'Kelahiran Sekarang': row.kelahiranSekarang,
      'Interval (Hari)': row.intervalHari,
      'Interval (Bulan)': row.intervalBulan,
      Kategori: row.kategori,
    }));

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(dataSheet);
    XLSX.utils.book_append_sheet(wb, ws1, 'Data Siklus IB');

    if (calvingSheet.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(calvingSheet);
      XLSX.utils.book_append_sheet(wb, ws2, 'Calving Interval');
    }

    const todayLabel = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Data_Siklus_IB_${todayLabel}.xlsx`);
  };

  const filteredIB = ibList.filter(
    (ib) =>
      ib.cattleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ib.ownerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      ib.inseminatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ib.kecamatan && ib.kecamatan.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ib.strawCode && ib.strawCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-20">
      {/* ── TOP APP BAR (Tema Hijau Bitpro) ── */}
      <header className="border-b border-emerald-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/bitpro"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Bitpro"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link
                  href="/bitpro"
                  className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors truncate"
                >
                  Bitpro
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Database IB</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Pencatatan Inseminasi Buatan &amp; Reproduksi
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportExcel}
              title="Export Excel"
              aria-label="Export Excel"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 transition-colors shadow-xs cursor-pointer"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            <Link
              href="/bitpro/sapitime"
              title="Buka SapiTime"
              aria-label="Buka SapiTime"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
            >
              <Smartphone size={16} className="sm:hidden" />
              <span className="hidden sm:inline">Buka SapiTime</span>
              <ChevronRight size={16} className="hidden sm:inline" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* 1. TABEL UTAMA DATABASE IB */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <span>Pelacakan Siklus Reproduksi Inseminasi Buatan</span>
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {filteredIB.length} Record
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring pelaksanaan IB, verifikasi PKB 90 hari, dan estimasi kelahiran
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari sapi, peternak, petugas, straw..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full min-h-touch h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-emerald-600 text-xs text-slate-900 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-5 py-4">Identitas Peternak & Sapi</th>
                  <th className="px-5 py-4">Data IB (Awal)</th>
                  <th className="px-5 py-4">Pejantan / Straw</th>
                  <th className="px-5 py-4">Status PKB (90 Hari)</th>
                  <th className="px-5 py-4">Status Kelahiran</th>
                  <th className="px-5 py-4 text-center">Tindakan Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIB.map((ib) => {
                  const birthInfo = ib.pkbResult === 'Bunting' && !ib.birthDate ? estimateBirthInfo(ib) : null;

                  return (
                    <tr key={ib.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 1. Sapi & Peternak */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900 text-sm block mb-0.5 flex items-center gap-1.5">
                          <User size={15} className="text-slate-400" />
                          {ib.ownerName || 'Peternak Tidak Diketahui'}
                        </span>
                        <span className="font-semibold text-emerald-700 block text-xs ml-5">
                          Sapi: {ib.cattleName} <span className="text-slate-400 font-normal">({ib.cattleId})</span>
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-1 ml-5">
                          {ib.kecamatan || '-'}, {ib.desa || '-'}
                        </span>
                      </td>

                      {/* 2. IB */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900 block">{fmtDate(ib.date)}</span>
                        <span className="block text-xs text-slate-500 mt-0.5">Petugas: {ib.inseminatorName}</span>
                      </td>

                      {/* 3. Pejantan */}
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900 block">
                          {ib.bullName} <span className="text-slate-500 font-normal text-xs">({ib.bullBreed})</span>
                        </span>
                        <span className="block text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md inline-block mt-1">
                          Straw: {ib.strawCode}
                        </span>
                      </td>

                      {/* 4. PKB Status */}
                      <td className="px-5 py-4">
                        {!ib.pkbResult && ib.pkbStatus !== 'Tidak Diperiksa' && (
                          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-700">
                              Jadwal PKB
                            </span>
                            <span className="block text-xs font-bold text-amber-900 mt-0.5">
                              {ib.rekomendasiPkb}
                            </span>
                          </div>
                        )}

                        {!ib.pkbResult && ib.pkbStatus === 'Tidak Diperiksa' && (
                          <div className="bg-slate-100 border border-slate-200 p-2.5 rounded-xl">
                            <span className="block text-xs font-bold text-slate-700">PKB Dilewati</span>
                            <span className="block text-[11px] text-slate-500 mt-0.5">Tgl: {fmtDate(ib.pkbSkipDate)}</span>
                            {ib.pkbSkipReason && (
                              <span className="block text-[10px] text-slate-400 mt-0.5">Alasan: {ib.pkbSkipReason}</span>
                            )}
                          </div>
                        )}

                        {ib.pkbResult && (
                          <div
                            className={`p-2.5 rounded-xl border ${
                              ib.pkbResult === 'Bunting'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-red-50 border-red-200 text-red-900'
                            }`}
                          >
                            <span
                              className={`block font-bold text-xs ${
                                ib.pkbResult === 'Bunting' ? 'text-emerald-700' : 'text-red-700'
                              }`}
                            >
                              {ib.pkbResult === 'Bunting' ? '✓ Positif Bunting' : '✕ Tidak Bunting (Kosong)'}
                            </span>
                            <span className="block text-[11px] text-slate-600 mt-0.5">
                              Tgl: {fmtDate(ib.pkbDateActual)}
                            </span>
                            <span className="block text-[10px] text-slate-500">Oleh: {ib.pkbOfficer}</span>
                          </div>
                        )}
                      </td>

                      {/* 5. Kelahiran Status */}
                      <td className="px-5 py-4">
                        {!ib.pkbResult && (
                          <span className="text-xs text-slate-400 italic">Menunggu hasil PKB</span>
                        )}
                        {ib.pkbResult === 'Tidak Bunting' && (
                          <span className="text-xs text-red-500 font-medium">Siklus selesai (Bisa IB ulang)</span>
                        )}
                        {ib.pkbResult === 'Bunting' && !ib.birthDate && birthInfo && (
                          <div
                            className={`p-2.5 rounded-xl border ${
                              birthInfo.isOverdue ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'
                            }`}
                          >
                            <span
                              className={`block font-bold text-xs ${
                                birthInfo.isOverdue ? 'text-red-700' : 'text-purple-700'
                              }`}
                            >
                              {birthInfo.isOverdue ? '⚠ Lewat Estimasi' : 'Sedang Bunting'}
                            </span>
                            <span className="block text-xs text-slate-700 mt-0.5">
                              Estimasi Lahir: <b>{birthInfo.estimatedDateLabel}</b>
                            </span>
                            <span
                              className={`block text-[11px] font-bold mt-0.5 ${
                                birthInfo.isOverdue ? 'text-red-600' : 'text-purple-600'
                              }`}
                            >
                              {birthInfo.isOverdue
                                ? `Sudah lewat ${Math.abs(birthInfo.daysRemaining)} hari`
                                : `± ${birthInfo.daysRemaining} hari lagi`}
                            </span>
                          </div>
                        )}
                        {ib.birthDate && (
                          <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl">
                            <span className="block font-bold text-xs text-blue-700">✓ Partus / Lahir</span>
                            <span className="block text-[11px] text-slate-700 mt-0.5">Tgl: {fmtDate(ib.birthDate)}</span>
                            <span className="block text-[11px] font-bold text-blue-600 mt-0.5">
                              Pedet: {ib.calfGender}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 6. Action Buttons */}
                      <td className="px-5 py-4 text-center align-middle">
                        <div className="flex flex-col gap-1.5 min-w-[120px]">
                          {!ib.pkbResult && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedIbForPkb(ib);
                                  setShowPkbModal(true);
                                }}
                                className="min-h-touch h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Stethoscope size={13} />
                                <span>Catat PKB</span>
                              </button>
                              {ib.pkbStatus !== 'Tidak Diperiksa' && (
                                <button
                                  onClick={() => {
                                    setSelectedIbForSkip(ib);
                                    setShowSkipPkbModal(true);
                                  }}
                                  className="min-h-touch h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer"
                                >
                                  Tidak PKB
                                </button>
                              )}
                            </>
                          )}
                          {ib.pkbResult === 'Bunting' && !ib.birthDate && (
                            <button
                              onClick={() => {
                                setSelectedIbForBirth(ib);
                                setShowBirthModal(true);
                              }}
                              className="min-h-touch h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Baby size={13} />
                              <span>Catat Kelahiran</span>
                            </button>
                          )}
                          {ib.pkbResult === 'Tidak Bunting' && (
                            <span className="text-xs text-slate-400 font-medium">Siklus Selesai</span>
                          )}
                          {ib.birthDate && (
                            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                              Siklus Sukses
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredIB.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                      Belum ada data riwayat IB di database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. ANALISIS CALVING INTERVAL (JARAK BERANAK) */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp size={18} className="text-emerald-700" />
                <span>Analisis Calving Interval (Jarak Beranak Indukan)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluasi efisiensi reproduksi ternak berdasarkan interval kelahiran berturut-turut
              </p>
            </div>
            {avgCalvingIntervalDays !== null && (
              <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-emerald-900">
                Rata-rata Interval: <span className="text-emerald-700">{avgCalvingIntervalDays} Hari</span>{' '}
                <span className="font-normal text-slate-500">(± {(avgCalvingIntervalDays / 30.44).toFixed(1)} Bulan)</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs sm:text-sm text-left whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-5 py-4">Identitas Peternak & Sapi</th>
                  <th className="px-5 py-4">Kelahiran Ke-</th>
                  <th className="px-5 py-4">Kelahiran Sebelumnya</th>
                  <th className="px-5 py-4">Kelahiran Sekarang</th>
                  <th className="px-5 py-4">Interval Waktu</th>
                  <th className="px-5 py-4">Kategori Efisiensi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calvingIntervals.map((row, idx) => (
                  <tr key={`${row.cattleId}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-900 block">{row.ownerName || 'Tanpa Nama'}</span>
                      <span className="text-emerald-700 font-semibold text-xs ml-4">Sapi: {row.cattleName}</span>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-700">{row.calvingKe + 1}</td>
                    <td className="px-5 py-4 text-slate-600">{row.kelahiranSebelumnya}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{row.kelahiranSekarang}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {row.intervalHari} hari <span className="text-slate-500 font-normal text-xs">({row.intervalBulan} bln)</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          row.kategori === 'Sangat Baik'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.kategori === 'Ideal / Baik'
                            ? 'bg-blue-100 text-blue-800'
                            : row.kategori === 'Cukup'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {row.kategori}
                      </span>
                    </td>
                  </tr>
                ))}
                {calvingIntervals.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                      Belum ada sapi dengan riwayat kelahiran ke-2 atau lebih untuk dihitung intervalnya.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── MODAL CATAT HASIL PKB ── */}
      {showPkbModal && selectedIbForPkb && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Stethoscope size={20} className="text-emerald-700" />
              <span>Catat Hasil PKB - Sapi {selectedIbForPkb.cattleName}</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Tanggal Pemeriksaan Kebuntingan</label>
                <input
                  type="date"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                  value={pkbFormData.date}
                  onChange={(e) => setPkbFormData({ ...pkbFormData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Nama Petugas Pemeriksa PKB</label>
                <input
                  type="text"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                  placeholder="Nama dokter hewan / paramedik pemeriksa"
                  value={pkbFormData.officer}
                  onChange={(e) => setPkbFormData({ ...pkbFormData, officer: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Hasil Pemeriksaan</label>
                <select
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900 font-bold"
                  value={pkbFormData.result}
                  onChange={(e) => setPkbFormData({ ...pkbFormData, result: e.target.value as any })}
                >
                  <option value="Bunting">✓ Positif Bunting</option>
                  <option value="Tidak Bunting">✕ Kosong / Tidak Bunting</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  *Jika Positif Bunting, status sapi otomatis berubah menjadi Bunting dan estimasi kelahiran akan dihitung.
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Catatan Medis</label>
                <textarea
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-600 text-xs text-slate-900"
                  rows={2}
                  placeholder="Catatan kondisi uterus/ovarium..."
                  value={pkbFormData.notes}
                  onChange={(e) => setPkbFormData({ ...pkbFormData, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowPkbModal(false)}
                className="flex-1 min-h-touch h-11 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSavePkb}
                disabled={!pkbFormData.date || !pkbFormData.officer}
                className="flex-1 min-h-touch h-11 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm hover:bg-emerald-700 disabled:opacity-50 shadow-xs cursor-pointer"
              >
                Simpan Hasil PKB
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL TIDAK PKB ── */}
      {showSkipPkbModal && selectedIbForSkip && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold mb-2 text-slate-900 border-b border-slate-100 pb-3">
              Tandai PKB Tidak Dilaksanakan
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Gunakan opsi ini jika pemeriksaan kebuntingan belum/tidak dilakukan untuk sapi ini. Sapi tetap dapat diperiksa ulang sewaktu-waktu.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Tanggal Pencatatan</label>
                <input
                  type="date"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-500 text-xs text-slate-900"
                  value={skipFormData.date}
                  onChange={(e) => setSkipFormData({ ...skipFormData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Alasan (Opsional)</label>
                <textarea
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-500 text-xs text-slate-900"
                  rows={2}
                  placeholder="Contoh: Sapi sedang dijual/di luar kandang"
                  value={skipFormData.reason}
                  onChange={(e) => setSkipFormData({ ...skipFormData, reason: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowSkipPkbModal(false)}
                className="flex-1 min-h-touch h-11 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSkipPkb}
                disabled={!skipFormData.date}
                className="flex-1 min-h-touch h-11 rounded-xl bg-slate-700 text-white font-bold text-xs sm:text-sm hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CATAT KELAHIRAN ── */}
      {showBirthModal && selectedIbForBirth && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Baby size={20} className="text-blue-600" />
              <span>Catat Kelahiran Pedet - Sapi {selectedIbForBirth.cattleName}</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Tanggal Kelahiran (Partus)</label>
                <input
                  type="date"
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 text-xs text-slate-900"
                  value={birthFormData.date}
                  onChange={(e) => setBirthFormData({ ...birthFormData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Jenis Kelamin Pedet</label>
                <select
                  className="w-full min-h-touch h-11 px-3.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 text-xs text-slate-900 font-bold"
                  value={birthFormData.gender}
                  onChange={(e) => setBirthFormData({ ...birthFormData, gender: e.target.value as any })}
                >
                  <option value="Jantan">Jantan</option>
                  <option value="Betina">Betina</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1 text-slate-700">Catatan Kelahiran</label>
                <textarea
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 text-xs text-slate-900"
                  rows={2}
                  placeholder="Kondisi pedet, berat lahir, proses persalinan..."
                  value={birthFormData.notes}
                  onChange={(e) => setBirthFormData({ ...birthFormData, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowBirthModal(false)}
                className="flex-1 min-h-touch h-11 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveBirth}
                disabled={!birthFormData.date}
                className="flex-1 min-h-touch h-11 rounded-xl bg-blue-600 text-white font-bold text-xs sm:text-sm hover:bg-blue-700 disabled:opacity-50 shadow-xs cursor-pointer"
              >
                Simpan Kelahiran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}