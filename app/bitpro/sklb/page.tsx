'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePageAuth } from '@/hooks/usePageAuth';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  Filter,
  Calendar,
  Map as MapIcon,
  Activity,
  CheckCircle2,
  Loader2,
  MapPin,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  KECAMATAN_ITEMS,
  KEBUMEN_MAP_VIEWBOX,
  getSapiPOColor,
  SAPI_PO_LEGEND,
} from '@/lib/sklbPetaData';

export default function UnifiedSKLBPage() {
  const { isReady, canEdit, handleLogout: authLogout } = usePageAuth('bitpro', 'sklb');

  // ── SAPI PO PETA & MULTI-YEAR STATE ──
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [availableYears, setAvailableYears] = useState<number[]>([2025, 2026]);
  const [showAddYearModal, setShowAddYearModal] = useState<boolean>(false);
  const [newYearInput, setNewYearInput] = useState<number>(2027);
  const [isAddingYear, setIsAddingYear] = useState<boolean>(false);

  const [sapiPOData, setSapiPOData] = useState<any[]>([]);
  const [sapiPOKecMap, setSapiPOKecMap] = useState<Record<string, number>>({});
  const [totalSapiPO, setTotalSapiPO] = useState<number>(50450);
  const [triwulanText, setTriwulanText] = useState<string>('Triwulan 2');
  const [isLoadingSapiPO, setIsLoadingSapiPO] = useState<boolean>(true);

  const [selectedKecamatan, setSelectedKecamatan] = useState<any | null>(null);
  const [hoveredKecamatan, setHoveredKecamatan] = useState<any | null>(null);

  // Modal Input / Edit Populasi Sapi PO
  const [modalSapiPO, setModalSapiPO] = useState<{ open: boolean; item: any | null }>({
    open: false,
    item: null,
  });
  const [formSapiPO, setFormSapiPO] = useState({
    kecamatan_id: 'ayah',
    kecamatan_nama: 'Ayah',
    populasi: 3070,
    triwulan: 'Triwulan 2',
    keterangan: '',
  });
  const [isSavingSapiPO, setIsSavingSapiPO] = useState<boolean>(false);

  // ── EXISTING SKLB TABS & DATA STATE ──
  const [activeTab, setActiveTab] = useState<'rekap' | 'detail'>('rekap');

  // Rekapitulasi State
  const [dataRekap, setDataRekap] = useState<any[]>([]);
  const [isSyncingRekap, setIsSyncingRekap] = useState(false);
  const [modalRekap, setModalRekap] = useState<{ open: boolean; mode: 'tambah' | 'edit'; data: any }>({
    open: false,
    mode: 'tambah',
    data: null,
  });

  // Master Detail Sapi State
  const [dataDetail, setDataDetail] = useState<any[]>([]);
  const [isSyncingDetail, setIsSyncingDetail] = useState(false);
  const [search, setSearch] = useState('');
  const [filterDesa, setFilterDesa] = useState('Semua');
  const [modalDetail, setModalDetail] = useState<{ open: boolean; mode: 'tambah' | 'edit'; data: any }>({
    open: false,
    mode: 'tambah',
    data: null,
  });

  // ── LOAD AVAILABLE YEARS ──
  const loadAvailableYears = async () => {
    try {
      const res = await fetch('/api/sklb-sapi-po?action=years');
      const json = await res.json();
      if (json.success && Array.isArray(json.years)) {
        setAvailableYears(json.years);
      }
    } catch (err) {
      console.warn('Gagal memuat tahun SKLB:', err);
    }
  };

  // ── LOAD SAPI PO MAP DATA PER TAHUN ──
  const loadSapiPOData = async (year: number) => {
    try {
      setIsLoadingSapiPO(true);
      const res = await fetch(`/api/sklb-sapi-po?tahun=${year}`);
      const json = await res.json();
      if (json.success) {
        setSapiPOData(json.data || []);
        setSapiPOKecMap(json.kecMap || {});
        setTotalSapiPO(json.totalPopulasi || 0);
        if (json.triwulan) setTriwulanText(json.triwulan);
      }
    } catch (err) {
      console.error('Gagal memuat data populasi Sapi PO:', err);
    } finally {
      setIsLoadingSapiPO(false);
    }
  };

  // ── LOAD TABEL REKAP & DETAIL PER TAHUN ──
  const loadTablesData = async (year: number) => {
    try {
      const [resRekap, resDetail] = await Promise.all([
        fetch(`/api/sync-sklb-summary?tahun=${year}`),
        fetch(`/api/sync-sklb-detail?tahun=${year}`),
      ]);
      const jsonRekap = await resRekap.json();
      const jsonDetail = await resDetail.json();

      if (jsonRekap.success && Array.isArray(jsonRekap.data)) {
        setDataRekap(jsonRekap.data);
      }
      if (jsonDetail.success && Array.isArray(jsonDetail.data)) {
        setDataDetail(jsonDetail.data);
      }
    } catch (err) {
      console.error('Gagal memuat data tabel SKLB:', err);
    }
  };

  // Trigger load saat inisialisasi & saat tahun berubah
  useEffect(() => {
    loadAvailableYears();
  }, []);

  useEffect(() => {
    loadSapiPOData(selectedYear);
    loadTablesData(selectedYear);
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
      const res = await fetch('/api/sklb-sapi-po', {
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

  // ── SAVE POPULASI SAPI PO HANDLER ──
  const handleSaveSapiPO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    try {
      setIsSavingSapiPO(true);
      const kecItem = KECAMATAN_ITEMS.find((k) => k.id === formSapiPO.kecamatan_id || k.id.replace('k_', '') === formSapiPO.kecamatan_id);
      const payload = {
        tahun: selectedYear,
        kecamatan_id: formSapiPO.kecamatan_id,
        kecamatan_nama: kecItem ? kecItem.nama : formSapiPO.kecamatan_nama,
        populasi: Number(formSapiPO.populasi) || 0,
        triwulan: formSapiPO.triwulan || 'Triwulan 2',
        keterangan: formSapiPO.keterangan || null,
      };

      const res = await fetch('/api/sklb-sapi-po', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setModalSapiPO({ open: false, item: null });
        loadSapiPOData(selectedYear);
      } else {
        alert('Gagal menyimpan: ' + json.error);
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsSavingSapiPO(false);
    }
  };

  // ── STATS HIGHLIGHT ──
  const topKecamatan = useMemo(() => {
    const entries = Object.entries(sapiPOKecMap);
    if (entries.length === 0) return { nama: '-', pop: 0 };
    entries.sort((a, b) => b[1] - a[1]);
    const topItem = KECAMATAN_ITEMS.find((k) => k.id.toLowerCase() === entries[0][0] || k.id.toLowerCase().replace('k_', '') === entries[0][0]);
    return { nama: topItem ? topItem.nama : entries[0][0], pop: entries[0][1] };
  }, [sapiPOKecMap]);

  // ── SYNC & EXPORT HANDLERS ──
  const handleSyncRekap = async () => {
    setIsSyncingRekap(true);
    try {
      const res = await fetch(`/api/sync-sklb-summary?tahun=${selectedYear}`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        setDataRekap(result.data);
        alert('Data rekapitulasi SKLB berhasil disinkronkan!');
      } else {
        alert('Gagal: ' + result.error);
      }
    } catch {
      alert('Gagal terhubung ke API Rekap.');
    } finally {
      setIsSyncingRekap(false);
    }
  };

  const handleSyncDetail = async () => {
    setIsSyncingDetail(true);
    try {
      const res = await fetch(`/api/sync-sklb-detail?tahun=${selectedYear}`, { method: 'POST' });
      const result = await res.json();
      if (result.success) {
        setDataDetail(result.data);
        alert(result.message);
      } else {
        alert('Gagal: ' + result.error);
      }
    } catch {
      alert('Gagal terhubung ke API Detail.');
    } finally {
      setIsSyncingDetail(false);
    }
  };

  const handleExportExcel = () => {
    try {
      const wsSapiPO = XLSX.utils.json_to_sheet(
        KECAMATAN_ITEMS.map((k, i) => {
          const cleanId = k.id.toLowerCase().replace('k_', '');
          const pop = sapiPOKecMap[cleanId] || sapiPOKecMap[k.id] || 0;
          return {
            No: i + 1,
            Tahun: selectedYear,
            Kecamatan: k.nama,
            'Populasi Sapi PO (Ekor)': pop,
            Triwulan: triwulanText,
          };
        })
      );

      const wsRekap = XLSX.utils.json_to_sheet(
        dataRekap.map((d) => ({
          No: d.no_urut,
          Tahun: selectedYear,
          Tanggal: d.tanggal,
          Desa: d.desa,
          Kecamatan: d.kecamatan,
          Target: d.target,
          Capaian: d.capaian,
          Selisih: d.selisih,
          'Grup Tim': d.grup,
        }))
      );

      const wsDetail = XLSX.utils.json_to_sheet(
        dataDetail.map((d) => ({
          Desa: d.desa_lokasi,
          Pemilik: d.nama_pemilik,
          Dusun: d.dusun,
          RT: d.rt,
          RW: d.rw,
          'Nama Sapi': d.nama_sapi,
          Kelamin: d.jenis_kelamin,
          'Umur (Bulan)': d.umur_bulan,
          'Tinggi Pundak (cm)': d.tinggi_pundak,
          'Panjang Badan (cm)': d.panjang_badan,
          'Lingkar Dada (cm)': d.lingkar_dada,
          'Berat Badan (kg)': d.berat_badan,
        }))
      );

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, wsSapiPO, `Populasi_Sapi_PO_${selectedYear}`);
      XLSX.utils.book_append_sheet(wb, wsRekap, `Rekap_SKLB_${selectedYear}`);
      XLSX.utils.book_append_sheet(wb, wsDetail, `Master_Detail_${selectedYear}`);
      XLSX.writeFile(wb, `Data_SKLB_Sapi_PO_Kebumen_${selectedYear}.xlsx`);
    } catch {
      alert('Gagal mengekspor file Excel.');
    }
  };

  // ── REKAP CRUD HANDLERS ──
  const handleSaveRekap = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = { ...modalRekap.data, tahun: selectedYear };
    try {
      if (modalRekap.mode === 'tambah') {
        const res = await fetch('/api/sync-sklb-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          alert('Data rekapitulasi berhasil ditambahkan ke database!');
          loadTablesData(selectedYear);
        } else {
          alert('Gagal menyimpan: ' + json.error);
        }
      } else {
        const res = await fetch('/api/sync-sklb-summary', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          alert('Data rekapitulasi berhasil diperbarui di database!');
          loadTablesData(selectedYear);
        } else {
          alert('Gagal memperbarui: ' + json.error);
        }
      }
    } catch {
      alert('Terjadi kesalahan saat menyimpan ke database.');
    }
    setModalRekap({ open: false, mode: 'tambah', data: null });
  };

  const handleDeleteRekap = async (id: number) => {
    if (confirm('Hapus data rekap ini dari database?')) {
      try {
        const res = await fetch(`/api/sync-sklb-summary?id=${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          setDataRekap((prev) => prev.filter((d) => d.id !== id));
        } else {
          alert('Gagal menghapus: ' + json.error);
        }
      } catch {
        alert('Terjadi kesalahan saat menghapus data.');
      }
    }
  };

  // ── DETAIL CRUD HANDLERS ──
  const handleSaveDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = { ...modalDetail.data, tahun: selectedYear };
    try {
      if (modalDetail.mode === 'tambah') {
        const res = await fetch('/api/sync-sklb-detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          alert('Data sapi berhasil disimpan ke database!');
          loadTablesData(selectedYear);
        } else {
          alert('Gagal menyimpan: ' + json.error);
        }
      } else {
        const res = await fetch('/api/sync-sklb-detail', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (json.success) {
          alert('Data sapi berhasil diperbarui di database!');
          loadTablesData(selectedYear);
        } else {
          alert('Gagal memperbarui: ' + json.error);
        }
      }
    } catch {
      alert('Terjadi kesalahan saat menyimpan ke database.');
    }
    setModalDetail({ open: false, mode: 'tambah', data: null });
  };

  const handleDeleteDetail = async (id: any) => {
    if (confirm('Hapus data sapi ini dari database?')) {
      try {
        const res = await fetch(`/api/sync-sklb-detail?id=${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          setDataDetail((prev) => prev.filter((d) => d.id !== id));
        } else {
          alert('Gagal menghapus: ' + json.error);
        }
      } catch {
        alert('Terjadi kesalahan saat menghapus data.');
      }
    }
  };

  const tabelKiri = dataRekap.filter((d) => d.grup === 'Tabel Kiri').sort((a, b) => a.no_urut - b.no_urut);
  const tabelKanan = dataRekap.filter((d) => d.grup === 'Tabel Kanan').sort((a, b) => a.no_urut - b.no_urut);
  const sum = (data: any[], key: string) => data.reduce((acc, row) => acc + (row[key] || 0), 0);

  const daftarDesa = useMemo(() => {
    const unik = Array.from(new Set(dataDetail.map((d) => d.desa_lokasi)));
    return ['Semua', ...unik];
  }, [dataDetail]);

  const filteredData = useMemo(() => {
    return dataDetail.filter((item) => {
      const matchDesa = filterDesa === 'Semua' || item.desa_lokasi === filterDesa;
      const matchSearch =
        item.nama_pemilik?.toLowerCase().includes(search.toLowerCase()) ||
        item.nama_sapi?.toLowerCase().includes(search.toLowerCase());
      return matchDesa && matchSearch;
    });
  }, [dataDetail, filterDesa, search]);

  // ── TABEL CAPAIAN DENGAN BORDER RAPI & TANPA ROUNDED (SESUAI PERMINTAAN USER) ──
  const TabelRekapCapaian = ({ data, judul, grup }: { data: any[]; judul: string; grup: string }) => (
    <div className="rounded-none border-2 border-slate-300 bg-white overflow-hidden flex flex-col h-full">
      <div className="p-3.5 bg-slate-100 border-b-2 border-slate-300 flex items-center justify-between">
        <div>
          <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 uppercase tracking-tight">{judul}</h3>
          <span className="text-[11px] font-sans text-slate-600">{data.length} Lokasi Terjadwal</span>
        </div>
        {canEdit && (
          <button
            onClick={() =>
              setModalRekap({ open: true, mode: 'tambah', data: { grup, no_urut: data.length + 1, tahun: selectedYear } })
            }
            className="rounded-none min-h-touch h-8 px-3 bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} />
            <span>Tambah</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto flex-grow">
        <table className="w-full text-xs text-center whitespace-nowrap border-collapse">
          <thead className="bg-slate-200/90 text-slate-800 font-bold uppercase tracking-wider border-b-2 border-slate-300">
            <tr>
              <th className="p-2.5 border border-slate-300 w-10">NO</th>
              <th className="p-2.5 border border-slate-300">TANGGAL</th>
              <th className="p-2.5 border border-slate-300 text-left">DESA</th>
              <th className="p-2.5 border border-slate-300 text-left">KECAMATAN</th>
              <th className="p-2.5 border border-slate-300 font-sans">TARGET</th>
              <th className="p-2.5 border border-slate-300 font-sans">CAPAIAN</th>
              <th className="p-2.5 border border-slate-300 font-sans">SELISIH</th>
              {canEdit && <th className="p-2.5 border border-slate-300 w-20">AKSI</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-900 font-medium">
            {data.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 8 : 7} className="p-8 text-center text-slate-400 font-semibold">
                  Belum ada data untuk tahun {selectedYear}. Klik &quot;Tarik Data Rekap&quot; atau &quot;+ Tambah&quot;.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id || row.no_urut} className="hover:bg-slate-50 transition-colors">
                  <td className="p-2.5 border border-slate-200 font-sans text-slate-500">{row.no_urut}</td>
                  <td className="p-2.5 border border-slate-200 font-sans">{row.tanggal}</td>
                  <td className="p-2.5 border border-slate-200 font-bold text-slate-900 text-left">{row.desa}</td>
                  <td className="p-2.5 border border-slate-200 text-slate-700 text-left">{row.kecamatan}</td>
                  <td className="p-2.5 border border-slate-200 font-sans font-bold">{row.target}</td>
                  <td className="p-2.5 border border-slate-200 font-sans font-black text-emerald-700">{row.capaian}</td>
                  <td className="p-2.5 border border-slate-200 font-sans font-bold text-slate-800">{row.selisih}</td>
                  {canEdit && (
                    <td className="p-2.5 border border-slate-200">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setModalRekap({ open: true, mode: 'edit', data: row })}
                          className="rounded-none h-7 w-7 border border-slate-300 bg-white text-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-100"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteRekap(row.id)}
                          className="rounded-none h-7 w-7 border border-rose-300 bg-rose-50 text-rose-700 flex items-center justify-center cursor-pointer hover:bg-rose-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          {data.length > 0 && (
            <tfoot>
              <tr className="bg-slate-200 font-black text-slate-900 border-t-2 border-slate-400">
                <td colSpan={4} className="p-2.5 border border-slate-300 text-right uppercase">
                  TOTAL
                </td>
                <td className="p-2.5 border border-slate-300 font-sans">{sum(data, 'target')}</td>
                <td className="p-2.5 border border-slate-300 font-sans text-emerald-800">{sum(data, 'capaian')}</td>
                <td className="p-2.5 border border-slate-300 font-sans">{sum(data, 'selisih')}</td>
                {canEdit && <td className="p-2.5 border border-slate-300" />}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-24">
      
      {/* ── TOP HEADER (Tema Hijau Bitpro) ── */}
      <header className="border-b border-emerald-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex flex-col md:flex-row md:items-center justify-between gap-4">
          
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
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Sertifikat SKLB &amp; Sapi PO</span>
              </div>
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                Surat Keterangan Layak Bibit (SKLB)
              </h1>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {/* Input / Edit Populasi Sapi PO */}
            {canEdit && (
              <button
                onClick={() => {
                  setModalSapiPO({ open: true, item: null });
                  setFormSapiPO({
                    kecamatan_id: 'ayah',
                    kecamatan_nama: 'Ayah',
                    populasi: sapiPOKecMap['ayah'] || 3070,
                    triwulan: triwulanText,
                    keterangan: '',
                  });
                }}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Input Data Sapi PO</span>
              </button>
            )}

            {/* Export Excel */}
            <button
              onClick={handleExportExcel}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Download size={15} />
              <span>Export Excel</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* ═══════════════════════════════════════════════════════════════
            Opsi Pilihan Tahun di Tengah di Atas Peta (Sesuai Permintaan)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-white p-3.5 rounded-2xl border border-emerald-200 shadow-xs max-w-xl mx-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50/70">
            <Calendar className="text-emerald-700" size={16} />
            <span className="text-xs font-bold text-emerald-900">Pilih Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-black text-emerald-900 focus:outline-none cursor-pointer"
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>Tahun {yr}</option>
              ))}
            </select>
          </div>

          {canEdit && (
            <button
              onClick={() => {
                const maxYear = Math.max(...availableYears, 2026);
                setNewYearInput(maxYear + 1);
                setShowAddYearModal(true);
              }}
              className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Tahun Baru</span>
            </button>
          )}
        </div>

        {/* ───────────────────────────────────────────────────────────
            1. PETA SEBARAN POPULASI SAPI PO (TEMA HIJAU RAPI & BERSIH)
        ─────────────────────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-8 space-y-6 relative overflow-hidden">
          
          {/* Header Judul Peta Rapi */}
          <div className="text-center space-y-1 pb-4 border-b border-slate-100">
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              Peta Sebaran Populasi Sapi PO di Kabupaten Kebumen
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-emerald-800">
              Peranakan Ongole &bull; Agregasi Tingkat Kecamatan &bull; Tahun {selectedYear}
            </p>
          </div>

          {/* Grid Layout: Peta di Kiri & Panel Samping di Kanan */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ── AREA PETA INTERAKTIF SVG (HIJAU EMERALD TEMA BITPRO) ── */}
            <div className="lg:col-span-8 xl:col-span-9 bg-slate-50/70 border border-slate-200/90 rounded-3xl p-4 sm:p-6 relative overflow-hidden flex flex-col items-center">
              
              {/* Petunjuk & Reset Button */}
              <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  <Sparkles size={14} className="text-emerald-600 shrink-0" />
                  <span>Klik kecamatan di peta untuk melihat rincian &amp; edit data</span>
                </span>

                {selectedKecamatan && (
                  <button
                    onClick={() => setSelectedKecamatan(null)}
                    className="px-3 py-1 rounded-xl bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                  >
                    <X size={13} />
                    <span>Reset Fokus</span>
                  </button>
                )}
              </div>

              {/* Peta SVG Kebumen */}
              <div className="relative w-full aspect-[16/11] min-h-[480px] sm:min-h-[580px] flex items-center justify-center select-none">
                <svg
                  viewBox={KEBUMEN_MAP_VIEWBOX}
                  className="w-full h-full"
                  style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.05))' }}
                >
                  {/* Background Reset Area */}
                  <rect
                    x="-6000"
                    y="1000"
                    width="35000"
                    height="28000"
                    fill="transparent"
                    onClick={() => setSelectedKecamatan(null)}
                  />

                  {/* 26 Poligon Kecamatan */}
                  {KECAMATAN_ITEMS.map((kec) => {
                    const cleanId = kec.id.toLowerCase().replace('k_', '');
                    const pop = sapiPOKecMap[cleanId] || sapiPOKecMap[kec.id] || 0;
                    const colorInfo = getSapiPOColor(pop);

                    const isSelected = selectedKecamatan?.id === kec.id;
                    const isHovered = hoveredKecamatan?.id === kec.id;

                    const commonProps = {
                      fill: colorInfo.fill,
                      stroke: isSelected ? '#064E3B' : isHovered ? '#0F172A' : '#FFFFFF',
                      strokeWidth: isSelected ? 90 : isHovered ? 60 : 35,
                      strokeLinejoin: 'round' as const,
                      strokeLinecap: 'round' as const,
                      className: 'cursor-pointer transition-all duration-150 opacity-95 hover:opacity-100',
                      onMouseEnter: () => setHoveredKecamatan(kec),
                      onMouseLeave: () => setHoveredKecamatan(null),
                      onClick: (e: React.MouseEvent) => {
                        e.stopPropagation();
                        setSelectedKecamatan(kec);
                      },
                    };

                    if (kec.tagName === 'polygon' && kec.points) {
                      return <polygon key={kec.id} points={kec.points} {...commonProps} />;
                    } else if (kec.d) {
                      return <path key={kec.id} d={kec.d} {...commonProps} />;
                    }
                    return null;
                  })}

                  {/* Label Nama Kecamatan & Angka Populasi */}
                  {KECAMATAN_ITEMS.map((kec) => {
                    const cleanId = kec.id.toLowerCase().replace('k_', '');
                    const pop = sapiPOKecMap[cleanId] || sapiPOKecMap[kec.id] || 0;
                    const colorInfo = getSapiPOColor(pop);

                    return (
                      <g
                        key={`label-${kec.id}`}
                        transform={`translate(${kec.centerX}, ${kec.centerY})`}
                        className="cursor-pointer pointer-events-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedKecamatan(kec);
                        }}
                        onMouseEnter={() => setHoveredKecamatan(kec)}
                        onMouseLeave={() => setHoveredKecamatan(null)}
                      >
                        <text
                          x="0"
                          y="-160"
                          textAnchor="middle"
                          fill={colorInfo.textColor}
                          fontSize="320"
                          fontWeight="800"
                          fontFamily="system-ui, -apple-system, sans-serif"
                          style={
                            colorInfo.textColor === '#FFFFFF'
                              ? { paintOrder: 'stroke', stroke: '#064E3B', strokeWidth: '55px' }
                              : { paintOrder: 'stroke', stroke: '#FFFFFF', strokeWidth: '40px' }
                          }
                        >
                          {kec.nama}
                        </text>

                        <text
                          x="0"
                          y="180"
                          textAnchor="middle"
                          fill={colorInfo.textColor}
                          fontSize="440"
                          fontWeight="900"
                          fontFamily="system-ui, -apple-system, sans-serif"
                          style={
                            colorInfo.textColor === '#FFFFFF'
                              ? { paintOrder: 'stroke', stroke: '#064E3B', strokeWidth: '65px' }
                              : { paintOrder: 'stroke', stroke: '#FFFFFF', strokeWidth: '50px' }
                          }
                        >
                          {pop.toLocaleString('id-ID')}
                        </text>

                        <text
                          x="0"
                          y="420"
                          textAnchor="middle"
                          fill={colorInfo.textColor}
                          fontSize="240"
                          fontWeight="700"
                          fontFamily="system-ui, -apple-system, sans-serif"
                          style={
                            colorInfo.textColor === '#FFFFFF'
                              ? { paintOrder: 'stroke', stroke: '#064E3B', strokeWidth: '45px' }
                              : { paintOrder: 'stroke', stroke: '#FFFFFF', strokeWidth: '35px' }
                          }
                        >
                          ekor
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Detail Box Saat Kecamatan Dipilih */}
              {selectedKecamatan && (
                <div className="w-full mt-4 p-4.5 bg-white rounded-2xl border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-xs shrink-0"
                      style={{ backgroundColor: getSapiPOColor(sapiPOKecMap[selectedKecamatan.id.toLowerCase().replace('k_', '')] || 0).fill }}
                    >
                      <MapPin size={22} className={getSapiPOColor(sapiPOKecMap[selectedKecamatan.id.toLowerCase().replace('k_', '')] || 0).textColor === '#064E3B' ? 'text-emerald-950' : 'text-white'} />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Kecamatan {selectedKecamatan.nama}</h4>
                      <p className="text-xs font-semibold text-slate-500">
                        Populasi Sapi PO Tahun {selectedYear}:{' '}
                        <span className="text-emerald-800 font-black text-sm">
                          {(sapiPOKecMap[selectedKecamatan.id.toLowerCase().replace('k_', '')] || 0).toLocaleString('id-ID')} Ekor
                        </span>
                      </p>
                    </div>
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => {
                        const cleanId = selectedKecamatan.id.toLowerCase().replace('k_', '');
                        setFormSapiPO({
                          kecamatan_id: cleanId,
                          kecamatan_nama: selectedKecamatan.nama,
                          populasi: sapiPOKecMap[cleanId] || 0,
                          triwulan: triwulanText,
                          keterangan: '',
                        });
                        setModalSapiPO({ open: true, item: selectedKecamatan });
                      }}
                      className="h-9 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Edit2 size={13} />
                      <span>Edit Data Kec. {selectedKecamatan.nama}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── PANEL KANAN: CARD TOTAL POPULASI (EMOT SAPI DIHAPUS) & LEGENDA HIJAU ── */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-4">
              
              {/* Card Ringkasan Total Populasi (Tanpa Emot Sapi) */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-100 bg-white/15 px-3 py-1 rounded-xl backdrop-blur-xs">
                      {triwulanText} {selectedYear}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider">TOTAL POPULASI SAPI PO</p>
                    <p className="text-[11px] font-semibold text-emerald-200">KABUPATEN KEBUMEN</p>
                  </div>

                  <div className="pt-1">
                    <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                      {totalSapiPO.toLocaleString('id-ID')}
                      <span className="text-base font-bold text-emerald-200 ml-1.5">Ekor</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/15 flex items-center justify-between text-xs text-emerald-100 font-semibold">
                    <span>Wilayah Tertinggi:</span>
                    <span className="font-extrabold text-white">Kec. {topKecamatan.nama} ({topKecamatan.pop.toLocaleString('id-ID')})</span>
                  </div>
                </div>
              </div>

              {/* Panel Legenda Gradasi Hijau */}
              <div className="bg-slate-50/90 rounded-3xl border border-slate-200 p-5 space-y-3">
                <div>
                  <h3 className="text-xs font-black text-slate-900 tracking-wider uppercase">
                    LEGENDA POPULASI
                  </h3>
                  <p className="text-[11px] font-bold text-emerald-800">Rentang Jumlah Sapi PO (Ekor)</p>
                </div>

                <div className="space-y-2 pt-1">
                  {SAPI_PO_LEGEND.map((leg) => (
                    <div key={leg.label} className="flex items-center justify-between text-xs font-bold text-slate-800 py-0.5">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-5 h-5 rounded-lg shrink-0 border border-slate-300 shadow-2xs"
                          style={{ backgroundColor: leg.color }}
                        />
                        <span>{leg.label} Ekor</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ───────────────────────────────────────────────────────────
            2. TABEL CAPAIAN SKLB & DETAIL TERNAK (FORMAT RAPI & KOTAK)
        ─────────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">Tabel Capaian &amp; Database SKLB {selectedYear}</h3>
              <p className="text-xs text-slate-500">Rekapitulasi jadwal lapangan dan daftar ternak layak bibit</p>
            </div>

            {/* Sync Buttons */}
            <div className="flex items-center gap-2">
              {activeTab === 'rekap' ? (
                <button
                  onClick={handleSyncRekap}
                  disabled={isSyncingRekap}
                  title="Tarik Data Rekap"
                  className="h-9 px-4 bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
                >
                  <RefreshCw size={13} className={isSyncingRekap ? 'animate-spin' : ''} />
                  <span>{isSyncingRekap ? 'Menyinkronkan...' : 'Tarik Data Rekap'}</span>
                </button>
              ) : (
                <button
                  onClick={handleSyncDetail}
                  disabled={isSyncingDetail}
                  title="Tarik Data Detail"
                  className="h-9 px-4 bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-800 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
                >
                  <RefreshCw size={13} className={isSyncingDetail ? 'animate-spin' : ''} />
                  <span>{isSyncingDetail ? 'Menyinkronkan Data...' : 'Tarik Data Detail'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs (Kotak Tegas / Rapi) */}
          <div className="flex gap-1 border-b-2 border-slate-300 pb-px overflow-x-auto">
            {[
              { key: 'rekap', label: `Rekapitulasi Capaian Tim (${dataRekap.length})` },
              { key: 'detail', label: `Master Detail Ternak (${dataDetail.length})` },
            ].map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`min-h-touch h-10 px-5 text-xs sm:text-sm font-extrabold border-t-2 border-x-2 transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-white border-slate-300 text-emerald-800 border-b-white translate-y-0.5'
                      : 'border-transparent text-slate-600 hover:text-slate-900 bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: REKAPITULASI CAPAIAN TIM (KOTAK RAPI FORMAL) */}
          {activeTab === 'rekap' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start animate-in fade-in duration-200">
              <TabelRekapCapaian data={tabelKiri} judul={`Capaian SKLB ${selectedYear} — Tim Timur`} grup="Tabel Kiri" />
              <TabelRekapCapaian data={tabelKanan} judul={`Capaian SKLB ${selectedYear} — Tim Barat`} grup="Tabel Kanan" />
            </div>
          )}

          {/* TAB 2: MASTER DETAIL TERNAK */}
          {activeTab === 'detail' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Filter & Search Toolbar */}
              <div className="bg-white p-3.5 border-2 border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
                  <div className="relative w-full sm:w-72">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama peternak atau sapi..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full min-h-touch h-10 pl-9 pr-4 border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="w-full sm:w-52">
                    <select
                      value={filterDesa}
                      onChange={(e) => setFilterDesa(e.target.value)}
                      className="w-full min-h-touch h-10 px-3 border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                    >
                      {daftarDesa.map((desa) => (
                        <option key={desa} value={desa}>
                          {desa === 'Semua' ? 'Semua Desa' : desa}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {canEdit && (
                  <button
                    onClick={() =>
                      setModalDetail({
                        open: true,
                        mode: 'tambah',
                        data: {
                          desa_lokasi: filterDesa !== 'Semua' ? filterDesa : '',
                          jenis_kelamin: 'Betina',
                          tahun: selectedYear,
                        },
                      })
                    }
                    className="min-h-touch h-10 px-4 bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Tambah Data Sapi</span>
                  </button>
                )}
              </div>

              {/* Data Table Kotak */}
              <div className="border-2 border-slate-300 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs whitespace-nowrap border-collapse">
                    <thead className="bg-slate-200 text-slate-800 font-bold uppercase tracking-wider border-b-2 border-slate-300">
                      <tr>
                        <th className="p-3 text-center w-10 border border-slate-300">NO</th>
                        <th className="p-3 text-left border border-slate-300">DESA LOKASI</th>
                        <th className="p-3 text-left border border-slate-300">PEMILIK</th>
                        <th className="p-3 text-left border border-slate-300">ALAMAT (DUSUN/RT/RW)</th>
                        <th className="p-3 text-left border border-slate-300">NAMA SAPI</th>
                        <th className="p-3 text-center border border-slate-300">KELAMIN</th>
                        <th className="p-3 text-center border border-slate-300">UMUR (BLN)</th>
                        <th className="p-3 text-center border border-slate-300">TINGGI (CM)</th>
                        <th className="p-3 text-center border border-slate-300">PANJANG (CM)</th>
                        <th className="p-3 text-center border border-slate-300">DADA (CM)</th>
                        <th className="p-3 text-center border border-slate-300">BERAT (KG)</th>
                        {canEdit && <th className="p-3 text-center w-20 border border-slate-300">AKSI</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-900 font-medium">
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={canEdit ? 12 : 11} className="p-12 text-center text-slate-400 font-semibold">
                            Tidak ada data sapi yang sesuai.
                          </td>
                        </tr>
                      ) : (
                        filteredData.map((row, idx) => (
                          <tr key={row.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="p-2.5 text-center font-sans text-slate-500 border border-slate-200">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-emerald-800 border border-slate-200">{row.desa_lokasi}</td>
                            <td className="p-2.5 font-bold text-slate-900 border border-slate-200">{row.nama_pemilik}</td>
                            <td className="p-2.5 text-slate-700 border border-slate-200">
                              {row.dusun || '-'} (RT {row.rt || '-'}/RW {row.rw || '-'})
                            </td>
                            <td className="p-2.5 font-semibold text-slate-800 border border-slate-200">{row.nama_sapi}</td>
                            <td className="p-2.5 text-center border border-slate-200">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold ${
                                  row.jenis_kelamin === 'Jantan'
                                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                {row.jenis_kelamin}
                              </span>
                            </td>
                            <td className="p-2.5 text-center font-sans border border-slate-200">{row.umur_bulan}</td>
                            <td className="p-2.5 text-center font-sans border border-slate-200">{row.tinggi_pundak}</td>
                            <td className="p-2.5 text-center font-sans border border-slate-200">{row.panjang_badan}</td>
                            <td className="p-2.5 text-center font-sans border border-slate-200">{row.lingkar_dada}</td>
                            <td className="p-2.5 text-center font-sans font-bold text-slate-900 border border-slate-200">{row.berat_badan}</td>
                            {canEdit && (
                              <td className="p-2.5 text-center border border-slate-200">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => setModalDetail({ open: true, mode: 'edit', data: row })}
                                    className="h-7 w-7 border border-slate-300 bg-white text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                                  >
                                    <Edit2 size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDetail(row.id)}
                                    className="h-7 w-7 border border-rose-300 bg-rose-50 text-rose-700 flex items-center justify-center hover:bg-rose-100 cursor-pointer"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>

      </main>

      {/* ───────────────────────────────────────────────────────────
          MODAL: INPUT / EDIT POPULASI SAPI PO PER KECAMATAN
      ─────────────────────────────────────────────────────────── */}
      {modalSapiPO.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setModalSapiPO({ open: false, item: null })}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute top-5 right-5 cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Input / Edit Populasi Sapi PO Tahun {selectedYear}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Perbarui jumlah populasi Sapi Peranakan Ongole (PO) per kecamatan di Kabupaten Kebumen.
            </p>

            <form onSubmit={handleSaveSapiPO} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Kecamatan <span className="text-red-500">*</span></label>
                  <select
                    value={formSapiPO.kecamatan_id}
                    onChange={(e) => {
                      const kecItem = KECAMATAN_ITEMS.find((k) => k.id === e.target.value || k.id.replace('k_', '') === e.target.value);
                      const cleanId = e.target.value.toLowerCase().replace('k_', '');
                      setFormSapiPO({
                        ...formSapiPO,
                        kecamatan_id: cleanId,
                        kecamatan_nama: kecItem ? kecItem.nama : cleanId,
                        populasi: sapiPOKecMap[cleanId] || 0,
                      });
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    {KECAMATAN_ITEMS.map((k) => {
                      const cleanId = k.id.toLowerCase().replace('k_', '');
                      return (
                        <option key={k.id} value={cleanId}>{k.nama}</option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-bold text-slate-700">Periode Triwulan</label>
                  <input
                    type="text"
                    value={formSapiPO.triwulan}
                    onChange={(e) => setFormSapiPO({ ...formSapiPO, triwulan: e.target.value })}
                    placeholder="Contoh: Triwulan 2"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700">Jumlah Populasi Sapi PO (Ekor) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formSapiPO.populasi}
                  onChange={(e) => setFormSapiPO({ ...formSapiPO, populasi: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600 text-sm"
                />
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700">Keterangan Tambahan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan verifikasi data lapangan..."
                  value={formSapiPO.keterangan}
                  onChange={(e) => setFormSapiPO({ ...formSapiPO, keterangan: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-900 focus:outline-none focus:border-emerald-600 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalSapiPO({ open: false, item: null })}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingSapiPO}
                  className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {isSavingSapiPO ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>Simpan Data Populasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          MODAL: TAMBAH TAHUN BARU
      ─────────────────────────────────────────────────────────── */}
      {showAddYearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAddYearModal(false)}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute top-5 right-5 cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Tambah Periode Tahun Baru</h3>
            <p className="text-xs text-slate-500 mb-5">
              Buat periode populasi Sapi PO untuk tahun berikutnya.
            </p>

            <form onSubmit={handleAddYearSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1 font-bold text-slate-700">Tahun Baru yang Ditambahkan <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  min={2020}
                  max={2100}
                  value={newYearInput}
                  onChange={(e) => setNewYearInput(Number(e.target.value))}
                  placeholder="Contoh: 2027"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-emerald-600 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddYearModal(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isAddingYear}
                  className="flex-1 h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  {isAddingYear ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>{isAddingYear ? 'Menambahkan...' : 'Buat Tahun Baru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          MODAL: REKAP TIM (EXISTING)
      ─────────────────────────────────────────────────────────── */}
      {modalRekap.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative">
            <button
              onClick={() => setModalRekap({ open: false, mode: 'tambah', data: null })}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute top-5 right-5 cursor-pointer"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {modalRekap.mode === 'tambah' ? 'Tambah Data Jadwal Rekap' : 'Edit Data Jadwal Rekap'}
            </h3>
            <form onSubmit={handleSaveRekap} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold">Tanggal</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 14/05/2024"
                    value={modalRekap.data?.tanggal || ''}
                    onChange={(e) => setModalRekap({ ...modalRekap, data: { ...modalRekap.data, tanggal: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Grup Tim</label>
                  <select
                    value={modalRekap.data?.grup || 'Tabel Kiri'}
                    onChange={(e) => setModalRekap({ ...modalRekap, data: { ...modalRekap.data, grup: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="Tabel Kiri">Tim Timur</option>
                    <option value="Tabel Kanan">Tim Barat</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold">Desa</label>
                  <input
                    type="text"
                    required
                    value={modalRekap.data?.desa || ''}
                    onChange={(e) => setModalRekap({ ...modalRekap, data: { ...modalRekap.data, desa: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Kecamatan</label>
                  <input
                    type="text"
                    required
                    value={modalRekap.data?.kecamatan || ''}
                    onChange={(e) => setModalRekap({ ...modalRekap, data: { ...modalRekap.data, kecamatan: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 font-bold">Target</label>
                  <input
                    type="number"
                    value={modalRekap.data?.target || 0}
                    onChange={(e) => {
                      const tgt = Number(e.target.value) || 0;
                      const cap = Number(modalRekap.data?.capaian) || 0;
                      setModalRekap({ ...modalRekap, data: { ...modalRekap.data, target: tgt, selisih: cap - tgt } });
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium font-sans"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Capaian</label>
                  <input
                    type="number"
                    value={modalRekap.data?.capaian || 0}
                    onChange={(e) => {
                      const cap = Number(e.target.value) || 0;
                      const tgt = Number(modalRekap.data?.target) || 0;
                      setModalRekap({ ...modalRekap, data: { ...modalRekap.data, capaian: cap, selisih: cap - tgt } });
                    }}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium font-sans"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Selisih</label>
                  <input
                    type="number"
                    disabled
                    value={modalRekap.data?.selisih || 0}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-50 font-medium font-sans text-slate-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalRekap({ open: false, mode: 'tambah', data: null })}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          MODAL: DETAIL SAPI (EXISTING)
      ─────────────────────────────────────────────────────────── */}
      {modalDetail.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalDetail({ open: false, mode: 'tambah', data: null })}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute top-5 right-5 cursor-pointer"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {modalDetail.mode === 'tambah' ? 'Tambah Data Sapi SKLB' : 'Edit Data Sapi SKLB'}
            </h3>
            <form onSubmit={handleSaveDetail} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold">Desa Lokasi <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={modalDetail.data?.desa_lokasi || ''}
                    onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, desa_lokasi: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Nama Pemilik <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={modalDetail.data?.nama_pemilik || ''}
                    onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, nama_pemilik: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 font-bold">Dusun</label>
                  <input
                    type="text"
                    value={modalDetail.data?.dusun || ''}
                    onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, dusun: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">RT</label>
                  <input
                    type="text"
                    value={modalDetail.data?.rt || ''}
                    onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, rt: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">RW</label>
                  <input
                    type="text"
                    value={modalDetail.data?.rw || ''}
                    onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, rw: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 font-bold">Nama Sapi</label>
                  <input
                    type="text"
                    value={modalDetail.data?.nama_sapi || ''}
                    onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, nama_sapi: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Jenis Kelamin</label>
                  <select
                    value={modalDetail.data?.jenis_kelamin || 'Betina'}
                    onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, jenis_kelamin: e.target.value } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium"
                  >
                    <option value="Betina">Betina</option>
                    <option value="Jantan">Jantan</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-bold">Umur (Bulan)</label>
                  <input
                    type="number"
                    value={modalDetail.data?.umur_bulan || ''}
                    onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, umur_bulan: Number(e.target.value) || 0 } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium font-sans"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block mb-1 font-bold">Tinggi (cm)</label>
                  <input
                    type="number"
                    step="any"
                    value={modalDetail.data?.tinggi_pundak || ''}
                    onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, tinggi_pundak: Number(e.target.value) || 0 } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium font-sans"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Panjang (cm)</label>
                  <input
                    type="number"
                    step="any"
                    value={modalDetail.data?.panjang_badan || ''}
                    onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, panjang_badan: Number(e.target.value) || 0 } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium font-sans"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Dada (cm)</label>
                  <input
                    type="number"
                    step="any"
                    value={modalDetail.data?.lingkar_dada || ''}
                    onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, lingkar_dada: Number(e.target.value) || 0 } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium font-sans"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold">Berat (kg)</label>
                  <input
                    type="number"
                    step="any"
                    value={modalDetail.data?.berat_badan || ''}
                    onChange={(e) => setModalDetail({ ...modalDetail, data: { ...modalDetail.data, berat_badan: Number(e.target.value) || 0 } })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-medium font-sans"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalDetail({ open: false, mode: 'tambah', data: null })}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
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