'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { ArrowLeft, Search, Download } from 'lucide-react';

const TOTAL_ROW = [
  4986, 6337, 6078, 8725, 7291, 31557, 64996, 0, 0, 0, 0, 0, 0, 0, 12, 14, 13,
  23, 38, 70, 170, 4, 3, 28, 17, 112, 110, 274, 8742, 12278, 11846, 13692,
  14738, 39959, 101255, 2484, 3385, 2721, 3357, 3919, 9605, 25552, 137, 184,
  108, 195, 37, 119, 780, 864412, 73976, 2636000, 70808, 87200, 81573, 2153,
  54168, 1303, 2538, 3907,
];

const HEADERS = [
  'AJ Sapi', 'AB Sapi', 'MJ Sapi', 'MB Sapi', 'DJ Sapi', 'DB Sapi', 'Total Sapi Potong',
  'AJ Perah', 'AB Perah', 'MJ Perah', 'MB Perah', 'DJ Perah', 'DB Perah', 'Total Sapi Perah',
  'AJ Kerbau', 'AB Kerbau', 'MJ Kerbau', 'MB Kerbau', 'DJ Kerbau', 'DB Kerbau', 'Total Kerbau',
  'AJ Kuda', 'AB Kuda', 'MJ Kuda', 'MB Kuda', 'DJ Kuda', 'DB Kuda', 'Total Kuda',
  'AJ Kambing', 'AB Kambing', 'MJ Kambing', 'MB Kambing', 'DJ Kambing', 'DB Kambing', 'Total Kambing',
  'AJ Domba', 'AB Domba', 'MJ Domba', 'MB Domba', 'DJ Domba', 'DB Domba', 'Total Domba',
  'AJ Babi', 'AB Babi', 'MJ Babi', 'MB Babi', 'DJ Babi', 'DB Babi', 'Total Babi',
  'Ayam Kampung', 'Ayam Petelur', 'Ayam Broiler', 'Puyuh', 'Itik', 'Entog', 'Angsa', 'Merpati',
  'Kelinci Jantan', 'Kelinci Betina',
];

export default function Populasi2025() {
  const [search, setSearch] = useState('');
  const [dataPopulasi, setDataPopulasi] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/get-populasi');
        const data = await response.json();
        setDataPopulasi(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Gagal menyedot data populasi 2025:', error);
        setDataPopulasi([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = Array.isArray(dataPopulasi)
    ? dataPopulasi.filter(
        (row) =>
          (row.kec || '').toLowerCase().includes(search.toLowerCase()) ||
          (row.desa || '').toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleExportExcel = () => {
    if (!dataPopulasi || dataPopulasi.length === 0) return alert('Belum ada data populasi untuk diekspor!');
    const rows = filteredData.map((row, idx) => {
      const obj: any = {
        No: idx + 1,
        Kecamatan: row.kec,
        Desa: row.desa,
      };
      if (Array.isArray(row.v)) {
        HEADERS.forEach((h, hIdx) => {
          obj[h] = row.v[hIdx] ?? 0;
        });
      }
      return obj;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Populasi_2025');
    XLSX.writeFile(wb, `Data_Populasi_Ternak_2025_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-600 selection:text-white pb-20">
      
      {/* ── TOP HEADER (Tema Hijau - Lega & Bernapas) ── */}
      <header className="border-b border-emerald-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/bitpro/populasi-dan-produksi"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Menu Populasi"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/bitpro" className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors truncate">
                  Bitpro
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">Populasi 2025</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Data Populasi Ternak TW 4 Tahun 2025
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

            <div className="relative w-36 sm:w-64">
              <Search size={16} strokeWidth={2.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari desa/kecamatan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full min-h-touch h-11 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-colors"
              />
            </div>
          </div>

        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h2 className="font-bold text-sm text-slate-900">
              Tabel Data Populasi Lengkap (16 Komoditas Ternak)
            </h2>
            <span className="font-sans text-xs text-slate-500">
              Menampilkan {filteredData.length} baris desa terdaftar
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <span className="font-sans text-xs text-slate-500 uppercase tracking-widest animate-pulse">
                Memuat data populasi ternak 2025...
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[75vh] overflow-y-auto">
              <table className="w-full text-xs text-left whitespace-nowrap border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider sticky top-0 z-20 border-b border-slate-200 shadow-sm">
                  <tr>
                    <th className="p-3 w-12 text-center sticky left-0 bg-slate-100 z-30 border-r border-slate-200">No</th>
                    <th className="p-3 sticky left-[48px] bg-slate-100 z-30 border-r border-slate-200">Kecamatan</th>
                    <th className="p-3 sticky left-[168px] bg-slate-100 z-30 border-r border-slate-200">Desa</th>
                    {HEADERS.map((h, i) => (
                      <th key={i} className="p-3 text-right font-sans border-r border-slate-200">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-center font-sans text-slate-400 sticky left-0 bg-white z-10 border-r border-slate-100">
                        {row.no}
                      </td>
                      <td className="p-3 font-semibold text-slate-900 sticky left-[48px] bg-white z-10 border-r border-slate-100">
                        {row.kec}
                      </td>
                      <td className="p-3 text-slate-700 sticky left-[168px] bg-white z-10 border-r border-slate-100">
                        {row.desa}
                      </td>
                      {row.v.map((val: any, i: number) => (
                        <td key={i} className="p-3 text-right font-sans tabular-nums border-r border-slate-100">
                          {Number(val).toLocaleString('id-ID')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 text-slate-900 font-bold sticky bottom-0 z-20 border-t-2 border-slate-300">
                    <td colSpan={3} className="p-3 text-center sticky left-0 bg-slate-100 z-30 border-r border-slate-300 font-sans uppercase">
                      TOTAL KABUPATEN
                    </td>
                    {TOTAL_ROW.map((val, i) => (
                      <td key={i} className="p-3 text-right font-sans text-emerald-600 font-bold border-r border-slate-300">
                        {Number(val).toLocaleString('id-ID')}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

        </div>

      </main>

    </div>
  );
}