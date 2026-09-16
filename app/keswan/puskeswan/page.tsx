'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { usePageAuth } from '@/hooks/usePageAuth';
import { compressImageFile } from '@/lib/file-compressor';
import {
  ArrowLeft,
  RefreshCw,
  Download,
  Check,
  AlertCircle,
  Plus,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import {
  PuskeswanProfil,
  initialPuskeswanProfiles,
  DEFAULT_JADWAL_HARIAN,
} from '@/lib/puskeswanData';
import {
  DAFTAR_PUSKESWAN,
  DAFTAR_BULAN,
  dataAwal,
  ProfilFormData,
  INITIAL_PROFIL_FORM,
} from '@/components/keswan/puskeswan/types';
import {
  PuskeswanProfilDetailModal,
  PuskeswanLightboxModal,
  PuskeswanProfilFormModal,
} from '@/components/keswan/puskeswan/PuskeswanProfilModals';
import { PuskeswanProfilTab } from '@/components/keswan/puskeswan/PuskeswanProfilTab';
import { PuskeswanRekapTab } from '@/components/keswan/puskeswan/PuskeswanRekapTab';

export default function LaporanPuskeswanPage() {
  const { isReady, canCreate, canEdit } = usePageAuth('keswan', 'puskeswan');

  // Navigasi Dua Menu / Tab (Default Menu 1: Rekapitulasi Kinerja Bulanan)
  const [currentTab, setCurrentTab] = useState<'rekap' | 'profil'>('rekap');

  // State Submenu 1: Profil Puskeswan
  const [profilList, setProfilList] = useState<PuskeswanProfil[]>(initialPuskeswanProfiles);
  const [searchProfil, setSearchProfil] = useState<string>('');
  const [selectedProfil, setSelectedProfil] = useState<PuskeswanProfil | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // Modal Form CRUD Profil
  const [showProfilModal, setShowProfilModal] = useState<boolean>(false);
  const [editingProfilId, setEditingProfilId] = useState<string | null>(null);
  const [profilForm, setProfilForm] = useState<ProfilFormData>(INITIAL_PROFIL_FORM);

  // State Submenu 2: Rekapitulasi Kinerja Bulanan
  const [dataLaporan, setDataLaporan] = useState<any[]>(dataAwal);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Filter & Search State Rekap (Tahun & Bulan)
  const [filterTahun, setFilterTahun] = useState<string>('2026');
  const [filterBulan, setFilterBulan] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal Tambah Periode Baru
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addTahun, setAddTahun] = useState<string>('2026');
  const [addBulan, setAddBulan] = useState<string>('FEBRUARI');

  // State untuk Inline Editing Rekap
  const [editingCell, setEditingCell] = useState<{ bulan: string; puskeswan: string; field: string; tahun?: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  // Muat Profil Puskeswan
  const loadProfilData = async () => {
    try {
      const res = await fetch('/api/profil-puskeswan');
      const result = await res.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        setProfilList(result.data);
      }
    } catch {
      console.warn('Gagal memuat profil puskeswan, menggunakan data default');
    }
  };

  // Muat Data Rekapitulasi dari Database
  const loadDataFromDB = async () => {
    try {
      const res = await fetch('/api/puskeswan');
      const result = await res.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        const withTahun = result.data.map((r: any) => ({
          ...r,
          tahun: r.tahun ? String(r.tahun) : '2026',
        }));
        setDataLaporan(withTahun);
      }
    } catch {
      console.warn('Gagal memuat dari database rekap, menggunakan data default');
    }
  };

  useEffect(() => {
    loadProfilData();
    loadDataFromDB();
  }, []);

  // Auto fokus saat sel tabel rekap diedit
  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  // Handler Upload Foto (Multiple) via Base64 dengan kompresi otomatis < 2 MB
  const handlePhotoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const compressed = await compressImageFile(file, 1600, 0.8, 2 * 1024 * 1024);
        if (compressed) {
          setProfilForm((prev) => ({
            ...prev,
            galeri_foto: [...prev.galeri_foto, compressed],
          }));
        }
      } catch {
        console.error('Gagal mengompres gambar:', file.name);
      }
    }
  };

  const handleAddPhotoUrl = () => {
    if (!profilForm.urlInputFoto.trim()) return;
    setProfilForm((prev) => ({
      ...prev,
      galeri_foto: [...prev.galeri_foto, prev.urlInputFoto.trim()],
      urlInputFoto: '',
    }));
  };

  const handleRemovePhoto = (idx: number) => {
    setProfilForm((prev) => ({
      ...prev,
      galeri_foto: prev.galeri_foto.filter((_, i) => i !== idx),
    }));
  };

  // ── HANDLER CRUD PROFIL PUSKESWAN ──
  const handleOpenAddProfil = () => {
    setEditingProfilId(null);
    setProfilForm({
      nama: '',
      kode: '',
      wilayah_binaan: '',
      alamat: '',
      maps_url: '',
      dokter_hewan: '',
      kontak: '',
      jam_operasional: 'Senin - Jumat: 07.30 - 15.30 WIB (Panggilan Darurat 24 Jam)',
      jadwal_harian: DEFAULT_JADWAL_HARIAN,
      layananText: 'Pemeriksaan & Pengobatan Hewan\nInseminasi Buatan (IB)\nPemeriksaan Kebuntingan (PKB)\nVaksinasi PMK & LSD\nPelayanan Keliling (Pusling)',
      fasilitasText: 'Ruang Tindakan Medis\nCold Storage Vaksin\nKendaraan Lapangan',
      keterangan: '',
      galeri_foto: ['/images/modules/keswan.jpg'],
      urlInputFoto: '',
    });
    setShowProfilModal(true);
  };

  const handleOpenEditProfil = (item: PuskeswanProfil, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProfilId(String(item.id));
    setProfilForm({
      nama: item.nama,
      kode: item.kode,
      wilayah_binaan: item.wilayah_binaan,
      alamat: item.alamat,
      maps_url: item.maps_url || '',
      dokter_hewan: item.dokter_hewan,
      kontak: item.kontak,
      jam_operasional: item.jam_operasional,
      jadwal_harian: item.jadwal_harian && item.jadwal_harian.length > 0 ? item.jadwal_harian : DEFAULT_JADWAL_HARIAN,
      layananText: (item.layanan || []).join('\n'),
      fasilitasText: (item.fasilitas || []).join('\n'),
      keterangan: item.keterangan || '',
      galeri_foto: item.galeri_foto && item.galeri_foto.length > 0 ? item.galeri_foto : (item.foto ? [item.foto] : []),
      urlInputFoto: '',
    });
    setShowProfilModal(true);
  };

  const handleSaveProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profilForm.nama || !profilForm.alamat) {
      return alert('Nama dan Alamat Puskeswan wajib diisi!');
    }

    const payload = {
      id: editingProfilId,
      nama: profilForm.nama,
      kode: profilForm.kode || profilForm.nama.toUpperCase().replace(/[^A-Z0-9]/g, '_'),
      wilayah_binaan: profilForm.wilayah_binaan,
      alamat: profilForm.alamat,
      maps_url: profilForm.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profilForm.nama + ' ' + profilForm.alamat)}`,
      dokter_hewan: profilForm.dokter_hewan,
      kontak: profilForm.kontak,
      jam_operasional: profilForm.jam_operasional,
      jadwal_harian: profilForm.jadwal_harian,
      layanan: profilForm.layananText.split('\n').map((s) => s.trim()).filter(Boolean),
      fasilitas: profilForm.fasilitasText.split('\n').map((s) => s.trim()).filter(Boolean),
      foto: profilForm.galeri_foto[0] || '',
      galeri_foto: profilForm.galeri_foto,
      keterangan: profilForm.keterangan,
    };

    try {
      if (editingProfilId) {
        if (!canEdit) {
          alert('Hanya Administrator yang memiliki hak akses untuk mengubah (edit) profil puskeswan!');
          return;
        }
        // Update
        setProfilList((prev) =>
          prev.map((p) => (String(p.id) === editingProfilId ? { ...p, ...payload, id: editingProfilId } : p))
        );
        if (selectedProfil && String(selectedProfil.id) === editingProfilId) {
          setSelectedProfil({ ...selectedProfil, ...payload, id: editingProfilId });
        }
        await fetch('/api/profil-puskeswan', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        showToast('success', 'Profil Puskeswan berhasil diperbarui!');
      } else {
        if (!canCreate) {
          alert('Anda tidak memiliki hak akses untuk menambah puskeswan baru!');
          return;
        }
        // Create
        const newTempId = String(Date.now());
        const newRecord = { ...payload, id: newTempId };
        setProfilList((prev) => [...prev, newRecord]);
        const res = await fetch('/api/profil-puskeswan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const resJson = await res.json();
        if (resJson.success && resJson.data?.id) {
          setProfilList((prev) =>
            prev.map((p) => (p.id === newTempId ? { ...p, id: String(resJson.data.id) } : p))
          );
        }
        showToast('success', 'Puskeswan baru berhasil ditambahkan!');
      }
      setShowProfilModal(false);
    } catch {
      showToast('error', 'Gagal menyimpan data ke database.');
    }
  };

  const handleDeleteProfil = async (id: string | number, nama: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!canEdit) {
      alert('Hanya Administrator yang memiliki hak akses untuk menghapus profil puskeswan!');
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus data ${nama}?`)) return;


    setProfilList((prev) => prev.filter((p) => String(p.id) !== String(id)));
    if (selectedProfil && String(selectedProfil.id) === String(id)) {
      setSelectedProfil(null);
    }

    try {
      await fetch(`/api/profil-puskeswan?id=${id}`, { method: 'DELETE' });
      showToast('success', `${nama} berhasil dihapus.`);
    } catch {
      showToast('error', 'Gagal menghapus data.');
    }
  };

  // Filter Profil
  const filteredProfilList = useMemo(() => {
    if (!searchProfil) return profilList;
    const q = searchProfil.toLowerCase();
    return profilList.filter(
      (p) =>
        p.nama.toLowerCase().includes(q) ||
        p.wilayah_binaan.toLowerCase().includes(q) ||
        p.alamat.toLowerCase().includes(q) ||
        p.dokter_hewan.toLowerCase().includes(q)
    );
  }, [profilList, searchProfil]);

  // Cek Hari Ini untuk Badge Jadwal
  const todayName = useMemo(() => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[new Date().getDay()];
  }, []);

  // ── HELPER & LOGIKA REKAPITULASI ──
  const sum = (rows: any[], key: string) => rows.reduce((acc, row) => acc + (Number(row[key]) || 0), 0);

  const handleStartEdit = (bulan: string, puskeswan: string, field: string, currentValue: any, tahun: string = '2026') => {
    if (!canEdit) return;
    setEditingCell({ bulan, puskeswan, field, tahun });
    setEditValue(String(currentValue ?? 0));
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;
    const { bulan, puskeswan, field, tahun } = editingCell;
    const numValue = Number(editValue) || 0;

    setDataLaporan((prev) =>
      prev.map((row) => {
        const matchYear = !tahun || (row.tahun || '2026') === tahun;
        if (row.bulan === bulan && row.puskeswan === puskeswan && matchYear) {
          return { ...row, [field]: numValue };
        }
        return row;
      })
    );

    setEditingCell(null);

    try {
      const res = await fetch('/api/puskeswan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bulan, puskeswan, field, value: numValue, tahun: tahun || '2026' }),
      });
      const result = await res.json();
      if (result.success) {
        showToast('success', `${puskeswan} (${bulan} ${tahun || '2026'}): ${field.toUpperCase()} diperbarui`);
      }
    } catch {
      showToast('error', 'Gagal menyimpan perubahan ke database');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveEdit();
    else if (e.key === 'Escape') setEditingCell(null);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync-puskeswan', { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        showToast('success', result.message || 'Sinkronisasi berhasil!');
        loadDataFromDB();
      } else {
        showToast('error', result.message || 'Sinkronisasi gagal!');
      }
    } catch {
      showToast('error', 'Terjadi kesalahan jaringan.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateNewPeriod = () => {
    const existing = dataLaporan.filter(
      (r) => r.bulan === addBulan && (r.tahun || '2026') === addTahun
    );
    if (existing.length > 0) {
      alert(`Lembar kerja untuk ${addBulan} ${addTahun} sudah ada!`);
      return;
    }

    const newRows = DAFTAR_PUSKESWAN.map((pusk, idx) => ({
      id: Date.now() + idx,
      tahun: addTahun,
      bulan: addBulan,
      no: idx + 1,
      no_urut: idx + 1,
      puskeswan: pusk,
      bef: 0,
      cacingan: 0,
      scabies: 0,
      orf: 0,
      pmk_diag: 0,
      lsd_diag: 0,
      aktif: 0,
      semi_aktif: 0,
      pasif: 0,
      pusling: 0,
      ib: 0,
      pkb: 0,
      pmk_vaks: 0,
      lsd_vaks: 0,
      retribusi: 0,
    }));

    setDataLaporan((prev) => [...prev, ...newRows]);
    setFilterTahun(addTahun);
    setFilterBulan(addBulan);
    setShowAddModal(false);
    showToast('success', `Lembar kerja baru ${addBulan} ${addTahun} berhasil dibuat!`);
  };

  const filteredData = useMemo(() => {
    return dataLaporan.filter((item) => {
      const rowTahun = item.tahun ? String(item.tahun) : '2026';
      const matchTahun = !filterTahun || rowTahun === filterTahun;
      const matchBulan = !filterBulan || item.bulan === filterBulan;
      const matchSearch =
        !searchQuery ||
        item.puskeswan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.bulan.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTahun && matchBulan && matchSearch;
    });
  }, [dataLaporan, filterTahun, filterBulan, searchQuery]);

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = Array.from(new Set(dataLaporan.map((r) => (r.tahun ? String(r.tahun) : String(currentYear)))));
    for (let y = currentYear + 1; y >= 2024; y--) {
      if (!years.includes(String(y))) years.push(String(y));
    }
    return years.sort((a, b) => Number(b) - Number(a));
  }, [dataLaporan]);

  const groupedData: Record<string, any[]> = useMemo(() => {
    return filteredData.reduce((acc: Record<string, any[]>, row: any) => {
      const key = `${row.tahun || '2026'} - ${row.bulan}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(row);
      return acc;
    }, {});
  }, [filteredData]);

  const totalRetribusi = sum(filteredData, 'retribusi');
  const totalLayanan = sum(filteredData, 'aktif') + sum(filteredData, 'semi_aktif') + sum(filteredData, 'pasif');

  const handleExportExcel = () => {
    if (!filteredData || filteredData.length === 0) return alert('Belum ada data laporan untuk diekspor!');
    const rows = filteredData.map((row) => ({
      Tahun: row.tahun || '2026',
      Bulan: row.bulan,
      No: row.no_urut || row.no,
      Puskeswan: row.puskeswan,
      'BEF (Demam 3 Hari)': row.bef,
      Cacingan: row.cacingan,
      Scabies: row.scabies,
      ORF: row.orf,
      'PMK (Kasus)': row.pmk_diag,
      'LSD (Kasus)': row.lsd_diag,
      'Pelayanan Aktif': row.aktif,
      'Pelayanan Semi Aktif': row.semi_aktif,
      'Pelayanan Pasif': row.pasif,
      Pusling: row.pusling,
      'Inseminasi Buatan': row.ib,
      'Pemeriksaan Kebuntingan': row.pkb,
      'Vaksinasi PMK': row.pmk_vaks,
      'Vaksinasi LSD': row.lsd_vaks,
      'Retribusi (Rp)': row.retribusi,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan_Puskeswan');
    XLSX.writeFile(wb, `Rekap_Kinerja_Puskeswan_${filterTahun || 'Semua'}_${filterBulan || 'Semua'}_${new Date().toISOString().split('T')[0]}.xlsx`);
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

      {/* ── TOP HEADER (Tema Biru) ── */}
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
                <span className="text-xs font-bold text-blue-700 whitespace-nowrap">Puskeswan</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Pusat Kesehatan Hewan (Puskeswan) Kebumen
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentTab === 'profil' && canCreate && (
              <button
                onClick={handleOpenAddProfil}
                className="min-h-touch min-w-touch h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Tambah Puskeswan</span>
              </button>
            )}

            {currentTab === 'rekap' && (
              <>
                {canCreate && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="min-h-touch min-w-touch h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Periode Baru</span>
                  </button>
                )}


                <button
                  onClick={handleExportExcel}
                  title="Export Excel"
                  aria-label="Export Excel"
                  className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <Download size={16} strokeWidth={2.5} />
                  <span className="hidden sm:inline">Export Excel</span>
                </button>

                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  title="Tarik Data Live Sheets"
                  aria-label="Tarik Data Live Sheets"
                  className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-4 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-800 text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} />
                  <span className="hidden sm:inline">{isSyncing ? 'Sinkronisasi...' : 'Sync Data'}</span>
                </button>
              </>
            )}
          </div>

        </div>
      </header>

      {/* ── SUBMENU / TABS NAVIGASI ── */}
      <div className="bg-white border-b border-slate-200 sticky top-[80px] sm:top-[88px] z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-2.5 overflow-x-auto">
            <button
              onClick={() => setCurrentTab('rekap')}
              className={`min-h-touch px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'rekap'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <FileSpreadsheet size={16} strokeWidth={2.5} />
              <span>1. Rekapitulasi Kinerja Bulanan</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                currentTab === 'rekap' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-800'
              }`}>
                Laporan
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('profil')}
              className={`min-h-touch px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'profil'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Building2 size={16} strokeWidth={2.5} />
              <span>2. Profil Puskeswan Kebumen</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                currentTab === 'profil' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-800'
              }`}>
                {profilList.length} Unit
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {currentTab === 'profil' && (
          <PuskeswanProfilTab
            filteredProfilList={filteredProfilList}
            searchProfil={searchProfil}
            setSearchProfil={setSearchProfil}
            todayName={todayName}
            canEdit={canEdit}
            onSelectProfil={(p) => {
              setSelectedProfil(p);
              setActivePhotoIdx(0);
            }}
            onEditProfil={handleOpenEditProfil}
            onDeleteProfil={handleDeleteProfil}
          />
        )}

        {currentTab === 'rekap' && (
          <PuskeswanRekapTab
            filteredData={filteredData}
            filterTahun={filterTahun}
            setFilterTahun={setFilterTahun}
            filterBulan={filterBulan}
            setFilterBulan={setFilterBulan}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            availableYears={availableYears}
            groupedData={groupedData}
            totalRetribusi={totalRetribusi}
            totalLayanan={totalLayanan}
            canEdit={canEdit}
            editingCell={editingCell}
            editValue={editValue}
            setEditValue={setEditValue}
            inputRef={inputRef}
            onStartEdit={handleStartEdit}
            onSaveEdit={handleSaveEdit}
            onKeyDown={handleKeyDown}
            showAddModal={showAddModal}
            setShowAddModal={setShowAddModal}
            addTahun={addTahun}
            setAddTahun={setAddTahun}
            addBulan={addBulan}
            setAddBulan={setAddBulan}
            onCreateNewPeriod={handleCreateNewPeriod}
          />
        )}
      </main>

      {/* ── MODAL DETAIL PROFIL PUSKESWAN ── */}
      <PuskeswanProfilDetailModal
        selectedProfil={selectedProfil}
        setSelectedProfil={setSelectedProfil}
        activePhotoIdx={activePhotoIdx}
        setActivePhotoIdx={setActivePhotoIdx}
        setLightboxPhoto={setLightboxPhoto}
        canEdit={canEdit}
        todayName={todayName}
        onEditProfil={(p) => {
          setSelectedProfil(null);
          handleOpenEditProfil(p);
        }}
        onDeleteProfil={handleDeleteProfil}
      />

      {/* ── MODAL LIGHTBOX FOTO FULLSCREEN ── */}
      <PuskeswanLightboxModal
        lightboxPhoto={lightboxPhoto}
        setLightboxPhoto={setLightboxPhoto}
      />

      {/* ── MODAL FORM TAMBAH / EDIT PROFIL PUSKESWAN ── */}
      <PuskeswanProfilFormModal
        showProfilModal={showProfilModal}
        setShowProfilModal={setShowProfilModal}
        editingProfilId={editingProfilId}
        profilForm={profilForm}
        setProfilForm={setProfilForm}
        handleSaveProfil={handleSaveProfil}
        handlePhotoFileUpload={handlePhotoFileUpload}
        handleAddPhotoUrl={handleAddPhotoUrl}
        handleRemovePhoto={handleRemovePhoto}
      />
    </div>
  );
}