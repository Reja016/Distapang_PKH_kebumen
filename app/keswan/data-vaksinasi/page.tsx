'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { usePageAuth } from '@/hooks/usePageAuth';
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
  X,
  Sparkles,
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

function daysInMonth(month: number, year = 2027) {
  return new Date(year, month, 0).getDate();
}
const n = (v: any) => Number(v) || 0;

const emptyBulananForm = { no_urut: 0, puskeswan: '', target: 0, pengambilan: 0 };
const emptyDropingForm = { tanggal: '', merk_vaksin: '', jumlah: 0, keterangan: '' };

export default function DataVaksinasiPMKPage() {
  const { isReady, canEdit } = usePageAuth('keswan', 'data-vaksinasi');
  
  // Posisi default: Matriks Input Harian
  const [activeTab, setActiveTab] = useState<'harian' | 'bulanan' | 'apbd'>('harian');
  const [activeMonth, setActiveMonth] = useState<number>(1);

  // State Manajemen Tahun (Default 2027, Dinamis & Persisten)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [daftarTahun, setDaftarTahun] = useState<number[]>([2028, 2027, 2026, 2025]);
  const [showAddYearModal, setShowAddYearModal] = useState<boolean>(false);
  const [inputTahunBaru, setInputTahunBaru] = useState<string>('2028');

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

  // Modal State untuk Tambah Puskeswan, Droping & Tambah Harian Manual
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

  const [modalHarianManual, setModalHarianManual] = useState<boolean>(false);
  const [formHarianManual, setFormHarianManual] = useState<{ puskeswan: string; tanggal: string; jumlah: number }>({
    puskeswan: 'MIRIT',
    tanggal: '2027-01-01',
    jumlah: 0,
  });

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // Muat daftar tahun tersimpan dari localStorage saat pertama kali render
  useEffect(() => {
    try {
      const savedYears = localStorage.getItem('distapang_vaksin_pmk_years');
      if (savedYears) {
        const parsed = JSON.parse(savedYears);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = Array.from(new Set([...parsed, 2028, 2027, 2026, 2025])).sort((a, b) => b - a);
          setDaftarTahun(merged);
        }
      }
    } catch {
      // fallback
    }
  }, []);

  const fetchAll = useCallback(async (tahun = selectedYear) => {
    setLoading(true);
    try {
      const [rB, rH, rD, rT] = await Promise.all([
        fetch(`/api/vaksinasi-pmk/bulanan?tahun=${tahun}`).then((r) => r.json()).catch(() => ({ success: false })),
        fetch(`/api/vaksinasi-pmk/harian?tahun=${tahun}`).then((r) => r.json()).catch(() => ({ success: false })),
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
  }, [selectedYear]);

  useEffect(() => {
    fetchAll(selectedYear);
  }, [fetchAll, selectedYear]);

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

  // ── INLINE EDIT HARIAN (PERSISTEN KE DATABASE) ──
  const startEditHarian = (puskeswan: string, tanggal: string) => {
    if (!canEdit) return;
    const existing = harianMap[puskeswan]?.[tanggal];
    setEditingHarian({ puskeswan, tanggal });
    setEditHarianValue(existing && existing.jumlah > 0 ? String(existing.jumlah) : '');
  };

  const saveEditHarian = async () => {
    if (!editingHarian || !canEdit) return;
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

    // Simpan ke API Database MySQL
    try {
      const res = await fetch('/api/vaksinasi-pmk/harian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ puskeswan, tanggal, jumlah: jumlahVal }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', `${puskeswan} (${tanggal}): ${jumlahVal} dosis tersimpan di database.`);
      }
    } catch {
      showToast('success', 'Perubahan dosis harian dicatat.');
    }
  };

  // ── INLINE EDIT BULANAN (TARGET & PENGAMBILAN) ──
  const startEditBulananCell = (id: number, field: 'target' | 'pengambilan', currentVal: number) => {
    if (!canEdit) return;
    setEditingBulananCell({ id, field });
    setEditBulananValue(String(currentVal || 0));
  };

  const saveEditBulananCell = async () => {
    if (!editingBulananCell) return;
    const { id, field } = editingBulananCell;
    const numVal = Number(editBulananValue) || 0;

    setBulanan((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updated = { ...b, [field]: numVal };
          if (field === 'target') {
            updated.kekurangan = Math.max(0, numVal - n(updated.realisasi));
          }
          return updated;
        }
        return b;
      })
    );

    setEditingBulananCell(null);

    try {
      const row = bulanan.find((b) => b.id === id);
      if (row) {
        const payload = {
          id: row.id,
          no_urut: row.no_urut,
          puskeswan: row.puskeswan,
          target: field === 'target' ? numVal : row.target,
          pengambilan: field === 'pengambilan' ? numVal : row.pengambilan,
        };
        await fetch(`/api/vaksinasi-pmk/bulanan/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        showToast('success', `${field === 'target' ? 'Target' : 'Pengambilan'} ${row.puskeswan} diperbarui.`);
      }
    } catch {
      showToast('error', 'Gagal menyimpan ke database.');
    }
  };

  // ── MODAL PUSKESWAN (BULANAN) ──
  const openAddBulanan = () => {
    setFormBulanan({ no_urut: bulanan.length + 1, puskeswan: '', target: 0, pengambilan: 0 });
    setModalBulanan({ open: true, edit: null });
  };
  const openEditBulanan = (item: Bulanan) => {
    setFormBulanan({ no_urut: item.no_urut, puskeswan: item.puskeswan, target: item.target, pengambilan: item.pengambilan });
    setModalBulanan({ open: true, edit: item });
  };
  const submitBulanan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBulanan.puskeswan.trim()) {
      showToast('error', 'Nama Puskeswan wajib diisi.');
      return;
    }
    const isEdit = !!modalBulanan.edit;
    const url = isEdit ? `/api/vaksinasi-pmk/bulanan/${modalBulanan.edit!.id}` : '/api/vaksinasi-pmk/bulanan';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formBulanan),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', isEdit ? 'Puskeswan diperbarui.' : 'Puskeswan ditambahkan.');
        setModalBulanan({ open: false, edit: null });
        fetchAll(selectedYear);
      } else {
        showToast('error', json.error || 'Gagal menyimpan.');
      }
    } catch {
      showToast('error', 'Terjadi kesalahan jaringan.');
    }
  };
  const deleteBulanan = async (item: Bulanan) => {
    if (!confirm(`Hapus puskeswan "${item.puskeswan}"? Data harian terkait tidak akan terhapus.`)) return;
    try {
      const res = await fetch(`/api/vaksinasi-pmk/bulanan/${item.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Puskeswan dihapus.');
        fetchAll(selectedYear);
      } else {
        showToast('error', json.error || 'Gagal menghapus.');
      }
    } catch {
      showToast('error', 'Terjadi kesalahan jaringan.');
    }
  };

  // ── MODAL DROPING ──
  const openAddDroping = () => {
    setFormDroping({ tanggal: new Date().toISOString().slice(0, 10), merk_vaksin: '', jumlah: 0, keterangan: '' });
    setModalDroping({ open: true, edit: null });
  };
  const openEditDroping = (item: Droping) => {
    setFormDroping({
      tanggal: item.tanggal ? item.tanggal.slice(0, 10) : '',
      merk_vaksin: item.merk_vaksin,
      jumlah: item.jumlah,
      keterangan: item.keterangan || '',
    });
    setModalDroping({ open: true, edit: item });
  };
  const submitDroping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDroping.tanggal || !formDroping.merk_vaksin.trim() || formDroping.jumlah <= 0) {
      showToast('error', 'Lengkapi tanggal, merk vaksin, dan jumlah.');
      return;
    }
    const isEdit = !!modalDroping.edit;
    const url = isEdit ? `/api/vaksinasi-pmk/apbd-droping/${modalDroping.edit!.id}` : '/api/vaksinasi-pmk/apbd-droping';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formDroping),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', isEdit ? 'Droping diperbarui.' : 'Droping dicatat.');
        setModalDroping({ open: false, edit: null });
        fetchAll(selectedYear);
      } else {
        showToast('error', json.error || 'Gagal menyimpan.');
      }
    } catch {
      showToast('error', 'Terjadi kesalahan jaringan.');
    }
  };
  const deleteDroping = async (item: Droping) => {
    if (!confirm(`Hapus catatan droping tanggal ${item.tanggal}?`)) return;
    try {
      const res = await fetch(`/api/vaksinasi-pmk/apbd-droping/${item.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('success', 'Droping dihapus.');
        fetchAll(selectedYear);
      } else {
        showToast('error', json.error || 'Gagal menghapus.');
      }
    } catch {
      showToast('error', 'Terjadi kesalahan jaringan.');
    }
  };

  // ── SUBMIT HARIAN MANUAL DARI MODAL ──
  const submitHarianManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formHarianManual.puskeswan || !formHarianManual.tanggal) {
      showToast('error', 'Puskeswan dan tanggal wajib diisi.');
      return;
    }
    try {
      const res = await fetch('/api/vaksinasi-pmk/harian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formHarianManual),
      });
      const json = await res.json();
      if (json.success) {
        showToast('success', `Data harian ${formHarianManual.puskeswan} berhasil disimpan ke database.`);
        setModalHarianManual(false);
        fetchAll(selectedYear);
      } else {
        showToast('error', json.error || 'Gagal menyimpan.');
      }
    } catch {
      showToast('error', 'Gagal terhubung ke server.');
    }
  };

  // ── EXPORT EXCEL SESUAI TAHUN TERPILIH ──
  const handleExportExcel = () => {
    try {
      const wsBulananData = bulanan.map((b) => ({
        'No Urut': b.no_urut,
        Puskeswan: b.puskeswan,
        Target: b.target,
        Pengambilan: b.pengambilan,
        Realisasi: b.realisasi,
        Kekurangan: b.kekurangan,
        Januari: b.jan,
        Februari: b.feb,
        Maret: b.mar,
        April: b.apr,
        Mei: b.mei,
        Juni: b.jun,
        Juli: b.jul,
        Agustus: b.agu,
        September: b.sep,
        Oktober: b.okt,
        November: b.nov,
        Desember: b.des,
      }));
      const wsBulanan = XLSX.utils.json_to_sheet(wsBulananData);

      const wsHarianData = harian.map((h) => ({
        Puskeswan: h.puskeswan,
        Tanggal: h.tanggal.slice(0, 10),
        'Jumlah Dosis': h.jumlah,
      }));
      const wsHarian = XLSX.utils.json_to_sheet(wsHarianData);

      const wsDropingData = droping.map((d) => ({
        Tanggal: d.tanggal ? d.tanggal.slice(0, 10) : '',
        'Merk Vaksin': d.merk_vaksin,
        Jumlah: d.jumlah,
        Keterangan: d.keterangan || '-',
      }));
      const wsDroping = XLSX.utils.json_to_sheet(wsDropingData);

      const wsApbdData = apbdTarget.map((a) => ({
        'No Urut': a.no_urut,
        Puskeswan: a.puskeswan,
        'Target LSD': a.target_lsd,
        'Target ND-AI': a.target_ndai,
        'Target Rabies': a.target_rabies,
        'Target Aphtovaks': a.target_aphtovaks,
        'Pengambilan ND-AI': a.pengambilan_ndai || '-',
        'Pengambilan Aphtovaks': a.pengambilan_aphtovaks || '-',
        Catatan: a.catatan || '-',
      }));
      const wsApbd = XLSX.utils.json_to_sheet(wsApbdData);

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsBulanan, `Rekap_Bulanan_${selectedYear}`);
      XLSX.utils.book_append_sheet(wb, wsHarian, `Data_Harian_${selectedYear}`);
      XLSX.utils.book_append_sheet(wb, wsDroping, 'Log_Droping');
      XLSX.utils.book_append_sheet(wb, wsApbd, 'Alokasi_APBD');

      XLSX.writeFile(wb, `Data_Vaksinasi_PMK_${selectedYear}_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast('success', `Export Excel Vaksinasi PMK Tahun ${selectedYear} berhasil diunduh.`);
    } catch {
      showToast('error', 'Gagal melakukan export excel.');
    }
  };

  if (!isReady) return null;

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
              onClick={() => fetchAll(selectedYear)}
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        
        {/* Banner Info Inline Edit */}
        <div className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 text-xs sm:text-sm">
          <Info size={18} className="text-blue-600 shrink-0" />
          <p>
            <strong>Mode Click-to-Edit Aktif:</strong> Klik langsung pada kotak tanggal harian atau angka target/pengambilan untuk mengubah dosis. Tekan <kbd className="px-1.5 py-0.5 bg-white border border-blue-300 rounded font-mono text-xs font-bold text-blue-700">Enter</kbd> atau klik di luar sel untuk menyimpan otomatis ke database.
          </p>
        </div>

        {/* Navigation Tabs (Matriks Input Harian di Tab Utama) */}
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

              {canEdit && (
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

            {/* Matrix Table with Click-to-Edit (Mobile Friendly & Border Kontras) */}
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
                                    ref={harianInputRef}
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
        )}

        {/* ── TAB 2: REKAPITULASI BULANAN ── */}
        {activeTab === 'bulanan' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Capaian Vaksinasi Per Puskeswan (Akumulasi Bulanan {selectedYear})
                </h3>
                <p className="text-xs text-slate-600 font-semibold">
                  Target dan realisasi droping vaksin per puskeswan tahun {selectedYear} &bull; Klik kotak Target / Ambil untuk edit langsung
                </p>
              </div>
              {canEdit && (
                <button
                  onClick={openAddBulanan}
                  className="min-h-touch h-10 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Tambah Puskeswan</span>
                </button>
              )}
            </div>

            <div className="border-2 border-slate-700 bg-white shadow-md rounded-xl overflow-hidden -mx-4 sm:mx-0">
              <div className="overflow-x-auto touch-pan-x">
                <table className="w-full text-xs text-left whitespace-nowrap border-collapse">
                  <thead className="bg-slate-200 text-slate-900 font-extrabold uppercase tracking-wider border-b-2 border-slate-700">
                    <tr>
                      <th className="p-3 text-center w-12 sticky left-0 bg-slate-300 z-10 border-r-2 border-slate-500 font-black">NO</th>
                      <th className="p-3 sticky left-12 bg-slate-300 z-10 border-r-2 border-slate-700 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.15)] font-black">PUSKESWAN</th>
                      <th className="p-3 text-right font-sans border-r-2 border-slate-500 min-w-[100px] font-black">TARGET</th>
                      <th className="p-3 text-right font-sans border-r-2 border-slate-500 min-w-[100px] font-black">AMBIL</th>
                      <th className="p-3 text-right font-sans text-emerald-950 bg-emerald-100 font-black border-r-2 border-slate-500">REALISASI</th>
                      <th className="p-3 text-right font-sans text-rose-950 bg-rose-100 font-black border-r-2 border-slate-500">KURANG</th>
                      {BULAN_LABEL.slice(1).map((m) => (
                        <th key={m} className="p-3 text-right font-sans border-r-2 border-slate-500 font-black">{m}</th>
                      ))}
                      {canEdit && <th className="p-3 text-center w-20 font-black">AKSI</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-400 text-slate-900 font-medium">
                    {bulanan.map((row) => {
                      const isEditingTarget = editingBulananCell?.id === row.id && editingBulananCell?.field === 'target';
                      const isEditingAmbil = editingBulananCell?.id === row.id && editingBulananCell?.field === 'pengambilan';

                      return (
                        <tr key={row.id} className="hover:bg-blue-50/50 transition-colors border-b-2 border-slate-400">
                          <td className="p-3 text-center font-black text-slate-700 sticky left-0 bg-slate-100 z-10 border-r-2 border-slate-500">
                            {row.no_urut}
                          </td>
                          <td className="p-3 font-black text-slate-950 sticky left-12 bg-white z-10 border-r-2 border-slate-700 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.12)]">
                            {row.puskeswan}
                          </td>

                          {/* Editable Target dengan Kotak Input Tebal & Jelas */}
                          <td
                            onClick={() => startEditBulananCell(row.id, 'target', row.target)}
                            className="p-2 text-right font-sans border-r-2 border-slate-400 cursor-pointer"
                          >
                            {isEditingTarget ? (
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
                                className="w-24 text-right py-1 px-2 text-xs font-black border-2 border-blue-600 ring-2 ring-blue-300 rounded-md bg-white text-blue-900"
                              />
                            ) : (
                              <div className="py-1 px-2 rounded-md border-2 border-blue-500 bg-blue-50 font-black text-blue-950 hover:border-blue-700 hover:bg-blue-100 transition-all shadow-xs">
                                {row.target.toLocaleString('id-ID')}
                              </div>
                            )}
                          </td>

                          {/* Editable Pengambilan dengan Kotak Input Tebal & Jelas */}
                          <td
                            onClick={() => startEditBulananCell(row.id, 'pengambilan', row.pengambilan)}
                            className="p-2 text-right font-sans border-r-2 border-slate-400 cursor-pointer"
                          >
                            {isEditingAmbil ? (
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
                                className="w-24 text-right py-1 px-2 text-xs font-black border-2 border-blue-600 ring-2 ring-blue-300 rounded-md bg-white text-blue-900"
                              />
                            ) : (
                              <div className="py-1 px-2 rounded-md border-2 border-blue-500 bg-blue-50 font-black text-blue-950 hover:border-blue-700 hover:bg-blue-100 transition-all shadow-xs">
                                {row.pengambilan.toLocaleString('id-ID')}
                              </div>
                            )}
                          </td>

                          <td className="p-3 text-right font-sans font-black text-emerald-950 bg-emerald-100/70 border-r-2 border-slate-400">
                            {row.realisasi.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3 text-right font-sans font-black text-rose-950 bg-rose-100/70 border-r-2 border-slate-400">
                            {row.kekurangan.toLocaleString('id-ID')}
                          </td>
                          {BULAN_KEY.map((k) => (
                            <td key={k} className="p-3 text-right font-sans border-r-2 border-slate-400 font-bold">
                              {n(row[k]) > 0 ? n(row[k]).toLocaleString('id-ID') : '-'}
                            </td>
                          ))}
                          {canEdit && (
                            <td className="p-3 text-center border-l-2 border-slate-400">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => openEditBulanan(row)}
                                  className="h-7 w-7 border border-slate-300 bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center cursor-pointer"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => deleteBulanan(row)}
                                  className="h-7 w-7 border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 flex items-center justify-center cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}

                    {/* Total Row */}
                    <tr className="bg-slate-200 font-black text-slate-900 border-t-2 border-slate-400">
                      <td colSpan={2} className="p-3 text-center sticky left-0 bg-slate-200 z-10 border-r-2 border-slate-400">
                        JUMLAH TOTAL
                      </td>
                      <td className="p-3 text-right font-sans border-r border-slate-300">{totalBulanan.target.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-sans border-r border-slate-300">{totalBulanan.pengambilan.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-sans text-emerald-900 border-r border-slate-300">{totalBulanan.realisasi.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-sans text-rose-800 border-r border-slate-300">{totalBulanan.kekurangan.toLocaleString('id-ID')}</td>
                      {BULAN_KEY.map((k) => {
                        const sumM = bulanan.reduce((sum, r) => sum + n(r[k]), 0);
                        return (
                          <td key={k} className="p-3 text-right font-sans border-r border-slate-300">
                            {sumM > 0 ? sumM.toLocaleString('id-ID') : '-'}
                          </td>
                        );
                      })}
                      {canEdit && <td />}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: ALOKASI APBD & LOG DROPING ── */}
        {activeTab === 'apbd' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Target APBD Jateng */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Target Alokasi Vaksin APBD Jateng {selectedYear}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Daftar alokasi vaksin LSD, ND-AI, Rabies, dan Aphtovaks per puskeswan
                  </p>
                </div>
              </div>

              <div className="border-2 border-slate-700 bg-white shadow-md rounded-xl overflow-hidden -mx-4 sm:mx-0">
                <div className="overflow-x-auto touch-pan-x">
                  <table className="w-full text-xs text-left whitespace-nowrap border-collapse">
                    <thead className="bg-slate-200 text-slate-950 font-black uppercase tracking-wider border-b-2 border-slate-700">
                      <tr>
                        <th className="p-3 text-center w-12 border-r-2 border-slate-500">NO</th>
                        <th className="p-3 border-r-2 border-slate-500">PUSKESWAN</th>
                        <th className="p-3 text-right font-sans border-r-2 border-slate-500">TARGET LSD</th>
                        <th className="p-3 text-right font-sans border-r-2 border-slate-500">TARGET ND-AI</th>
                        <th className="p-3 text-right font-sans border-r-2 border-slate-500">TARGET RABIES</th>
                        <th className="p-3 text-right font-sans border-r-2 border-slate-500">TARGET APHTOVAKS</th>
                        <th className="p-3 border-r-2 border-slate-500">AMBIL ND-AI</th>
                        <th className="p-3 border-r-2 border-slate-500">AMBIL APHTOVAKS</th>
                        <th className="p-3">CATATAN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-400 text-slate-900 font-medium">
                      {apbdTarget.map((row) => (
                        <tr key={row.id} className="hover:bg-blue-50/50 transition-colors border-b-2 border-slate-400">
                          <td className="p-3 text-center font-black text-slate-700 border-r-2 border-slate-400 bg-slate-100">{row.no_urut}</td>
                          <td className="p-3 font-black text-slate-950 border-r-2 border-slate-400">{row.puskeswan}</td>
                          <td className="p-3 text-right font-sans font-bold border-r-2 border-slate-400">{row.target_lsd.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-sans font-bold border-r-2 border-slate-400">{row.target_ndai.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-sans font-bold border-r-2 border-slate-400">{row.target_rabies.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-sans font-bold border-r-2 border-slate-400">{row.target_aphtovaks.toLocaleString('id-ID')}</td>
                          <td className="p-3 font-sans font-bold border-r-2 border-slate-400">{row.pengambilan_ndai || '-'}</td>
                          <td className="p-3 font-sans font-bold border-r-2 border-slate-400">{row.pengambilan_aphtovaks || '-'}</td>
                          <td className="p-3 text-slate-700 font-semibold">{row.catatan || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Log Droping Vaksin */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Log Penerimaan / Droping Vaksin</h3>
                  <p className="text-xs text-slate-500">Riwayat penerimaan suplai vaksin dari dinas/provinsi</p>
                </div>
                {canEdit && (
                  <button
                    onClick={openAddDroping}
                    className="min-h-touch h-10 px-4 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Catat Droping</span>
                  </button>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {droping.map((d) => (
                    <div key={d.id} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{d.merk_vaksin}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(d.tanggal).toLocaleDateString('id-ID')} · {d.keterangan || '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-sans font-bold text-blue-600 text-sm bg-blue-600/10 px-2.5 py-1 rounded-lg">
                          {d.jumlah} Dosis
                        </span>
                        {canEdit && (
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
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ── MODAL TAMBAH TAHUN BARU ── */}
      {showAddYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowAddYearModal(false)}
              className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 absolute top-4 right-4 flex items-center justify-center transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="mb-5 text-left">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mb-3">
                <Calendar size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Tambah Tahun Laporan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Buka &amp; kelola matriks harian untuk tahun baru
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const yr = parseInt(inputTahunBaru, 10);
                if (!yr || isNaN(yr) || yr < 2000 || yr > 2100) {
                  alert('Masukkan 4 digit tahun yang valid (2000 - 2100)!');
                  return;
                }
                const updated = Array.from(new Set([...daftarTahun, yr])).sort((a, b) => b - a);
                setDaftarTahun(updated);
                try {
                  localStorage.setItem('distapang_vaksin_pmk_years', JSON.stringify(updated));
                } catch {}
                setSelectedYear(yr);
                setShowAddYearModal(false);
                fetchAll(yr);
                showToast('success', `Tahun laporan ${yr} berhasil ditambahkan dan diaktifkan!`);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tahun Laporan Baru (Contoh: 2028, 2029)
                </label>
                <input
                  type="number"
                  min="2000"
                  max="2100"
                  required
                  value={inputTahunBaru}
                  onChange={(e) => setInputTahunBaru(e.target.value)}
                  placeholder="Contoh: 2028"
                  className="w-full min-h-touch h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddYearModal(false)}
                  className="flex-1 min-h-touch h-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-touch h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                >
                  Simpan Tahun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL TAMBAH HARIAN MANUAL ── */}
      {modalHarianManual && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                + Tambah Log Dosis Harian
              </h3>
              <button
                onClick={() => setModalHarianManual(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitHarianManual} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Puskeswan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formHarianManual.puskeswan}
                  onChange={(e) => setFormHarianManual({ ...formHarianManual, puskeswan: e.target.value })}
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:border-blue-600 outline-none"
                >
                  {bulanan.map((b) => (
                    <option key={b.id || b.puskeswan} value={b.puskeswan}>
                      {b.puskeswan}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Pelaksanaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formHarianManual.tanggal}
                  onChange={(e) => setFormHarianManual({ ...formHarianManual, tanggal: e.target.value })}
                  className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:border-blue-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jumlah Dosis Vaksin <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formHarianManual.jumlah}
                  onChange={(e) => setFormHarianManual({ ...formHarianManual, jumlah: Number(e.target.value) })}
                  className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:border-blue-600 outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalHarianManual(false)}
                  className="min-h-touch h-10 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-touch h-10 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
                >
                  Simpan Dosis Harian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL TAMBAH/EDIT PUSKESWAN ── */}
      {modalBulanan.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              {modalBulanan.edit ? 'Edit Puskeswan' : 'Tambah Puskeswan'}
            </h3>
            <form onSubmit={submitBulanan} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">No. Urut</label>
                <input
                  type="number"
                  value={formBulanan.no_urut}
                  onChange={(e) => setFormBulanan({ ...formBulanan, no_urut: Number(e.target.value) })}
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Puskeswan</label>
                <input
                  type="text"
                  value={formBulanan.puskeswan}
                  onChange={(e) => setFormBulanan({ ...formBulanan, puskeswan: e.target.value })}
                  placeholder="Contoh: MIRIT"
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 uppercase font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Target Dosis</label>
                <input
                  type="number"
                  value={formBulanan.target}
                  onChange={(e) => setFormBulanan({ ...formBulanan, target: Number(e.target.value) })}
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-bold font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Pengambilan Vaksin</label>
                <input
                  type="number"
                  value={formBulanan.pengambilan}
                  onChange={(e) => setFormBulanan({ ...formBulanan, pengambilan: Number(e.target.value) })}
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-bold font-mono"
                />
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalBulanan({ open: false, edit: null })}
                  className="flex-1 min-h-touch h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-touch h-10 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              {modalDroping.edit ? 'Edit Log Droping' : 'Catat Droping Vaksin'}
            </h3>
            <form onSubmit={submitDroping} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={formDroping.tanggal}
                  onChange={(e) => setFormDroping({ ...formDroping, tanggal: e.target.value })}
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Merk Vaksin</label>
                <input
                  type="text"
                  value={formDroping.merk_vaksin}
                  onChange={(e) => setFormDroping({ ...formDroping, merk_vaksin: e.target.value })}
                  placeholder="Contoh: Aftogen Oleo"
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Jumlah Dosis</label>
                <input
                  type="number"
                  value={formDroping.jumlah}
                  onChange={(e) => setFormDroping({ ...formDroping, jumlah: Number(e.target.value) })}
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-bold font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Keterangan</label>
                <input
                  type="text"
                  value={formDroping.keterangan}
                  onChange={(e) => setFormDroping({ ...formDroping, keterangan: e.target.value })}
                  placeholder="Opsional"
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs"
                />
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalDroping({ open: false, edit: null })}
                  className="flex-1 min-h-touch h-10 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-touch h-10 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer shadow-xs"
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