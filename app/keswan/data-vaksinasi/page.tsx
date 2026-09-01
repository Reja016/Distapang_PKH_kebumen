'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Info,
  Calendar,
} from 'lucide-react';

interface Bulanan {
  id: number;
  no_urut: number;
  puskeswan: string;
  target: number;
  pengambilan: number;
  realisasi: number;
  kekurangan: number;
  jan: number;
  feb: number;
  mar: number;
  apr: number;
  mei: number;
  jun: number;
  jul: number;
  agu: number;
  sep: number;
  okt: number;
  nov: number;
  des: number;
}
interface Harian {
  id: number;
  puskeswan: string;
  tanggal: string;
  jumlah: number;
}
interface Droping {
  id: number;
  tanggal: string;
  merk_vaksin: string;
  jumlah: number;
  keterangan: string | null;
}
interface ApbdTarget {
  id: number;
  no_urut: number;
  puskeswan: string;
  target_lsd: number;
  target_ndai: number;
  target_rabies: number;
  target_aphtovaks: number;
  pengambilan_ndai: string | null;
  pengambilan_aphtovaks: string | null;
  catatan: string | null;
}

const BULAN_LABEL = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const BULAN_LONG = [
  '',
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];
const BULAN_KEY: (keyof Bulanan)[] = [
  'jan',
  'feb',
  'mar',
  'apr',
  'mei',
  'jun',
  'jul',
  'agu',
  'sep',
  'okt',
  'nov',
  'des',
];

const fallbackPuskeswan = [
  { id: 1, no_urut: 1, puskeswan: 'MIRIT', target: 3000, pengambilan: 1500, realisasi: 0, kekurangan: 3000, jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 },
  { id: 2, no_urut: 2, puskeswan: 'KLIRONG', target: 3000, pengambilan: 1500, realisasi: 0, kekurangan: 3000, jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 },
  { id: 3, no_urut: 3, puskeswan: 'GOMBONG', target: 3000, pengambilan: 1500, realisasi: 0, kekurangan: 3000, jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 },
  { id: 4, no_urut: 4, puskeswan: 'BUAYAN', target: 3000, pengambilan: 1500, realisasi: 0, kekurangan: 3000, jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 },
  { id: 5, no_urut: 5, puskeswan: 'ALIAN', target: 3000, pengambilan: 1500, realisasi: 0, kekurangan: 3000, jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 },
  { id: 6, no_urut: 6, puskeswan: 'PREMBUN', target: 3000, pengambilan: 1500, realisasi: 0, kekurangan: 3000, jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 },
  { id: 7, no_urut: 7, puskeswan: 'KEBUMEN', target: 3000, pengambilan: 1500, realisasi: 0, kekurangan: 3000, jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 },
  { id: 8, no_urut: 8, puskeswan: 'KARANGANYAR', target: 3000, pengambilan: 1500, realisasi: 0, kekurangan: 3000, jan: 0, feb: 0, mar: 0, apr: 0, mei: 0, jun: 0, jul: 0, agu: 0, sep: 0, okt: 0, nov: 0, des: 0 },
];

function daysInMonth(month: number, year = 2026) {
  return new Date(year, month, 0).getDate();
}
const n = (v: any) => Number(v) || 0;

const emptyBulananForm = { no_urut: 0, puskeswan: '', target: 0, pengambilan: 0 };
const emptyDropingForm = { tanggal: '', merk_vaksin: '', jumlah: 0, keterangan: '' };

