'use client';

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Building2,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Download,
  User,
} from "lucide-react";
import { usePageAuth } from '@/hooks/usePageAuth';

/* =========================================================
   1. TIPE DATA & KONSTANTA
   ========================================================= */
export interface KelompokTani {
  id: number;
  kecamatan: string;
  desa: string;
  namaKelompok: string;
  nomorRegister: string;
  jenisKelompok: string;
  kelasKelompok: string;
  luasLahanHa: number;
  anggotaLaki: number;
  anggotaPerempuan: number;
  namaKetuaKelompok: string;
}

type KelompokTaniFormValues = Omit<KelompokTani, 'id'>;

const emptyFormValues: KelompokTaniFormValues = {
  kecamatan: "",
  desa: "",
  namaKelompok: "",
  nomorRegister: "",
  jenisKelompok: "Kelompok Tani Ternak (KTT)",
  kelasKelompok: "Pemula",
  luasLahanHa: 0,
  anggotaLaki: 0,
  anggotaPerempuan: 0,
  namaKetuaKelompok: "",
};

const KECAMATAN_OPTIONS = [
  "Ayah", "Buayan", "Puring", "Petanahan", "Klirong", "Buluspesantren", "Ambal",
  "Mirit", "Bonorowo", "Prembun", "Padureso", "Kutowinangun", "Alian",
  "Poncowarno", "Kebumen", "Pejagoan", "Sruweng", "Adimulyo", "Kuwarasan",
  "Rowokele", "Sempor", "Gombong", "Karanganyar", "Karanggayam", "Sadang",
  "Karangsambung"
];

const JENIS_KELOMPOK_OPTIONS = ["Kelompok Tani Ternak (KTT)", "Poktan/Tanaman Pangan", "Kelompok Lainnya"];
const KELAS_ORDER = ["Pemula", "Lanjut", "Madya", "Utama"];
const PAGE_SIZE = 10;

