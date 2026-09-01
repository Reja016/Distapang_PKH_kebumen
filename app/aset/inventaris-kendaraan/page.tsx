'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  ArrowLeft,
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  Car,
  Key,
  Shield,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

export type KendaraanRecord = {
  id: string;
  namaPemegang: string;
  merkType: string;
  tahun: string;
  nopolLama: string;
  nopolBaru: string;
  nomorMesin: string;
  nomorRangka: string;
  keterangan?: string;
};

const INITIAL_KENDARAAN_DATA: KendaraanRecord[] = [
  {
    id: '1',
    namaPemegang: 'Kepala Dinas Pertanian & Pangan',
    merkType: 'Toyota Kijang Innova 2.0 G M/T',
    tahun: '2021',
    nopolLama: 'AA 1234 AD',
    nopolBaru: 'AA 1 D',
    nomorMesin: '1TR-FE8923145',
    nomorRangka: 'MHF11GB40K0029141',
    keterangan: 'Kendaraan Dinas Operasional Pimpinan',
  },
  {
    id: '2',
    namaPemegang: 'Kabid Peternakan & Keswan',
    merkType: 'Toyota Avanza 1.3 E M/T',
    tahun: '2019',
    nopolLama: 'AA 9876 AD',
    nopolBaru: 'AA 1045 D',
    nomorMesin: '1NR-VE7623910',
    nomorRangka: 'MHF12BB20J0018274',
    keterangan: 'Operasional Bidang Peternakan',
  },
  {
    id: '3',
    namaPemegang: 'Medik Veteriner / Puskeswan Kebumen',
    merkType: 'Honda Supra X 125 FI',
    tahun: '2020',
    nopolLama: 'AA 4521 AD',
    nopolBaru: 'AA 6120 D',
    nomorMesin: 'JB91E1492014',
    nomorRangka: 'MH1JB9115LK892301',
    keterangan: 'Pelayanan Lapangan & Vaksinasi',
  },
  {
    id: '4',
    namaPemegang: 'Petugas Inseminator Wilayah Prembun',
    merkType: 'Yamaha Jupiter Z1',
    tahun: '2018',
    nopolLama: 'AA 3319 AD',
    nopolBaru: 'AA 6482 D',
    nomorMesin: '2SU-928172',
    nomorRangka: 'MH32SU004JJ910283',
    keterangan: 'Pelayanan Inseminasi Buatan (IB)',
  },
  {
    id: '5',
    namaPemegang: 'Petugas Pengawas Kesmavet & RPH',
    merkType: 'Honda Revo X FI',
    tahun: '2022',
    nopolLama: 'AA 5104 AD',
    nopolBaru: 'AA 6301 D',
    nomorMesin: 'JB92E2019481',
    nomorRangka: 'MH1JB9219NK109284',
    keterangan: 'Pengawasan Peredaran Daging & NKV',
  },
];

