'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { usePageAuth } from '@/hooks/usePageAuth';
import { getAuthSession } from '@/lib/auth';
import {
  ArrowLeft,
  Download,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Building2,
  Save,
  Loader2,
  Calendar,
  Table as TableIcon,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  Layers,
} from 'lucide-react';

const BULAN_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const LOKASI_CONFIGS = [
  { key: 'rph_kebumen', label: '1. RPH Kebumen', subtitle: 'Unit Pemotongan Hewan Resmi Kebumen' },
  { key: 'luar_rph_kebumen', label: '2. Luar RPH Kebumen', subtitle: 'Pemotongan Masyarakat / Wilayah Luar RPH Kebumen' },
  { key: 'rph_gombong', label: '3. RPH Gombong', subtitle: 'Unit Pemotongan Hewan Resmi Gombong (Termasuk Babi)' },
  { key: 'luar_rph_gombong', label: '4. Luar RPH Gombong', subtitle: 'Pemotongan Masyarakat / Wilayah Luar RPH Gombong (Termasuk Babi)' },
];

const KOMODITAS_LIST = ['Sapi Potong', 'Kuda', 'Babi', 'Kambing', 'Domba'];

export default function RphTphTpuPage() {
  const { isReady, canEdit, userRole } = usePageAuth('kesmavet', 'rph-tph-tpu');

  // Role Admin Check
  const isAdmin = useMemo(() => {
    const session = getAuthSession();
    const roleFromSession = (session?.role || '').toLowerCase();
    const roleFromHook = (userRole || '').toLowerCase();
    return (
      roleFromSession.includes('admin') ||
      roleFromHook.includes('admin') ||
      session?.role === 'Administrator' ||
      userRole === 'Administrator' ||
      canEdit
    );
  }, [userRole, canEdit]);

  // Navigation tabs (URUTAN SESUAI PERMINTAAN USER: 1. Input Pemotongan, 2. TPH, 3. Data Rumah Potong)
  const [activeTab, setActiveTab] = useState<'pemotongan_rumpun' | 'rekap_komoditas' | 'rumah_potong'>('pemotongan_rumpun');

  // Tab 1 & 2 Location Switcher (Horizontal Button Switcher)
  const [selectedLokasiKey, setSelectedLokasiKey] = useState<string>('rph_kebumen');
  const [selectedKomoditasFilter, setSelectedKomoditasFilter] = useState<string>('ALL');

  // Year filter & dynamic multi-year state
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [availableYears, setAvailableYears] = useState<number[]>([2025, 2026]);
  const [showAddYearModal, setShowAddYearModal] = useState<boolean>(false);
  const [newYearInput, setNewYearInput] = useState<number>(2026);
  const [isAddingYear, setIsAddingYear] = useState<boolean>(false);

  // ── 1. STATE TAB: DATA RUMAH POTONG (RPH / TPH / TPU) ──
  const [rphList, setRphList] = useState<any[]>([]);
  const [isLoadingRph, setIsLoadingRph] = useState(true);
  const [searchRph, setSearchRph] = useState('');
  const [filterJenis, setFilterJenis] = useState('ALL');
  const [filterHalal, setFilterHalal] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formRph, setFormRph] = useState({
    nama_usaha: '',
    jenis: 'TPU',
    pemilik: '',
    alamat_pemilik: '',
    kontak: '',
    lokasi: '',
    status_perijinan: '',
    sertifikat_halal: '',
    sertifikat_nkv: 'belum',
  });

  // ── 2. STATE TAB: INPUT PEMOTONGAN RUMAH POTONG HEWAN (4 TABEL RUMPUN SAPI) ──
  const [rumpunData, setRumpunData] = useState<Record<string, any[]>>({
    rph_kebumen: [],
    luar_rph_kebumen: [],
    rph_gombong: [],
    luar_rph_gombong: [],
  });
  const [isLoadingRumpun, setIsLoadingRumpun] = useState(false);
  const [isSavingRumpun, setIsSavingRumpun] = useState(false);
  const [rumpunSaveMessage, setRumpunSaveMessage] = useState('');

  // ── 3. STATE TAB: TEMPAT PEMOTONGAN HEWAN (TPH) / KOMODITAS TERNAK (12 BULAN) ──
  const [komoditasData, setKomoditasData] = useState<any[]>([]);
  const [isLoadingKomoditas, setIsLoadingKomoditas] = useState(false);
  const [isSavingKomoditas, setIsSavingKomoditas] = useState(false);
  const [komoditasSaveMessage, setKomoditasSaveMessage] = useState('');

  // ── FETCH AVAILABLE YEARS ──
  const loadAvailableYears = async () => {
    try {
      const [res1, res2] = await Promise.all([
        fetch('/api/pemotongan-rumpun?action=years'),
        fetch('/api/pemotongan-komoditas?action=years'),
      ]);
      const json1 = await res1.json();
      const json2 = await res2.json();
      
      const yearsSet = new Set<number>([2025, 2026]);
      if (json1.success && Array.isArray(json1.years)) {
        json1.years.forEach((y: number) => yearsSet.add(Number(y)));
      }
      if (json2.success && Array.isArray(json2.years)) {
        json2.years.forEach((y: number) => yearsSet.add(Number(y)));
      }
      setAvailableYears(Array.from(yearsSet).sort((a, b) => a - b));
    } catch (err) {
      console.warn('Gagal memuat tahun unik:', err);
    }
  };

  // ── 1. LOAD DATA RUMAH POTONG ──
  const loadRphData = async () => {
    try {
      setIsLoadingRph(true);
      const res = await fetch('/api/pemotongan-hewan');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRphList(json.data);
      }
    } catch (err) {
      console.error('Gagal memuat data RPH:', err);
    } finally {
      setIsLoadingRph(false);
    }
  };

  // ── 2. LOAD DATA PEMOTONGAN RUMPUN SAPI ──
  const loadRumpunData = async (year: number) => {
    try {
      setIsLoadingRumpun(true);
      const res = await fetch(`/api/pemotongan-rumpun?tahun=${year}`);
      const json = await res.json();
      if (json.success && json.data) {
        setRumpunData({
          rph_kebumen: json.data.rph_kebumen || [],
          luar_rph_kebumen: json.data.luar_rph_kebumen || [],
          rph_gombong: json.data.rph_gombong || [],
          luar_rph_gombong: json.data.luar_rph_gombong || [],
        });
      }
    } catch (err) {
      console.error('Gagal memuat data pemotongan rumpun:', err);
    } finally {
      setIsLoadingRumpun(false);
    }
  };

  // ── 3. LOAD DATA REKAP KOMODITAS TERNAK ──
  const loadKomoditasData = async (year: number) => {
    try {
      setIsLoadingKomoditas(true);
      const res = await fetch(`/api/pemotongan-komoditas?tahun=${year}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        // Ensure Gombong and Luar Gombong have Babi row if missing
        let data = json.data;
        const ensureBabi = (lokasiName: string) => {
          const exists = data.some((r: any) => r.nama_pemotongan === lokasiName && (r.komoditas || '').toLowerCase() === 'babi');
          if (!exists) {
            data.push({
              tahun: year,
              nama_pemotongan: lokasiName,
              komoditas: 'Babi',
              jan_jantan: 0, jan_betina: 0,
              feb_jantan: 0, feb_betina: 0,
              mar_jantan: 0, mar_betina: 0,
              apr_jantan: 0, apr_betina: 0,
              mei_jantan: 0, mei_betina: 0,
              jun_jantan: 0, jun_betina: 0,
              jul_jantan: 0, jul_betina: 0,
              agu_jantan: 0, agu_betina: 0,
              sep_jantan: 0, sep_betina: 0,
              okt_jantan: 0, okt_betina: 0,
              nov_jantan: 0, nov_betina: 0,
              des_jantan: 0, des_betina: 0,
            });
          }
        };
        ensureBabi('RPH Gombong');
        ensureBabi('Luar RPH Gombong');
        setKomoditasData(data);
      }
    } catch (err) {
      console.error('Gagal memuat data komoditas:', err);
    } finally {
      setIsLoadingKomoditas(false);
    }
  };

  useEffect(() => {
    loadAvailableYears();
    loadRphData();
  }, []);

  useEffect(() => {
    loadRumpunData(selectedYear);
    loadKomoditasData(selectedYear);
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
      const [res1, res2] = await Promise.all([
        fetch('/api/pemotongan-rumpun', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_year', tahun: newYearInput }),
        }),
        fetch('/api/pemotongan-komoditas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_year', tahun: newYearInput }),
        }),
      ]);

      const json1 = await res1.json();
      const json2 = await res2.json();

      if (json1.success || json2.success) {
        await loadAvailableYears();
        setSelectedYear(newYearInput);
        setShowAddYearModal(false);
        alert(`Periode Tahun ${newYearInput} berhasil ditambahkan!`);
      } else {
        alert(json1.error || json2.error || 'Gagal menambahkan tahun baru');
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsAddingYear(false);
    }
  };

  // ── SAVE TAB 1: RUMPUN SAPI INLINE SPREADSHEET ──
  const handleRumpunCellChange = (lokasiKey: string, monthIndex: number, field: string, value: any) => {
    if (!isAdmin) return;
    const num = Math.max(0, parseInt(value, 10) || 0);

    setRumpunData((prev) => {
      const copy = { ...prev };
      const lokasiRows = [...(copy[lokasiKey] || [])];
      if (lokasiRows[monthIndex]) {
        lokasiRows[monthIndex] = {
          ...lokasiRows[monthIndex],
          [field]: num,
        };
      }
      copy[lokasiKey] = lokasiRows;
      return copy;
    });
  };

  const handleSaveRumpun = async () => {
    if (!isAdmin) return;
    try {
      setIsSavingRumpun(true);
      setRumpunSaveMessage('');
      const res = await fetch('/api/pemotongan-rumpun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tahun: selectedYear,
          data: rumpunData,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setRumpunSaveMessage('✓ Perubahan 4 Tabel Pemotongan berhasil disimpan!');
        setTimeout(() => setRumpunSaveMessage(''), 4000);
      } else {
        alert('Gagal menyimpan: ' + json.error);
      }
    } catch (err: any) {
      alert('Terjadi kesalahan saat menyimpan: ' + err.message);
    } finally {
      setIsSavingRumpun(false);
    }
  };

  // ── SAVE TAB 2: KOMODITAS SPREADSHEET ──
  const handleSaveKomoditas = async () => {
    if (!isAdmin) return;
    try {
      setIsSavingKomoditas(true);
      setKomoditasSaveMessage('');
      const res = await fetch('/api/pemotongan-komoditas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tahun: selectedYear,
          data: komoditasData,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setKomoditasSaveMessage('✓ Rekap Pemotongan Komoditas berhasil disimpan!');
        setTimeout(() => setKomoditasSaveMessage(''), 4000);
      } else {
        alert('Gagal menyimpan: ' + json.error);
      }
    } catch (err: any) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsSavingKomoditas(false);
    }
  };

  const handleKomoditasCellChange = (rowIndex: number, field: string, val: any) => {
    if (!isAdmin) return;
    setKomoditasData((prev) => {
      const copy = [...prev];
      if (copy[rowIndex]) {
        copy[rowIndex] = { ...copy[rowIndex], [field]: val };
      }
      return copy;
    });
  };

  // Add new row to Komoditas table
  const handleAddKomoditasRow = () => {
    if (!isAdmin) return;
    const newRow = {
      tahun: selectedYear,
      nama_pemotongan: 'RPH Gombong',
      komoditas: 'Babi',
      jan_jantan: 0, jan_betina: 0,
      feb_jantan: 0, feb_betina: 0,
      mar_jantan: 0, mar_betina: 0,
      apr_jantan: 0, apr_betina: 0,
      mei_jantan: 0, mei_betina: 0,
      jun_jantan: 0, jun_betina: 0,
      jul_jantan: 0, jul_betina: 0,
      agu_jantan: 0, agu_betina: 0,
      sep_jantan: 0, sep_betina: 0,
      okt_jantan: 0, okt_betina: 0,
      nov_jantan: 0, nov_betina: 0,
      des_jantan: 0, des_betina: 0,
    };
    setKomoditasData((prev) => [...prev, newRow]);
  };

  // Delete row from Komoditas table
  const handleDeleteKomoditasRow = (rowIndex: number) => {
    if (!isAdmin) return;
    if (!confirm('Apakah Anda yakin ingin menghapus baris pemotongan ini?')) return;
    setKomoditasData((prev) => prev.filter((_, i) => i !== rowIndex));
  };

  // ── CALCULATIONS FOR TAB 1: RUMPUN SAPI DENGAN TOTAL JANTAN, BETINA PROD & NON TERPISAH SETIAP BULAN ──
  const getTableSummary = (rows: any[]) => {
    const summary = {
      po_jantan: 0, po_betina_prod: 0, po_betina_non_prod: 0, po_total: 0,
      so_jantan: 0, so_betina_prod: 0, so_betina_non_prod: 0, so_total: 0,
      simmental_jantan: 0, simmental_betina_prod: 0, simmental_betina_non_prod: 0, simmental_total: 0,
      limousine_jantan: 0, limousine_betina_prod: 0, limousine_betina_non_prod: 0, limousine_total: 0,
      babi_jantan: 0, babi_betina: 0, babi_total: 0,
      total_jantan: 0, total_betina_prod: 0, total_betina_non_prod: 0,
      grand_total: 0,
    };

    (rows || []).forEach((r) => {
      const pj = Number(r.po_jantan) || 0;
      const pbp = Number(r.po_betina_prod) || 0;
      const pbnp = Number(r.po_betina_non_prod) || 0;

      const sj = Number(r.so_jantan) || 0;
      const sbp = Number(r.so_betina_prod) || 0;
      const sbnp = Number(r.so_betina_non_prod) || 0;

      const smj = Number(r.simmental_jantan) || 0;
      const smbp = Number(r.simmental_betina_prod) || 0;
      const smbnp = Number(r.simmental_betina_non_prod) || 0;

      const lj = Number(r.limousine_jantan) || 0;
      const lbp = Number(r.limousine_betina_prod) || 0;
      const lbnp = Number(r.limousine_betina_non_prod) || 0;

      const bj = Number(r.babi_jantan) || 0;
      const bb = Number(r.babi_betina) || Number(r.babi_betina_prod) || 0;

      summary.po_jantan += pj; summary.po_betina_prod += pbp; summary.po_betina_non_prod += pbnp;
      summary.so_jantan += sj; summary.so_betina_prod += sbp; summary.so_betina_non_prod += sbnp;
      summary.simmental_jantan += smj; summary.simmental_betina_prod += smbp; summary.simmental_betina_non_prod += smbnp;
      summary.limousine_jantan += lj; summary.limousine_betina_prod += lbp; summary.limousine_betina_non_prod += lbnp;
      summary.babi_jantan += bj; summary.babi_betina += bb;

      summary.total_jantan += pj + sj + smj + lj + bj;
      summary.total_betina_prod += pbp + sbp + smbp + lbp + bb;
      summary.total_betina_non_prod += pbnp + sbnp + smbnp + lbnp;
    });

    summary.po_total = summary.po_jantan + summary.po_betina_prod + summary.po_betina_non_prod;
    summary.so_total = summary.so_jantan + summary.so_betina_prod + summary.so_betina_non_prod;
    summary.simmental_total = summary.simmental_jantan + summary.simmental_betina_prod + summary.simmental_betina_non_prod;
    summary.limousine_total = summary.limousine_jantan + summary.limousine_betina_prod + summary.limousine_betina_non_prod;
    summary.babi_total = summary.babi_jantan + summary.babi_betina;
    summary.grand_total = summary.total_jantan + summary.total_betina_prod + summary.total_betina_non_prod;

    return summary;
  };

  const getBabiSummary = (rows: any[]) => {
    let jantan = 0;
    let betina_prod = 0;
    let betina_non_prod = 0;
    (rows || []).forEach((r) => {
      jantan += Number(r.babi_jantan) || 0;
      betina_prod += Number(r.babi_betina_prod) || 0;
      betina_non_prod += Number(r.babi_betina_non_prod) || 0;
    });
    return {
      jantan,
      betina_prod,
      betina_non_prod,
      grand_total: jantan + betina_prod + betina_non_prod,
    };
  };

  // ── EXPORT EXCEL HANDLERS ──
  const exportRphToExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(
        rphList.map((r, i) => ({
          No: i + 1,
          'Nama Usaha': r.nama_usaha,
          Jenis: r.jenis,
          Pemilik: r.pemilik,
          Kontak: r.kontak,
          Lokasi: r.lokasi || r.alamat_pemilik,
          'Sertifikat Halal': r.sertifikat_halal ? 'Sudah' : 'Belum',
          'Sertifikat NKV': r.sertifikat_nkv || 'Belum',
        }))
      );
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data Rumah Potong');
      XLSX.writeFile(wb, `Data_Rumah_Potong_Kebumen_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch {
      alert('Gagal mengekspor data RPH.');
    }
  };

  const exportRumpunToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      LOKASI_CONFIGS.forEach((cfg) => {
        const rows = rumpunData[cfg.key] || [];
        const data = rows.map((r, idx) => {
          const totJ = (Number(r.po_jantan) || 0) + (Number(r.so_jantan) || 0) + (Number(r.simmental_jantan) || 0) + (Number(r.limousine_jantan) || 0);
          const totBP = (Number(r.po_betina_prod) || 0) + (Number(r.so_betina_prod) || 0) + (Number(r.simmental_betina_prod) || 0) + (Number(r.limousine_betina_prod) || 0);
          const totBNP = (Number(r.po_betina_non_prod) || 0) + (Number(r.so_betina_non_prod) || 0) + (Number(r.simmental_betina_non_prod) || 0) + (Number(r.limousine_betina_non_prod) || 0);
          const totBulan = totJ + totBP + totBNP;

          return {
            Bulan: r.bulan || BULAN_NAMES[idx],
            'PO Jantan': r.po_jantan || 0,
            'PO Betina Prod': r.po_betina_prod || 0,
            'PO Betina Non-P': r.po_betina_non_prod || 0,
            'SO Jantan': r.so_jantan || 0,
            'SO Betina Prod': r.so_betina_prod || 0,
            'SO Betina Non-P': r.so_betina_non_prod || 0,
            'Simmental Jantan': r.simmental_jantan || 0,
            'Simmental Betina Prod': r.simmental_betina_prod || 0,
            'Simmental Betina Non-P': r.simmental_betina_non_prod || 0,
            'Limousine Jantan': r.limousine_jantan || 0,
            'Limousine Betina Prod': r.limousine_betina_prod || 0,
            'Limousine Betina Non-P': r.limousine_betina_non_prod || 0,
            'Total Jantan': totJ,
            'Total Betina Prod': totBP,
            'Total Betina Non-P': totBNP,
            'Total Keseluruhan Bulan': totBulan,
          };
        });
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, cfg.label.substring(0, 31));
      });
      XLSX.writeFile(wb, `Data_Pemotongan_Rumpun_${selectedYear}.xlsx`);
    } catch {
      alert('Gagal mengekspor data pemotongan.');
    }
  };

  const exportKomoditasToExcel = () => {
    try {
      const months = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];
      const data = komoditasData.map((r, i) => {
        const item: any = {
          No: i + 1,
          'Nama Pemotongan': r.nama_pemotongan,
          Komoditas: r.komoditas,
        };
        let totJ = 0;
        let totB = 0;
        months.forEach((m) => {
          const j = Number(r[`${m}_jantan`]) || 0;
          const b = Number(r[`${m}_betina`]) || 0;
          item[`${m.toUpperCase()} Jantan`] = j;
          item[`${m.toUpperCase()} Betina`] = b;
          totJ += j;
          totB += b;
        });
        item['Total Jantan'] = totJ;
        item['Total Betina'] = totB;
        item['Total Keseluruhan'] = totJ + totB;
        return item;
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rekap Komoditas');
      XLSX.writeFile(wb, `Rekap_Pemotongan_Komoditas_${selectedYear}.xlsx`);
    } catch {
      alert('Gagal mengekspor rekap komoditas.');
    }
  };

  const filteredRph = useMemo(() => {
    return rphList.filter((r) => {
      const matchSearch =
        !searchRph ||
        (r.nama_usaha && r.nama_usaha.toLowerCase().includes(searchRph.toLowerCase())) ||
        (r.pemilik && r.pemilik.toLowerCase().includes(searchRph.toLowerCase())) ||
        (r.lokasi && r.lokasi.toLowerCase().includes(searchRph.toLowerCase()));

      const matchJenis = filterJenis === 'ALL' || r.jenis === filterJenis;
      const matchHalal = filterHalal === 'ALL' || (filterHalal === 'Sudah' ? r.sertifikat_halal : !r.sertifikat_halal);

      return matchSearch && matchJenis && matchHalal;
    });
  }, [rphList, searchRph, filterJenis, filterHalal]);

  // Form submit for Tab 3 (Admin only)
  const handleRphSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      if (editingItem) {
        const res = await fetch(`/api/pemotongan-hewan/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formRph),
        });
        if (res.ok) {
          loadRphData();
          setShowAddModal(false);
          setEditingItem(null);
        }
      } else {
        const res = await fetch('/api/pemotongan-hewan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formRph),
        });
        if (res.ok) {
          loadRphData();
          setShowAddModal(false);
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleDeleteRph = async (id: number) => {
    if (!isAdmin) return;
    if (!confirm('Apakah Anda yakin ingin menghapus unit pemotongan ini?')) return;

    try {
      const res = await fetch(`/api/pemotongan-hewan/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadRphData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (!isReady) return null;

  return (
    <div className="min-h-screen bg-purple-50/30 text-slate-900 font-sans selection:bg-purple-600 selection:text-white pb-24">
      
      {/* ── TOP HEADER (Tema Ungu Khas Kesmavet) ── */}
      <header className="border-b border-purple-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex flex-col md:flex-row md:items-center justify-between gap-4">
          
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
                <span className="text-xs font-bold text-purple-700 whitespace-nowrap">RPH, TPH &amp; TPU</span>
              </div>
              <h1 className="text-base sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                Manajemen Rumah Potong &amp; Pemotongan Hewan
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {activeTab === 'pemotongan_rumpun' && (
              <>
                <button
                  onClick={exportRumpunToExcel}
                  className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download size={15} strokeWidth={2.5} />
                  <span>Export 4 Tabel Excel</span>
                </button>

                {(canEdit || isAdmin) && (
                  <button
                    onClick={handleSaveRumpun}
                    disabled={isSavingRumpun}
                    className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    {isSavingRumpun ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    <span>Simpan Perubahan</span>
                  </button>
                )}
              </>
            )}

            {activeTab === 'rekap_komoditas' && (
              <>
                <button
                  onClick={exportKomoditasToExcel}
                  className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download size={15} strokeWidth={2.5} />
                  <span>Export Excel</span>
                </button>

                {isAdmin && (
                  <>
                    <button
                      onClick={handleAddKomoditasRow}
                      className="h-10 px-3.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus size={15} strokeWidth={2.5} />
                      <span>Tambah Baris</span>
                    </button>

                    <button
                      onClick={handleSaveKomoditas}
                      disabled={isSavingKomoditas}
                      className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      {isSavingKomoditas ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                      <span>Simpan Perubahan</span>
                    </button>
                  </>
                )}
              </>
            )}

            {activeTab === 'rumah_potong' && (
              <>
                <button
                  onClick={exportRphToExcel}
                  className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download size={15} strokeWidth={2.5} />
                  <span>Export Excel</span>
                </button>

                {isAdmin && (
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setFormRph({
                        nama_usaha: '',
                        jenis: 'TPU',
                        pemilik: '',
                        alamat_pemilik: '',
                        kontak: '',
                        lokasi: '',
                        status_perijinan: '',
                        sertifikat_halal: '',
                        sertifikat_nkv: 'belum',
                      });
                      setShowAddModal(true);
                    }}
                    className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    <span>Tambah Rumah Potong</span>
                  </button>
                )}
              </>
            )}
          </div>

        </div>
      </header>

      {/* ── WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* ═══════════════════════════════════════════════════════════════
            Opsi Pilihan Tahun di Tengah di Atas Konten (Sesuai Permintaan)
        ═══════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 bg-white p-3.5 rounded-2xl border border-purple-200 shadow-xs max-w-xl mx-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50/70">
            <Calendar className="text-purple-700" size={16} />
            <span className="text-xs font-bold text-purple-900">Pilih Tahun:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-black text-purple-800 focus:outline-none cursor-pointer"
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
              className="h-9 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Tambah Tahun Baru</span>
            </button>
          )}
        </div>

        {/* ── MAIN TAB NAVIGATION (URUTAN SESUAI PERMINTAAN USER) ── */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl border border-purple-100 shadow-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('pemotongan_rumpun')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'pemotongan_rumpun'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
            }`}
          >
            <TableIcon size={16} />
            <span>1. Input Pemotongan Rumah Potong Hewan</span>
          </button>

          <button
            onClick={() => setActiveTab('rekap_komoditas')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'rekap_komoditas'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
            }`}
          >
            <FileSpreadsheet size={16} />
            <span>2. Tempat Pemotongan Hewan (TPH)</span>
          </button>

          <button
            onClick={() => setActiveTab('rumah_potong')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'rumah_potong'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-purple-700 hover:bg-purple-50'
            }`}
          >
            <Building2 size={16} />
            <span>3. Data Rumah Potong</span>
          </button>
        </div>

        {/* ───────────────────────────────────────────────────────────
            TAB 1: INPUT PEMOTONGAN RUMAH POTONG HEWAN (DENGAN BUTTON SWITCHER KE SAMPING)
        ─────────────────────────────────────────────────────────── */}
        {activeTab === 'pemotongan_rumpun' && (
          <div className="space-y-4">
            
            {/* Horizontal Button Switcher untuk 4 Lokasi (Tidak Perlu Scroll Bawah) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {LOKASI_CONFIGS.map((cfg) => {
                  const isActive = selectedLokasiKey === cfg.key;
                  return (
                    <button
                      key={cfg.key}
                      onClick={() => setSelectedLokasiKey(cfg.key)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>

              {rumpunSaveMessage && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 animate-in fade-in">
                  {rumpunSaveMessage}
                </span>
              )}
            </div>

            {/* TABEL LOKASI TERPILIH DENGAN TOTAL TERPISAH (J, BP, BT, TOTAL) */}
            {(() => {
              const activeCfg = LOKASI_CONFIGS.find((c) => c.key === selectedLokasiKey) || LOKASI_CONFIGS[0];
              const isGombong = activeCfg.key === 'rph_gombong' || activeCfg.key === 'luar_rph_gombong';
              const rows = rumpunData[activeCfg.key] || [];
              const summary = getTableSummary(rows);

              return (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-4 sm:p-6 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-purple-100">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-600" />
                        <span>{activeCfg.label}</span>
                      </h3>
                      <p className="text-xs text-slate-500">{activeCfg.subtitle} &bull; Periode Tahun {selectedYear}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-black text-purple-800">
                        Total Pemotongan: {summary.grand_total.toLocaleString('id-ID')} Ekor
                      </span>
                    </div>
                  </div>

                  {/* Spreadsheet Inline-Editable Table dengan Rincian Total Bulanan Terpisah */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full min-w-[1280px] text-center text-xs border-collapse">
                      <thead>
                        {/* Level 1 Header: Rumpun Sapi & Babi & Total Terpisah */}
                        <tr className="bg-purple-900 text-white font-bold border border-purple-950">
                          <th rowSpan={2} className="p-3 border border-purple-800 text-center w-28 min-w-[110px] bg-purple-950 sticky left-0 z-20">
                            BULAN
                          </th>
                          <th colSpan={3} className="p-2.5 border border-purple-800 bg-purple-900/95 text-purple-100 text-xs">
                            PERANAKAN ONGOLE (PO)
                          </th>
                          <th colSpan={3} className="p-2.5 border border-purple-800 bg-purple-900/85 text-purple-100 text-xs">
                            SAPI ONGOLE / JAWA (SO)
                          </th>
                          <th colSpan={3} className="p-2.5 border border-purple-800 bg-purple-900/95 text-purple-100 text-xs">
                            SIMMENTAL
                          </th>
                          <th colSpan={3} className="p-2.5 border border-purple-800 bg-purple-900/85 text-purple-100 text-xs">
                            LIMOUSINE
                          </th>
                          {isGombong && (
                            <th colSpan={2} className="p-2.5 border border-purple-800 bg-rose-900 text-rose-100 font-extrabold text-xs">
                              BABI
                            </th>
                          )}
                          <th colSpan={4} className="p-2.5 border border-purple-800 bg-purple-950 text-purple-100 font-extrabold text-xs">
                            TOTAL BULANAN
                          </th>
                        </tr>
                        {/* Level 2 Header: Jantan / Betina */}
                        <tr className="bg-purple-50 text-purple-950 font-bold border border-purple-200 text-[11px]">
                          {/* PO */}
                          <th className="p-2 border border-purple-200 min-w-[65px]">J</th>
                          <th className="p-2 border border-purple-200 min-w-[65px]">BP</th>
                          <th className="p-2 border border-purple-200 min-w-[65px]">BT</th>
                          {/* SO */}
                          <th className="p-2 border border-purple-200 min-w-[65px]">J</th>
                          <th className="p-2 border border-purple-200 min-w-[65px]">BP</th>
                          <th className="p-2 border border-purple-200 min-w-[65px]">BT</th>
                          {/* Simmental */}
                          <th className="p-2 border border-purple-200 min-w-[65px]">J</th>
                          <th className="p-2 border border-purple-200 min-w-[65px]">BP</th>
                          <th className="p-2 border border-purple-200 min-w-[65px]">BT</th>
                          {/* Limousine */}
                          <th className="p-2 border border-purple-200 min-w-[65px]">J</th>
                          <th className="p-2 border border-purple-200 min-w-[65px]">BP</th>
                          <th className="p-2 border border-purple-200 min-w-[65px]">BT</th>
                          {/* Babi (Hanya J dan B) */}
                          {isGombong && (
                            <>
                              <th className="p-2 border border-purple-200 bg-rose-100 text-rose-950 font-black min-w-[65px]">J</th>
                              <th className="p-2 border border-purple-200 bg-rose-100 text-rose-950 font-black min-w-[65px]">B</th>
                            </>
                          )}
                          {/* Total Terpisah Setiap Bulan */}
                          <th className="p-2 border border-purple-200 bg-purple-100/90 text-purple-950 min-w-[68px]">Total J</th>
                          <th className="p-2 border border-purple-200 bg-purple-100/90 text-purple-950 min-w-[68px]">Total BP</th>
                          <th className="p-2 border border-purple-200 bg-purple-100/90 text-purple-950 min-w-[68px]">Total BT</th>
                          <th className="p-2 border border-purple-200 bg-purple-200 text-purple-950 font-black min-w-[80px]">Total Bulan</th>
                        </tr>
                      </thead>

                      <tbody>
                        {rows.map((row, monthIdx) => {
                          const pj = Number(row.po_jantan) || 0;
                          const pbp = Number(row.po_betina_prod) || 0;
                          const pbnp = Number(row.po_betina_non_prod) || 0;

                          const sj = Number(row.so_jantan) || 0;
                          const sbp = Number(row.so_betina_prod) || 0;
                          const sbnp = Number(row.so_betina_non_prod) || 0;

                          const smj = Number(row.simmental_jantan) || 0;
                          const smbp = Number(row.simmental_betina_prod) || 0;
                          const smbnp = Number(row.simmental_betina_non_prod) || 0;

                          const lj = Number(row.limousine_jantan) || 0;
                          const lbp = Number(row.limousine_betina_prod) || 0;
                          const lbnp = Number(row.limousine_betina_non_prod) || 0;

                          const bj = isGombong ? (Number(row.babi_jantan) || 0) : 0;
                          const bb = isGombong ? (Number(row.babi_betina) || Number(row.babi_betina_prod) || 0) : 0;

                          const rowTotalJantan = pj + sj + smj + lj + bj;
                          const rowTotalBetinaProd = pbp + sbp + smbp + lbp + bb;
                          const rowTotalBetinaNon = pbnp + sbnp + smbnp + lbnp;
                          const rowGrandTotal = rowTotalJantan + rowTotalBetinaProd + rowTotalBetinaNon;

                          return (
                            <tr key={monthIdx} className="hover:bg-purple-50/40 transition-colors">
                              {/* Month Name */}
                              <td className="p-2 border border-slate-200 font-bold text-slate-900 bg-slate-50 sticky left-0 z-10 text-left pl-3.5">
                                {row.bulan || BULAN_NAMES[monthIdx]}
                              </td>

                              {/* PO */}
                              <td className="p-1 border border-slate-200">
                                {canEdit || isAdmin ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.po_jantan ?? 0}
                                    onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'po_jantan', e.target.value)}
                                    className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                                  />
                                ) : (
                                  <span className="font-mono font-bold text-slate-800">{(row.po_jantan || 0).toLocaleString('id-ID')}</span>
                                )}
                              </td>
                              <td className="p-1 border border-slate-200">
                                {canEdit || isAdmin ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.po_betina_prod ?? 0}
                                    onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'po_betina_prod', e.target.value)}
                                    className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                                  />
                                ) : (
                                  <span className="font-mono font-bold text-slate-800">{(row.po_betina_prod || 0).toLocaleString('id-ID')}</span>
                                )}
                              </td>
                              <td className="p-1 border border-slate-200">
                                {canEdit || isAdmin ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.po_betina_non_prod ?? 0}
                                    onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'po_betina_non_prod', e.target.value)}
                                    className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                                  />
                                ) : (
                                  <span className="font-mono font-bold text-slate-800">{(row.po_betina_non_prod || 0).toLocaleString('id-ID')}</span>
                                )}
                              </td>

                              {/* SO */}
                              <td className="p-1 border border-slate-200">
                                {canEdit || isAdmin ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.so_jantan ?? 0}
                                    onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'so_jantan', e.target.value)}
                                    className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                                  />
                                ) : (
                                  <span className="font-mono font-bold text-slate-800">{(row.so_jantan || 0).toLocaleString('id-ID')}</span>
                                )}
                              </td>
                              <td className="p-1 border border-slate-200">
                                {canEdit || isAdmin ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.so_betina_prod ?? 0}
                                    onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'so_betina_prod', e.target.value)}
                                    className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                                  />
                                ) : (
                                  <span className="font-mono font-bold text-slate-800">{(row.so_betina_prod || 0).toLocaleString('id-ID')}</span>
                                )}
                              </td>
                              <td className="p-1 border border-slate-200">
                                {canEdit || isAdmin ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.so_betina_non_prod ?? 0}
                                    onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'so_betina_non_prod', e.target.value)}
                                    className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                                  />
                                ) : (
                                  <span className="font-mono font-bold text-slate-800">{(row.so_betina_non_prod || 0).toLocaleString('id-ID')}</span>
                                )}
                              </td>

                              {/* Simmental */}
                              <td className="p-1 border border-slate-200">
                                {canEdit || isAdmin ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.simmental_jantan ?? 0}
                                    onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'simmental_jantan', e.target.value)}
                                    className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                                  />
                                ) : (
                                  <span className="font-mono font-bold text-slate-800">{(row.simmental_jantan || 0).toLocaleString('id-ID')}</span>
                                )}
                              </td>
                              <td className="p-1 border border-slate-200">
                                {canEdit || isAdmin ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.simmental_betina_prod ?? 0}
                                    onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'simmental_betina_prod', e.target.value)}
                                    className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                                  />
                                ) : (
                                  <span className="font-mono font-bold text-slate-800">{(row.simmental_betina_prod || 0).toLocaleString('id-ID')}</span>
                                )}
                              </td>
                              <td className="p-1 border border-slate-200">
                                {canEdit || isAdmin ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.simmental_betina_non_prod ?? 0}
                                    onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'simmental_betina_non_prod', e.target.value)}
                                    className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                                  />
                                ) : (
                                  <span className="font-mono font-bold text-slate-800">{(row.simmental_betina_non_prod || 0).toLocaleString('id-ID')}</span>
                                )}
                              </td>

                              {/* Limousine */}
                              <td className="p-1 border border-slate-200">
                                {canEdit || isAdmin ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.limousine_jantan ?? 0}
                                    onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'limousine_jantan', e.target.value)}
                                    className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                                  />
                                ) : (
                                  <span className="font-mono font-bold text-slate-800">{(row.limousine_jantan || 0).toLocaleString('id-ID')}</span>
                                )}
                              </td>
                              <td className="p-1 border border-slate-200">
                                {canEdit || isAdmin ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.limousine_betina_prod ?? 0}
                                    onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'limousine_betina_prod', e.target.value)}
                                    className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                                  />
                                ) : (
                                  <span className="font-mono font-bold text-slate-800">{(row.limousine_betina_prod || 0).toLocaleString('id-ID')}</span>
                                )}
                              </td>
                              <td className="p-1 border border-slate-200">
                                {canEdit || isAdmin ? (
                                  <input
                                    type="number"
                                    min="0"
                                    value={row.limousine_betina_non_prod ?? 0}
                                    onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'limousine_betina_non_prod', e.target.value)}
                                    className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                                  />
                                ) : (
                                  <span className="font-mono font-bold text-slate-800">{(row.limousine_betina_non_prod || 0).toLocaleString('id-ID')}</span>
                                )}
                              </td>

                              {/* Babi (Hanya J dan B - Khusus Gombong & Luar Gombong di Samping Limousine) */}
                              {isGombong && (
                                <>
                                  <td className="p-1 border border-slate-200 bg-rose-50/30">
                                    {canEdit || isAdmin ? (
                                      <input
                                        type="number"
                                        min="0"
                                        value={row.babi_jantan ?? 0}
                                        onChange={(e) => handleRumpunCellChange(activeCfg.key, monthIdx, 'babi_jantan', e.target.value)}
                                        className="w-full h-8 text-center rounded border border-rose-200 focus:border-rose-600 focus:bg-white bg-white font-mono font-bold text-slate-900 text-xs outline-none"
                                      />
                                    ) : (
                                      <span className="font-mono font-bold text-slate-800">{(row.babi_jantan || 0).toLocaleString('id-ID')}</span>
                                    )}
                                  </td>
                                  <td className="p-1 border border-slate-200 bg-rose-50/30">
                                    {canEdit || isAdmin ? (
                                      <input
                                        type="number"
                                        min="0"
                                        value={row.babi_betina ?? (row.babi_betina_prod || 0)}
                                        onChange={(e) => {
                                          handleRumpunCellChange(activeCfg.key, monthIdx, 'babi_betina_prod', e.target.value);
                                          handleRumpunCellChange(activeCfg.key, monthIdx, 'babi_betina', e.target.value);
                                        }}
                                        className="w-full h-8 text-center rounded border border-rose-200 focus:border-rose-600 focus:bg-white bg-white font-mono font-bold text-slate-900 text-xs outline-none"
                                      />
                                    ) : (
                                      <span className="font-mono font-bold text-slate-800">{(Number(row.babi_betina) || Number(row.babi_betina_prod) || 0).toLocaleString('id-ID')}</span>
                                    )}
                                  </td>
                                </>
                              )}

                              {/* TOTAL TERPISAH SETIAP BULAN (Jantan, Betina Prod, Betina Non, Total Bulan) */}
                              <td className="p-2 border border-slate-200 font-mono font-bold text-slate-900 bg-purple-50/30">
                                {rowTotalJantan.toLocaleString('id-ID')}
                              </td>
                              <td className="p-2 border border-slate-200 font-mono font-bold text-slate-900 bg-purple-50/30">
                                {rowTotalBetinaProd.toLocaleString('id-ID')}
                              </td>
                              <td className="p-2 border border-slate-200 font-mono font-bold text-slate-900 bg-purple-50/30">
                                {rowTotalBetinaNon.toLocaleString('id-ID')}
                              </td>
                              <td className="p-2 border border-slate-200 font-extrabold font-mono text-purple-900 bg-purple-100/70">
                                {rowGrandTotal.toLocaleString('id-ID')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>

                      {/* SUMMARY / TOTALS FOOTER ROW */}
                      <tfoot>
                        <tr className="bg-purple-100/90 text-purple-950 font-bold border border-purple-200">
                          <td className="p-3 border border-purple-200 font-black text-left pl-3.5 sticky left-0 z-10 bg-purple-100">
                            TOTAL TAHUNAN
                          </td>
                          {/* PO */}
                          <td className="p-2 border border-purple-200 font-mono font-bold">{summary.po_jantan.toLocaleString('id-ID')}</td>
                          <td className="p-2 border border-purple-200 font-mono font-bold">{summary.po_betina_prod.toLocaleString('id-ID')}</td>
                          <td className="p-2 border border-purple-200 font-mono font-bold">{summary.po_betina_non_prod.toLocaleString('id-ID')}</td>
                          {/* SO */}
                          <td className="p-2 border border-purple-200 font-mono font-bold">{summary.so_jantan.toLocaleString('id-ID')}</td>
                          <td className="p-2 border border-purple-200 font-mono font-bold">{summary.so_betina_prod.toLocaleString('id-ID')}</td>
                          <td className="p-2 border border-purple-200 font-mono font-bold">{summary.so_betina_non_prod.toLocaleString('id-ID')}</td>
                          {/* Simmental */}
                          <td className="p-2 border border-purple-200 font-mono font-bold">{summary.simmental_jantan.toLocaleString('id-ID')}</td>
                          <td className="p-2 border border-purple-200 font-mono font-bold">{summary.simmental_betina_prod.toLocaleString('id-ID')}</td>
                          <td className="p-2 border border-purple-200 font-mono font-bold">{summary.simmental_betina_non_prod.toLocaleString('id-ID')}</td>
                          {/* Limousine */}
                          <td className="p-2 border border-purple-200 font-mono font-bold">{summary.limousine_jantan.toLocaleString('id-ID')}</td>
                          <td className="p-2 border border-purple-200 font-mono font-bold">{summary.limousine_betina_prod.toLocaleString('id-ID')}</td>
                          <td className="p-2 border border-purple-200 font-mono font-bold">{summary.limousine_betina_non_prod.toLocaleString('id-ID')}</td>
                          {/* Babi Footer (Khusus Gombong & Luar Gombong) */}
                          {isGombong && (
                            <>
                              <td className="p-2 border border-purple-200 font-mono font-bold bg-rose-100/70 text-rose-950">{summary.babi_jantan.toLocaleString('id-ID')}</td>
                              <td className="p-2 border border-purple-200 font-mono font-bold bg-rose-100/70 text-rose-950">{summary.babi_betina.toLocaleString('id-ID')}</td>
                            </>
                          )}
                          {/* Subtotals Footer */}
                          <td className="p-2 border border-purple-200 font-mono font-black text-purple-950 bg-purple-200/60">{summary.total_jantan.toLocaleString('id-ID')}</td>
                          <td className="p-2 border border-purple-200 font-mono font-black text-purple-950 bg-purple-200/60">{summary.total_betina_prod.toLocaleString('id-ID')}</td>
                          <td className="p-2 border border-purple-200 font-mono font-black text-purple-950 bg-purple-200/60">{summary.total_betina_non_prod.toLocaleString('id-ID')}</td>
                          <td className="p-2.5 border border-purple-200 font-black font-mono text-purple-950 bg-purple-300/80 text-sm">
                            {summary.grand_total.toLocaleString('id-ID')}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* ───────────────────────────────────────────────────────────
            TAB 2: TEMPAT PEMOTONGAN HEWAN (TPH) / REKAP KOMODITAS DENGAN BABI DI GOMBONG
        ─────────────────────────────────────────────────────────── */}
        {activeTab === 'rekap_komoditas' && (
          <div className="space-y-4">
            
            {/* Location Switcher Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 overflow-x-auto">
                {['ALL', 'RPH Kebumen', 'Luar RPH Kebumen', 'RPH Gombong', 'Luar RPH Gombong'].map((lok) => (
                  <button
                    key={lok}
                    onClick={() => setSelectedKomoditasFilter(lok)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedKomoditasFilter === lok
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-purple-50 text-slate-700'
                    }`}
                  >
                    {lok === 'ALL' ? 'Semua Lokasi' : lok}
                  </button>
                ))}
              </div>

              {komoditasSaveMessage && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 animate-in fade-in">
                  {komoditasSaveMessage}
                </span>
              )}
            </div>

            {/* Table TPH Komoditas */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden p-4 sm:p-6">
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[1750px] text-center text-xs border-collapse">
                  <thead>
                    <tr className="bg-purple-900 text-white font-bold border border-purple-950">
                      <th rowSpan={2} className="p-3 border border-purple-800 w-12 min-w-[48px] bg-purple-950 sticky left-0 z-20">NO</th>
                      <th rowSpan={2} className="p-3 border border-purple-800 text-left min-w-[190px] w-52 bg-purple-950 sticky left-[48px] z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                        NAMA PEMOTONGAN
                      </th>
                      <th rowSpan={2} className="p-3 border border-purple-800 text-left min-w-[130px] w-36 bg-purple-900">
                        KOMODITAS
                      </th>
                      {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map((m) => (
                        <th key={m} colSpan={2} className="p-2 border border-purple-800 bg-purple-900/90 text-purple-100 text-xs">
                          {m}
                        </th>
                      ))}
                      <th colSpan={3} className="p-2 border border-purple-800 bg-purple-950 text-purple-100 font-extrabold text-xs">
                        TOTAL TAHUNAN
                      </th>
                      {isAdmin && (
                        <th rowSpan={2} className="p-2 border border-purple-800 w-14 min-w-[56px] text-center bg-rose-950 text-rose-100">
                          AKSI
                        </th>
                      )}
                    </tr>
                    <tr className="bg-purple-50 text-purple-950 font-bold border border-purple-200 text-[11px]">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="contents">
                          <th className="p-2 border border-purple-200 min-w-[58px] w-16">J</th>
                          <th className="p-2 border border-purple-200 min-w-[58px] w-16">B</th>
                        </div>
                      ))}
                      <th className="p-2 border border-purple-200 bg-purple-100/70 min-w-[72px] w-20">Jantan</th>
                      <th className="p-2 border border-purple-200 bg-purple-100/70 min-w-[72px] w-20">Betina</th>
                      <th className="p-2 border border-purple-200 bg-purple-200 text-purple-950 font-black min-w-[85px] w-24">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoadingKomoditas ? (
                      <tr>
                        <td colSpan={isAdmin ? 29 : 28} className="p-8 text-center text-slate-400">
                          <Loader2 className="animate-spin inline-block mr-2 text-purple-600" size={16} />
                          Memuat data komoditas...
                        </td>
                      </tr>
                    ) : komoditasData.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 29 : 28} className="p-8 text-center text-slate-400">
                          Belum ada data rekap komoditas untuk tahun {selectedYear}.
                        </td>
                      </tr>
                    ) : (
                      komoditasData
                        .filter((row) => selectedKomoditasFilter === 'ALL' || (row.nama_pemotongan || '').toLowerCase().includes(selectedKomoditasFilter.toLowerCase()))
                        .map((row, idx) => {
                          const months = ['jan', 'feb', 'mar', 'apr', 'mei', 'jun', 'jul', 'agu', 'sep', 'okt', 'nov', 'des'];
                          let rowJantan = 0;
                          let rowBetina = 0;
                          months.forEach((m) => {
                            rowJantan += Number(row[`${m}_jantan`]) || 0;
                            rowBetina += Number(row[`${m}_betina`]) || 0;
                          });
                          const grandRowTotal = rowJantan + rowBetina;

                          return (
                            <tr key={idx} className="hover:bg-purple-50/40 transition-colors">
                              {/* Sticky No */}
                              <td className="p-2 border border-slate-200 font-semibold text-slate-500 bg-slate-50 sticky left-0 z-10">
                                {idx + 1}
                              </td>
                              
                              {/* Sticky Nama Pemotongan */}
                              <td className="p-1 border border-slate-200 text-left bg-white sticky left-[48px] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.08)]">
                                {isAdmin ? (
                                  <input
                                    type="text"
                                    value={row.nama_pemotongan || ''}
                                    onChange={(e) => handleKomoditasCellChange(idx, 'nama_pemotongan', e.target.value)}
                                    placeholder="Nama RPH/TPH..."
                                    className="w-full h-8 px-2 rounded border border-slate-200/70 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-xs font-bold text-slate-900 outline-none"
                                  />
                                ) : (
                                  <span className="font-bold text-slate-900 pl-2">{row.nama_pemotongan}</span>
                                )}
                              </td>

                              {/* Komoditas Ternak */}
                              <td className="p-1 border border-slate-200 text-left">
                                {isAdmin ? (
                                  <select
                                    value={row.komoditas || 'Sapi Potong'}
                                    onChange={(e) => handleKomoditasCellChange(idx, 'komoditas', e.target.value)}
                                    className="w-full h-8 px-1.5 rounded border border-slate-200/70 focus:border-purple-600 focus:bg-white bg-slate-50/40 text-xs font-bold text-purple-700 outline-none"
                                  >
                                    {KOMODITAS_LIST.map((k) => (
                                      <option key={k} value={k}>{k}</option>
                                    ))}
                                  </select>
                                ) : (
                                  <span className="font-bold text-purple-700 pl-2">{row.komoditas}</span>
                                )}
                              </td>

                              {/* 12 Months Cells (J & B) */}
                              {months.map((m) => (
                                <div key={m} className="contents">
                                  <td className="p-1 border border-slate-200">
                                    {isAdmin ? (
                                      <input
                                        type="number"
                                        min="0"
                                        value={row[`${m}_jantan`] ?? 0}
                                        onChange={(e) => handleKomoditasCellChange(idx, `${m}_jantan`, Math.max(0, parseInt(e.target.value, 10) || 0))}
                                        className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                                      />
                                    ) : (
                                      <span className="font-mono font-semibold text-slate-800">{(row[`${m}_jantan`] || 0).toLocaleString('id-ID')}</span>
                                    )}
                                  </td>
                                  <td className="p-1 border border-slate-200">
                                    {isAdmin ? (
                                      <input
                                        type="number"
                                        min="0"
                                        value={row[`${m}_betina`] ?? 0}
                                        onChange={(e) => handleKomoditasCellChange(idx, `${m}_betina`, Math.max(0, parseInt(e.target.value, 10) || 0))}
                                        className="w-full h-8 text-center rounded border border-slate-200/60 focus:border-purple-600 focus:bg-white bg-slate-50/40 font-mono font-bold text-slate-900 text-xs outline-none"
                                      />
                                    ) : (
                                      <span className="font-mono font-semibold text-slate-800">{(row[`${m}_betina`] || 0).toLocaleString('id-ID')}</span>
                                    )}
                                  </td>
                                </div>
                              ))}

                              {/* Subtotal Row */}
                              <td className="p-2 border border-slate-200 font-mono font-bold text-slate-900 bg-purple-50/30">
                                {rowJantan.toLocaleString('id-ID')}
                              </td>
                              <td className="p-2 border border-slate-200 font-mono font-bold text-slate-900 bg-purple-50/30">
                                {rowBetina.toLocaleString('id-ID')}
                              </td>
                              <td className="p-2 border border-slate-200 font-mono font-black text-purple-950 bg-purple-100/70">
                                {grandRowTotal.toLocaleString('id-ID')}
                              </td>

                              {/* Action: Tambah Baris di Samping Hapus */}
                              {isAdmin && (
                                <td className="p-1 border border-slate-200 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={handleAddKomoditasRow}
                                      className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center justify-center transition-colors cursor-pointer"
                                      title="Tambah Baris Baru"
                                    >
                                      <Plus size={13} strokeWidth={2.5} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteKomoditasRow(idx)}
                                      className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                                      title="Hapus baris"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ───────────────────────────────────────────────────────────
            TAB 3: DATA RUMAH POTONG (RPH / TPH / TPU)
        ─────────────────────────────────────────────────────────── */}
        {activeTab === 'rumah_potong' && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={searchRph}
                    onChange={(e) => setSearchRph(e.target.value)}
                    placeholder="Cari nama usaha, pemilik, atau lokasi..."
                    className="w-full h-10 pl-10 pr-3.5 text-xs rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={filterJenis}
                  onChange={(e) => setFilterJenis(e.target.value)}
                  className="h-10 px-3.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:border-purple-600"
                >
                  <option value="ALL">Semua Jenis Unit</option>
                  <option value="RPH">RPH (Rumah Potong Hewan)</option>
                  <option value="TPU">TPU (Tempat Pemotongan Unggas)</option>
                  <option value="RPU">RPU (Rumah Potong Unggas)</option>
                  <option value="TPH">TPH (Tempat Pemotongan Hewan)</option>
                </select>

                <select
                  value={filterHalal}
                  onChange={(e) => setFilterHalal(e.target.value)}
                  className="h-10 px-3.5 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none focus:border-purple-600"
                >
                  <option value="ALL">Semua Status Halal</option>
                  <option value="Sudah">Sudah Bersertifikat</option>
                  <option value="Belum">Belum Bersertifikat</option>
                </select>
              </div>
            </div>

            {/* Table RPH List */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-purple-900 text-white font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3.5 w-12 text-center">NO</th>
                      <th className="p-3.5">NAMA USAHA</th>
                      <th className="p-3.5 text-center">JENIS</th>
                      <th className="p-3.5">PEMILIK</th>
                      <th className="p-3.5">KONTAK</th>
                      <th className="p-3.5">LOKASI / ALAMAT</th>
                      <th className="p-3.5 text-center">SERTIFIKAT HALAL</th>
                      <th className="p-3.5 text-center">NKV</th>
                      {isAdmin && <th className="p-3.5 text-center w-24">AKSI</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {isLoadingRph ? (
                      <tr>
                        <td colSpan={isAdmin ? 9 : 8} className="p-8 text-center text-slate-400">
                          <Loader2 className="animate-spin inline-block mr-2 text-purple-600" size={16} />
                          Memuat data rumah potong...
                        </td>
                      </tr>
                    ) : filteredRph.length === 0 ? (
                      <tr>
                        <td colSpan={isAdmin ? 9 : 8} className="p-8 text-center text-slate-400">
                          Tidak ada data yang sesuai.
                        </td>
                      </tr>
                    ) : (
                      filteredRph.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-purple-50/30 transition-colors">
                          <td className="p-3.5 text-center font-semibold text-slate-400">{idx + 1}</td>
                          <td className="p-3.5 font-bold text-slate-900">{item.nama_usaha}</td>
                          <td className="p-3.5 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
                              {item.jenis}
                            </span>
                          </td>
                          <td className="p-3.5 font-medium">{item.pemilik || '-'}</td>
                          <td className="p-3.5 text-slate-500">{item.kontak || '-'}</td>
                          <td className="p-3.5 text-slate-600 max-w-xs truncate">{item.lokasi || item.alamat_pemilik || '-'}</td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                item.sertifikat_halal
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {item.sertifikat_halal ? 'Sudah' : 'Belum'}
                            </span>
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                item.sertifikat_nkv && !item.sertifikat_nkv.includes('belum')
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-slate-50 text-slate-500 border-slate-200'
                              }`}
                            >
                              {item.sertifikat_nkv || 'Belum'}
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="p-3.5 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingItem(item);
                                    setFormRph({
                                      nama_usaha: item.nama_usaha || '',
                                      jenis: item.jenis || 'TPU',
                                      pemilik: item.pemilik || '',
                                      alamat_pemilik: item.alamat_pemilik || '',
                                      kontak: item.kontak || '',
                                      lokasi: item.lokasi || '',
                                      status_perijinan: item.status_perijinan || '',
                                      sertifikat_halal: item.sertifikat_halal || '',
                                      sertifikat_nkv: item.sertifikat_nkv || 'belum',
                                    });
                                    setShowAddModal(true);
                                  }}
                                  className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteRph(item.id)}
                                  className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 size={13} />
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

      </main>

      {/* ───────────────────────────────────────────────────────────
          MODAL: TAMBAH / EDIT RUMAH POTONG (ADMIN ONLY)
      ─────────────────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 absolute top-5 right-5 cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingItem ? 'Edit Data Rumah Potong' : 'Tambah Unit Rumah Potong Baru'}
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Kelola informasi unit RPH, TPH, TPU, atau RPU di Kabupaten Kebumen.
            </p>

            <form onSubmit={handleRphSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Nama Usaha / Tempat <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formRph.nama_usaha}
                    onChange={(e) => setFormRph({ ...formRph, nama_usaha: e.target.value })}
                    placeholder="Contoh: RPH Kalirejo"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Jenis Usaha <span className="text-red-500">*</span></label>
                  <select
                    value={formRph.jenis}
                    onChange={(e) => setFormRph({ ...formRph, jenis: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                  >
                    <option value="RPH">RPH (Rumah Potong Hewan)</option>
                    <option value="TPU">TPU (Tempat Pemotongan Unggas)</option>
                    <option value="RPU">RPU (Rumah Potong Unggas)</option>
                    <option value="TPH">TPH (Tempat Pemotongan Hewan)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Nama Pemilik / Pengelola <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formRph.pemilik}
                    onChange={(e) => setFormRph({ ...formRph, pemilik: e.target.value })}
                    placeholder="Nama pemilik..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Kontak / Telepon</label>
                  <input
                    type="text"
                    value={formRph.kontak}
                    onChange={(e) => setFormRph({ ...formRph, kontak: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-700">Lokasi / Alamat Lengkap <span className="text-red-500">*</span></label>
                <textarea
                  required
                  rows={2}
                  value={formRph.lokasi}
                  onChange={(e) => setFormRph({ ...formRph, lokasi: e.target.value, alamat_pemilik: e.target.value })}
                  placeholder="Alamat desa, kecamatan..."
                  className="w-full p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Sertifikat Halal</label>
                  <input
                    type="text"
                    value={formRph.sertifikat_halal}
                    onChange={(e) => setFormRph({ ...formRph, sertifikat_halal: e.target.value })}
                    placeholder="No Sertifikat / Sudah / Belum"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-slate-700">Nomor Kontrol Veteriner (NKV)</label>
                  <input
                    type="text"
                    value={formRph.sertifikat_nkv}
                    onChange={(e) => setFormRph({ ...formRph, sertifikat_nkv: e.target.value })}
                    placeholder="Nomor NKV..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-10 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 size={15} />
                  <span>Simpan Rumah Potong</span>
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
              Buat periode pemotongan hewan untuk tahun berikutnya.
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
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:border-purple-600 text-sm"
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
                  className="flex-1 h-10 px-5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold shadow-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  {isAddingYear ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  <span>{isAddingYear ? 'Menambahkan...' : 'Buat Tahun Baru'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