function KelasBadge({ kelas }: { kelas: string }) {
  if (!kelas || kelas === '-') {
    return <span className="text-xs text-slate-400 italic">Belum diklasifikasi</span>;
  }

  const k = kelas.trim().toLowerCase();

  // Warna berbeda untuk setiap kelas namun lembut/tidak mencolok (Soft & Elegant)
  let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
  let dotStyle = "bg-slate-400";

  if (k.includes('pemula')) {
    badgeStyle = "bg-sky-50/90 text-sky-800 border-sky-200";
    dotStyle = "bg-sky-500";
  } else if (k.includes('lanjut')) {
    badgeStyle = "bg-emerald-50/90 text-emerald-800 border-emerald-200";
    dotStyle = "bg-emerald-500";
  } else if (k.includes('madya')) {
    badgeStyle = "bg-amber-50/90 text-amber-800 border-amber-200";
    dotStyle = "bg-amber-500";
  } else if (k.includes('utama')) {
    badgeStyle = "bg-purple-50/90 text-purple-800 border-purple-200";
    dotStyle = "bg-purple-500";
  } else if (k.includes('mandiri')) {
    badgeStyle = "bg-indigo-50/90 text-indigo-800 border-indigo-200";
    dotStyle = "bg-indigo-500";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-sans border shadow-2xs ${badgeStyle}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyle}`} />
      {kelas}
    </span>
  );
}

export default function DatabaseKTTPage() {
  const [data, setData] = useState<KelompokTani[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("");
  const [filterDesa, setFilterDesa] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"tambah" | "edit">("tambah");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<KelompokTaniFormValues>(emptyFormValues);
  const [deleteTarget, setDeleteTarget] = useState<KelompokTani | null>(null);

  const { isReady, canEdit, handleLogout: authLogout } = usePageAuth('bitpro', 'database-ktt');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ktt');
      const jsonData = await res.json();
      let validData: KelompokTani[] = [];
      if (Array.isArray(jsonData)) {
        validData = jsonData;
      } else if (jsonData && typeof jsonData === 'object') {
        const foundArray = Object.values(jsonData).find(val => Array.isArray(val));
        if (foundArray) validData = foundArray as KelompokTani[];
      }
      setData(validData);
    } catch (error) {
      console.error('Gagal meload data KTT:', error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const desaList = useMemo(() => {
    if (!filterKecamatan) return [];
    const desas = data
      .filter(d => (d.kecamatan || '').trim().toUpperCase() === filterKecamatan.trim().toUpperCase())
      .map(d => d.desa);
    return Array.from(new Set(desas)).sort();
  }, [data, filterKecamatan]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((row) => {
      const namaKel = row.namaKelompok ? row.namaKelompok.toLowerCase() : "";
      const namaKet = row.namaKetuaKelompok ? row.namaKetuaKelompok.toLowerCase() : "";
      const nmrReg = row.nomorRegister ? row.nomorRegister.toLowerCase() : "";
      const nmDesa = row.desa ? row.desa.toLowerCase() : "";

      const matchSearch = !q || namaKel.includes(q) || namaKet.includes(q) || nmDesa.includes(q) || nmrReg.includes(q);
      const matchKecamatan = !filterKecamatan || (row.kecamatan || '').trim().toUpperCase() === filterKecamatan.trim().toUpperCase();
      const matchDesa = !filterDesa || (row.desa || '').trim().toUpperCase() === filterDesa.trim().toUpperCase();
      const matchJenis = !filterJenis || row.jenisKelompok === filterJenis;
      return matchSearch && matchKecamatan && matchDesa && matchJenis;
    });
  }, [data, search, filterKecamatan, filterDesa, filterJenis]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const kecamatanIndex = useMemo(() => {
    const base = data.filter((row) => !filterJenis || row.jenisKelompok === filterJenis);
    const map = new Map<string, number>();
    for (const row of base) {
      const k = (row.kecamatan || '').trim().toUpperCase();
      map.set(k, (map.get(k) || 0) + 1);
    }
    return KECAMATAN_OPTIONS.map((k) => ({
      kecamatan: k,
      jumlah: map.get(k.trim().toUpperCase()) || 0,
    }));
  }, [data, filterJenis]);

  function pilihKecamatan(kec: string) {
    if (filterKecamatan.trim().toUpperCase() !== kec.trim().toUpperCase()) {
      setFilterKecamatan(kec);
      setFilterDesa("");
    } else {
      setFilterKecamatan("");
      setFilterDesa("");
    }
    setPage(1);
  }

  function openAddModal() {
    setFormMode("tambah");
    setEditingId(null);
    setFormValues(emptyFormValues);
    setFormOpen(true);
  }

  function openEditModal(row: KelompokTani) {
    setFormMode("edit");
    setEditingId(row.id);
    const { id, ...rest } = row;
    setFormValues(rest);
    setFormOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch('/api/ktt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...formValues })
      });
      await loadData();
      setFormOpen(false);
    } catch (error) {
      alert('Gagal menyimpan data KTT!');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    try {
      await fetch(`/api/ktt?id=${deleteTarget.id}`, { method: 'DELETE' });
      await loadData();
      setDeleteTarget(null);
    } catch (error) {
      alert('Gagal menghapus data KTT!');
    }
  }

  const handleExportExcel = () => {
    if (data.length === 0) return alert("Belum ada data KTT untuk diekspor!");
    const exportData = filtered.map((row, idx) => ({
      No: idx + 1,
      "Nomor Register": row.nomorRegister || "-",
      "Nama Kelompok": row.namaKelompok || "-",
      "Ketua Kelompok": row.namaKetuaKelompok || "-",
      Kecamatan: row.kecamatan || "-",
      Desa: row.desa || "-",
      "Jenis Kelompok": row.jenisKelompok || "-",
      "Kelas Kelompok": row.kelasKelompok || "-",
      "Luas Lahan (Ha)": row.luasLahanHa || 0,
      "Anggota Laki-laki": row.anggotaLaki || 0,
      "Anggota Perempuan": row.anggotaPerempuan || 0,
      "Total Anggota": (Number(row.anggotaLaki) || 0) + (Number(row.anggotaPerempuan) || 0),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Master_KTT");
    XLSX.writeFile(wb, `Database_Master_KTT_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-600/40 flex items-center justify-center animate-spin">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600" />
          </div>
          <p className="font-sans text-xs uppercase tracking-widest text-slate-500">
            Memuat Buku Register Kelompok Tani...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-20">
      
      {/* ── TOP HEADER (Tema Hijau - Lega & Bernapas) ── */}
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
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Database KTT</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Master Kelompok Tani Ternak
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

            {canEdit && (
              <button
                onClick={openAddModal}
                title="Tambah KTT"
                aria-label="Tambah KTT"
                className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-xs cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span className="hidden sm:inline">Tambah KTT</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
          
          {/* ── LEFT SIDEBAR: INDEKS KECAMATAN ── */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 font-sans">
                Wilayah Kecamatan
              </h3>
              <span className="text-[11px] font-sans text-slate-400">
                {kecamatanIndex.filter((k) => k.jumlah > 0).length}/26 Aktif
              </span>
            </div>

            <div className="max-h-[520px] overflow-y-auto space-y-1 pr-1">
              <button
                onClick={() => pilihKecamatan("")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  !filterKecamatan
                    ? "bg-emerald-600 text-white font-bold"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>Semua Wilayah</span>
                <span className="font-sans text-xs">{data.length}</span>
              </button>

              {kecamatanIndex.map(({ kecamatan, jumlah }) => {
                const active = filterKecamatan.trim().toUpperCase() === kecamatan.trim().toUpperCase();
                return (
                  <button
                    key={kecamatan}
                    onClick={() => pilihKecamatan(kecamatan)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      active
                        ? "bg-emerald-600 text-white font-bold shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>{kecamatan}</span>
                    <span className={`font-sans text-xs ${active ? "text-white" : "text-slate-400"}`}>
                      {jumlah}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── RIGHT MAIN: TABEL MASTER DATA ── */}
          <div className="space-y-4">
            
            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari kelompok, ketua, desa, nomor register..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full min-h-touch h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {filterKecamatan && desaList.length > 0 && (
                  <select
                    value={filterDesa}
                    onChange={(e) => {
                      setFilterDesa(e.target.value);
                      setPage(1);
                    }}
                    className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 focus:border-emerald-500 outline-none"
                  >
                    <option value="">Semua Desa ({filterKecamatan})</option>
                    {desaList.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                )}

                <select
                  value={filterJenis}
                  onChange={(e) => {
                    setFilterJenis(e.target.value);
                    setPage(1);
                  }}
                  className="min-h-touch h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 focus:border-emerald-500 outline-none"
                >
                  <option value="">Semua Jenis</option>
                  {JENIS_KELOMPOK_OPTIONS.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-4 w-12 text-center">NO</th>
                      <th className="p-4">NAMA KELOMPOK & REG</th>
                      <th className="p-4">LOKASI DESA / KEC</th>
                      <th className="p-4">KETUA KELOMPOK</th>
                      <th className="p-4 text-center">KELAS</th>
                      <th className="p-4 text-right">ANGGOTA</th>
                      {canEdit && <th className="p-4 text-center w-24">AKSI</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {paginated.length > 0 ? (
                      paginated.map((row, idx) => (
                        <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 text-center font-sans text-slate-400 text-xs">
                            {(currentPage - 1) * PAGE_SIZE + idx + 1}
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block text-sm">
                              {row.namaKelompok || '-'}
                            </span>
                            <span className="text-xs font-sans text-slate-500 block">
                              Reg: {row.nomorRegister || '-'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-slate-800 font-medium block text-xs">
                              {row.desa || '-'}
                            </span>
                            <span className="text-xs text-slate-500 font-sans">
                              Kec. {row.kecamatan || '-'}
                            </span>
                          </td>
                          <td className="p-4 text-slate-700 text-xs font-medium">
                            <span className="flex items-center gap-1.5">
                              <User size={13} className="text-slate-400 shrink-0" />
                              <span>{row.namaKetuaKelompok || '-'}</span>
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <KelasBadge kelas={row.kelasKelompok} />
                          </td>
                          <td className="p-4 text-right font-sans text-xs">
                            <span className="font-bold text-slate-900">
                              {(row.anggotaLaki || 0) + (row.anggotaPerempuan || 0)}
                            </span>
                            <span className="text-slate-400 text-[11px] block">
                              {row.anggotaLaki || 0}L · {row.anggotaPerempuan || 0}P
                            </span>
                          </td>
                          {canEdit && (
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => openEditModal(row)}
                                  className="min-h-touch h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors"
                                  aria-label="Edit"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(row)}
                                  className="min-h-touch h-8 w-8 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors"
                                  aria-label="Hapus"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-400 font-medium text-sm">
                          Tidak ada kelompok tani yang sesuai filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                <span className="font-sans">
                  Menampilkan {paginated.length} dari {filtered.length} kelompok terdaftar
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="min-h-touch h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1"
                  >
                    <ChevronLeft size={14} />
                    <span>Sebelumnya</span>
                  </button>

                  <span className="font-sans px-2">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="min-h-touch h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1"
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* ── MODAL FORM TAMBAH/EDIT ── */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {formMode === "tambah" ? "Tambah Kelompok Tani Baru" : "Edit Data Kelompok Tani"}
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Nama Kelompok Tani
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: KTT Lembu Agung"
                    value={formValues.namaKelompok}
                    onChange={(e) => setFormValues({ ...formValues, namaKelompok: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-emerald-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Nomor Register / SK
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 524/12/2024"
                    value={formValues.nomorRegister}
                    onChange={(e) => setFormValues({ ...formValues, nomorRegister: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-emerald-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Kecamatan
                  </label>
                  <select
                    required
                    value={formValues.kecamatan}
                    onChange={(e) => setFormValues({ ...formValues, kecamatan: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-emerald-500 focus:bg-white outline-none"
                  >
                    <option value="">Pilih Kecamatan</option>
                    {KECAMATAN_OPTIONS.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Desa / Kelurahan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama desa"
                    value={formValues.desa}
                    onChange={(e) => setFormValues({ ...formValues, desa: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-emerald-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Nama Ketua Kelompok
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama ketua"
                    value={formValues.namaKetuaKelompok}
                    onChange={(e) => setFormValues({ ...formValues, namaKetuaKelompok: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-emerald-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Kelas Kelompok
                  </label>
                  <select
                    value={formValues.kelasKelompok}
                    onChange={(e) => setFormValues({ ...formValues, kelasKelompok: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-emerald-500 focus:bg-white outline-none"
                  >
                    {KELAS_ORDER.map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Anggota Laki-laki
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formValues.anggotaLaki}
                    onChange={(e) => setFormValues({ ...formValues, anggotaLaki: parseInt(e.target.value) || 0 })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-emerald-500 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Anggota Perempuan
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formValues.anggotaPerempuan}
                    onChange={(e) => setFormValues({ ...formValues, anggotaPerempuan: parseInt(e.target.value) || 0 })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:border-emerald-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="min-h-touch h-10 px-4 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="min-h-touch h-10 px-5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm hover:bg-emerald-600/90 disabled:opacity-50"
                >
                  {isSaving ? "Menyimpan..." : "Simpan Kelompok"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI HAPUS ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle size={24} />
              <h3 className="font-bold text-base text-slate-900">Konfirmasi Hapus Data</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus data kelompok <span className="font-bold text-slate-900">{deleteTarget.namaKelompok}</span> di Desa {deleteTarget.desa}? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="min-h-touch h-10 px-4 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="min-h-touch h-10 px-5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}