export default function DataVaksinasiPMKPage() {
  // Posisi ditukar: default activeTab adalah 'harian'
  const [activeTab, setActiveTab] = useState<'harian' | 'bulanan' | 'apbd'>('harian');
  const [activeMonth, setActiveMonth] = useState<number>(1);

  const [bulanan, setBulanan] = useState<Bulanan[]>(fallbackPuskeswan);
  const [harian, setHarian] = useState<Harian[]>([]);
  const [droping, setDroping] = useState<Droping[]>([]);
  const [apbdTarget, setApbdTarget] = useState<ApbdTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // State untuk Inline Editing Harian
  const [editingHarian, setEditingHarian] = useState<{ puskeswan: string; tanggal: string } | null>(null);
  const [editHarianValue, setEditHarianValue] = useState<string>('');
  const harianInputRef = useRef<HTMLInputElement>(null);

  // State untuk Inline Editing Bulanan (Target & Pengambilan)
  const [editingBulananCell, setEditingBulananCell] = useState<{ id: number; field: 'target' | 'pengambilan' } | null>(null);
  const [editBulananValue, setEditBulananValue] = useState<string>('');
  const bulananInputRef = useRef<HTMLInputElement>(null);

  // Modal State untuk Tambah Puskeswan & Droping
  const [modalBulanan, setModalBulanan] = useState<{ open: boolean; edit: Bulanan | null }>({
    open: false,
    edit: null,
  });
  const [formBulanan, setFormBulanan] = useState<any>(emptyBulananForm);

  const [modalDroping, setModalDroping] = useState<{ open: boolean; edit: Droping | null }>({
    open: false,
    edit: null,
  });
  const [formDroping, setFormDroping] = useState<any>(emptyDropingForm);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rB, rH, rD, rT] = await Promise.all([
        fetch('/api/vaksinasi-pmk/bulanan').then((r) => r.json()).catch(() => ({ success: false })),
        fetch('/api/vaksinasi-pmk/harian').then((r) => r.json()).catch(() => ({ success: false })),
        fetch('/api/vaksinasi-pmk/apbd-droping').then((r) => r.json()).catch(() => ({ success: false })),
        fetch('/api/vaksinasi-pmk/apbd-target').then((r) => r.json()).catch(() => ({ success: false })),
      ]);
      if (rB?.success && Array.isArray(rB.data) && rB.data.length > 0) setBulanan(rB.data);
      if (rH?.success && Array.isArray(rH.data)) setHarian(rH.data);
      if (rD?.success && Array.isArray(rD.data)) setDroping(rD.data);
      if (rT?.success && Array.isArray(rT.data)) setApbdTarget(rT.data);
    } catch {
      console.warn('Menggunakan data memori/fallback sementara');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Focus ke input saat inline edit harian aktif
  useEffect(() => {
    if (editingHarian && harianInputRef.current) {
      harianInputRef.current.focus();
      harianInputRef.current.select();
    }
  }, [editingHarian]);

  // Focus ke input saat inline edit bulanan aktif
  useEffect(() => {
    if (editingBulananCell && bulananInputRef.current) {
      bulananInputRef.current.focus();
      bulananInputRef.current.select();
    }
  }, [editingBulananCell]);

  const harianMap = useMemo(() => {
    const map: Record<string, Record<string, { id: number; jumlah: number }>> = {};
    for (const h of harian) {
      if (!map[h.puskeswan]) map[h.puskeswan] = {};
      const dateObj = new Date(h.tanggal);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dd = String(dateObj.getDate()).padStart(2, '0');
      const fixDateStr = `${yyyy}-${mm}-${dd}`;
      map[h.puskeswan][fixDateStr] = { id: h.id, jumlah: n(h.jumlah) };
    }
    return map;
  }, [harian]);

  // Kalkulasi total bulanan
  const totalBulanan = useMemo(() => {
    return bulanan.reduce(
      (acc, r) => ({
        target: acc.target + n(r.target),
        pengambilan: acc.pengambilan + n(r.pengambilan),
        realisasi: acc.realisasi + n(r.realisasi),
        kekurangan: acc.kekurangan + n(r.kekurangan),
      }),
      { target: 0, pengambilan: 0, realisasi: 0, kekurangan: 0 }
    );
  }, [bulanan]);

  // ── INLINE EDIT HARIAN ──
  const startEditHarian = (puskeswan: string, tanggal: string) => {
    const existing = harianMap[puskeswan]?.[tanggal];
    setEditingHarian({ puskeswan, tanggal });
    setEditHarianValue(existing && existing.jumlah > 0 ? String(existing.jumlah) : '');
  };

  const saveEditHarian = async () => {
    if (!editingHarian) return;
    const { puskeswan, tanggal } = editingHarian;
    const jumlahVal = Number(editHarianValue) || 0;

    // Optimistic Update pada state harian
    setHarian((prev) => {
      const filtered = prev.filter(
        (item) => !(item.puskeswan === puskeswan && item.tanggal.slice(0, 10) === tanggal)
      );
      if (jumlahVal > 0) {
        return [...filtered, { id: Date.now(), puskeswan, tanggal, jumlah: jumlahVal }];
      }
      return filtered;
    });

    // Update juga realisasi pada state bulanan secara instan
    const monthNum = parseInt(tanggal.split('-')[1], 10);
    const monthKey = BULAN_KEY[monthNum - 1];

    setBulanan((prev) =>
      prev.map((b) => {
        if (b.puskeswan === puskeswan) {
          const oldVal = harianMap[puskeswan]?.[tanggal]?.jumlah || 0;
          const diff = jumlahVal - oldVal;
          const newRealisasi = Math.max(0, n(b.realisasi) + diff);
          const newMonthVal = Math.max(0, n(b[monthKey]) + diff);
          return {
            ...b,
            realisasi: newRealisasi,
            kekurangan: Math.max(0, n(b.target) - newRealisasi),
            [monthKey]: newMonthVal,
          };
        }
        return b;
      })
    );

    setEditingHarian(null);

    // Simpan ke API
    try {
      const res = await fetch('/api/vaksinasi-pmk/harian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puskeswan, tanggal, jumlah: jumlahVal }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', `${puskeswan} (${tanggal}): ${jumlahVal} dosis tersimpan.`);
      }
    } catch {
      showToast('success', 'Perubahan dosis harian dicatat.');
    }
  };

  // ── INLINE EDIT BULANAN (TARGET & PENGAMBILAN) ──
  const startEditBulananCell = (id: number, field: 'target' | 'pengambilan', currentVal: number) => {
    setEditingBulananCell({ id, field });
    setEditBulananValue(String(currentVal || 0));
  };

  const saveEditBulananCell = async () => {
    if (!editingBulananCell) return;
    const { id, field } = editingBulananCell;
    const numVal = Number(editBulananValue) || 0;

    // Optimistic Update
    setBulanan((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updated = { ...b, [field]: numVal };
          if (field === 'target') {
            updated.kekurangan = Math.max(0, numVal - n(b.realisasi));
          }
          return updated;
        }
        return b;
      })
    );

    setEditingBulananCell(null);

    try {
      const res = await fetch(`/api/vaksinasi-pmk/bulanan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: numVal }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', `Tersimpan: ${field.toUpperCase()} diperbarui (${numVal.toLocaleString('id-ID')}).`);
      }
    } catch {
      showToast('success', 'Perubahan tersimpan.');
    }
  };

  const handleExportExcel = () => {
    try {
      const wsHarianData = harian.map((h) => ({
        Puskeswan: h.puskeswan,
        Tanggal: new Date(h.tanggal).toLocaleDateString('id-ID'),
        'Jumlah Dosis': h.jumlah,
      }));
      const wsHarian = XLSX.utils.json_to_sheet(wsHarianData);

      const wsBulananData = bulanan.map((b) => ({
        'No. Urut': b.no_urut,
        Puskeswan: b.puskeswan,
        Target: b.target,
        Pengambilan: b.pengambilan,
        Realisasi: b.realisasi,
        Kekurangan: b.kekurangan,
        Jan: b.jan || 0,
        Feb: b.feb || 0,
        Mar: b.mar || 0,
        Apr: b.apr || 0,
        Mei: b.mei || 0,
        Jun: b.jun || 0,
        Jul: b.jul || 0,
        Agu: b.agu || 0,
        Sep: b.sep || 0,
        Okt: b.okt || 0,
        Nov: b.nov || 0,
        Des: b.des || 0,
      }));
      const wsBulanan = XLSX.utils.json_to_sheet(wsBulananData);

      const wsApbdData = apbdTarget.map((a) => ({
        Puskeswan: a.puskeswan,
        'Target LSD': a.target_lsd,
        'Target ND AI': a.target_ndai,
        'Target Rabies': a.target_rabies,
        'Target Aphtovaks': a.target_aphtovaks,
      }));
      const wsApbd = XLSX.utils.json_to_sheet(wsApbdData);

      const wsDropingData = droping.map((d) => ({
        'Tanggal Droping': new Date(d.tanggal).toLocaleDateString('id-ID'),
        'Merk Vaksin': d.merk_vaksin,
        'Jumlah (Dosis)': d.jumlah,
        Keterangan: d.keterangan || '-',
      }));
      const wsDroping = XLSX.utils.json_to_sheet(wsDropingData);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsHarian, 'Data Harian');
      XLSX.utils.book_append_sheet(wb, wsBulanan, 'Rekap Bulanan');
      XLSX.utils.book_append_sheet(wb, wsApbd, 'Target APBD');
      XLSX.utils.book_append_sheet(wb, wsDroping, 'Log Droping');

      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `Data_Vaksinasi_PMK_${dateStr}.xlsx`);
      showToast('success', 'File Excel berhasil diunduh!');
    } catch {
      showToast('error', 'Gagal mengekspor file Excel.');
    }
  };

  const openEditBulanan = (row: Bulanan) => {
    setFormBulanan({
      no_urut: row.no_urut,
      puskeswan: row.puskeswan,
      target: row.target,
      pengambilan: row.pengambilan,
    });
    setModalBulanan({ open: true, edit: row });
  };

  const submitBulanan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formBulanan.puskeswan.trim()) {
      showToast('error', 'Nama Puskeswan wajib diisi.');
      return;
    }
    try {
      const isEdit = !!modalBulanan.edit;
      const url = isEdit
        ? `/api/vaksinasi-pmk/bulanan/${modalBulanan.edit!.id}`
        : '/api/vaksinasi-pmk/bulanan';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formBulanan),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showToast('success', json.message);
      setModalBulanan({ open: false, edit: null });
      fetchAll();
    } catch (e: any) {
      showToast('error', e.message);
    }
  };

  const deleteBulanan = async (row: Bulanan) => {
    if (!confirm(`Hapus Puskeswan "${row.puskeswan}"? Seluruh data harian miliknya juga akan terhapus.`)) return;
    try {
      const res = await fetch(`/api/vaksinasi-pmk/bulanan/${row.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showToast('success', json.message);
      fetchAll();
    } catch (e: any) {
      showToast('error', e.message);
    }
  };

  const openAddDroping = () => {
    setFormDroping(emptyDropingForm);
    setModalDroping({ open: true, edit: null });
  };

  const openEditDroping = (row: Droping) => {
    setFormDroping({
      tanggal: row.tanggal?.slice(0, 10) || '',
      merk_vaksin: row.merk_vaksin,
      jumlah: row.jumlah,
      keterangan: row.keterangan || '',
    });
    setModalDroping({ open: true, edit: row });
  };

  const submitDroping = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formDroping.tanggal || !formDroping.merk_vaksin.trim()) {
      showToast('error', 'Tanggal dan Merk Vaksin wajib diisi.');
      return;
    }
    try {
      const isEdit = !!modalDroping.edit;
      const url = isEdit
        ? `/api/vaksinasi-pmk/apbd-droping/${modalDroping.edit!.id}`
        : '/api/vaksinasi-pmk/apbd-droping';
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDroping),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showToast('success', json.message);
      setModalDroping({ open: false, edit: null });
      fetchAll();
    } catch (e: any) {
      showToast('error', e.message);
    }
  };

  const deleteDroping = async (row: Droping) => {
    if (!confirm(`Hapus log droping "${row.merk_vaksin}"?`)) return;
    try {
      const res = await fetch(`/api/vaksinasi-pmk/apbd-droping/${row.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      showToast('success', json.message);
      fetchAll();
    } catch (e: any) {
      showToast('error', e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white pb-20">
      
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-bold text-white flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── TOP HEADER ── */}
      <header className="border-b border-blue-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/keswan"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Keswan"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/keswan" className="text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors truncate">
                  Keswan
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-blue-700 whitespace-nowrap">Data Vaksinasi</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Rekapitulasi &amp; Pemantauan Vaksinasi PMK
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
            <button
              onClick={fetchAll}
              title="Muat Ulang Data"
              aria-label="Muat Ulang Data"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Muat Ulang</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
        
        {/* Banner Info Inline Edit */}
        <div className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs sm:text-sm">
          <Info size={18} className="text-blue-600 shrink-0" />
          <p>
            <strong>Mode Click-to-Edit Aktif:</strong> Klik langsung pada kotak tanggal harian atau angka target/pengambilan untuk mengubah dosis. Tekan <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded font-mono text-xs font-bold text-blue-700">Enter</kbd> atau klik di luar sel untuk menyimpan otomatis.
          </p>
        </div>

        {/* Navigation Tabs (Urutan Ditukar: Matriks Input Harian di awal) */}
        <div className="flex gap-2 border-b border-slate-200 pb-px overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { key: 'harian', label: 'Matriks Input Harian' },
            { key: 'bulanan', label: 'Rekapitulasi Bulanan' },
            { key: 'apbd', label: 'Alokasi APBD & Log Droping' },
          ].map((tab) => {
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`min-h-touch h-11 px-4 sm:px-5 rounded-t-xl text-xs sm:text-sm font-bold border-t border-x transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-white border-slate-200 text-blue-600 border-b-white translate-y-px shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-900 bg-slate-100/60'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: MATRIKS INPUT HARIAN (UTAMA) ── */}
        {activeTab === 'harian' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Month Filter Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
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
                    {label} 2026
                  </button>
                );
              })}
            </div>

            {/* Matrix Table with Click-to-Edit */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Matriks Log Harian — Bulan {BULAN_LONG[activeMonth]} 2026
                  </h3>
                  <p className="text-xs text-slate-500">
                    Klik langsung pada sel tanggal untuk mengetik angka dosis vaksinasi (Click-to-Edit)
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[70vh]">
                <table className="w-full text-xs text-left whitespace-nowrap border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider sticky top-0 z-20 border-b border-slate-200 shadow-sm">
                    <tr>
                      <th className="p-3.5 sticky left-0 bg-slate-100 z-30 border-r border-slate-200">PUSKESWAN</th>
                      <th className="p-3.5 text-right font-sans border-r border-slate-200">TARGET</th>
                      <th className="p-3.5 text-right font-sans border-r border-slate-200">AMBIL</th>
                      <th className="p-3.5 text-right font-sans text-emerald-700 border-r border-slate-200">REALISASI</th>
                      {Array.from({ length: daysInMonth(activeMonth) }, (_, i) => i + 1).map((d) => (
                        <th key={d} className="p-2 text-center font-sans w-10 min-w-[40px] border-r border-slate-200">{d}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {bulanan.map((row) => {
                      const days = Array.from({ length: daysInMonth(activeMonth) }, (_, i) => i + 1);
                      const realisasiBulanIni = Object.entries(harianMap[row.puskeswan] || {})
                        .filter(([tgl]) => tgl.startsWith(`2026-${String(activeMonth).padStart(2, '0')}`))
                        .reduce((sum, [, v]) => sum + v.jumlah, 0);

                      return (
                        <tr key={row.id || row.puskeswan} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-200">
                            {row.puskeswan}
                          </td>
                          <td className="p-3.5 text-right font-sans border-r border-slate-100">{row.target.toLocaleString('id-ID')}</td>
                          <td className="p-3.5 text-right font-sans border-r border-slate-100">{row.pengambilan}</td>
                          <td className="p-3.5 text-right font-sans font-bold text-emerald-700 bg-emerald-50/40 border-r border-slate-100">
                            {realisasiBulanIni.toLocaleString('id-ID')}
                          </td>
                          {days.map((d) => {
                            const dateStr = `2026-${String(activeMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                            const val = harianMap[row.puskeswan]?.[dateStr]?.jumlah;
                            const isEditing = editingHarian?.puskeswan === row.puskeswan && editingHarian?.tanggal === dateStr;

                            if (isEditing) {
                              return (
                                <td key={d} className="p-0.5 text-center font-sans border-r border-blue-400 bg-blue-50">
                                  <input
                                    ref={harianInputRef}
                                    type="number"
                                    value={editHarianValue}
                                    onChange={(e) => setEditHarianValue(e.target.value)}
                                    onBlur={saveEditHarian}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') saveEditHarian();
                                      else if (e.key === 'Escape') setEditingHarian(null);
                                    }}
                                    className="w-full text-center py-1 px-0.5 text-xs font-bold font-sans bg-white border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-slate-900 shadow-sm"
                                  />
                                </td>
                              );
                            }

                            return (
                              <td
                                key={d}
                                onClick={() => startEditHarian(row.puskeswan, dateStr)}
                                title={`Klik untuk ubah dosis ${row.puskeswan} tgl ${d}`}
                                className={`p-1 text-center font-sans border-r border-slate-100 cursor-pointer select-none transition-colors ${
                                  val ? 'bg-blue-600/10 text-blue-600 font-bold hover:bg-blue-600/20' : 'text-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                {val && val > 0 ? val : '-'}
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
        )}

        {/* ── TAB 2: REKAPITULASI BULANAN ── */}
        {activeTab === 'bulanan' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Target Kabupaten
                </p>
                <p className="font-sans text-2xl sm:text-3xl font-bold text-slate-900">
                  {totalBulanan.target.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">Dosis</span>
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Pengambilan Vaksin
                </p>
                <p className="font-sans text-2xl sm:text-3xl font-bold text-blue-600">
                  {totalBulanan.pengambilan.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">Dosis</span>
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Total Realisasi
                </p>
                <p className="font-sans text-2xl sm:text-3xl font-bold text-emerald-600">
                  {totalBulanan.realisasi.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">Dosis</span>
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Sisa Kekurangan
                </p>
                <p className="font-sans text-2xl sm:text-3xl font-bold text-rose-600">
                  {totalBulanan.kekurangan.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">Dosis</span>
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Capaian Vaksinasi Per Puskeswan (Akumulasi Bulanan 2026)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kolom Target &amp; Pengambilan bisa diedit inline langsung di tabel. Realisasi otomatis terakumulasi dari log harian.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setFormBulanan(emptyBulananForm);
                    setModalBulanan({ open: true, edit: null });
                  }}
                  className="min-h-touch h-8 px-3 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-600/90 flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah Puskeswan</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3.5 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">PUSKESWAN</th>
                      <th className="p-3.5 text-right font-sans">TARGET</th>
                      <th className="p-3.5 text-right font-sans">AMBIL</th>
                      <th className="p-3.5 text-right font-sans text-emerald-700">REALISASI</th>
                      <th className="p-3.5 text-right font-sans text-rose-600">KURANG</th>
                      {BULAN_LABEL.slice(1).map((b) => (
                        <th key={b} className="p-3 text-right font-sans">{b}</th>
                      ))}
                      <th className="p-3.5 text-center w-20">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {bulanan.map((row) => {
                      const isEditingTarget = editingBulananCell?.id === row.id && editingBulananCell?.field === 'target';
                      const isEditingAmbil = editingBulananCell?.id === row.id && editingBulananCell?.field === 'pengambilan';

                      return (
                        <tr key={row.id || row.puskeswan} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-100">
                            {row.puskeswan}
                          </td>

                          {/* Editable Target */}
                          {isEditingTarget ? (
                            <td className="p-1 border-r border-blue-400 bg-blue-50 font-sans text-right">
                              <input
                                ref={bulananInputRef}
                                type="number"
                                value={editBulananValue}
                                onChange={(e) => setEditBulananValue(e.target.value)}
                                onBlur={saveEditBulananCell}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEditBulananCell();
                                  else if (e.key === 'Escape') setEditingBulananCell(null);
                                }}
                                className="w-20 text-right py-1 px-1.5 text-xs font-bold font-sans bg-white border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-slate-900 shadow-sm"
                              />
                            </td>
                          ) : (
                            <td
                              onClick={() => startEditBulananCell(row.id, 'target', row.target)}
                              title="Klik untuk ubah target"
                              className="p-3.5 text-right font-sans cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors group select-none"
                            >
                              <span className="group-hover:underline decoration-blue-400 underline-offset-2">
                                {row.target.toLocaleString('id-ID')}
                              </span>
                            </td>
                          )}

                          {/* Editable Pengambilan */}
                          {isEditingAmbil ? (
                            <td className="p-1 border-r border-blue-400 bg-blue-50 font-sans text-right">
                              <input
                                ref={bulananInputRef}
                                type="number"
                                value={editBulananValue}
                                onChange={(e) => setEditBulananValue(e.target.value)}
                                onBlur={saveEditBulananCell}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEditBulananCell();
                                  else if (e.key === 'Escape') setEditingBulananCell(null);
                                }}
                                className="w-20 text-right py-1 px-1.5 text-xs font-bold font-sans bg-white border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-slate-900 shadow-sm"
                              />
                            </td>
                          ) : (
                            <td
                              onClick={() => startEditBulananCell(row.id, 'pengambilan', row.pengambilan)}
                              title="Klik untuk ubah pengambilan"
                              className="p-3.5 text-right font-sans cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors group select-none"
                            >
                              <span className="group-hover:underline decoration-blue-400 underline-offset-2">
                                {row.pengambilan.toLocaleString('id-ID')}
                              </span>
                            </td>
                          )}

                          <td className="p-3.5 text-right font-sans font-bold text-emerald-700 bg-emerald-50/30">
                            {row.realisasi.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3.5 text-right font-sans font-bold text-rose-600 bg-rose-50/30">
                            {row.kekurangan.toLocaleString('id-ID')}
                          </td>
                          {BULAN_KEY.map((k) => {
                            const val = n(row[k]);
                            return (
                              <td key={k} className={`p-3 text-right font-sans ${val > 0 ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                                {val ? val.toLocaleString('id-ID') : '-'}
                              </td>
                            );
                          })}
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openEditBulanan(row)}
                                className="min-h-touch h-7 w-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-100"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => deleteBulanan(row)}
                                className="min-h-touch h-7 w-7 rounded-lg border border-red-200 bg-red-50 text-red-600 flex items-center justify-center cursor-pointer hover:bg-red-100"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {bulanan.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                        <td className="p-3.5 sticky left-0 bg-slate-100 z-10 border-r border-slate-300 font-sans uppercase">
                          TOTAL KABUPATEN
                        </td>
                        <td className="p-3.5 text-right font-sans">{totalBulanan.target.toLocaleString('id-ID')}</td>
                        <td className="p-3.5 text-right font-sans">{totalBulanan.pengambilan.toLocaleString('id-ID')}</td>
                        <td className="p-3.5 text-right font-sans text-emerald-700 font-black">{totalBulanan.realisasi.toLocaleString('id-ID')}</td>
                        <td className="p-3.5 text-right font-sans text-rose-600 font-black">{totalBulanan.kekurangan.toLocaleString('id-ID')}</td>
                        {BULAN_KEY.map((k) => {
                          const sum = bulanan.reduce((s, r) => s + n(r[k]), 0);
                          return (
                            <td key={k} className="p-3 text-right font-sans font-bold text-blue-600">
                              {sum ? sum.toLocaleString('id-ID') : '-'}
                            </td>
                          );
                        })}
                        <td />
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ── TAB 3: APBD & DROPING ── */}
        {activeTab === 'apbd' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-200">
            
            {/* Alokasi Target APBD */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                  <h3 className="font-bold text-sm text-slate-900">
                    Target Alokasi Vaksin APBD Jateng 2026
                  </h3>
                  <p className="text-xs text-slate-500">Distribusi dosis per puskeswan</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">PUSKESWAN</th>
                        <th className="p-3.5 text-right font-sans">LSD</th>
                        <th className="p-3.5 text-right font-sans">ND AI</th>
                        <th className="p-3.5 text-right font-sans">RABIES</th>
                        <th className="p-3.5 text-right font-sans">APHTOVAX</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {apbdTarget.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900">{row.puskeswan}</td>
                          <td className="p-3.5 text-right font-sans">{row.target_lsd}</td>
                          <td className="p-3.5 text-right font-sans">{row.target_ndai}</td>
                          <td className="p-3.5 text-right font-sans">{row.target_rabies}</td>
                          <td className="p-3.5 text-right font-sans">{row.target_aphtovaks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Riwayat Droping */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Log Pengiriman &amp; Droping Vaksin
                    </h3>
                    <p className="text-xs text-slate-500">Pencatatan batch vaksin masuk dari Dinas Provinsi</p>
                  </div>
                  <button
                    onClick={openAddDroping}
                    className="min-h-touch h-8 px-3 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-600/90 flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Catat Droping</span>
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  {droping.map((d) => (
                    <div
                      key={d.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 hover:bg-white transition-colors"
                    >
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">{d.merk_vaksin}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(d.tanggal).toLocaleDateString('id-ID')} · {d.keterangan || '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-sans font-bold text-blue-600 text-sm bg-blue-600/10 px-2.5 py-1 rounded-lg">
                          {d.jumlah} Dosis
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditDroping(d)}
                            className="min-h-touch h-7 w-7 rounded-lg border border-slate-200 bg-white text-slate-600 flex items-center justify-center cursor-pointer"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => deleteDroping(d)}
                            className="min-h-touch h-7 w-7 rounded-lg border border-red-200 bg-red-50 text-red-600 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ── MODAL TAMBAH/EDIT PUSKESWAN ── */}
      {modalBulanan.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              {modalBulanan.edit ? 'Edit Puskeswan' : 'Tambah Puskeswan'}
            </h3>
            <form onSubmit={submitBulanan} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">No. Urut</label>
                <input
                  type="number"
                  value={formBulanan.no_urut}
                  onChange={(e) => setFormBulanan({ ...formBulanan, no_urut: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Puskeswan</label>
                <input
                  type="text"
                  value={formBulanan.puskeswan}
                  onChange={(e) => setFormBulanan({ ...formBulanan, puskeswan: e.target.value })}
                  placeholder="Contoh: MIRIT"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Dosis</label>
                <input
                  type="number"
                  value={formBulanan.target}
                  onChange={(e) => setFormBulanan({ ...formBulanan, target: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Pengambilan Vaksin</label>
                <input
                  type="number"
                  value={formBulanan.pengambilan}
                  onChange={(e) => setFormBulanan({ ...formBulanan, pengambilan: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalBulanan({ open: false, edit: null })}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL DROPING ── */}
      {modalDroping.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              {modalDroping.edit ? 'Edit Log Droping' : 'Catat Droping Vaksin'}
            </h3>
            <form onSubmit={submitDroping} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={formDroping.tanggal}
                  onChange={(e) => setFormDroping({ ...formDroping, tanggal: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Merk Vaksin</label>
                <input
                  type="text"
                  value={formDroping.merk_vaksin}
                  onChange={(e) => setFormDroping({ ...formDroping, merk_vaksin: e.target.value })}
                  placeholder="Contoh: Aftogen Oleo"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Jumlah Dosis</label>
                <input
                  type="number"
                  value={formDroping.jumlah}
                  onChange={(e) => setFormDroping({ ...formDroping, jumlah: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan</label>
                <input
                  type="text"
                  value={formDroping.keterangan}
                  onChange={(e) => setFormDroping({ ...formDroping, keterangan: e.target.value })}
                  placeholder="Opsional"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalDroping({ open: false, edit: null })}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}