'use client';

import { useState, useEffect, useRef, useMemo, Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import * as XLSX from 'xlsx';
import { usePageAuth } from '@/hooks/usePageAuth';
import {
  ArrowLeft,
  RefreshCw,
  Download,
  Check,
  AlertCircle,
  Info,
  Plus,
  Search,
  Filter,
  Calendar,
  Building2,
  MapPin,
  Phone,
  Clock,
  User,
  Stethoscope,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  Layers,
  ChevronRight,
  ShieldCheck,
  Camera,
  Image as ImageIcon,
  Upload,
  ChevronDown,
  ChevronUp,
  Maximize2,
  FileSpreadsheet,
} from 'lucide-react';
import {
  PuskeswanProfil,
  JadwalHari,
  initialPuskeswanProfiles,
  DEFAULT_JADWAL_HARIAN,
} from '@/lib/puskeswanData';

const DAFTAR_PUSKESWAN = [
  'MIRIT',
  'KLIRONG',
  'GOMBONG',
  'BUAYAN',
  'ALIAN',
  'PREMBUN',
  'KEBUMEN',
  'KARANGANYAR',
];

const DAFTAR_BULAN = [
  'JANUARI',
  'FEBRUARI',
  'MARET',
  'APRIL',
  'MEI',
  'JUNI',
  'JULI',
  'AGUSTUS',
  'SEPTEMBER',
  'OKTOBER',
  'NOVEMBER',
  'DESEMBER',
];

const dataAwal = [
  { id: 1, tahun: '2026', bulan: 'JANUARI', no: 1, puskeswan: 'MIRIT', bef: 2, cacingan: 70, scabies: 0, orf: 0, pmk_diag: 0, lsd_diag: 5, aktif: 127, semi_aktif: 5, pasif: 0, pusling: 127, ib: 160, pkb: 12, pmk_vaks: 0, lsd_vaks: 0, retribusi: 1750000 },
  { id: 2, tahun: '2026', bulan: 'JANUARI', no: 2, puskeswan: 'KLIRONG', bef: 10, cacingan: 60, scabies: 7, orf: 0, pmk_diag: 5, lsd_diag: 3, aktif: 125, semi_aktif: 6, pasif: 4, pusling: 125, ib: 94, pkb: 25, pmk_vaks: 25, lsd_vaks: 0, retribusi: 2500000 },
  { id: 3, tahun: '2026', bulan: 'JANUARI', no: 3, puskeswan: 'GOMBONG', bef: 0, cacingan: 16, scabies: 5, orf: 0, pmk_diag: 3, lsd_diag: 0, aktif: 140, semi_aktif: 43, pasif: 22, pusling: 30, ib: 196, pkb: 31, pmk_vaks: 75, lsd_vaks: 0, retribusi: 3970000 },
  { id: 4, tahun: '2026', bulan: 'JANUARI', no: 4, puskeswan: 'BUAYAN', bef: 5, cacingan: 16, scabies: 2, orf: 0, pmk_diag: 0, lsd_diag: 0, aktif: 51, semi_aktif: 3, pasif: 0, pusling: 51, ib: 198, pkb: 23, pmk_vaks: 51, lsd_vaks: 0, retribusi: 670000 },
  { id: 5, tahun: '2026', bulan: 'JANUARI', no: 5, puskeswan: 'ALIAN', bef: 1, cacingan: 25, scabies: 5, orf: 0, pmk_diag: 1, lsd_diag: 4, aktif: 48, semi_aktif: 5, pasif: 7, pusling: 64, ib: 15, pkb: 2, pmk_vaks: 0, lsd_vaks: 0, retribusi: 0 },
  { id: 6, tahun: '2026', bulan: 'JANUARI', no: 6, puskeswan: 'PREMBUN', bef: 3, cacingan: 70, scabies: 2, orf: 0, pmk_diag: 0, lsd_diag: 3, aktif: 70, semi_aktif: 18, pasif: 4, pusling: 70, ib: 0, pkb: 0, pmk_vaks: 0, lsd_vaks: 0, retribusi: 1360000 },
  { id: 7, tahun: '2026', bulan: 'JANUARI', no: 7, puskeswan: 'KEBUMEN', bef: 10, cacingan: 77, scabies: 2, orf: 0, pmk_diag: 0, lsd_diag: 10, aktif: 77, semi_aktif: 20, pasif: 3, pusling: 51, ib: 47, pkb: 47, pmk_vaks: 71, lsd_vaks: 60, retribusi: 1600000 },
  { id: 8, tahun: '2026', bulan: 'JANUARI', no: 8, puskeswan: 'KARANGANYAR', bef: 8, cacingan: 16, scabies: 9, orf: 7, pmk_diag: 4, lsd_diag: 2, aktif: 38, semi_aktif: 5, pasif: 0, pusling: 38, ib: 72, pkb: 26, pmk_vaks: 30, lsd_vaks: 0, retribusi: 565000 },
];

export default function LaporanPuskeswanPage() {
  const { isReady, canEdit } = usePageAuth('keswan', 'puskeswan');

  // Navigasi Dua Menu / Tab
  const [currentTab, setCurrentTab] = useState<'profil' | 'rekap'>('profil');

  // State Submenu 1: Profil Puskeswan
  const [profilList, setProfilList] = useState<PuskeswanProfil[]>(initialPuskeswanProfiles);
  const [searchProfil, setSearchProfil] = useState<string>('');
  const [selectedProfil, setSelectedProfil] = useState<PuskeswanProfil | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);

  // Modal Form CRUD Profil
  const [showProfilModal, setShowProfilModal] = useState<boolean>(false);
  const [editingProfilId, setEditingProfilId] = useState<string | null>(null);
  const [profilForm, setProfilForm] = useState<{
    nama: string;
    kode: string;
    wilayah_binaan: string;
    alamat: string;
    maps_url: string;
    dokter_hewan: string;
    kontak: string;
    jam_operasional: string;
    jadwal_harian: JadwalHari[];
    layananText: string;
    fasilitasText: string;
    keterangan: string;
    galeri_foto: string[];
    urlInputFoto: string;
  }>({
    nama: '',
    kode: '',
    wilayah_binaan: '',
    alamat: '',
    maps_url: '',
    dokter_hewan: '',
    kontak: '',
    jam_operasional: 'Senin - Jumat: 07.30 - 15.30 WIB (Panggilan Darurat 24 Jam)',
    jadwal_harian: DEFAULT_JADWAL_HARIAN,
    layananText: '',
    fasilitasText: '',
    keterangan: '',
    galeri_foto: [],
    urlInputFoto: '',
  });

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

  // Handler Upload Foto (Multiple) via Base64
  const handlePhotoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const base64 = loadEvt.target?.result as string;
        if (base64) {
          setProfilForm((prev) => ({
            ...prev,
            galeri_foto: [...prev.galeri_foto, base64],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
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
  const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(Number(val) || 0);

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
    const years = Array.from(new Set(dataLaporan.map((r) => (r.tahun ? String(r.tahun) : '2026'))));
    if (!years.includes('2026')) years.push('2026');
    if (!years.includes('2025')) years.push('2025');
    if (!years.includes('2027')) years.push('2027');
    return years.sort();
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
            onBlur={handleSaveEdit}
            onKeyDown={handleKeyDown}
            className="w-full text-center py-1 px-1.5 text-xs font-bold font-sans bg-white border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-900 shadow-sm"
          />
        </td>
      );
    }

    return (
      <td
        onClick={() => handleStartEdit(row.bulan, row.puskeswan, field, value, rowYear)}
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
            {currentTab === 'profil' && canEdit && (
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
                {canEdit && (
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
              onClick={() => setCurrentTab('profil')}
              className={`min-h-touch px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'profil'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Building2 size={16} strokeWidth={2.5} />
              <span>1. Profil Puskeswan Kebumen</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                currentTab === 'profil' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-800'
              }`}>
                {profilList.length} Unit
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('rekap')}
              className={`min-h-touch px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                currentTab === 'rekap'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <FileSpreadsheet size={16} strokeWidth={2.5} />
              <span>2. Rekapitulasi Kinerja Bulanan</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                currentTab === 'rekap' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-800'
              }`}>
                Laporan
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ═══════════════════════════════════════════════════════════════
            SUBMENU 1: PROFIL PUSKESWAN (DESAIN KARTU DENGAN FOTO & MAPS)
        ═══════════════════════════════════════════════════════════════ */}
        {currentTab === 'profil' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            
            {/* Header & Search Bar */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">
                    Jaringan Layanan Veteriner &amp; Foto Lokasi
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Puskeswan Se-Kabupaten Kebumen
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Klik kartu Puskeswan untuk melihat foto lokasi, daftar jam operasional harian, rute Google Maps, dan dokter penanggung jawab.
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari puskeswan, dokter, kecamatan..."
                  value={searchProfil}
                  onChange={(e) => setSearchProfil(e.target.value)}
                  className="w-full min-h-touch h-11 pl-10 pr-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 transition-colors shadow-2xs"
                />
              </div>
            </div>

            {/* Grid Kartu Modul Puskeswan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredProfilList.map((p) => {
                const fotoUtama = (p.galeri_foto && p.galeri_foto.length > 0 ? p.galeri_foto[0] : p.foto) || '/images/modules/keswan.jpg';
                const totalFoto = (p.galeri_foto?.length || (p.foto ? 1 : 0)) || 1;
                const jadwalHariIni = p.jadwal_harian?.find((j) => j.hari.toLowerCase() === todayName.toLowerCase());

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProfil(p);
                      setActivePhotoIdx(0);
                    }}
                    className="group relative bg-white border border-slate-200/90 rounded-3xl overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-blue-300 transition-all duration-300 hover:-translate-y-1 cursor-pointer shadow-xs"
                  >
                    {/* Header Foto Puskeswan (Google Maps Card Style) */}
                    <div className="relative w-full h-40 bg-slate-100 overflow-hidden">
                      {fotoUtama.startsWith('data:') || fotoUtama.startsWith('http') || fotoUtama.startsWith('/') ? (
                        <img
                          src={fotoUtama}
                          alt={p.nama}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white">
                          <Building2 size={36} />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                      {/* Badges on Image */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black bg-white/90 backdrop-blur-md text-blue-900 border border-white/40 shadow-xs">
                          {p.kode}
                        </span>

                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-slate-900/80 backdrop-blur-md text-white flex items-center gap-1.5 shadow-xs">
                          <Camera size={12} />
                          <span>{totalFoto} Foto</span>
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 left-3 right-3 text-white">
                        <span className="text-[10px] font-bold bg-emerald-600/90 px-2 py-0.5 rounded-md backdrop-blur-xs">
                          {jadwalHariIni ? `${todayName}: ${jadwalHariIni.jam}` : 'Buka Hari Ini'}
                        </span>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <h3 className="font-extrabold sm:font-black text-lg text-slate-900 group-hover:text-blue-700 transition-colors tracking-tight leading-snug">
                          {p.nama}
                        </h3>

                        <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          <MapPin size={13} className="text-blue-600 shrink-0" />
                          <span className="truncate">{p.wilayah_binaan || 'Kabupaten Kebumen'}</span>
                        </p>

                        <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                          <p className="flex items-center gap-1.5 font-medium text-[11px] text-slate-700">
                            <User size={12} className="text-emerald-600 shrink-0" />
                            <span className="truncate">{p.dokter_hewan || 'Dokter Hewan Penanggung Jawab'}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {p.alamat}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-blue-700 text-xs font-bold">
                        <span className="group-hover:underline flex items-center gap-1">
                          Lihat Foto &amp; Jadwal
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>

                        {canEdit && (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleOpenEditProfil(p, e)}
                              title="Edit Profil"
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-800 text-slate-600 flex items-center justify-center transition-colors"
                            >
                              <Edit2 size={12} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteProfil(p.id, p.nama, e)}
                              title="Hapus Profil"
                              className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors"
                            >
                              <Trash2 size={12} strokeWidth={2.5} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredProfilList.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
                <Building2 size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="font-bold text-slate-700">Puskeswan tidak ditemukan</p>
                <p className="text-xs text-slate-400 mt-1">Coba gunakan kata kunci pencarian yang lain.</p>
              </div>
            )}

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SUBMENU 2: REKAPITULASI KINERJA BULANAN PUSKESWAN (EKSISTING)
        ═══════════════════════════════════════════════════════════════ */}
        {currentTab === 'rekap' && (
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

          </div>
        )}

      </main>

      {/* ── MODAL DETAIL PROFIL PUSKESWAN (GOOGLE MAPS PHOTO GALLERY & JAM OPERASIONAL LIST) ── */}
      {selectedProfil && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            
            {/* Modal Hero Image & Gallery Banner */}
            <div className="relative w-full h-56 sm:h-72 bg-slate-900 shrink-0 overflow-hidden">
              {(() => {
                const photos = selectedProfil.galeri_foto && selectedProfil.galeri_foto.length > 0 
                  ? selectedProfil.galeri_foto 
                  : (selectedProfil.foto ? [selectedProfil.foto] : ['/images/modules/keswan.jpg']);
                const currentPhoto = photos[activePhotoIdx] || photos[0];

                return (
                  <>
                    <img
                      src={currentPhoto}
                      alt={selectedProfil.nama}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-black/40" />

                    {/* Top Floating Controls */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      <span className="px-3 py-1 rounded-xl text-xs font-black bg-white/90 backdrop-blur-md text-blue-900 shadow-md">
                        {selectedProfil.kode}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setLightboxPhoto(currentPhoto)}
                          title="Perbesar Foto"
                          className="w-9 h-9 rounded-xl bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
                        >
                          <Maximize2 size={16} />
                        </button>
                        <button
                          onClick={() => setSelectedProfil(null)}
                          className="w-9 h-9 rounded-xl bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors font-bold cursor-pointer"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Title on Banner */}
                    <div className="absolute bottom-4 left-5 right-5 text-white z-10 flex items-end justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-500 text-white uppercase tracking-wider">
                            Puskeswan Aktif
                          </span>
                          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                            <Camera size={13} />
                            <span>{photos.length} Foto Lokasi</span>
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                          {selectedProfil.nama}
                        </h3>
                      </div>

                      {canEdit && (
                        <button
                          onClick={() => {
                            const p = selectedProfil;
                            setSelectedProfil(null);
                            handleOpenEditProfil(p);
                          }}
                          className="min-h-touch px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                        >
                          <Upload size={14} />
                          <span>Kelola Foto</span>
                        </button>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Photo Thumbnails Gallery Strip (Google Maps Style) */}
            {selectedProfil.galeri_foto && selectedProfil.galeri_foto.length > 1 && (
              <div className="bg-slate-900 px-5 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 border-b border-slate-800">
                {selectedProfil.galeri_foto.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activePhotoIdx === idx ? 'border-blue-400 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Scrollable Content Body */}
            <div className="p-6 sm:p-7 space-y-6 overflow-y-auto text-xs">
              
              {/* Alamat & GOOGLE MAPS ACTION */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-blue-900 flex items-center gap-1.5">
                    <MapPin size={15} className="text-blue-600" />
                    <span>Alamat Lengkap &amp; Titik Lokasi</span>
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-md">
                    Google Maps Terintegrasi
                  </span>
                </div>
                
                <p className="text-slate-800 font-medium leading-relaxed">
                  {selectedProfil.alamat}
                </p>

                {/* Tombol Klik Menuju Google Maps */}
                <a
                  href={selectedProfil.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedProfil.nama + ' ' + selectedProfil.alamat)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer group"
                >
                  <MapPin size={15} className="group-hover:animate-bounce" />
                  <span>Buka Petunjuk Arah di Google Maps</span>
                  <ExternalLink size={14} className="opacity-80" />
                </a>
              </div>

              {/* ── JAM OPERASIONAL LIST (SENIN - MINGGU) ── */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Clock size={15} className="text-blue-600" />
                    <span>Jadwal &amp; Jam Operasional Layanan</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-200">
                    Hari Ini: {todayName}
                  </span>
                </div>

                {/* List Hari */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {(selectedProfil.jadwal_harian && selectedProfil.jadwal_harian.length > 0 
                    ? selectedProfil.jadwal_harian 
                    : DEFAULT_JADWAL_HARIAN
                  ).map((jadwal, i) => {
                    const isToday = jadwal.hari.toLowerCase() === todayName.toLowerCase();
                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                          isToday
                            ? 'bg-blue-100/70 border-blue-300 font-bold text-blue-950 shadow-2xs'
                            : 'bg-white border-slate-200/80 text-slate-700'
                        }`}
                      >
                        <span className="font-extrabold flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${isToday ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`} />
                          {jadwal.hari}
                        </span>
                        <span className={`text-[11px] ${jadwal.isTutup ? 'text-amber-700 font-semibold' : 'text-slate-900 font-bold'}`}>
                          {jadwal.jam}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-[11px] text-slate-500 italic pt-1">
                  * Untuk penanganan kasus kritis di luar jam kerja, silakan hubungi kontak darurat dokter hewan.
                </p>
              </div>

              {/* Grid Info Dokter & Wilayah */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <User size={13} className="text-emerald-600" />
                    <span>Dokter Hewan / Penanggung Jawab</span>
                  </span>
                  <p className="text-sm font-extrabold text-slate-900">
                    {selectedProfil.dokter_hewan || '-'}
                  </p>
                  <p className="text-[11px] text-slate-600 flex items-center gap-1 pt-1">
                    <Phone size={12} className="text-emerald-600" />
                    <span className="font-bold">{selectedProfil.kontak || '-'}</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Layers size={13} className="text-purple-600" />
                    <span>Wilayah Kerja / Kecamatan Binaan</span>
                  </span>
                  <p className="text-xs font-extrabold text-slate-900">
                    {selectedProfil.wilayah_binaan || '-'}
                  </p>
                </div>
              </div>

              {/* Layanan Unggulan */}
              {selectedProfil.layanan && selectedProfil.layanan.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase text-slate-600 flex items-center gap-1.5">
                    <Stethoscope size={14} className="text-emerald-600" />
                    <span>Layanan Utama &amp; Tindakan Medis:</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfil.layanan.map((lay, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 font-bold text-[11px] border border-emerald-200 flex items-center gap-1.5"
                      >
                        <Check size={13} className="text-emerald-600" />
                        <span>{lay}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Fasilitas */}
              {selectedProfil.fasilitas && selectedProfil.fasilitas.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold uppercase text-slate-600 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-blue-600" />
                    <span>Sarana &amp; Fasilitas:</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfil.fasilitas.map((fas, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl bg-blue-50 text-blue-900 font-semibold text-[11px] border border-blue-200"
                      >
                        • {fas}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Keterangan */}
              {selectedProfil.keterangan && (
                <p className="text-xs text-slate-500 italic pt-2 border-t border-slate-100">
                  &ldquo;{selectedProfil.keterangan}&rdquo;
                </p>
              )}

            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-5 border-t border-slate-100 bg-slate-50 shrink-0">
              {canEdit ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const item = selectedProfil;
                      setSelectedProfil(null);
                      handleOpenEditProfil(item);
                    }}
                    className="min-h-touch h-10 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 size={14} />
                    <span>Edit Profil &amp; Foto</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProfil(selectedProfil.id, selectedProfil.nama)}
                    className="min-h-touch h-10 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Hapus</span>
                  </button>
                </div>
              ) : <div />}

              <button
                onClick={() => setSelectedProfil(null)}
                className="min-h-touch h-10 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── LIGHTBOX MODAL (PREVIEW FOTO LENGKAP) ── */}
      {lightboxPhoto && (
        <div 
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-lg font-bold cursor-pointer"
            >
              ✕
            </button>
            <img
              src={lightboxPhoto}
              alt="Preview Foto Puskeswan"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* ── MODAL FORM TAMBAH / EDIT PROFIL PUSKESWAN (CRUD + FOTO + JADWAL LIST) ── */}
      {showProfilModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    {editingProfilId ? 'Edit Profil Puskeswan' : 'Tambah Profil Puskeswan Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">Kelola foto lokasi, jadwal jam operasional harian, dan informasi Puskeswan</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfilModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfil} className="space-y-5 text-xs">
              
              {/* Identitas Puskeswan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Puskeswan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profilForm.nama}
                    onChange={(e) => setProfilForm({ ...profilForm, nama: e.target.value })}
                    placeholder="Contoh: Puskeswan Mirit"
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:border-blue-600 outline-none shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode Singkatan Puskeswan
                  </label>
                  <input
                    type="text"
                    value={profilForm.kode}
                    onChange={(e) => setProfilForm({ ...profilForm, kode: e.target.value.toUpperCase() })}
                    placeholder="Contoh: MIRIT"
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:border-blue-600 outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* ── KELOLA FOTO PUSKESWAN (GOOGLE MAPS STYLE) ── */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                    <Camera size={14} className="text-blue-600" />
                    <span>Galeri Foto Puskeswan (Google Maps Style)</span>
                  </label>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    {profilForm.galeri_foto.length} Foto Ditambahkan
                  </span>
                </div>

                {/* Upload Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <label className="w-full sm:w-auto min-h-touch h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs">
                    <Upload size={14} />
                    <span>Upload Foto dari Perangkat</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoFileUpload}
                      className="hidden"
                    />
                  </label>

                  <div className="flex items-center gap-1 w-full sm:flex-1">
                    <input
                      type="url"
                      placeholder="Atau tempel Link URL Foto..."
                      value={profilForm.urlInputFoto}
                      onChange={(e) => setProfilForm({ ...profilForm, urlInputFoto: e.target.value })}
                      className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:border-blue-600 outline-none shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddPhotoUrl}
                      className="min-h-touch h-10 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer"
                    >
                      + Tambah
                    </button>
                  </div>
                </div>

                {/* Photo Previews */}
                {profilForm.galeri_foto.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-2">
                    {profilForm.galeri_foto.map((imgUrl, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden h-16 border border-slate-200 bg-slate-100 shadow-2xs">
                        <img src={imgUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                          title="Hapus foto ini"
                        >
                          ✕
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-blue-600/90 text-[8px] font-black text-white text-center py-0.5">
                            Utama
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── KELOLA JAM OPERASIONAL LIST (SENIN - MINGGU) ── */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="block text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-600" />
                  <span>Daftar Jam Operasional Harian (Senin s/d Minggu)</span>
                </label>

                <div className="space-y-2">
                  {profilForm.jadwal_harian.map((j, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-20 font-bold text-slate-800 text-xs">{j.hari}:</span>
                      <input
                        type="text"
                        value={j.jam}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProfilForm((prev) => ({
                            ...prev,
                            jadwal_harian: prev.jadwal_harian.map((item, idx) =>
                              idx === i ? { ...item, jam: val, isTutup: val.toLowerCase().includes('tutup') || val.toLowerCase().includes('on-call') } : item
                            ),
                          }));
                        }}
                        placeholder="Contoh: 07.30 - 15.30 WIB"
                        className="flex-1 min-h-touch h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:border-blue-600 outline-none shadow-2xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Wilayah Kerja / Kecamatan Binaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profilForm.wilayah_binaan}
                  onChange={(e) => setProfilForm({ ...profilForm, wilayah_binaan: e.target.value })}
                  placeholder="Contoh: Kecamatan Mirit, Kecamatan Bonorowo"
                  className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-600 outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={profilForm.alamat}
                  onChange={(e) => setProfilForm({ ...profilForm, alamat: e.target.value })}
                  placeholder="Jl. Daendels, Desa Mirit, Kec. Mirit, Kab. Kebumen..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-600 outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link Google Maps (Opsional / Otomatis Dibuat)
                </label>
                <input
                  type="url"
                  value={profilForm.maps_url}
                  onChange={(e) => setProfilForm({ ...profilForm, maps_url: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-600 outline-none shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dokter Hewan / Kepala
                  </label>
                  <input
                    type="text"
                    value={profilForm.dokter_hewan}
                    onChange={(e) => setProfilForm({ ...profilForm, dokter_hewan: e.target.value })}
                    placeholder="drh. H. Bambang Suhartono"
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-600 outline-none shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={profilForm.kontak}
                    onChange={(e) => setProfilForm({ ...profilForm, kontak: e.target.value })}
                    placeholder="0812-3456-7890"
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-600 outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daftar Layanan (1 baris per layanan)
                  </label>
                  <textarea
                    rows={3}
                    value={profilForm.layananText}
                    onChange={(e) => setProfilForm({ ...profilForm, layananText: e.target.value })}
                    placeholder="Pemeriksaan Hewan&#10;Inseminasi Buatan&#10;Vaksinasi PMK"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-600 outline-none shadow-2xs text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daftar Fasilitas (1 baris per fasilitas)
                  </label>
                  <textarea
                    rows={3}
                    value={profilForm.fasilitasText}
                    onChange={(e) => setProfilForm({ ...profilForm, fasilitasText: e.target.value })}
                    placeholder="Ruang Tindakan Medis&#10;Cold Storage Vaksin&#10;Kendaraan Lapangan"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-600 outline-none shadow-2xs text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan / Catatan Tambahan
                </label>
                <input
                  type="text"
                  value={profilForm.keterangan}
                  onChange={(e) => setProfilForm({ ...profilForm, keterangan: e.target.value })}
                  placeholder="Catatan pelayanan wilayah..."
                  className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-blue-600 outline-none shadow-2xs"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProfilModal(false)}
                  className="min-h-touch h-11 px-5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-touch h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  Simpan Data Profil &amp; Foto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL TAMBAH PERIODE REKAPITULASI (REKAP TAB) ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Calendar size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                    Tambah Periode Rekapitulasi
                  </h3>
                  <p className="text-xs text-slate-500">Pilih Tahun &amp; Bulan untuk lembar kerja baru</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tahun Anggaran
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2100"
                  value={addTahun}
                  onChange={(e) => setAddTahun(e.target.value)}
                  className="w-full min-h-touch h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:border-blue-600 outline-none shadow-2xs"
                  placeholder="Contoh: 2026"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Bulan Laporan
                </label>
                <select
                  value={addBulan}
                  onChange={(e) => setAddBulan(e.target.value)}
                  className="w-full min-h-touch h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-blue-600 outline-none shadow-2xs"
                >
                  {DAFTAR_BULAN.map((bln) => (
                    <option key={bln} value={bln}>
                      {bln}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">8 Puskeswan yang akan disiapkan:</p>
                <p className="text-[11px] text-slate-500">{DAFTAR_PUSKESWAN.join(', ')}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="min-h-touch h-11 px-5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCreateNewPeriod}
                className="flex-1 min-h-touch h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                Buat Lembar Kerja
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}