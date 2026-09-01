'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Plus,
  Search,
  Calendar as CalendarIcon,
  Users,
  CheckCircle2,
  Edit2,
  Trash2,
  Filter,
  FileText,
  MapPin,
  X,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronLeft,
  Download,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';

type KTTMaster = {
  id: number | string;
  namaKelompok: string;
  kecamatan: string;
  desa: string;
};

type KegiatanKTT = {
  id: string;
  tanggal: string;
  ktt_id: string;
  nama_ktt: string;
  kecamatan: string;
  desa: string;
  tim_pelaksana: string;
  nama_kegiatan: string;
  hasil_kegiatan: string;
  lat?: number | null;
  lng?: number | null;
  photo?: string | null;
  created_at?: string;
};

const DAFTAR_TIM_PELAKSANA = [
  'Tim Pembibitan & Produksi Bitpro',
  'Tim Monitoring & Evaluasi Lapangan',
  'Tim Medis Veteriner & Kesehatan Ternak',
  'Tim Verifikasi Kelayakan Bantuan',
  'Tim Pendamping Penyuluh Kecamatan',
  'Tim Sarana & Prasarana Peternakan',
];

const PRESET_KEGIATAN = [
  'Pembinaan Manajemen Kelompok & Kandang',
  'Monitoring Populasi & Kesehatan Ternak',
  'Verifikasi Lapangan Usulan Calon Penerima Bantuan',
  'Pendampingan Pakan & Hijauan Makanan Ternak (HMT)',
  'Evaluasi Pasca Penyaluran Bantuan Hibah',
  'Sosialisasi & Edukasi Inseminasi Buatan (IB)',
];

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function KegiatanKTTPage() {
  const [listKegiatan, setListKegiatan] = useState<KegiatanKTT[]>([]);
  const [listKTT, setListKTT] = useState<KTTMaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterKtt, setFilterKtt] = useState('');
  const [filterTim, setFilterTim] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

  // Calendar State
  const [currentCalendarDate, setCurrentCalendarDate] = useState(() => new Date());

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showKttSuggestions, setShowKttSuggestions] = useState(false);

  // Camera State
  const [showCameraModal, setShowCameraModal] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    ktt_id: '',
    nama_ktt: '',
    kecamatan: '',
    desa: '',
    tim_pelaksana: DAFTAR_TIM_PELAKSANA[0],
    nama_kegiatan: '',
    hasil_kegiatan: '',
    lat: null as number | null,
    lng: null as number | null,
    photo: null as string | null,
  });

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Tarik Data KTT Master
      const resKTT = await fetch('/api/ktt');
      const dataKTT = await resKTT.json();
      if (Array.isArray(dataKTT)) {
        setListKTT(dataKTT);
      }

      // 2. Tarik Data Kegiatan KTT
      const resKeg = await fetch('/api/kegiatan-ktt');
      const dataKeg = await resKeg.json();
      if (Array.isArray(dataKeg)) {
        setListKegiatan(dataKeg);
      }
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Pilih KTT di Form Modal (Auto-fill Kecamatan & Desa)
  const handleSelectKTTInForm = (kttName: string) => {
    const selected = listKTT.find((k) => k.namaKelompok === kttName);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        ktt_id: String(selected.id),
        nama_ktt: selected.namaKelompok,
        kecamatan: selected.kecamatan,
        desa: selected.desa,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        nama_ktt: kttName,
        ktt_id: '',
      }));
    }
  };

  // Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Perangkat Anda tidak mendukung Geolocation.');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        }));
        setIsGettingLocation(false);
      },
      () => {
        alert('Gagal mengambil titik GPS. Pastikan izin lokasi diizinkan di browser Anda.');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Camera Handler
  const openCamera = async () => {
    setShowCameraModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch {
      alert('Kamera tidak dapat diakses. Silakan gunakan opsi galeri file.');
      setShowCameraModal(false);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowCameraModal(false);
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setFormData((prev) => ({
        ...prev,
        photo: canvas.toDataURL('image/jpeg', 0.85),
      }));
    }
    closeCamera();
    if (formData.lat === null || formData.lng === null) handleGetLocation();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setFormData((prev) => ({
        ...prev,
        photo: evt.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
    if (formData.lat === null || formData.lng === null) handleGetLocation();
  };

  // Submit Simpan / Edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_ktt) return alert('Silakan pilih nama KTT!');
    if (!formData.nama_kegiatan) return alert('Silakan isi nama/jenis kegiatan!');

    try {
      const res = await fetch('/api/kegiatan-ktt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: editingId || undefined,
          isEdit: !!editingId,
        }),
      });

      if (res.ok) {
        alert(editingId ? 'Log kegiatan berhasil diperbarui!' : 'Log kegiatan berhasil dicatat ke database!');
        setShowModal(false);
        resetForm();
        fetchData();
      } else {
        alert('Gagal menyimpan data kegiatan.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  // Handle Edit
  const handleEdit = (kegiatan: KegiatanKTT) => {
    setEditingId(kegiatan.id);
    setFormData({
      tanggal: kegiatan.tanggal ? kegiatan.tanggal.substring(0, 10) : new Date().toISOString().split('T')[0],
      ktt_id: kegiatan.ktt_id || '',
      nama_ktt: kegiatan.nama_ktt || '',
      kecamatan: kegiatan.kecamatan || '',
      desa: kegiatan.desa || '',
      tim_pelaksana: kegiatan.tim_pelaksana || DAFTAR_TIM_PELAKSANA[0],
      nama_kegiatan: kegiatan.nama_kegiatan || '',
      hasil_kegiatan: kegiatan.hasil_kegiatan || '',
      lat: kegiatan.lat || null,
      lng: kegiatan.lng || null,
      photo: kegiatan.photo || null,
    });
    document.getElementById('form-catat-kegiatan')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus catatan log kegiatan ini?')) return;
    try {
      const res = await fetch(`/api/kegiatan-ktt?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        alert('Gagal menghapus kegiatan.');
      }
    } catch {
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      tanggal: new Date().toISOString().split('T')[0],
      ktt_id: '',
      nama_ktt: '',
      kecamatan: '',
      desa: '',
      tim_pelaksana: DAFTAR_TIM_PELAKSANA[0],
      nama_kegiatan: '',
      hasil_kegiatan: '',
      lat: null,
      lng: null,
      photo: null,
    });
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (listKegiatan.length === 0) return alert('Belum ada data kegiatan untuk diekspor!');
    const rows = filteredKegiatan.map((item, idx) => ({
      No: idx + 1,
      Tanggal: item.tanggal ? item.tanggal.substring(0, 10) : '-',
      'Nama KTT': item.nama_ktt,
      Kecamatan: item.kecamatan || '-',
      Desa: item.desa || '-',
      'Tim Pelaksana': item.tim_pelaksana,
      'Nama Kegiatan': item.nama_kegiatan,
      'Hasil / Uraian Kegiatan': item.hasil_kegiatan,
      Latitude: item.lat || '-',
      Longitude: item.lng || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Log_Kegiatan_KTT');
    XLSX.writeFile(wb, `Log_Kegiatan_KTT_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Calendar Calculation
  const calendarDays = useMemo(() => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Mapping kegiatan per date format: YYYY-MM-DD
    const dateActivityMap: Record<string, KegiatanKTT[]> = {};
    listKegiatan.forEach((k) => {
      if (k.tanggal) {
        const dateKey = k.tanggal.substring(0, 10);
        if (!dateActivityMap[dateKey]) dateActivityMap[dateKey] = [];
        dateActivityMap[dateKey].push(k);
      }
    });

    const days = [];
    // Adjust Sunday index so Monday = 0
    const startOffset = (firstDayIndex + 6) % 7;

    for (let i = 0; i < startOffset; i++) {
      days.push({ type: 'empty', key: `empty-${i}` });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(month + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateKey = `${year}-${monthStr}-${dayStr}`;
      const activities = dateActivityMap[dateKey] || [];

      days.push({
        type: 'day',
        dayNumber: d,
        dateKey,
        activities,
        key: `day-${d}`,
      });
    }

    return days;
  }, [currentCalendarDate, listKegiatan]);

  // Filtered Kegiatan
  const filteredKegiatan = useMemo(() => {
    return listKegiatan.filter((item) => {
      const matchKtt = filterKtt ? item.nama_ktt === filterKtt : true;
      const matchTim = filterTim ? item.tim_pelaksana === filterTim : true;
      const matchDate = selectedDateFilter ? item.tanggal && item.tanggal.substring(0, 10) === selectedDateFilter : true;
      const matchSearch = searchTerm
        ? item.nama_ktt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.nama_kegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.hasil_kegiatan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.kecamatan || '').toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchKtt && matchTim && matchDate && matchSearch;
    });
  }, [listKegiatan, filterKtt, filterTim, selectedDateFilter, searchTerm]);

  // Unique KTTs involved in activities
  const uniqueKttCount = useMemo(() => {
    return new Set(listKegiatan.map((k) => k.nama_ktt)).size;
  }, [listKegiatan]);

  // Filtered KTT list for Autocomplete Suggestion
  const filteredKttSuggestions = useMemo(() => {
    const q = (formData.nama_ktt || '').toLowerCase().trim();
    if (!q) return listKTT.slice(0, 10);
    return listKTT.filter((k) =>
      (k.namaKelompok || '').toLowerCase().includes(q) ||
      (k.kecamatan || '').toLowerCase().includes(q) ||
      (k.desa || '').toLowerCase().includes(q)
    ).slice(0, 15);
  }, [listKTT, formData.nama_ktt]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-20">
      
      {/* ── TOP HEADER (Tema Hijau Bitpro) ── */}
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
                <Link href="/bitpro" className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors truncate">
                  Bitpro
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Kegiatan KTT</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Log Aktivitas &amp; Pembinaan KTT
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportExcel}
              title="Export Excel"
              aria-label="Export Excel"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Download size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        
        {/* ── FORM INLINE CATAT KEGIATAN KTT BARU (POSISI UTAMA / PALING ATAS) ── */}
        <section id="form-catat-kegiatan" className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Plus size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                  {editingId ? (
                    <>
                      <Edit2 size={18} className="text-emerald-700" />
                      <span>Edit Catatan Kegiatan Lapangan</span>
                    </>
                  ) : (
                    <span>Catat Kegiatan / Pembinaan KTT Baru</span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingId ? `Sedang mengubah data ID: ${editingId}` : 'Formulir pencatatan langsung aktivitas pendampingan kelompok tani ternak'}
                </p>
              </div>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                ✕ Batalkan Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tanggal Kegiatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.tanggal}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tanggal: e.target.value }))}
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-emerald-600 outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tim Pelaksana <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.tim_pelaksana}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tim_pelaksana: e.target.value }))}
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-emerald-600 outline-none shadow-2xs"
                >
                  {DAFTAR_TIM_PELAKSANA.map((tim) => (
                    <option key={tim} value={tim}>
                      {tim}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pilih KTT dengan Live Autocomplete Search */}
            <div className="relative">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nama Kelompok Tani Ternak (KTT) <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  Live Search Database KTT (ketik cth: &quot;gom&quot;)
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ketik nama kelompok, kecamatan, atau desa..."
                  value={formData.nama_ktt}
                  onFocus={() => setShowKttSuggestions(true)}
                  onChange={(e) => {
                    handleSelectKTTInForm(e.target.value);
                    setShowKttSuggestions(true);
                  }}
                  className="w-full min-h-touch h-11 px-3.5 pr-10 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 outline-none shadow-2xs"
                />
                {formData.nama_ktt && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        nama_ktt: '',
                        ktt_id: '',
                        kecamatan: '',
                        desa: '',
                      }));
                      setShowKttSuggestions(true);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 w-6 h-6 flex items-center justify-center text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Smart Dropdown Autocomplete */}
              {showKttSuggestions && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowKttSuggestions(false)}
                  />
                  <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-100 animate-in fade-in duration-150">
                    <div className="px-3.5 py-2 bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span>Pilihan Master KTT ({filteredKttSuggestions.length})</span>
                      <span className="text-[10px] text-emerald-700 font-normal">Klik untuk memilih</span>
                    </div>

                    {filteredKttSuggestions.length > 0 ? (
                      filteredKttSuggestions.map((k) => (
                        <button
                          key={k.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              ktt_id: String(k.id),
                              nama_ktt: k.namaKelompok,
                              kecamatan: k.kecamatan || '',
                              desa: k.desa || '',
                            }));
                            setShowKttSuggestions(false);
                          }}
                          className="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50/80 transition-colors flex items-center justify-between group cursor-pointer"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-800 block truncate">
                              {k.namaKelompok}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              Desa {k.desa || '-'}, Kec. {k.kecamatan || '-'}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800 shrink-0 ml-2">
                            Pilih →
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400 text-xs">
                        Tidak ditemukan KTT yang cocok dengan &quot;{formData.nama_ktt}&quot;.<br />
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          (Anda tetap dapat mengetik nama KTT baru secara manual)
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Kecamatan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Petanahan"
                  value={formData.kecamatan}
                  onChange={(e) => setFormData((prev) => ({ ...prev, kecamatan: e.target.value }))}
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-emerald-600 outline-none shadow-2xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Desa
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Karangduwur"
                  value={formData.desa}
                  onChange={(e) => setFormData((prev) => ({ ...prev, desa: e.target.value }))}
                  className="w-full min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-emerald-600 outline-none shadow-2xs"
                />
              </div>
            </div>

            {/* Jenis Kegiatan */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nama / Jenis Kegiatan <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Pilih rekomendasi di bawah</span>
              </div>
              <input
                type="text"
                required
                placeholder="Contoh: Pembinaan Manajemen Kelompok & Kandang"
                value={formData.nama_kegiatan}
                onChange={(e) => setFormData((prev) => ({ ...prev, nama_kegiatan: e.target.value }))}
                className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-emerald-600 outline-none mb-2 shadow-2xs"
              />
              
              {/* Preset Kegiatan Chips */}
              <div className="flex flex-wrap gap-1.5">
                {PRESET_KEGIATAN.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, nama_kegiatan: preset }))}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Hasil & Catatan Kegiatan */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Uraian Hasil Kegiatan &amp; Arahan Petugas
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan hasil evaluasi lapangan, kendala kelompok, rekomendasi pakan/kesehatan, dll..."
                value={formData.hasil_kegiatan}
                onChange={(e) => setFormData((prev) => ({ ...prev, hasil_kegiatan: e.target.value }))}
                className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs focus:border-emerald-600 outline-none leading-relaxed shadow-2xs"
              />
            </div>

            {/* Titik GPS & Foto Dokumentasi */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin size={15} strokeWidth={2.5} className="text-emerald-600" />
                <span>Titik Lokasi GPS &amp; Foto Dokumentasi</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      Koordinat GPS
                    </label>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isGettingLocation}
                      className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <MapPin size={12} />
                      <span>{isGettingLocation ? 'Mencari GPS...' : 'Ambil GPS Otomatis'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      value={formData.lat ?? ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lat: e.target.value ? parseFloat(e.target.value) : null }))}
                      className="w-full min-h-touch h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-emerald-600 outline-none"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      value={formData.lng ?? ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lng: e.target.value ? parseFloat(e.target.value) : null }))}
                      className="w-full min-h-touch h-9 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:border-emerald-600 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Dokumentasi Foto
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={openCamera}
                      className="min-h-touch h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold flex items-center gap-1 hover:bg-slate-50 cursor-pointer"
                    >
                      <Camera size={13} strokeWidth={2.5} /> Kamera
                    </button>
                    <label className="min-h-touch h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold flex items-center gap-1 hover:bg-slate-50 cursor-pointer">
                      <ImageIcon size={13} strokeWidth={2.5} /> Galeri
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                    {formData.photo && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-0.5">
                        <CheckCircle2 size={13} strokeWidth={2.5} /> Foto Siap
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="min-h-touch h-11 px-5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                >
                  Batal
                </button>
              )}
              <button
                type="submit"
                className="flex-1 min-h-touch h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                {editingId ? 'Simpan Perubahan Kegiatan' : 'Simpan Log Kegiatan'}
              </button>
            </div>

          </form>
        </section>
        
        {/* KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileText size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                Total Kegiatan
              </p>
              <p className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-900">
                {listKegiatan.length} <span className="text-xs font-semibold text-slate-400">Aktivitas</span>
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Users size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                KTT Terdampingi
              </p>
              <p className="font-sans text-2xl sm:text-3xl font-extrabold text-emerald-700">
                {uniqueKttCount} <span className="text-xs font-semibold text-slate-400">Kelompok</span>
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MapPin size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                Terverifikasi GPS
              </p>
              <p className="font-sans text-2xl sm:text-3xl font-extrabold text-slate-900">
                {listKegiatan.filter((k) => k.lat).length} <span className="text-xs font-semibold text-slate-400">Lokasi</span>
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-sans font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                Status Sistem
              </p>
              <p className="font-sans text-base sm:text-lg font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 size={18} strokeWidth={2.5} className="text-emerald-600" />
                <span>Terhubung Realtime</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── KALENDER KEGIATAN LAPANGAN INTERAKTIF ── */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <CalendarIcon size={20} strokeWidth={2.5} className="text-emerald-600" />
                <span>Kalender Agenda &amp; Aktivitas Pembinaan Lapangan</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Klik tanggal bertanda titik hijau untuk melihat dan memfilter log kegiatan lapangan pada hari tersebut
              </p>
            </div>

            {/* Navigasi Bulan */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => {
                  const d = new Date(currentCalendarDate);
                  d.setMonth(d.getMonth() - 1);
                  setCurrentCalendarDate(d);
                }}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>

              <span className="text-xs sm:text-sm font-extrabold text-slate-800 min-w-[140px] text-center">
                {NAMA_BULAN[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}
              </span>

              <button
                onClick={() => {
                  const d = new Date(currentCalendarDate);
                  d.setMonth(d.getMonth() + 1);
                  setCurrentCalendarDate(d);
                }}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors"
                title="Bulan Berikutnya"
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>

              <button
                onClick={() => setCurrentCalendarDate(new Date())}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors"
              >
                Hari Ini
              </button>
            </div>
          </div>

          {/* Active Date Filter Banner */}
          {selectedDateFilter && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="font-bold text-emerald-900">
                  Menampilkan kegiatan pada tanggal: <span className="underline font-extrabold">{selectedDateFilter}</span> ({filteredKegiatan.length} Kegiatan)
                </span>
              </div>
              <button
                onClick={() => setSelectedDateFilter(null)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white px-2.5 py-1 rounded-lg border border-emerald-300 shadow-2xs cursor-pointer"
              >
                ✕ Tampilkan Semua Tanggal
              </button>
            </div>
          )}

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
            {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((day) => (
              <div key={day} className="py-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                {day}
              </div>
            ))}

            {calendarDays.map((item) => {
              if (item.type === 'empty') {
                return <div key={item.key} className="h-14 sm:h-20 rounded-xl bg-slate-50/50" />;
              }

              const hasActivities = item.activities && item.activities.length > 0;
              const isSelected = selectedDateFilter === item.dateKey;
              const isToday = item.dateKey === new Date().toISOString().split('T')[0];

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedDateFilter(null);
                    } else {
                      setSelectedDateFilter(item.dateKey!);
                    }
                  }}
                  className={`h-14 sm:h-20 p-1.5 sm:p-2 rounded-2xl border transition-all text-left flex flex-col justify-between relative cursor-pointer group ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
                      : hasActivities
                      ? 'bg-emerald-50/60 hover:bg-emerald-100/70 border-emerald-200 text-slate-800'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-extrabold ${
                        isToday && !isSelected
                          ? 'w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center'
                          : ''
                      }`}
                    >
                      {item.dayNumber}
                    </span>

                    {hasActivities && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isSelected ? 'bg-white text-emerald-800' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {item.activities!.length}
                      </span>
                    )}
                  </div>

                  {hasActivities && (
                    <div className="min-w-0 w-full hidden sm:block">
                      <p className={`text-[10px] font-bold truncate ${isSelected ? 'text-white' : 'text-emerald-900'}`}>
                        {item.activities![0].nama_kegiatan}
                      </p>
                      <p className={`text-[9px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {item.activities![0].nama_ktt}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── DAFTAR LOG AKTIVITAS & FILTER TOOLBAR ── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText size={18} strokeWidth={2.5} className="text-emerald-600" />
                <span>Riwayat Log Aktivitas &amp; Hasil Pendampingan</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {filteredKegiatan.length} Catatan
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Pencatatan rekam jejak penyuluhan, vaksinasi, pembinaan, dan monev di tingkat kelompok tani
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search size={16} strokeWidth={2.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama KTT, jenis kegiatan, hasil, atau kecamatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full min-h-touch h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={filterKtt}
                onChange={(e) => setFilterKtt(e.target.value)}
                className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 focus:bg-white"
              >
                <option value="">Semua Kelompok Tani</option>
                {Array.from(new Set(listKegiatan.map((k) => k.nama_ktt))).map((ktt) => (
                  <option key={ktt} value={ktt}>
                    {ktt}
                  </option>
                ))}
              </select>

              <select
                value={filterTim}
                onChange={(e) => setFilterTim(e.target.value)}
                className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 focus:bg-white"
              >
                <option value="">Semua Tim Pelaksana</option>
                {DAFTAR_TIM_PELAKSANA.map((tim) => (
                  <option key={tim} value={tim}>
                    {tim}
                  </option>
                ))}
              </select>

              {(filterKtt || filterTim || searchTerm || selectedDateFilter) && (
                <button
                  onClick={() => {
                    setFilterKtt('');
                    setFilterTim('');
                    setSearchTerm('');
                    setSelectedDateFilter(null);
                  }}
                  className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Activity Cards List */}
          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-bold">Memuat log kegiatan KTT...</p>
            </div>
          ) : filteredKegiatan.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
              <p className="text-sm font-bold text-slate-700">Belum ada catatan log kegiatan.</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Klik tombol &quot;+ Catat Kegiatan Baru&quot; untuk mencatat pendampingan, sosialisasi, atau monitoring kelompok.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredKegiatan.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-extrabold text-sm shrink-0">
                        <Users size={18} strokeWidth={2.5} />
                      </span>
                      <div>
                        <h4 className="font-extrabold text-base text-slate-900">{item.nama_ktt}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{item.desa ? `${item.desa}, ` : ''}{item.kecamatan || 'Kabupaten Kebumen'}</span>
                          <span>•</span>
                          <span className="font-bold text-emerald-800">{item.tim_pelaksana}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5">
                        <Clock size={13} strokeWidth={2.5} />
                        {item.tanggal ? item.tanggal.substring(0, 10) : '-'}
                      </span>

                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={14} strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3 space-y-2">
                      <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-bold">
                        📌 {item.nama_kegiatan}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {item.hasil_kegiatan || 'Belum ada uraian hasil kegiatan.'}
                      </p>
                    </div>

                    {/* Side Info: GPS & Foto */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                      <span className="font-bold text-slate-600 block text-[11px] uppercase tracking-wider">
                        Dokumentasi &amp; Titik
                      </span>
                      {item.lat ? (
                        <div className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 size={14} strokeWidth={2.5} />
                          <span>Lat: {item.lat}, Lng: {item.lng}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Titik GPS tidak dicatat</span>
                      )}

                      {item.photo && (
                        <div className="mt-2">
                          <img
                            src={item.photo}
                            alt="Foto Lapangan"
                            className="w-full h-24 object-cover rounded-lg border border-slate-200 shadow-2xs"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>


      {/* ── MODAL KAMERA ── */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-center text-base">Ambil Foto Kegiatan</h3>
            <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={takePhoto}
                className="flex-1 min-h-touch h-11 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700"
              >
                📸 Ambil Foto
              </button>
              <button
                type="button"
                onClick={closeCamera}
                className="min-h-touch h-11 px-5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
