'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  getAuthSession,
  clearAuthSession,
  checkModuleAccess,
  checkSubmenuAccess,
} from '@/lib/auth';
import {
  ArrowLeft,
  LogOut,
  ChevronRight,
  Stethoscope,
  Activity,
  Syringe,
  Building2,
  ShieldCheck,
  HeartPulse,
  Lock,
} from 'lucide-react';

export default function KeswanPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const localUser = getAuthSession();
      const { data: supaData } = await supabase.auth.getSession();

      if (!localUser && !supaData.session) {
        router.push('/login');
        return;
      }

      if (!checkModuleAccess('keswan')) {
        alert('Akses ke modul Keswan dibatasi oleh Administrator.');
        router.push('/beranda');
        return;
      }

      setIsAuthorized(true);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    clearAuthSession();
    try {
      await supabase.auth.signOut();
    } catch {}
    router.push('/login');
  };

  const menus = [
    {
      id: 'data-vaksinasi',
      title: 'Data Vaksinasi PMK & Penyakit Menular',
      desc: 'Pencatatan target & realisasi vaksinasi PMK, LSD, log harian dosis, dan alokasi droping vaksin APBD',
      icon: Syringe,
      path: '/keswan/data-vaksinasi',
      badge: 'Vaksinasi PMK & LSD',
    },
    {
      id: 'lalu-lintas-ternak',
      title: 'Lalu Lintas Ternak',
      desc: 'Pencatatan dan pengawasan pergerakan ternak antar wilayah, penerbitan SKKH, dan rekapitulasi dokumen lalin',
      icon: ShieldCheck,
      path: '/keswan/data-vaksinasi',
      badge: 'Lalu Lintas',
    },
    {
      id: 'laporan-penyakit',
      title: 'Laporan Penyakit Ternak',
      desc: 'Rekapitulasi kasus penyakit hewan menular strategis, outbreak monitoring, dan tindakan pengendalian wabah',
      icon: HeartPulse,
      path: '/keswan/data-vaksinasi',
      badge: 'Surveilans Penyakit',
    },
    {
      id: 'puskeswan',
      title: 'Kinerja Pelayanan Puskeswan',
      desc: 'Rekapitulasi diagnosa penyakit, pelayanan medis aktif/pasif, pusling keliling, dan penerimaan retribusi 8 Puskeswan',
      icon: Building2,
      path: '/keswan/puskeswan',
      badge: 'Klinik & Pusling',
    },
  ];

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-blue-50/50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center animate-spin shadow-xs">
            <Activity size={22} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-800">
            Memeriksa Hak Akses Keswan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white pb-20">
      
      {/* ── TOP APP BAR ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <Link
              href="/beranda"
              className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all shrink-0"
              aria-label="Kembali ke Beranda"
            >
              <ArrowLeft size={20} className="text-slate-600" />
            </Link>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Modul Keswan</p>
              <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Kesehatan Hewan
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLogout}
              title="Keluar"
              aria-label="Keluar"
              className="min-h-touch min-w-touch h-11 w-11 sm:w-auto sm:px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center sm:gap-2 transition-all shadow-xs cursor-pointer"
            >
              <LogOut size={16} strokeWidth={2.5} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>

        </div>
      </header>

      {/* ── FULL-WIDTH TOP ARC BANNER (Tema Biru) ── */}
      <section className="w-full bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white [border-bottom-left-radius:50%_25px] [border-bottom-right-radius:50%_25px] sm:[border-bottom-left-radius:50%_50px] sm:[border-bottom-right-radius:50%_50px] shadow-lg relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-12 sm:pb-16 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8 relative z-10">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0 shadow-inner">
              <Stethoscope size={30} strokeWidth={2.5} />
            </div>
            <div className="space-y-1.5 sm:space-y-2 min-w-0">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Bidang Keswan
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-blue-50 max-w-2xl leading-relaxed text-justify">
                Pusat data monitoring vaksinasi penyakit menular ternak strategis (PMK &amp; LSD), pelayanan medis di 8 Puskeswan, rekapitulasi log dosis harian, dan pencegahan wabah.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/10 border border-white/20 text-xs sm:text-sm text-blue-100">
              <span className="font-bold text-white block text-sm sm:text-base">{menus.length} Layanan Data</span>
              Tersinkronisasi Realtime
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT (MENU GRID) ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-blue-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              Menu &amp; Pelayanan Data Keswan
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-4xl">
            {menus.map((menu) => {
              const IconComp = menu.icon;
              const isPermitted = checkSubmenuAccess('keswan', menu.id);

              if (!isPermitted) {
                return (
                  <div
                    key={menu.title}
                    onClick={() => alert(`Akses ke menu "${menu.title}" dibatasi oleh Administrator.`)}
                    className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-6 flex flex-col justify-between min-h-[160px] opacity-60 cursor-not-allowed shadow-xs transition-all duration-200"
                    title="Akses Dibatasi oleh Admin"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center shadow-xs">
                          <IconComp size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                          <Lock size={10} />
                          <span>Terkunci</span>
                        </span>
                      </div>

                      <div>
                        <h4 className="text-lg sm:text-xl font-extrabold text-slate-600 leading-snug">
                          {menu.title}
                        </h4>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-400">
                      <span>Akses Dibatasi</span>
                      <Lock size={14} />
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={menu.title}
                  href={menu.path}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between min-h-[160px] shadow-xs hover:border-blue-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                        <IconComp size={24} strokeWidth={2.5} />
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                        {menu.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                        {menu.title}
                      </h4>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-bold text-blue-700 group-hover:text-blue-800">
                    <span>Buka Layanan</span>
                    <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </main>

    </div>
  );
}