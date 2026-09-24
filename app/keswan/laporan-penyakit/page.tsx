'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePageAuth } from '@/hooks/usePageAuth';
import { getAuthSession } from '@/lib/auth';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Download,
  Plus,
  Calendar,
  Map as MapIcon,
  FileSpreadsheet,
  ShieldCheck,
  Printer,
  Activity,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import {
  KECAMATAN_MAP_ITEMS,
  getZoneByKecamatanId,
} from '@/lib/penyakitData';
import { PenyakitFormValues } from '@/components/keswan/laporan-penyakit/types';
import PenyakitPetaTab from '@/components/keswan/laporan-penyakit/PenyakitPetaTab';
import PenyakitTableTab from '@/components/keswan/laporan-penyakit/PenyakitTableTab';
import PenyakitModals from '@/components/keswan/laporan-penyakit/PenyakitModals';
import { UniversalAuditModal } from '@/components/common/UniversalAuditModal';

export default function LaporanPenyakitPage() {
  const { isReady, canCreate, canEdit, isAdmin: isAuthAdmin, userRole } = usePageAuth('keswan', 'laporan-penyakit');

  // Role Admin Check: strictly only Administrator
  const isAdmin = useMemo(() => {
    return isAuthAdmin || canEdit || userRole === 'Administrator';
  }, [isAuthAdmin, canEdit, userRole]);

  // View state: 'map' (Peta Spasial) or 'table' (Rekapitulasi CRUD)
  const [activeView, setActiveView] = useState<'map' | 'table'>('map');

  // Year filter & dynamic multi-year state
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [availableYears, setAvailableYears] = useState<number[]>([2025, 2026]);
  const [showAddYearModal, setShowAddYearModal] = useState<boolean>(false);
  const [newYearInput, setNewYearInput] = useState<number>(2027);
  const [isAddingYear, setIsAddingYear] = useState<boolean>(false);

  // Data Kasus Penyakit dari Database
  const [casesList, setCasesList] = useState<any[]>([]);
  const [kecAggregates, setKecAggregates] = useState<Record<string, any>>({});
  const [totalKasus, setTotalKasus] = useState<number>(0);
  const [isLoadingCases, setIsLoadingCases] = useState<boolean>(true);

  // State Peta: Terpilih & Hover
  const [selectedKecamatan, setSelectedKecamatan] = useState<any | null>(null);
  const [hoveredKecamatan, setHoveredKecamatan] = useState<any | null>(null);

  // Table Filter & Search
  const [searchTable, setSearchTable] = useState<string>('');
  const [filterPuskeswan, setFilterPuskeswan] = useState<string>('ALL');
  const [filterDiagnosa, setFilterDiagnosa] = useState<string>('ALL');

  // Modal Tambah / Edit Kasus
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formValues, setFormValues] = useState<PenyakitFormValues>({
    kecamatan_id: 'k_alian',
    kecamatan_nama: 'Alian',
    puskeswan_id: 'alian',
    diagnosa_nama: 'Scabies',
    jumlah_kasus: 1,
    keterangan: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Audit State
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditTarget, setAuditTarget] = useState<any | null>(null);

  // ── LOAD AVAILABLE YEARS ──
  const loadAvailableYears = async () => {
    try {
      const res = await fetch('/api/laporan-penyakit?action=years');
      const json = await res.json();
      if (json.success && Array.isArray(json.years)) {
        setAvailableYears(json.years);
      }
    } catch (err) {
      console.warn('Gagal memuat tahun laporan penyakit:', err);
    }
  };

  // ── LOAD CASES FOR SELECTED YEAR ──
  const loadCasesData = async (year: number) => {
    try {
      setIsLoadingCases(true);
      const res = await fetch(`/api/laporan-penyakit?tahun=${year}`);
      const json = await res.json();
      if (json.success) {
        setCasesList(json.data || []);
        setKecAggregates(json.kecAggregates || {});
        setTotalKasus(json.totalKasus || 0);
      }
    } catch (err) {
      console.error('Gagal memuat data kasus:', err);
    } finally {
      setIsLoadingCases(false);
    }
  };

  useEffect(() => {
    loadAvailableYears();
    loadCasesData(selectedYear);
  }, []);

  useEffect(() => {
    loadCasesData(selectedYear);
  }, [selectedYear]);

  // ── TAMBAH TAHUN BARU HANDLER ──
  const handleAddYearSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearInput || newYearInput < 2000) {
      alert('Masukkan tahun yang valid');
      return;
    }

    try {
      setIsAddingYear(true);
      const res = await fetch('/api/laporan-penyakit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_year', tahun: newYearInput }),
      });
      const json = await res.json();
      if (json.success) {
        await loadAvailableYears();
        setSelectedYear(newYearInput);
        setShowAddYearModal(false);
        alert(`Periode Tahun ${newYearInput} berhasil ditambahkan!`);
      } else {
        alert(json.error || 'Gagal menambahkan tahun baru');
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsAddingYear(false);
    }
  };

  // Submit Tambah / Edit Kasus
  const handleCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && !canEdit) {
      alert('Hanya Administrator yang berhak mengedit data kasus penyakit.');
      return;
    }
    if (!editingItem && !canCreate) {
      alert('Anda tidak memiliki izin untuk menambah data.');
      return;
    }

    try {

      setIsSubmitting(true);
      const kec = KECAMATAN_MAP_ITEMS.find((k) => k.id === formValues.kecamatan_id);
      const zone = getZoneByKecamatanId(formValues.kecamatan_id);

      const payload = {
        tahun: selectedYear,
        kecamatan_id: formValues.kecamatan_id,
        kecamatan_nama: kec ? kec.nama : formValues.kecamatan_nama,
        puskeswan_id: zone ? zone.id : formValues.puskeswan_id,
        diagnosa_nama: formValues.diagnosa_nama,
        jumlah_kasus: Number(formValues.jumlah_kasus) || 0,
        keterangan: formValues.keterangan || null,
      };

      if (editingItem) {
        const res = await fetch(`/api/laporan-penyakit/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          setShowAddModal(false);
          setEditingItem(null);
          loadCasesData(selectedYear);
        } else {
          alert('Gagal memperbarui: ' + json.error);
        }
      } else {
        const res = await fetch('/api/laporan-penyakit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          setShowAddModal(false);
          loadCasesData(selectedYear);
        } else {
          alert('Gagal menambahkan: ' + json.error);
        }
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Case
  const handleDeleteCase = async (id: number) => {
    if (!isAdmin && !canEdit) {
      alert('Hanya Administrator yang berhak menghapus data.');
      return;
    }
    if (!confirm('Apakah Anda yakin ingin menghapus data kasus penyakit ini?')) return;

    try {
      const res = await fetch(`/api/laporan-penyakit/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadCasesData(selectedYear);
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Filtered Table Data
  const filteredCases = useMemo(() => {
    return casesList.filter((c) => {
      const q = searchTable.toLowerCase();
      const matchSearch =
        (c.kecamatan_nama || '').toLowerCase().includes(q) ||
        (c.diagnosa_nama || '').toLowerCase().includes(q) ||
        (c.keterangan || '').toLowerCase().includes(q);

      const zone = getZoneByKecamatanId(c.kecamatan_id);
      const matchPuskeswan = filterPuskeswan === 'ALL' || zone.id === filterPuskeswan || c.puskeswan_id === filterPuskeswan;
      const matchDiagnosa = filterDiagnosa === 'ALL' || c.diagnosa_nama === filterDiagnosa;

      return matchSearch && matchPuskeswan && matchDiagnosa;
    });
  }, [casesList, searchTable, filterPuskeswan, filterDiagnosa]);

  // Diagnosa & Kecamatan Tertinggi
  const topDiagnosa = useMemo(() => {
    const counts: Record<string, number> = {};
    casesList.forEach((c) => {
      counts[c.diagnosa_nama] = (counts[c.diagnosa_nama] || 0) + (c.jumlah_kasus || 1);
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { nama: sorted[0][0], count: sorted[0][1] } : { nama: '-', count: 0 };
  }, [casesList]);

  const topKecamatan = useMemo(() => {
    const counts: Record<string, number> = {};
    casesList.forEach((c) => {
      counts[c.kecamatan_nama] = (counts[c.kecamatan_nama] || 0) + (c.jumlah_kasus || 1);
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0] ? { nama: sorted[0][0], count: sorted[0][1] } : { nama: '-', count: 0 };
  }, [casesList]);

  // Export to Excel
  const handleExportExcel = () => {
    try {
      const wsData = casesList.map((c, i) => {
        const zone = getZoneByKecamatanId(c.kecamatan_id);
        return {
          No: i + 1,
          Tahun: selectedYear,
          Kecamatan: c.kecamatan_nama,
          'Wilayah Puskeswan': zone ? zone.nama : c.puskeswan_id,
          'Diagnosa Penyakit': c.diagnosa_nama,
          'Jumlah Kasus (Ekor)': c.jumlah_kasus,
          Keterangan: c.keterangan || '-',
        };
      });
      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Kasus_Penyakit_${selectedYear}`);
      XLSX.writeFile(wb, `Laporan_Penyakit_Hewan_Kebumen_${selectedYear}.xlsx`);
    } catch {
      alert('Gagal mengekspor file Excel.');
    }
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-blue-50/20 text-slate-900 font-sans selection:bg-blue-600 selection:text-white pb-24">
      {/* ── TOP HEADER ── */}
      <header className="border-b border-blue-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 min-h-[64px] sm:min-h-[88px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/keswan"
              className="min-h-touch min-w-touch w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Modul Keswan"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/keswan" className="text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors truncate">
                  Kesehatan Hewan (Keswan)
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-blue-700 whitespace-nowrap">Laporan Penyakit</span>
              </div>
              <h1 className="text-sm sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight line-clamp-2 sm:line-clamp-none">
                Peta &amp; Rekapitulasi Kasus Penyakit Hewan
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => window.print()}
              title="Cetak / PDF"
              aria-label="Cetak / PDF"
              className="min-h-touch min-w-touch h-10 w-10 sm:w-auto sm:px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center sm:gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Cetak / PDF</span>
            </button>

            <button
              onClick={handleExportExcel}
              title="Export Excel"
              aria-label="Export Excel"
              className="min-h-touch min-w-touch h-10 w-10 sm:w-auto sm:px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center sm:gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Download size={15} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            {canCreate && (
              <button
                onClick={() => {
                  setEditingItem(null);
                  setFormValues({
                    kecamatan_id: 'k_alian',
                    kecamatan_nama: 'Alian',
                    puskeswan_id: 'alian',
                    diagnosa_nama: 'Scabies',
                    jumlah_kasus: 1,
                    keterangan: '',
                  });
                  setShowAddModal(true);
                }}
                title="Tambah Kasus"
                aria-label="Tambah Kasus"
                className="min-h-touch min-w-touch h-10 w-10 sm:w-auto sm:px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center sm:gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span className="hidden sm:inline">Tambah Kasus</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Opsi Pilihan Tahun di Tengah */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-white p-3.5 rounded-2xl border border-blue-200 shadow-xs max-w-xl mx-auto print:hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70">
            <Calendar className="text-blue-700" size={16} />
            <span className="text-xs font-bold text-blue-900">Pilih Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-black text-blue-800 focus:outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>Tahun {yr}</option>
              ))}
            </select>
          </div>

          {isAdmin && (
            <button
              onClick={() => {
                const maxYear = Math.max(...availableYears, 2026);
                setNewYearInput(maxYear + 1);
                setShowAddYearModal(true);
              }}
              className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>+ Tambah Tahun Baru</span>
            </button>
          )}
        </div>

        {/* KPI Metrik Ringkasan */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 print:hidden">
          <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Activity size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">Total Kasus Penyakit</p>
              <p className="text-xl font-black text-slate-900">{totalKasus.toLocaleString('id-ID')} <span className="text-xs text-slate-500 font-semibold">Kasus</span></p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <AlertTriangle size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">Diagnosa Tertinggi</p>
              <p className="text-base font-extrabold text-slate-900 truncate">
                {topDiagnosa.nama} <span className="text-xs text-rose-600 font-bold">({topDiagnosa.count})</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <MapPin size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">Wilayah Kasus Terbanyak</p>
              <p className="text-base font-extrabold text-slate-900 truncate">
                Kec. {topKecamatan.nama} <span className="text-xs text-amber-600 font-bold">({topKecamatan.count})</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">Status Hak Akses</p>
              <p className="text-xs font-black text-slate-900 flex items-center gap-1.5 truncate">
                <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-blue-600' : 'bg-emerald-500'}`} />
                <span>{isAdmin ? 'Administrator (Full CRUD)' : canEdit ? 'Operator (Bisa Edit)' : 'Pengunjung (View-Only)'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-blue-100 shadow-xs print:hidden">
          <button
            onClick={() => setActiveView('map')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === 'map'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            <MapIcon size={16} />
            <span>Peta Sebaran Spasial &amp; Legenda Diagnosa</span>
          </button>

          <button
            onClick={() => setActiveView('table')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeView === 'table'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50'
            }`}
          >
            <FileSpreadsheet size={16} />
            <span>Tabel Rekapitulasi Data Kasus ({filteredCases.length} Baris)</span>
          </button>
        </div>

        {/* View 1: Peta Spasial */}
        {activeView === 'map' && (
          <PenyakitPetaTab
            selectedYear={selectedYear}
            selectedKecamatan={selectedKecamatan}
            setSelectedKecamatan={setSelectedKecamatan}
            hoveredKecamatan={hoveredKecamatan}
            setHoveredKecamatan={setHoveredKecamatan}
            kecAggregates={kecAggregates}
          />
        )}

        {/* View 2: Tabel Rekapitulasi */}
        {activeView === 'table' && (
          <PenyakitTableTab
            searchTable={searchTable}
            setSearchTable={setSearchTable}
            filterPuskeswan={filterPuskeswan}
            setFilterPuskeswan={setFilterPuskeswan}
            filterDiagnosa={filterDiagnosa}
            setFilterDiagnosa={setFilterDiagnosa}
            filteredCases={filteredCases}
            isLoadingCases={isLoadingCases}
            isAdmin={isAdmin}
            canEdit={canEdit}
            setEditingItem={setEditingItem}
            setFormValues={setFormValues}
            setShowAddModal={setShowAddModal}
            handleDeleteCase={handleDeleteCase}
            onShowHistory={(row) => {
              setAuditTarget(row);
              setShowAuditModal(true);
            }}
          />
        )}
      </main>

      {/* Modals */}
      <PenyakitModals
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        editingItem={editingItem}
        selectedYear={selectedYear}
        formValues={formValues}
        setFormValues={setFormValues}
        handleCaseSubmit={handleCaseSubmit}
        isSubmitting={isSubmitting}
        showAddYearModal={showAddYearModal}
        setShowAddYearModal={setShowAddYearModal}
        newYearInput={newYearInput}
        setNewYearInput={setNewYearInput}
        handleAddYearSubmit={handleAddYearSubmit}
        isAddingYear={isAddingYear}
      />

      {showAuditModal && auditTarget && (
        <UniversalAuditModal
          isOpen={showAuditModal}
          onClose={() => setShowAuditModal(false)}
          recordId={auditTarget.id}
          tableName="keswan_laporan_penyakit"
          moduleKey="keswan"
          submenuKey="laporan-penyakit"
          availableFields={[
            { key: 'tahun', label: 'Tahun', type: 'number' },
            { key: 'kecamatan_nama', label: 'Kecamatan' },
            { key: 'puskeswan_id', label: 'Puskeswan' },
            { key: 'diagnosa_nama', label: 'Diagnosa Penyakit' },
            { key: 'kategori_penyakit', label: 'Kategori Penyakit' },
            { key: 'jumlah_kasus', label: 'Jumlah Kasus', type: 'number' },
            { key: 'keterangan', label: 'Keterangan' },
          ]}
        />
      )}
    </div>
  );
}
