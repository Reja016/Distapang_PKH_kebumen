'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  getAuthSession,
  clearAuthSession,
  checkModuleAccess,
  AuthSessionUser,
} from '@/lib/auth';
import {
  LogOut,
  ExternalLink,
  Activity,
  Landmark,
  Lock,
  Users,
} from 'lucide-react';
import UserManagementModal from '@/components/UserManagementModal';

export default function BerandaPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDisplay, setUserDisplay] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const localUser = getAuthSession();
        const { data: supaData } = await supabase.auth.getSession();

        if (!localUser && !supaData.session) {
          router.push('/');
          return;
        }

        setIsLoggedIn(true);

        if (localUser) {
          setUserDisplay(localUser.nama ? `${localUser.nama} (${localUser.nip_username})` : localUser.nip_username);
          setIsAdmin(localUser.role === 'Administrator');
        } else if (supaData.session) {
          const email = supaData.session.user?.email || '';
          setUserDisplay(email);
          setIsAdmin(email.toLowerCase().includes('admin'));
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    clearAuthSession();
    try {
      await supabase.auth.signOut();
    } catch {}
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center animate-spin text-blue-600">
            <Activity size={22} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Memuat Dashboard Petugas...
          </p>
        </div>
      </div>
    );
  }

  const hasBitpro = checkModuleAccess('bitpro');
  const hasKeswan = checkModuleAccess('keswan');
  const hasKesmavet = checkModuleAccess('kesmavet');
  const hasAset = checkModuleAccess('aset');

  return (
    <div className="min-h-screen bg-slate-900 font-sans selection:bg-blue-600 selection:text-white relative">
      
      {/* ── WALLPAPER LATAR BELAKANG PETERNAKAN & DOKTER HEWAN ── */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/images/beranda-hero-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-900/55 to-slate-950/80 backdrop-blur-[2px]" />
      </div>

      {/* ── KONTEN UTAMA ── */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* ── TOP NAV ACTIONS ── */}
        <header className="w-full px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md">
              {isAdmin ? '★ Administrator' : 'Petugas Teknis'}
            </span>
            <span className="text-xs text-white/80 hidden sm:inline font-medium">
              ({userDisplay})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Kelola Anggota (Hanya untuk Admin) */}
            {isAdmin && (
              <button
                onClick={() => setShowUserModal(true)}
                title="Kelola Anggota & Hak Akses"
                className="min-h-touch h-10 px-3.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs backdrop-blur-md cursor-pointer"
              >
                <Users size={14} strokeWidth={2.5} />
                <span className="hidden sm:inline">Kelola Anggota</span>
              </button>
            )}

            <Link
              href="/"
              title="Portal Publik"
              className="min-h-touch h-10 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <ExternalLink size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline">Portal Publik</span>
            </Link>

            <button
              onClick={handleLogout}
              title="Keluar"
              className="min-h-touch h-10 px-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <LogOut size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* ── CENTER HERO SECTION ── */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 flex flex-col items-center justify-center w-full text-center">
          
          {/* Logo Tengah Melingkar Sempurna */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-full bg-white p-3 shadow-2xl flex items-center justify-center mb-5 ring-4 ring-white/40 backdrop-blur-md overflow-hidden shrink-0 transition-transform hover:scale-105">
            <img
              src="/logo-simantap.png"
              alt="Logo SiMantap"
              className="w-full h-full object-contain"
              onError={(e: any) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextSibling) e.currentTarget.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden text-blue-600 items-center justify-center">
              <Landmark size={36} />
            </div>
          </div>

          {/* Judul Utama */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl drop-shadow-sm">
            Sistem Informasi <br className="hidden sm:inline" /> Manajemen{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300">
              Peternakan Terpadu
            </span>
          </h1>

          {/* Sub-judul */}
          <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-2 tracking-wide uppercase drop-shadow-xs">
            Bidang Peternakan dan Kesehatan Hewan
          </p>

          {/* Status Sesi Petugas */}
          <div className="mt-4 mb-10 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-xs font-semibold backdrop-blur-md shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sesi Petugas Aktif</span>
          </div>

          {/* ── 4 KARTU MODUL FULL GAMBAR (TANPA TEKS) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            
            {/* ── KARTU 01: BITPRO ── */}
            {hasBitpro ? (
              <Link
                href="/bitpro"
                className="group relative aspect-square w-full rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 border-2 border-emerald-400/60 bg-emerald-950 flex flex-col cursor-pointer"
              >
                <img
                  src="/logo/card-bitpro.png"
                  alt="Modul Bitpro"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            ) : (
              <div
                onClick={() => alert('Akses ke modul Bitpro dibatasi oleh Administrator.')}
                className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-xl border-2 border-slate-600 bg-slate-900 opacity-75 cursor-not-allowed"
                title="Akses Dibatasi"
              >
                <img
                  src="/logo/card-bitpro.png"
                  alt="Modul Bitpro (Terbatas)"
                  className="w-full h-full object-cover grayscale"
                />
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4 text-center">
                  <Lock size={28} className="mb-2 text-red-400" />
                  <span className="text-xs font-bold uppercase tracking-wider bg-red-600 px-3 py-1 rounded-full shadow-md">
                    Akses Dibatasi
                  </span>
                </div>
              </div>
            )}

            {/* ── KARTU 02: KESWAN ── */}
            {hasKeswan ? (
              <Link
                href="/keswan"
                className="group relative aspect-square w-full rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 border-2 border-blue-400/60 bg-blue-950 flex flex-col cursor-pointer"
              >
                <img
                  src="/logo/card-keswan.png"
                  alt="Modul Keswan"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            ) : (
              <div
                onClick={() => alert('Akses ke modul Keswan dibatasi oleh Administrator.')}
                className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-xl border-2 border-slate-600 bg-slate-900 opacity-75 cursor-not-allowed"
                title="Akses Dibatasi"
              >
                <img
                  src="/logo/card-keswan.png"
                  alt="Modul Keswan (Terbatas)"
                  className="w-full h-full object-cover grayscale"
                />
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4 text-center">
                  <Lock size={28} className="mb-2 text-red-400" />
                  <span className="text-xs font-bold uppercase tracking-wider bg-red-600 px-3 py-1 rounded-full shadow-md">
                    Akses Dibatasi
                  </span>
                </div>
              </div>
            )}

            {/* ── KARTU 03: KESMAVET ── */}
            {hasKesmavet ? (
              <Link
                href="/kesmavet"
                className="group relative aspect-square w-full rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 border-2 border-purple-400/60 bg-purple-950 flex flex-col cursor-pointer"
              >
                <img
                  src="/logo/card-kesmavet.png"
                  alt="Modul Kesmavet"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            ) : (
              <div
                onClick={() => alert('Akses ke modul Kesmavet dibatasi oleh Administrator.')}
                className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-xl border-2 border-slate-600 bg-slate-900 opacity-75 cursor-not-allowed"
                title="Akses Dibatasi"
              >
                <img
                  src="/logo/card-kesmavet.png"
                  alt="Modul Kesmavet (Terbatas)"
                  className="w-full h-full object-cover grayscale"
                />
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4 text-center">
                  <Lock size={28} className="mb-2 text-red-400" />
                  <span className="text-xs font-bold uppercase tracking-wider bg-red-600 px-3 py-1 rounded-full shadow-md">
                    Akses Dibatasi
                  </span>
                </div>
              </div>
            )}

            {/* ── KARTU 04: ASET SARPRAS ── */}
            {hasAset ? (
              <Link
                href="/aset"
                className="group relative aspect-square w-full rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 border-2 border-amber-400/60 bg-amber-950 flex flex-col cursor-pointer"
              >
                <img
                  src="/logo/card-aset-pkh.png"
                  alt="Modul Aset Sarpras"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>
            ) : (
              <div
                onClick={() => alert('Akses ke modul Aset dibatasi oleh Administrator.')}
                className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-xl border-2 border-slate-600 bg-slate-900 opacity-75 cursor-not-allowed"
                title="Akses Dibatasi"
              >
                <img
                  src="/logo/card-aset-pkh.png"
                  alt="Modul Aset (Terbatas)"
                  className="w-full h-full object-cover grayscale"
                />
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-white p-4 text-center">
                  <Lock size={28} className="mb-2 text-red-400" />
                  <span className="text-xs font-bold uppercase tracking-wider bg-red-600 px-3 py-1 rounded-full shadow-md">
                    Akses Dibatasi
                  </span>
                </div>
              </div>
            )}

          </div>

        </main>

        {/* ── BOTTOM FOOTER ── */}
        <footer className="w-full py-4 text-center text-xs text-white/50 border-t border-white/10 backdrop-blur-md">
          © {new Date().getFullYear()} Dinas Pertanian dan Pangan Kabupaten Kebumen. Hak Cipta Dilindungi.
        </footer>

      </div>

      {/* ── MODAL MANAJEMEN ANGGOTA & HAK AKSES ── */}
      <UserManagementModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
      />

    </div>
  );
}