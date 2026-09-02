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
  Car,
  ShieldCheck,
  Lock,
} from 'lucide-react';

export default function AsetPage() {
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

      if (!checkModuleAccess('aset')) {
        alert('Akses ke modul Aset dibatasi oleh Administrator.');
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
      id: 'inventaris-kendaraan',
      title: 'Inventaris Kendaraan Dinas',
      desc: 'Pencatatan nomor polisi, tipe kendaraan roda 2 & roda 4, penanggung jawab pemegang kendaraan, status pajak tahunan, dan 5 tahunan',
      icon: Car,
      path: '/aset/inventaris-kendaraan',
      badge: 'Inventarisasi Aset',
    },
  ];

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-amber-50/50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center animate-spin shadow-xs">
            <Car size={22} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Memeriksa Hak Akses Modul Aset...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-600 selection:text-white pb-20">
      
      {/* ── TOP HEADER DENGAN BREADCRUMB ── */}
      <header className="border-b border-amber-100 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 min-h-[80px] sm:min-h-[88px] flex items-center justify-between gap-3">
          
          {/* Brand & Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link
              href="/beranda"
              className="min-h-touch min-w-touch w-11 h-11 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center transition-all shadow-xs shrink-0"
              aria-label="Kembali ke Beranda"
            >
              <ArrowLeft size={18} strokeWidth={2.5} />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Link href="/beranda" className="text-xs font-semibold text-slate-500 hover:text-amber-700 transition-colors truncate">
                  Beranda
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-bold text-amber-700 whitespace-nowrap">Bidang Aset</span>
              </div>
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-tight truncate">
                Manajemen Aset &amp; Kendaraan Dinas
              </h1>
            </div>
          </div>

          {/* Quick Actions */}
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

      {/* ── FULL-WIDTH TOP ARC BANNER (Tema Oranye Asli) ── */}
      <section className="w-full bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 text-white [border-bottom-left-radius:50%_25px] [border-bottom-right-radius:50%_25px] sm:[border-bottom-left-radius:50%_50px] sm:[border-bottom-right-radius:50%_50px] shadow-lg relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-12 sm:pb-16 flex flex-col md:flex-row md:items-center justify-between gap-6 sm:gap-8 relative z-10">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center shrink-0 shadow-inner">
              <Car size={30} strokeWidth={2.5} />
            </div>
            <div className="space-y-1.5 sm:space-y-2 min-w-0">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Bidang Manajemen Aset
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-amber-50 max-w-2xl leading-relaxed text-justify">
                Pencatatan dan inventarisasi kendaraan operasional dinas, riwayat pemegang kendaraan, monitoring masa berlaku pajak tahunan &amp; 5 tahunan kendaraan roda 2 dan roda 4.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white/10 border border-white/20 text-xs sm:text-sm text-amber-100">
              <span className="font-bold text-white block text-sm sm:text-base">{menus.length} Layanan Data</span>
              Tersinkronisasi Realtime
            </div>
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT (KARTU MODUL RAPI) ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
              Menu &amp; Pelayanan Manajemen Aset
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {menus.map((menu) => {
              const IconComp = menu.icon;
              const isPermitted = checkSubmenuAccess('aset', menu.id);

              if (!isPermitted) {
                return (
                  <div
                    key={menu.title}
                    onClick={() => alert(`Akses ke menu "${menu.title}" dibatasi oleh Administrator.`)}
                    className="group rounded-2xl border border-slate-200 bg-slate-50/90 p-6 flex flex-col justify-between min-h-[160px] opacity-60 cursor-not-allowed shadow-xs transition-all duration-200"
                    title="Akses Dibatasi oleh Admin"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center shadow-xs shrink-0">
                          <IconComp size={24} />
                        </div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1 shrink-0">
                          <Lock size={10} />
                          <span>Terkunci</span>
                        </span>
                      </div>

                      <h4 className="text-lg sm:text-xl font-extrabold sm:font-black text-slate-700 leading-snug tracking-tight">
                        {menu.title}
                      </h4>
                    </div>

                    <div className="pt-3.5 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-400 mt-4">
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
                  className="group rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between min-h-[160px] shadow-xs hover:border-amber-500 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 shrink-0">
                        <IconComp size={24} />
                      </div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-800 border-amber-200 shrink-0">
                        {menu.badge}
                      </span>
                    </div>

                    <h4 className="text-lg sm:text-xl font-extrabold sm:font-black text-slate-900 group-hover:text-amber-700 transition-colors leading-snug tracking-tight">
                      {menu.title}
                    </h4>
                  </div>

                  <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-bold text-amber-700 group-hover:text-amber-800 mt-4">
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
