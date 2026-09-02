'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { usePageAuth } from '@/hooks/usePageAuth';
import {
  ArrowLeft,
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  ShieldCheck,
  Building2,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
} from 'lucide-react';

export type NKVRecord = {
  id: string;
  namaUsaha: string;
  jenisUsaha: string;
  proses: string;
  pembinaan1: string;
  hasil1: string;
  pembinaan2: string;
  hasil2: string;
  pelatihanHigiene: string;
  pengeluaranRekomendasi: string;
  keterangan: string;
};

const INITIAL_NKV_DATA: NKVRecord[] = [
  {
    id: '1',
    namaUsaha: 'RPH Kebumen (UPTD)',
    jenisUsaha: 'RPH Ruminansia',
    proses: 'Sertifikasi NKV Tingkat II',
    pembinaan1: '14 Maret 2025',
    hasil1: 'Kelayakan dasar & alur sanitasi memenuhi syarat',
    pembinaan2: '20 Mei 2025',
    hasil2: 'Perbaikan sarana cold storage telah selesai',
    pelatihanHigiene: 'Sudah Bersertifikat (2 Juleha & 4 Petugas)',
    pengeluaranRekomendasi: 'Rekomendasi Diterbitkan (No: 524/112/2025)',
    keterangan: 'Telah terverifikasi Dinas Peternakan Provinsi',
  },
  {
    id: '2',
    namaUsaha: 'RPH Gombong (UPTD)',
    jenisUsaha: 'RPH Ruminansia',
    proses: 'Pembinaan & Audit Lapangan',
    pembinaan1: '10 Februari 2025',
    hasil1: 'Penataan drainase limbah cair perlu optimasi',
    pembinaan2: '18 Juni 2025',
    hasil2: 'Instalasi IPAL berfungsi optimal',
    pelatihanHigiene: 'Sudah Bersertifikat (3 Petugas)',
    pengeluaranRekomendasi: 'Rekomendasi Diterbitkan (No: 524/145/2025)',
    keterangan: 'Menunggu penerbitan nomor resmi provinsi',
  },
  {
    id: '3',
    namaUsaha: 'TPU Unggas Barokah Petanahan',
    jenisUsaha: 'TPU Unggas',
    proses: 'Penerbitan Rekomendasi NKV',
    pembinaan1: '05 April 2025',
    hasil1: 'Pemisahan area bersih dan kotor terlaksana',
    pembinaan2: '12 Juli 2025',
    hasil2: 'Uji residu & cemaran mikroba nihil',
    pelatihanHigiene: 'Sudah Bersertifikat (1 Pengelola)',
    pengeluaranRekomendasi: 'Rekomendasi Diterbitkan (No: 524/189/2025)',
    keterangan: 'NKV Level III Aktif',
  },
  {
    id: '4',
    namaUsaha: 'UD Berkah Telur Kutowinangun',
    jenisUsaha: 'Gudang Telur Konsumsi',
    proses: 'Pengajuan Sertifikasi Baru',
    pembinaan1: '22 Januari 2025',
    hasil1: 'Sistem pencatatan batch & suhu ruang diperiksa',
    pembinaan2: '15 Agustus 2025',
    hasil2: 'Pendingin dan tata ruang higienis siap audit',
    pelatihanHigiene: 'Proses Sertifikasi Higiene Sanitasi',
    pengeluaranRekomendasi: 'Dalam Proses Validasi',
    keterangan: 'Dijadwalkan visitasi tim penilai',
  },
];

