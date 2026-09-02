'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { usePageAuth } from '@/hooks/usePageAuth';
import {
  ArrowLeft,
  Search,
  Plus,
  Edit2,
  X,
  Building2,
  ChevronRight,
  Filter,
  PackageCheck,
  Activity,
  Layers,
  TrendingUp,
  Download,
} from 'lucide-react';

/* ======================= TIPE DATA & KONFIGURASI ======================= */
type CommodityKey = 'broiler' | 'petelur' | 'babi' | 'sapi' | 'domba';

const FIELD_LABELS_BROILER: Record<string, string> = {
  kecamatan: 'Kecamatan',
  desa: 'Desa',
  nama_badan_usaha: 'Nama Badan Usaha / Perusahaan',
  nama_unit_farm: 'Nama Unit Farm / Peternak',
  mandiri_kemitraan: 'Mandiri / Kemitraan',
  alamat: 'Alamat',
  lintang: 'Lintang',
  bujur: 'Bujur',
  telp_hp: 'Telp / HP',
  kapasitas_kandang: 'Kapasitas Kandang (Ekor/Tahun)',
  jumlah_populasi: 'Jumlah Populasi (Ekor/Tahun)',
  jumlah_produksi: 'Jumlah Produksi Siap Potong (Ekor/Tahun)',
  bobot_rata2_panen: 'Bobot Rata-rata Panen (Kg/Ekor)',
  konsumsi_pakan_fcr: 'Konsumsi Pakan (Gram/Ekor/Hari) / FCR',
  catatan: 'Catatan (Siklus Panen)',
  status: 'Status',
};

const FIELD_LABELS_PETELUR: Record<string, string> = {
  kecamatan: 'Kecamatan',
  desa: 'Desa',
  nama_badan_usaha: 'Nama Badan Usaha (Perusahaan)',
  nama_unit_farm_perusahaan: 'Nama Unit Farm (Perusahaan)',
  nama_peternak: 'Nama Peternak (Mandiri)',
  nama_unit_farm_mandiri: 'Nama Unit Farm (Mandiri)',
  mandiri_kemitraan: 'Mandiri / Kemitraan',
  alamat: 'Alamat',
  lintang: 'Lintang',
  bujur: 'Bujur',
  telp_hp: 'Telp / HP',
  kapasitas_kandang: 'Kapasitas Kandang (Ekor/Tahun)',
  populasi_produktif: 'Populasi Produktif (Ekor)',
  populasi_belum_produktif: 'Populasi Belum Produktif (Ekor)',
  populasi_total: 'Populasi Total (Ekor)',
  produksi_telur_kg_tahun: 'Produksi Telur Konsumsi (Kg/Tahun)',
  konsumsi_pakan: 'Konsumsi Pakan (Gram/Ekor/Hari)',
};

const FIELD_LABELS_GENERAL: Record<string, string> = {
  nama_peternak: 'Nama Peternak / Nama Badan Usaha',
  nama_unit_farm: 'Nama Unit Farm',
  status_kepemilikan: 'Status Kepemilikan Farm',
  kapasitas_kandang: 'Kapasitas Kandang (Ekor/Tahun)',
  alamat: 'Alamat',
  kelurahan_desa: 'Kelurahan / Desa / Nagari',
  kecamatan: 'Kecamatan / Distrik',
  lintang: 'Lintang',
  bujur: 'Bujur',
  telp_hp: 'Telp / HP',
  tujuan_pemeliharaan: 'Tujuan Pemeliharaan',
};

const COMMODITY_META: Record<CommodityKey, any> = {
  broiler: {
    title: 'Ayam Broiler',
    subtitle: 'Ayam Pedaging',
    icon: Building2,
    iconColor: 'text-emerald-600 bg-blue-50',
    badge: 'Unggas Daging',
  },
  petelur: {
    title: 'Ayam Petelur',
    subtitle: 'Ayam Ras Petelur',
    icon: PackageCheck,
    iconColor: 'text-amber-600 bg-amber-50',
    badge: 'Unggas Telur',
  },
  sapi: {
    title: 'Sapi Potong',
    subtitle: 'Ternak Sapi Potong Binaan',
    icon: Activity,
    iconColor: 'text-vitality bg-emerald-50',
    jenisTernak: 'Sapi Potong',
    badge: 'Ruminansia Besar',
  },
  domba: {
    title: 'Domba & Kambing',
    subtitle: 'Ternak Ruminansia Kecil',
    icon: Layers,
    iconColor: 'text-lime-800 bg-lime-50',
    jenisTernak: 'Domba',
    badge: 'Ruminansia Kecil',
  },
  babi: {
    title: 'Babi',
    subtitle: 'Peternakan Non-Ruminansia',
    icon: TrendingUp,
    iconColor: 'text-slate-700 bg-slate-100',
    jenisTernak: 'Babi',
    badge: 'Non-Ruminansia',
  },
};

const COMMODITY_ORDER: CommodityKey[] = ['broiler', 'petelur', 'sapi', 'domba', 'babi'];

