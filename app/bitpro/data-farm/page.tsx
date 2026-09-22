'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { usePageAuth } from '@/hooks/usePageAuth';
import {
  ArrowLeft,
  Download,
  LayoutGrid,
  RefreshCw,
} from 'lucide-react';
import {
  CommodityKey,
  COMMODITY_META,
  COMMODITY_ORDER,
  KECAMATAN_DESA_MAP,
  KECAMATAN_LIST,
  parseNum,
} from '@/components/bitpro/data-farm/types';
import FarmOverviewTab from '@/components/bitpro/data-farm/FarmOverviewTab';
import FarmTableTab from '@/components/bitpro/data-farm/FarmTableTab';
import FarmModal from '@/components/bitpro/data-farm/FarmModal';

export default function DataFarmPage() {
  const { isReady, canCreate, canEdit } = usePageAuth('bitpro', 'data-farm');
  const [dataBroiler, setDataBroiler] = useState<any[]>([]);
  const [dataPetelur, setDataPetelur] = useState<any[]>([]);
  const [dataGeneral, setDataGeneral] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tab switcher komoditas
  const [activeCommodity, setActiveCommodity] = useState<CommodityKey | 'overview'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [targetCategory, setTargetCategory] = useState<CommodityKey>('broiler');
  const [formValues, setFormValues] = useState<any>({});

  // GPS Geolocation state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  // SEDOT DATA DARI MYSQL
  const fetchData = async () => {
    setIsLoading(true);
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

  useEffect(() => {
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

  // Open modal Tambah Baru
  const openAddModal = (cat?: CommodityKey) => {
    const activeCat = cat || (activeCommodity !== 'overview' ? activeCommodity : 'broiler');
    setTargetCategory(activeCat);
    setEditingItem(null);
    setFormValues({
      kecamatan: 'AYAH',
      desa: KECAMATAN_DESA_MAP['AYAH']?.[0] || '',
      mandiri_kemitraan: 'Kemitraan',
      status_kepemilikan: 'Milik Sendiri',
      lintang: '',
      bujur: '',
      alamat: '',
    });
    setGpsStatus(null);
    setIsModalOpen(true);
  };

  // Open modal Edit Data
  const openEditModal = (item: any, cat: CommodityKey) => {
    setTargetCategory(cat);
    setEditingItem(item);

    const kec = (item.kecamatan || '').toUpperCase().trim();
    const matchedKec = KECAMATAN_LIST.find((k) => k === kec) || KECAMATAN_LIST[0];

    setFormValues({
      ...item,
      kecamatan: matchedKec,
      desa: item.desa || item.kelurahan_desa || '',
      lintang: item.lintang || '',
      bujur: item.bujur || '',
      alamat: item.alamat || '',
    });
    setGpsStatus(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormValues({});
    setGpsStatus(null);
  };

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'kecamatan') {
      const kecUpper = value.toUpperCase();
      const firstDesa = KECAMATAN_DESA_MAP[kecUpper]?.[0] || '';
      setFormValues((prev: any) => ({
        ...prev,
        kecamatan: kecUpper,
        desa: firstDesa,
        kelurahan_desa: firstDesa,
      }));
    } else {
      setFormValues((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  // Ambil titik lokasi koordinat GPS secara otomatis dari device/browser
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      alert('Browser / Perangkat Anda tidak mendukung fitur Geolocation / GPS.');
      return;
    }
    setGpsLoading(true);
    setGpsStatus('Mencari sinyal satelit GPS...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);

        setFormValues((prev: any) => ({
          ...prev,
          lintang: lat,
          bujur: lng,
        }));

        setGpsStatus(`GPS Terkunci: ${lat}, ${lng}`);

        // Reverse Geocoding via OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'id' } }
          );
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setFormValues((prev: any) => ({
                ...prev,
                alamat: prev.alamat || data.display_name,
              }));
              const locName = data.address?.village || data.address?.suburb || data.address?.road || 'Lokasi Terdeteksi';
              setGpsStatus(`GPS Sukses: ${lat}, ${lng} (${locName})`);
            }
          }
        } catch {
          // Tetap simpan lintang & bujur jika reverse geocoding gagal
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        console.warn('GPS Geolocation Error:', error);
        setGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsStatus('Izin akses lokasi ditolak. Silakan ketik alamat & koordinat secara manual.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGpsStatus('Sinyal GPS tidak terdeteksi. Silakan ketik manual.');
        } else if (error.code === error.TIMEOUT) {
          setGpsStatus('Waktu pencarian GPS habis. Silakan ketik manual.');
        } else {
          setGpsStatus('Gagal mengambil GPS. Silakan gunakan input manual.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Simpan atau Perbarui Data Farm (POST / PUT)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const cat = targetCategory === 'broiler' ? 'broiler' : targetCategory === 'petelur' ? 'petelur' : 'general';
      const payload = {
        ...formValues,
        kecamatan: (formValues.kecamatan || '').toUpperCase(),
        desa: formValues.desa || formValues.kelurahan_desa || '',
        kelurahan_desa: formValues.desa || formValues.kelurahan_desa || '',
        jenis_ternak: formValues.jenis_ternak || COMMODITY_META[targetCategory].jenisTernak || 'Lainnya',
      };

      const isEdit = !!editingItem?.db_id;
      if (isEdit && !canEdit) {
        alert('Hanya Administrator yang memiliki hak akses untuk mengubah (edit) data!');
        return;
      }
      if (!isEdit && !canCreate) {
        alert('Anda tidak memiliki hak akses untuk menambah data!');
        return;
      }
      const url = '/api/get-farm';
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit
        ? { id: editingItem.db_id, kategori: cat, data: payload }
        : { kategori: cat, data: payload };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.success) {
        alert(isEdit ? 'Data farm berhasil diperbarui!' : 'Data farm berhasil disimpan ke database MySQL!');
        fetchData();
      } else {
        alert('Gagal menyimpan: ' + json.error);
      }
    } catch {
      alert('Terjadi kesalahan saat menyimpan data farm.');
    }
    closeModal();
  };

  // Hapus Data Farm (DELETE)
  const handleDelete = async (item: any) => {
    if (!canEdit) {
      alert('Hanya Administrator yang memiliki hak akses untuk menghapus data!');
      return;
    }
    const farmName = item.nama_peternak || item.nama_unit_farm || item.nama_badan_usaha || 'data farm ini';
    if (!confirm(`Apakah Anda yakin ingin menghapus "${farmName}" dari database?`)) return;


    try {
      if (item.db_id) {
        const res = await fetch(`/api/get-farm?id=${item.db_id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          alert('Data farm berhasil dihapus dari database!');
          fetchData();
        } else {
          alert('Gagal menghapus: ' + json.error);
        }
      } else {
        alert('Data berhasil dihapus.');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus data farm.');
    }
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

  const currentDesaList = useMemo(() => {
    const kec = (formValues.kecamatan || 'AYAH').toUpperCase();
    return KECAMATAN_DESA_MAP[kec] || [];
  }, [formValues.kecamatan]);

  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center animate-spin shadow-xs">
            <RefreshCw size={22} />
          </div>
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-emerald-800">
            Memuat Data Sebaran Farm Kabupaten...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-20">
      {/* ── TOP HEADER (Tema Hijau Bitpro) ── */}
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
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Database Sebaran Farm</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Database &amp; Sebaran Farm Peternakan
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
            <button
              onClick={fetchData}
              title="Muat Ulang"
              aria-label="Muat Ulang"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-4 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* ── TOP COMMODITY TAB BAR ── */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-px overflow-x-auto no-scrollbar scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => {
              setActiveCommodity('overview');
              setSearchTerm('');
            }}
            className={`min-h-touch h-11 px-4 sm:px-5 rounded-t-2xl text-xs sm:text-sm font-bold border-t border-x transition-all shrink-0 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeCommodity === 'overview'
                ? 'bg-white border-slate-200 text-emerald-700 border-b-white translate-y-px shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900 bg-slate-100/70'
            }`}
          >
            <LayoutGrid size={16} />
            <span>Ringkasan Semua</span>
          </button>

          {COMMODITY_ORDER.map((key) => {
            const meta = COMMODITY_META[key];
            const stats = getStats(key);
            const isActive = activeCommodity === key;
            const IconComp = meta.icon;

            return (
              <button
                key={key}
                onClick={() => {
                  setActiveCommodity(key);
                  setSearchTerm('');
                }}
                className={`min-h-touch h-11 px-4 sm:px-5 rounded-t-2xl text-xs sm:text-sm font-bold border-t border-x transition-all shrink-0 whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-white border-slate-200 text-emerald-700 border-b-white translate-y-px shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-900 bg-slate-100/70'
                }`}
              >
                <span className="text-sm leading-none">{meta.emoji}</span>
                <span>{meta.title}</span>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {stats.jumlahFarm}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── VIEW 1: OVERVIEW KARTU KOMODITAS ── */}
        {activeCommodity === 'overview' ? (
          <FarmOverviewTab
            dataBroiler={dataBroiler}
            dataPetelur={dataPetelur}
            dataGeneral={dataGeneral}
            setActiveCommodity={setActiveCommodity}
            setSearchTerm={setSearchTerm}
            getStats={getStats}
          />
        ) : (
          /* ── VIEW 2: TABEL RINCIAN KOMODITAS ── */
          <FarmTableTab
            activeCommodity={activeCommodity}
            filteredData={getFilteredData(activeCommodity)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            canEdit={canEdit}
            canCreate={canCreate}
            openAddModal={openAddModal}
            openEditModal={openEditModal}
            handleDelete={handleDelete}
          />

        )}
      </main>

      {/* ── MODAL TAMBAH / EDIT DATA FARM ── */}
      <FarmModal
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        editingItem={editingItem}
        targetCategory={targetCategory}
        formValues={formValues}
        setFormValues={setFormValues}
        handleFieldChange={handleFieldChange}
        handleGetGpsLocation={handleGetGpsLocation}
        gpsLoading={gpsLoading}
        gpsStatus={gpsStatus}
        currentDesaList={currentDesaList}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}