export default function NKVPage() {
  const { isReady, canEdit } = usePageAuth('kesmavet', 'nkv');
  const [dataNkv, setDataNkv] = useState<NKVRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<NKVRecord, 'id'>>({
    namaUsaha: '',
    jenisUsaha: '',
    proses: '',
    pembinaan1: '',
    hasil1: '',
    pembinaan2: '',
    hasil2: '',
    pelatihanHigiene: '',
    pengeluaranRekomendasi: '',
    keterangan: '',
  });

  // Load data dari database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/nkv');
        const json = await res.json();
        if (json.success) {
          const mapped: NKVRecord[] = json.data.map((row: any) => ({
            id: String(row.id_pembinaan),
            namaUsaha: row.nama_usaha,
            jenisUsaha: row.jenis_usaha || '',
            proses: row.proses || '',
            pembinaan1: row.pembinaan_1 || '',
            hasil1: row.hasil_1 || '',
            pembinaan2: row.pembinaan_2 || '',
            hasil2: row.hasil_2 || '',
            pelatihanHigiene: row.pelatihan_higiene || '',
            pengeluaranRekomendasi: row.pengeluaran_rekomendasi || '',
            keterangan: row.keterangan || '',
          }));
          setDataNkv(mapped);
        }
      } catch (err) {
        console.error('Gagal memuat data NKV:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      namaUsaha: '',
      jenisUsaha: '',
      proses: '',
      pembinaan1: '',
      hasil1: '',
      pembinaan2: '',
      hasil2: '',
      pelatihanHigiene: '',
      pengeluaranRekomendasi: '',
      keterangan: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: NKVRecord) => {
    setEditingId(item.id);
    setFormData({
      namaUsaha: item.namaUsaha,
      jenisUsaha: item.jenisUsaha,
      proses: item.proses,
      pembinaan1: item.pembinaan1,
      hasil1: item.hasil1,
      pembinaan2: item.pembinaan2,
      hasil2: item.hasil2,
      pelatihanHigiene: item.pelatihanHigiene,
      pengeluaranRekomendasi: item.pengeluaranRekomendasi,
      keterangan: item.keterangan,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data unit usaha NKV ini?')) {
      try {
        const res = await fetch(`/api/nkv?id=${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (json.success) {
          setDataNkv((prev) => prev.filter((item) => item.id !== id));
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
    if (!formData.namaUsaha) {
      alert('Nama Usaha wajib diisi!');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch('/api/nkv', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_pembinaan: editingId,
            nama_usaha: formData.namaUsaha,
            jenis_usaha: formData.jenisUsaha,
            proses: formData.proses,
            pembinaan_1: formData.pembinaan1,
            hasil_1: formData.hasil1,
            pembinaan_2: formData.pembinaan2,
            hasil_2: formData.hasil2,
            pelatihan_higiene: formData.pelatihanHigiene,
            pengeluaran_rekomendasi: formData.pengeluaranRekomendasi,
            keterangan: formData.keterangan,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setDataNkv((prev) =>
            prev.map((item) => (item.id === editingId ? { ...item, ...formData } : item))
          );
          alert('Data NKV berhasil diperbarui!');
        } else {
          alert('Gagal memperbarui: ' + json.error);
        }
      } else {
        const res = await fetch('/api/nkv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nama_usaha: formData.namaUsaha,
            jenis_usaha: formData.jenisUsaha,
            proses: formData.proses,
            pembinaan_1: formData.pembinaan1,
            hasil_1: formData.hasil1,
            pembinaan_2: formData.pembinaan2,
            hasil_2: formData.hasil2,
            pelatihan_higiene: formData.pelatihanHigiene,
            pengeluaran_rekomendasi: formData.pengeluaranRekomendasi,
            keterangan: formData.keterangan,
          }),
        });
        const json = await res.json();
        if (json.success) {
          const newRecord: NKVRecord = {
            id: String(json.insertId),
            ...formData,
          };
          setDataNkv((prev) => [...prev, newRecord]);
          alert('Data unit usaha baru berhasil ditambahkan!');
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
      'Nama Usaha': d.namaUsaha,
      'Jenis Usaha': d.jenisUsaha,
      Proses: d.proses,
      'Pembinaan 1': d.pembinaan1,
      'Hasil (Pembinaan 1)': d.hasil1,
      'Pembinaan 2': d.pembinaan2,
      'Hasil (Pembinaan 2)': d.hasil2,
      'Pelatihan Higiene Sanitasi': d.pelatihanHigiene,
      'Pengeluaran Rekomendasi': d.pengeluaranRekomendasi,
      Keterangan: d.keterangan,
    }));

    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Data_NKV');
    XLSX.writeFile(wb, `Data_Nomor_Kontrol_Veteriner_NKV_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Filter Data
  const filteredData = useMemo(() => {
    return dataNkv.filter((item) => {
      const matchSearch =
        item.namaUsaha.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jenisUsaha.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.proses.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.keterangan.toLowerCase().includes(searchTerm.toLowerCase());
      const matchJenis = !filterJenis || item.jenisUsaha === filterJenis;
      return matchSearch && matchJenis;
    });
  }, [dataNkv, searchTerm, filterJenis]);

  const uniqueJenis = useMemo(() => {
    return Array.from(new Set(dataNkv.map((d) => d.jenisUsaha).filter(Boolean)));
  }, [dataNkv]);

  if (loading || !isReady) return null;

  return (
    <div className="min-h-screen bg-purple-50/30 text-slate-900 font-sans selection:bg-purple-600 selection:text-white pb-20">
      
      {/* ── TOP HEADER (Tema Ungu) ── */}
      <header className="border-b border-purple-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/kesmavet"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Modul Kesmavet"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/kesmavet" className="text-xs font-semibold text-slate-500 hover:text-purple-700 transition-colors truncate">
                  Kesmavet
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-purple-700 whitespace-nowrap">NKV</span>
              </div>
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                Nomor Kontrol Veteriner (NKV)
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
            {canEdit && (
              <button
                onClick={handleOpenAdd}
                className="min-h-touch min-w-touch h-11 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Tambah Data NKV</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <ShieldCheck size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Unit Usaha</p>
              <p className="text-2xl font-extrabold text-slate-900">{dataNkv.length} <span className="text-xs text-slate-500 font-semibold">Usaha</span></p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <CheckCircle2 size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Rekomendasi Diterbitkan</p>
              <p className="text-2xl font-extrabold text-emerald-700">
                {dataNkv.filter((d) => d.pengeluaranRekomendasi.toLowerCase().includes('diterbitkan')).length} <span className="text-xs text-slate-500 font-semibold">Unit</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Clock size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Dalam Proses / Audit</p>
              <p className="text-2xl font-extrabold text-amber-800">
                {dataNkv.filter((d) => !d.pengeluaranRekomendasi.toLowerCase().includes('diterbitkan')).length} <span className="text-xs text-slate-500 font-semibold">Unit</span>
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
              placeholder="Cari nama usaha, jenis, proses audit, atau keterangan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full min-h-touch h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="min-h-touch h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:border-purple-600 focus:bg-white"
            >
              <option value="">Semua Jenis Usaha</option>
              {uniqueJenis.map((jenis) => (
                <option key={jenis} value={jenis}>
                  {jenis}
                </option>
              ))}
            </select>

            {(searchTerm || filterJenis) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterJenis('');
                }}
                className="min-h-touch h-11 px-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* ── TABEL DATA NOMOR KONTROL VETERINER (11 KOLOM) ── */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-purple-50/50">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">📋</span>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Rekapitulasi Usaha &amp; Pembinaan Sertifikasi NKV
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar pembinaan higiene sanitasi, proses audit, dan status pengeluaran rekomendasi
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              {filteredData.length} Data Ditampilkan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 font-extrabold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5 text-center w-12 border-r border-slate-200">No</th>
                  <th className="p-3.5 border-r border-slate-200">Nama Usaha</th>
                  <th className="p-3.5 border-r border-slate-200">Jenis Usaha</th>
                  <th className="p-3.5 border-r border-slate-200">Proses</th>
                  <th className="p-3.5 border-r border-slate-200">Pembinaan 1</th>
                  <th className="p-3.5 border-r border-slate-200">Hasil (1)</th>
                  <th className="p-3.5 border-r border-slate-200">Pembinaan 2</th>
                  <th className="p-3.5 border-r border-slate-200">Hasil (2)</th>
                  <th className="p-3.5 border-r border-slate-200">Pelatihan Higiene Sanitasi</th>
                  <th className="p-3.5 border-r border-slate-200">Pengeluaran Rekomendasi</th>
                  <th className="p-3.5 border-r border-slate-200">Keterangan</th>
                  {canEdit && <th className="p-3.5 text-center sticky right-0 bg-slate-50 z-10">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 12 : 11} className="p-8 text-center text-slate-400 font-medium text-xs">
                      Tidak ditemukan data Nomor Kontrol Veteriner (NKV).
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, index) => (
                    <tr key={row.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="p-3.5 text-center font-bold text-slate-500 border-r border-slate-100">
                        {index + 1}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 border-r border-slate-100">
                        {row.namaUsaha}
                      </td>
                      <td className="p-3.5 font-semibold text-purple-700 border-r border-slate-100">
                        {row.jenisUsaha || '-'}
                      </td>
                      <td className="p-3.5 border-r border-slate-100">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {row.proses || '-'}
                        </span>
                      </td>
                      <td className="p-3.5 border-r border-slate-100 text-slate-600">
                        {row.pembinaan1 || '-'}
                      </td>
                      <td className="p-3.5 border-r border-slate-100 text-slate-700 max-w-[200px] truncate" title={row.hasil1}>
                        {row.hasil1 || '-'}
                      </td>
                      <td className="p-3.5 border-r border-slate-100 text-slate-600">
                        {row.pembinaan2 || '-'}
                      </td>
                      <td className="p-3.5 border-r border-slate-100 text-slate-700 max-w-[200px] truncate" title={row.hasil2}>
                        {row.hasil2 || '-'}
                      </td>
                      <td className="p-3.5 border-r border-slate-100 font-semibold text-slate-800">
                        {row.pelatihanHigiene || '-'}
                      </td>
                      <td className="p-3.5 border-r border-slate-100">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                            row.pengeluaranRekomendasi.toLowerCase().includes('diterbitkan')
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {row.pengeluaranRekomendasi || '-'}
                        </span>
                      </td>
                      <td className="p-3.5 border-r border-slate-100 text-slate-500 max-w-[220px] truncate" title={row.keterangan}>
                        {row.keterangan || '-'}
                      </td>
                      {canEdit && (
                        <td className="p-3.5 text-center sticky right-0 bg-white z-10 border-l border-slate-100">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(row)}
                              title="Edit Data"
                              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-purple-100 hover:text-purple-800 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Edit2 size={13} strokeWidth={2.5} />
                            </button>
                            <button
                              onClick={() => handleDelete(row.id)}
                              title="Hapus Data"
                              className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} strokeWidth={2.5} />
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

      </main>

      {/* ── MODAL FORM TAMBAH / EDIT DATA NKV ── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <ShieldCheck size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    {editingId ? 'Edit Data Unit Usaha NKV' : 'Tambah Unit Usaha NKV Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Formulir pencatatan 11 kolom nomor kontrol veteriner
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
                    Nama Usaha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: RPH Kebumen (UPTD)"
                    value={formData.namaUsaha}
                    onChange={(e) => setFormData({ ...formData, namaUsaha: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-purple-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Jenis Usaha
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: RPH Ruminansia / TPU Unggas / Gudang Telur"
                    value={formData.jenisUsaha}
                    onChange={(e) => setFormData({ ...formData, jenisUsaha: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-purple-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Proses
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sertifikasi NKV Tingkat II / Pembinaan Lapangan"
                  value={formData.proses}
                  onChange={(e) => setFormData({ ...formData, proses: e.target.value })}
                  className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-purple-600 outline-none"
                />
              </div>

              {/* Pembinaan 1 & Hasil */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span>📍 Pembinaan Tahap 1</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal / Waktu Pembinaan 1</label>
                    <input
                      type="text"
                      placeholder="Contoh: 14 Maret 2025"
                      value={formData.pembinaan1}
                      onChange={(e) => setFormData({ ...formData, pembinaan1: e.target.value })}
                      className="w-full min-h-touch h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Hasil Pembinaan 1</label>
                    <input
                      type="text"
                      placeholder="Hasil evaluasi / catatan pembinaan 1"
                      value={formData.hasil1}
                      onChange={(e) => setFormData({ ...formData, hasil1: e.target.value })}
                      className="w-full min-h-touch h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Pembinaan 2 & Hasil */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span>📍 Pembinaan Tahap 2</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Tanggal / Waktu Pembinaan 2</label>
                    <input
                      type="text"
                      placeholder="Contoh: 20 Mei 2025"
                      value={formData.pembinaan2}
                      onChange={(e) => setFormData({ ...formData, pembinaan2: e.target.value })}
                      className="w-full min-h-touch h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Hasil Pembinaan 2</label>
                    <input
                      type="text"
                      placeholder="Hasil evaluasi / catatan pembinaan 2"
                      value={formData.hasil2}
                      onChange={(e) => setFormData({ ...formData, hasil2: e.target.value })}
                      className="w-full min-h-touch h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Pelatihan Higiene Sanitasi & Pengeluaran Rekomendasi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Pelatihan Higiene Sanitasi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Sudah Bersertifikat (2 Petugas)"
                    value={formData.pelatihanHigiene}
                    onChange={(e) => setFormData({ ...formData, pelatihanHigiene: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-purple-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Pengeluaran Rekomendasi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Rekomendasi Diterbitkan (No: ...)"
                    value={formData.pengeluaranRekomendasi}
                    onChange={(e) => setFormData({ ...formData, pengeluaranRekomendasi: e.target.value })}
                    className="w-full min-h-touch h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900 focus:border-purple-600 outline-none"
                  />
                </div>
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan tambahan status sertifikasi NKV..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:border-purple-600 outline-none leading-relaxed"
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
                  className="flex-1 min-h-touch h-11 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                >
                  {editingId ? 'Simpan Perubahan NKV' : 'Simpan Unit Usaha NKV'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