function parseNum(v: string | undefined): number {
  if (!v) return 0;
  const m = v.match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}
function formatNum(n: number): string {
  return n.toLocaleString('id-ID');
}
function getFieldLabels(key: CommodityKey) {
  if (key === 'broiler') return FIELD_LABELS_BROILER;
  if (key === 'petelur') return FIELD_LABELS_PETELUR;
  return FIELD_LABELS_GENERAL;
}

export default function DataFarmPage() {
  const { isReady, canEdit } = usePageAuth('bitpro', 'data-farm');
  const [dataBroiler, setDataBroiler] = useState<any[]>([]);
  const [dataPetelur, setDataPetelur] = useState<any[]>([]);
  const [dataGeneral, setDataGeneral] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeCommodity, setActiveCommodity] = useState<CommodityKey | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNo, setEditingNo] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<any>({});

  // SEDOT DATA DARI MYSQL
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/get-farm');
        const data = await response.json();
        setDataBroiler(data.dataBroiler || []);
        setDataPetelur(data.dataPetelur || []);
        setDataGeneral(data.dataGeneral || []);
      } catch (error) {
        console.error('Gagal menyedot data farm:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getBaseData = (key: CommodityKey): any[] => {
    if (key === 'broiler') return dataBroiler;
    if (key === 'petelur') return dataPetelur;
    const jenis = COMMODITY_META[key].jenisTernak;
    return dataGeneral.filter((d) => d.jenis_ternak === jenis);
  };

  const getFilteredData = (key: CommodityKey): any[] => {
    const base = getBaseData(key);
    if (!searchTerm.trim()) return base;
    const term = searchTerm.toLowerCase();
    return base.filter((item) =>
      Object.values(item).some((val) => String(val).toLowerCase().includes(term))
    );
  };

  const getStats = (key: CommodityKey) => {
    const base = getBaseData(key);
    const jumlahFarm = base.length;
    let totalPopulasi = 0;
    let label = 'Kapasitas Kandang';
    if (key === 'broiler') {
      totalPopulasi = base.reduce((sum, d) => sum + parseNum(d.jumlah_populasi), 0);
      label = 'Populasi (Ekor)';
    } else if (key === 'petelur') {
      totalPopulasi = base.reduce((sum, d) => sum + parseNum(d.populasi_total), 0);
      label = 'Populasi (Ekor)';
    } else {
      totalPopulasi = base.reduce((sum, d) => sum + parseNum(d.kapasitas_kandang), 0);
      label = 'Kapasitas (Ekor)';
    }
    return { jumlahFarm, totalPopulasi, label };
  };

  const openAddModal = () => {
    setEditingNo(null);
    setFormValues({});
    setIsModalOpen(true);
  };
  const openEditModal = (item: any) => {
    setEditingNo(item.no);
    setFormValues({ ...item });
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNo(null);
    setFormValues({});
  };
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const cat = activeCommodity === 'broiler' ? 'broiler' : activeCommodity === 'petelur' ? 'petelur' : 'general';
      const payload = {
        ...formValues,
        jenis_ternak: formValues.jenis_ternak || (activeCommodity ? COMMODITY_META[activeCommodity].jenisTernak : 'Lainnya'),
      };

      const res = await fetch('/api/get-farm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kategori: cat,
          data: payload,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert('Data farm peternakan berhasil disimpan ke database!');
        const refresh = await fetch('/api/get-farm');
        const refreshedData = await refresh.json();
        setDataBroiler(refreshedData.dataBroiler || []);
        setDataPetelur(refreshedData.dataPetelur || []);
        setDataGeneral(refreshedData.dataGeneral || []);
      } else {
        alert('Gagal menyimpan: ' + json.error);
      }
    } catch {
      alert('Terjadi kesalahan saat menyimpan data farm.');
    }
    closeModal();
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // 1. Broiler
    if (dataBroiler.length > 0) {
      const wsBroiler = XLSX.utils.json_to_sheet(dataBroiler);
      XLSX.utils.book_append_sheet(wb, wsBroiler, 'Ayam_Broiler');
    }
    // 2. Petelur
    if (dataPetelur.length > 0) {
      const wsPetelur = XLSX.utils.json_to_sheet(dataPetelur);
      XLSX.utils.book_append_sheet(wb, wsPetelur, 'Ayam_Petelur');
    }
    // 3. General (Babi, Sapi, Domba)
    if (dataGeneral.length > 0) {
      const wsGeneral = XLSX.utils.json_to_sheet(dataGeneral);
      XLSX.utils.book_append_sheet(wb, wsGeneral, 'Ternak_Lainnya');
    }

    XLSX.writeFile(wb, `Data_Farm_Peternakan_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-600/40 flex items-center justify-center animate-spin">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600" />
          </div>
          <p className="font-sans text-xs uppercase tracking-widest text-slate-500">
            Memuat Data Farm Kabupaten...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* ── TOP HEADER (Tema Hijau - Lega & Bernapas) ── */}
      <header className="border-b border-emerald-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/bitpro"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Modul Bitpro"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/bitpro" className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors truncate">
                  Bitpro
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Data Farm</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Sebaran Unit Usaha Peternakan
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

            {activeCommodity && (
              <button
                onClick={() => {
                  setActiveCommodity(null);
                  setSearchTerm('');
                }}
                title="Semua Komoditas"
                aria-label="Semua Komoditas"
                className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <Layers size={16} className="sm:hidden" />
                <span className="hidden sm:inline">← Semua Komoditas</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
        
        {/* ── VIEW 1: OVERVIEW KARTU KOMODITAS ── */}
        {!activeCommodity ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Kategori Komoditas Farm
                </h2>
                <p className="text-sm text-slate-500">
                  Pilih salah satu komoditas peternakan untuk melihat rincian unit usaha dan kapasitas kandang.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {COMMODITY_ORDER.map((key) => {
                const meta = COMMODITY_META[key];
                const stats = getStats(key);
                const IconComp = meta.icon;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveCommodity(key);
                      setSearchTerm('');
                    }}
                    className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm hover:border-emerald-600 hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[210px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${meta.iconColor}`}>
                          <IconComp size={22} />
                        </div>
                        <span className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {meta.badge}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-0.5">
                        {meta.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {meta.subtitle}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-end justify-between">
                      <div>
                        <p className="text-[11px] font-sans uppercase tracking-wider text-slate-400 font-semibold">
                          Jumlah Farm
                        </p>
                        <p className="text-2xl font-bold font-sans text-slate-900">
                          {stats.jumlahFarm} <span className="text-xs font-normal text-slate-500">Unit</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[11px] font-sans uppercase tracking-wider text-slate-400 font-semibold">
                          {stats.label}
                        </p>
                        <p className="text-lg font-bold font-sans text-emerald-600">
                          {formatNum(stats.totalPopulasi)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── VIEW 2: TABEL RINCIAN KOMODITAS ── */
          (() => {
            const meta = COMMODITY_META[activeCommodity];
            const filteredData = getFilteredData(activeCommodity);
            const fieldLabels = getFieldLabels(activeCommodity);
            const HeaderIcon = meta.icon;

            return (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Header Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${meta.iconColor}`}>
                      <HeaderIcon size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Data Farm {meta.title}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Menampilkan {filteredData.length} data peternakan terdaftar
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 sm:w-64">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari peternak / desa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full min-h-touch h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                      />
                    </div>

                    {canEdit && (
                      <button
                        onClick={openAddModal}
                        className="min-h-touch h-10 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-600/90 active:scale-95 transition-all shadow-sm shrink-0"
                      >
                        <Plus size={16} />
                        <span>Tambah Farm</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Table Container */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="p-4 w-16 text-center">NO</th>
                          <th className="p-4">NAMA USAHA / FARM</th>
                          <th className="p-4">KECAMATAN</th>
                          <th className="p-4">DESA</th>
                          <th className="p-4 text-right">KAPASITAS KANDANG</th>
                          {canEdit && <th className="p-4 text-center w-28">AKSI</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-slate-800">
                        {filteredData.length > 0 ? (
                          filteredData.map((item) => (
                            <tr key={item.no} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-4 text-center font-sans text-slate-400 text-xs">{item.no}</td>
                              <td className="p-4 font-semibold text-slate-900">
                                {item.nama_peternak || item.nama_unit_farm || item.nama_badan_usaha || '-'}
                              </td>
                              <td className="p-4 text-slate-600">{item.kecamatan || '-'}</td>
                              <td className="p-4 text-slate-600">{item.desa || item.kelurahan_desa || '-'}</td>
                              <td className="p-4 text-right font-sans font-bold text-emerald-600">
                                {item.kapasitas_kandang || '-'}
                              </td>
                              {canEdit && (
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() => openEditModal(item)}
                                    className="min-h-touch h-8 px-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                  >
                                    <Edit2 size={13} />
                                    <span>Edit</span>
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={canEdit ? 6 : 5} className="p-12 text-center text-slate-400 font-medium text-sm">
                              Tidak ada data farm yang cocok dengan pencarian &quot;{searchTerm}&quot;.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            );
          })()
        )}

      </main>

      {/* ── MODAL TAMBAH / EDIT ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingNo !== null ? `Edit Data Farm` : `Tambah Data Farm Baru`}
              </h3>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(getFieldLabels(activeCommodity || 'broiler')).map((key) => (
                  <div key={key} className={key === 'alamat' || key === 'catatan' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-sans font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      {getFieldLabels(activeCommodity || 'broiler')[key]}
                    </label>
                    <input
                      type="text"
                      name={key}
                      value={formValues[key] ?? ''}
                      onChange={handleFieldChange}
                      className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="min-h-touch h-10 px-5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="min-h-touch h-10 px-5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-600/90 active:scale-95 transition-all shadow-sm"
                >
                  Simpan Data
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}