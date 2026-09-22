'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { ArrowLeft, Plus, Download } from 'lucide-react';
import { usePageAuth } from '@/hooks/usePageAuth';

import {
  KelompokTani,
  KelompokTaniFormValues,
  emptyFormValues,
  KECAMATAN_OPTIONS,
  PAGE_SIZE,
} from '@/components/bitpro/database-ktt/types';
import KttSidebar from '@/components/bitpro/database-ktt/KttSidebar';
import KttTableSection from '@/components/bitpro/database-ktt/KttTableSection';
import KttModals from '@/components/bitpro/database-ktt/KttModals';

export default function DatabaseKTTPage() {
  const [data, setData] = useState<KelompokTani[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [filterKecamatan, setFilterKecamatan] = useState('');
  const [filterDesa, setFilterDesa] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'tambah' | 'edit'>('tambah');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<KelompokTaniFormValues>(emptyFormValues);
  const [deleteTarget, setDeleteTarget] = useState<KelompokTani | null>(null);

  const { isReady, canCreate, canEdit } = usePageAuth('bitpro', 'database-ktt');


  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ktt');
      const jsonData = await res.json();
      let validData: KelompokTani[] = [];
      if (Array.isArray(jsonData)) {
        validData = jsonData;
      } else if (jsonData && typeof jsonData === 'object') {
        const foundArray = Object.values(jsonData).find((val) => Array.isArray(val));
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
      .filter((d) => (d.kecamatan || '').trim().toUpperCase() === filterKecamatan.trim().toUpperCase())
      .map((d) => d.desa);
    return Array.from(new Set(desas)).sort();
  }, [data, filterKecamatan]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter((row) => {
      const namaKel = row.namaKelompok ? row.namaKelompok.toLowerCase() : '';
      const namaKet = row.namaKetuaKelompok ? row.namaKetuaKelompok.toLowerCase() : '';
      const nmrReg = row.nomorRegister ? row.nomorRegister.toLowerCase() : '';
      const nmDesa = row.desa ? row.desa.toLowerCase() : '';

      const matchSearch =
        !q || namaKel.includes(q) || namaKet.includes(q) || nmDesa.includes(q) || nmrReg.includes(q);
      const matchKecamatan =
        !filterKecamatan ||
        (row.kecamatan || '').trim().toUpperCase() === filterKecamatan.trim().toUpperCase();
      const matchDesa =
        !filterDesa || (row.desa || '').trim().toUpperCase() === filterDesa.trim().toUpperCase();
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
      setFilterDesa('');
    } else {
      setFilterKecamatan('');
      setFilterDesa('');
    }
    setPage(1);
  }

  function openAddModal() {
    setFormMode('tambah');
    setEditingId(null);
    setFormValues(emptyFormValues);
    setFormOpen(true);
  }

  function openEditModal(row: KelompokTani) {
    setFormMode('edit');
    setEditingId(row.id);
    const { id, ...rest } = row;
    setFormValues(rest);
    setFormOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formMode === 'edit' && !canEdit) {
      alert('Hanya Administrator yang memiliki hak akses untuk mengubah (edit) data!');
      return;
    }
    if (formMode === 'tambah' && !canCreate) {
      alert('Anda tidak memiliki hak akses untuk menambah data!');
      return;
    }
    setIsSaving(true);
    try {
      await fetch('/api/ktt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...formValues }),
      });
      await loadData();
      setFormOpen(false);
    } catch {
      alert('Gagal menyimpan data KTT!');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    if (!canEdit) {
      alert('Hanya Administrator yang memiliki hak akses untuk menghapus data!');
      return;
    }
    try {
      await fetch(`/api/ktt?id=${deleteTarget.id}`, { method: 'DELETE' });
      await loadData();
      setDeleteTarget(null);
    } catch {
      alert('Gagal menghapus data KTT!');
    }
  }


  const handleExportExcel = () => {
    if (data.length === 0) return alert('Belum ada data KTT untuk diekspor!');
    const exportData = filtered.map((row, idx) => ({
      No: idx + 1,
      'Nomor Register': row.nomorRegister || '-',
      'Nama Kelompok': row.namaKelompok || '-',
      'Ketua Kelompok': row.namaKetuaKelompok || '-',
      Kecamatan: row.kecamatan || '-',
      Desa: row.desa || '-',
      'Jenis Kelompok': row.jenisKelompok || '-',
      'Kelas Kelompok': row.kelasKelompok || '-',
      'Luas Lahan (Ha)': row.luasLahanHa || 0,
      'Anggota Laki-laki': row.anggotaLaki || 0,
      'Anggota Perempuan': row.anggotaPerempuan || 0,
      'Total Anggota': (Number(row.anggotaLaki) || 0) + (Number(row.anggotaPerempuan) || 0),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Master_KTT');
    XLSX.writeFile(wb, `Database_Master_KTT_${new Date().toISOString().split('T')[0]}.xlsx`);
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
      {/* ── TOP HEADER (Tema Hijau Bitpro) ── */}
      <header className="border-b border-emerald-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 min-h-[64px] sm:min-h-[88px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/bitpro"
              className="min-h-touch min-w-touch w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
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

            {canCreate && (
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
          {/* Left Sidebar: Indeks Kecamatan */}
          <KttSidebar
            totalCount={data.length}
            kecamatanIndex={kecamatanIndex}
            filterKecamatan={filterKecamatan}
            onPilihKecamatan={pilihKecamatan}
          />

          {/* Right Main: Master Table */}
          <KttTableSection
            dataCount={data.length}
            paginated={paginated}
            filteredCount={filtered.length}
            search={search}
            setSearch={setSearch}
            filterKecamatan={filterKecamatan}
            filterDesa={filterDesa}
            setFilterDesa={setFilterDesa}
            filterJenis={filterJenis}
            setFilterJenis={setFilterJenis}
            desaList={desaList}
            page={page}
            totalPages={totalPages}
            currentPage={currentPage}
            setPage={setPage}
            canEdit={canEdit}
            onEdit={openEditModal}
            onDelete={(row) => setDeleteTarget(row)}
          />
        </div>
      </main>

      {/* Modals */}
      <KttModals
        formOpen={formOpen}
        formMode={formMode}
        formValues={formValues}
        setFormValues={setFormValues}
        isSaving={isSaving}
        onCloseForm={() => setFormOpen(false)}
        onSubmitForm={handleFormSubmit}
        deleteTarget={deleteTarget}
        onCloseDelete={() => setDeleteTarget(null)}
        onConfirmDelete={handleDeleteConfirm}
      />
    </div>
  );
}