export default function InventarisKendaraanPage() {
  const [dataKendaraan, setDataKendaraan] = useState<KendaraanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<KendaraanRecord, 'id'>>({
    namaPemegang: '',
    merkType: '',
    tahun: new Date().getFullYear().toString(),
    nopolLama: '',
    nopolBaru: '',
    nomorMesin: '',
    nomorRangka: '',
    keterangan: '',
  });

  // Load data dari database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/aset-kendaraan');
        const json = await res.json();
        if (json.success) {
          const mapped: KendaraanRecord[] = json.data.map((row: any) => ({
            id: String(row.id_aset),
            namaPemegang: row.nama_pemegang,
            merkType: row.merk_type,
            tahun: String(row.tahun),
            nopolLama: row.nopol_lama || '',
            nopolBaru: row.nopol_baru,
            nomorMesin: row.nomor_mesin,
            nomorRangka: row.nomor_rangka,
            keterangan: '',
          }));
          setDataKendaraan(mapped);
        }
      } catch (err) {
        console.error('Gagal memuat data kendaraan:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      namaPemegang: '',
      merkType: '',
      tahun: new Date().getFullYear().toString(),
      nopolLama: '',
      nopolBaru: '',
      nomorMesin: '',
      nomorRangka: '',
      keterangan: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: KendaraanRecord) => {
    setEditingId(item.id);
    setFormData({
      namaPemegang: item.namaPemegang,
      merkType: item.merkType,
      tahun: item.tahun,
      nopolLama: item.nopolLama,
      nopolBaru: item.nopolBaru,
      nomorMesin: item.nomorMesin,
      nomorRangka: item.nomorRangka,
      keterangan: item.keterangan || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data kendaraan dinas ini?')) {
      try {
        const res = await fetch(`/api/aset-kendaraan?id=${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          setDataKendaraan((prev) => prev.filter((item) => item.id !== id));
        } else {
          alert('Gagal menghapus: ' + json.error);
        }
      } catch {
        alert('Terjadi kesalahan saat menghapus data.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaPemegang) {
      alert('Nama Pemegang kendaraan wajib diisi!');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch('/api/aset-kendaraan', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_aset: editingId,
            nama_pemegang: formData.namaPemegang,
            merk_type: formData.merkType,
            tahun: formData.tahun,
            nopol_lama: formData.nopolLama,
            nopol_baru: formData.nopolBaru,
            nomor_mesin: formData.nomorMesin,
            nomor_rangka: formData.nomorRangka,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setDataKendaraan((prev) =>
            prev.map((item) => (item.id === editingId ? { ...item, ...formData } : item))
          );
          alert('Data kendaraan dinas berhasil diperbarui!');
        } else {
          alert('Gagal memperbarui: ' + json.error);
        }
      } else {
        const res = await fetch('/api/aset-kendaraan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama_pemegang: formData.namaPemegang,
            merk_type: formData.merkType,
            tahun: formData.tahun,
            nopol_lama: formData.nopolLama,
            nopol_baru: formData.nopolBaru,
            nomor_mesin: formData.nomorMesin,
            nomor_rangka: formData.nomorRangka,
          }),
        });
        const json = await res.json();
        if (json.success) {
          const newRecord: KendaraanRecord = {
            id: String(json.insertId),
            ...formData,
          };
          setDataKendaraan((prev) => [...prev, newRecord]);
          alert('Data kendaraan dinas baru berhasil ditambahkan!');
        } else {
          alert('Gagal menyimpan: ' + json.error);
        }
      }
    } catch {
      alert('Terjadi kesalahan saat menyimpan data.');
    } finally {
      setSaving(false);
    }
    setShowModal(false);
  };


  // Export to Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    const wsData = filteredData.map((d, index) => ({
      No: index + 1,
      'Nama Pemegang': d.namaPemegang,
      'Merk / Type': d.merkType,
      Tahun: d.tahun,
      'Nomor Polisi (Lama)': d.nopolLama,
      'Nomor Polisi (Baru)': d.nopolBaru,
      'Nomor Mesin': d.nomorMesin,
      'Nomor Rangka': d.nomorRangka,
      Keterangan: d.keterangan || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Inventaris_Kendaraan');
    XLSX.writeFile(wb, `Inventaris_Kendaraan_Dinas_Distapang_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Filter Data
  const filteredData = useMemo(() => {
    return dataKendaraan.filter((item) => {
      return (
        item.namaPemegang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.merkType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nopolLama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nopolBaru.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nomorMesin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nomorRangka.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tahun.includes(searchTerm)
      );
    });
  }, [dataKendaraan, searchTerm]);

  return (
    <div className="min-h-screen bg-amber-50/30 text-slate-900 font-sans selection:bg-amber-600 selection:text-white pb-20">
      
      {/* ── TOP HEADER (Tema Amber) ── */}
      <header className="border-b border-amber-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/aset"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Modul Aset"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/aset" className="text-xs font-semibold text-slate-500 hover:text-amber-700 transition-colors truncate">
                  Aset
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-amber-700 whitespace-nowrap">Inventaris Kendaraan</span>
              </div>
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                Inventaris Kendaraan Dinas
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportExcel}
              className="min-h-touch min-w-touch h-11 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Download size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="min-h-touch min-w-touch h-11 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Tambah Kendaraan</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Car size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Kendaraan Terdata</p>
              <p className="text-2xl font-extrabold text-slate-900">{dataKendaraan.length} <span className="text-xs text-slate-500 font-semibold">Unit</span></p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Key size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pemegang Aktif</p>
              <p className="text-2xl font-extrabold text-emerald-700">
                {new Set(dataKendaraan.map((d) => d.namaPemegang)).size} <span className="text-xs text-slate-500 font-semibold">Petugas/Pejabat</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Shield size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Kelengkapan Nopol Baru</p>
              <p className="text-2xl font-extrabold text-blue-700">
                {dataKendaraan.filter((d) => Boolean(d.nopolBaru)).length} <span className="text-xs text-slate-500 font-semibold">Unit</span>
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} strokeWidth={2.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pemegang, merk/tipe, tahun, plat nomor, nomor mesin, atau no rangka..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-h-touch h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-600 focus:bg-white transition-colors"
            />
          </div>

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="min-h-touch h-11 px-4 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors shrink-0"
            >
              Reset Pencarian
            </button>
          )}
        </div>

        {/* ── TABEL INVENTARIS KENDARAAN (8 KOLOM) ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-amber-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Car size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Daftar Inventaris Kendaraan Dinas Operasional
                </h3>
                <p className="text-xs text-slate-500">
                  Rekapitulasi nomor polisi lama &amp; baru, nomor mesin, dan nomor rangka
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {filteredData.length} Kendaraan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5 text-center w-12 border-r border-slate-200">No</th>
                  <th className="p-3.5 border-r border-slate-200">Nama Pemegang</th>
                  <th className="p-3.5 border-r border-slate-200">Merk / Type</th>
                  <th className="p-3.5 text-center border-r border-slate-200">Tahun</th>
                  <th className="p-3.5 border-r border-slate-200 text-center bg-amber-50/50">Nopol Lama</th>
                  <th className="p-3.5 border-r border-slate-200 text-center bg-emerald-50/50 text-emerald-900">Nopol Baru</th>
                  <th className="p-3.5 border-r border-slate-200 font-mono">Nomor Mesin</th>
                  <th className="p-3.5 border-r border-slate-200 font-mono">Nomor Rangka</th>
                  <th className="p-3.5 text-center sticky right-0 bg-slate-50 z-10">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 font-medium text-xs">
                      Tidak ditemukan data kendaraan dinas yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, index) => (
                    <tr key={row.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="p-3.5 text-center font-bold text-slate-500 border-r border-slate-100">
                        {index + 1}
                      </td>
                      <td className="p-3.5 font-extrabold text-slate-900 border-r border-slate-100">
                        {row.namaPemegang}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 border-r border-slate-100">
                        {row.merkType || '-'}
                      </td>
                      <td className="p-3.5 text-center font-bold font-sans text-slate-600 border-r border-slate-100">
                        {row.tahun || '-'}
                      </td>
                      <td className="p-3.5 text-center border-r border-slate-100">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-extrabold font-mono text-[11px] border border-slate-200">
                          {row.nopolLama || '-'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center border-r border-slate-100">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold font-mono text-[11px] border border-emerald-300 shadow-2xs">
                          {row.nopolBaru || '-'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-xs font-bold text-slate-700 border-r border-slate-100">
                        {row.nomorMesin || '-'}
                      </td>
                      <td className="p-3.5 font-mono text-xs font-bold text-slate-700 border-r border-slate-100">
                        {row.nomorRangka || '-'}
                      </td>
                      <td className="p-3.5 text-center sticky right-0 bg-white z-10 border-l border-slate-100">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(row)}
                            title="Edit Data Kendaraan"
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Edit2 size={13} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => handleDelete(row.id)}
                            title="Hapus Data Kendaraan"
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* ── MODAL FORM TAMBAH / EDIT DATA KENDARAAN ── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Car size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    {editingId ? 'Edit Data Kendaraan Dinas' : 'Tambah Kendaraan Dinas Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Formulir pencatatan plat nomor, nomor mesin, dan nomor rangka
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nama Pemegang <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Medik Veteriner / Nama Pejabat"
                    value={formData.namaPemegang}
                    onChange={(e) => setFormData({ ...formData, namaPemegang: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-amber-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Merk / Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Toyota Avanza / Honda Supra X"
                    value={formData.merkType}
                    onChange={(e) => setFormData({ ...formData, merkType: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-amber-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tahun Pembuatan / Pengadaan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 2021"
                  value={formData.tahun}
                  onChange={(e) => setFormData({ ...formData, tahun: e.target.value })}
                  className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-amber-600 outline-none"
                />
              </div>

              {/* Nopol Lama & Baru */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span>Nomor Registrasi Kendaraan Bermotor (Nopol)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Nomor Polisi Lama</label>
                    <input
                      type="text"
                      placeholder="Contoh: AA 1234 AD"
                      value={formData.nopolLama}
                      onChange={(e) => setFormData({ ...formData, nopolLama: e.target.value })}
                      className="w-full min-h-touch h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Nomor Polisi Baru</label>
                    <input
                      type="text"
                      placeholder="Contoh: AA 1 D"
                      value={formData.nopolBaru}
                      onChange={(e) => setFormData({ ...formData, nopolBaru: e.target.value })}
                      className="w-full min-h-touch h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-mono font-bold text-emerald-800"
                    />
                  </div>
                </div>
              </div>

              {/* Nomor Mesin & Nomor Rangka */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nomor Mesin
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 1TR-FE8923145"
                    value={formData.nomorMesin}
                    onChange={(e) => setFormData({ ...formData, nomorMesin: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:border-amber-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nomor Rangka
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: MHF11GB40K0029141"
                    value={formData.nomorRangka}
                    onChange={(e) => setFormData({ ...formData, nomorRangka: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:border-amber-600 outline-none"
                  />
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Keterangan Tambahan
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan status kendaraan, lokasi pos dinas, kondisi mesin, dll..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-amber-600 outline-none leading-relaxed"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="min-h-touch h-11 px-5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-touch h-11 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  {editingId ? 'Simpan Perubahan Kendaraan' : 'Simpan Kendaraan Baru'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
