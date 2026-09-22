'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { saveAuthSession } from '@/lib/auth';
import { CloudflareTurnstileRef } from '@/components/common/CloudflareTurnstile';

import {
  PopulasiItem,
  ProduksiItemSimple,
  FarmSebaranItem,
} from '@/components/landing/types';
import { ArrowUp } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingHeroSection from '@/components/landing/LandingHeroSection';
import LandingStatsSection from '@/components/landing/LandingStatsSection';
import LandingFacilitiesSection from '@/components/landing/LandingFacilitiesSection';
import LandingChartsSection from '@/components/landing/LandingChartsSection';
import LandingServicesSection from '@/components/landing/LandingServicesSection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingLoginModal } from '@/components/landing/LandingLoginModal';

export default function LandingPage() {
  const router = useRouter();

  // ── 100% PURE DATABASE STATES (Semua dari MySQL) ──
  const [populasi16, setPopulasi16] = useState<PopulasiItem[]>([]);
  const [populasiTernak8, setPopulasiTernak8] = useState<PopulasiItem[]>([]);
  const [populasiUnggas8, setPopulasiUnggas8] = useState<PopulasiItem[]>([]);
  const [dagingList, setDagingList] = useState<ProduksiItemSimple[]>([]);
  const [telurList, setTelurList] = useState<ProduksiItemSimple[]>([]);
  const [sebaranFarmList, setSebaranFarmList] = useState<FarmSebaranItem[]>([]);
  const [totalSapiPo, setTotalSapiPo] = useState<number>(0);
  const [puskeswanList, setPuskeswanList] = useState<any[]>([]);
  const [vaksinasiList, setVaksinasiList] = useState<any[]>([]);
  const [rphList, setRphList] = useState<any[]>([]);
  const [nkvList, setNkvList] = useState<any[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // State Auth Modal & Navigation
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme Dark / Light State
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('simantap_theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('simantap_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('simantap_theme', 'light');
    }
  };

  // Dashboard state
  const [detailView, setDetailView] = useState<string | null>(null);
  const [subTabProd, setSubTabProd] = useState<'populasi' | 'daging' | 'telur'>('populasi');
  const [expandedPuskeswanLayanan, setExpandedPuskeswanLayanan] = useState<number | null>(null);
  const [expandedTableLayanan, setExpandedTableLayanan] = useState<number | null>(null);
  const [searchVaksin, setSearchVaksin] = useState('');
  const [searchPuskeswan, setSearchPuskeswan] = useState('');
  const [puskeswanViewMode, setPuskeswanViewMode] = useState<'cards' | 'table'>('cards');
  const [facilityTab, setFacilityTab] = useState<'puskeswan' | 'rph'>('puskeswan');
  const [searchRphFilter, setSearchRphFilter] = useState('');
  const [rphViewMode, setRphViewMode] = useState<'cards' | 'table'>('cards');

  // Form login
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<CloudflareTurnstileRef>(null);

  // ── FETCH LANGSUNG 100% DATA REAL DARI DATABASE MYSQL ──
  useEffect(() => {
    const loadPortalData = async () => {
      try {
        setIsDataLoading(true);
        const res = await fetch('/api/portal-stats');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            const d = json.data;
            setPopulasi16(d.populasi16 || []);
            setPopulasiTernak8(d.populasiTernak8 || []);
            setPopulasiUnggas8(d.populasiUnggas8 || []);
            setDagingList(d.dataDaging || []);
            setTelurList(d.dataTelur || []);
            setSebaranFarmList(d.sebaranFarm || []);
            setTotalSapiPo(d.totalSapiPo || 0);
            setPuskeswanList(d.puskeswanList || []);
            setVaksinasiList(d.vaksinasiList || []);
            setRphList(d.rphList || []);
            setNkvList(d.nkvList || []);
          }
        }
      } catch (err) {
        console.error('Gagal memuat data portal dari database:', err);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadPortalData();
  }, []);

  // Cek sesi login
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) router.push('/beranda');
    };
    checkSession();
  }, [router]);

  // Handler Login Petugas
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!captchaToken) {
      setError('Silakan selesaikan verifikasi keamanan Turnstile terlebih dahulu.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nip_username: loginId, password, captcha_token: captchaToken }),
      });

      const json = await res.json();

      if (res.ok && json.success && json.user) {
        saveAuthSession(json.user);
        window.location.href = '/beranda';
        return;
      }

      if (json && json.error) {
        setError(json.error);
        turnstileRef.current?.reset();
        setIsLoading(false);
        return;
      }

      // Fallback Supabase jika login via email
      if (loginId.includes('@')) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: loginId,
          password,
        });

        if (signInError) {
          setError('Akses ditolak. Periksa kembali ID Petugas/NIP atau kata sandi Anda.');
          turnstileRef.current?.reset();
          setIsLoading(false);
          return;
        } else {
          window.location.href = '/beranda';
          return;
        }
      }

      setError('ID Petugas / NIP / Username atau kata sandi salah.');
      turnstileRef.current?.reset();
      setIsLoading(false);
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan saat memproses login. Silakan coba kembali.');
      turnstileRef.current?.reset();
      setIsLoading(false);
    }
  };

  // ── KALKULASI TOTAL STATISTIK DARI DATABASE SECARA OTOMATIS ──
  const totalPopulasi = useMemo(() => populasi16.reduce((sum, d) => sum + d.total, 0), [populasi16]);
  const totalDagingKg = useMemo(() => dagingList.reduce((sum, d) => sum + d.total, 0), [dagingList]);
  const totalTelurKg = useMemo(() => telurList.reduce((sum, d) => sum + d.total, 0), [telurList]);
  const totalFarm = useMemo(() => sebaranFarmList.reduce((sum, d) => sum + d.jumlah_farm, 0), [sebaranFarmList]);

  const totalTernakHewan = useMemo(() => populasiTernak8.reduce((sum, d) => sum + d.total, 0), [populasiTernak8]);
  const totalUnggas = useMemo(() => populasiUnggas8.reduce((sum, d) => sum + d.total, 0), [populasiUnggas8]);

  const dataProduksiDaging = useMemo(() => [...dagingList]
    .map((d) => ({ jenis: d.jenis, ton: d.total / 1000 }))
    .sort((a, b) => b.ton - a.ton), [dagingList]);

  const dataProduksiTelur = useMemo(() => [...telurList]
    .map((d) => ({ jenis: d.jenis, ton: d.total / 1000 }))
    .sort((a, b) => b.ton - a.ton), [telurList]);

  const totalProdDagingTon = totalDagingKg / 1000;
  const totalProdTelurTon = totalTelurKg / 1000;

  const maxTernak = populasiTernak8[0]?.total || 1;
  const maxUnggas = populasiUnggas8[0]?.total || 1;
  const maxDagingTon = dataProduksiDaging[0]?.ton || 1;
  const maxTelurTon = dataProduksiTelur[0]?.ton || 1;

  // 4 Kartu Metrik Sekunder Teratas
  const topUnggas = populasiUnggas8[0] || { komoditas: 'Unggas Terbesar', total: 0 };
  const topDaging = dataProduksiDaging[0] || { jenis: 'Daging Terbesar', ton: 0 };
  const topTelur = dataProduksiTelur[0] || { jenis: 'Telur Terbesar', ton: 0 };
  const sapiPotongPop = populasi16.find((x) => x.komoditas === 'Sapi Potong')?.total || 0;

  const filteredVaksinasi = vaksinasiList.filter((row: any) =>
    (row.desa || '').toLowerCase().includes(searchVaksin.toLowerCase()) ||
    (row.jenis || '').toLowerCase().includes(searchVaksin.toLowerCase())
  );

  const filteredPuskeswan = puskeswanList.filter((p: any) => {
    if (!searchPuskeswan) return true;
    const q = searchPuskeswan.toLowerCase();
    return (
      (p.nama || '').toLowerCase().includes(q) ||
      (p.wilayah || '').toLowerCase().includes(q) ||
      (p.koordinator || '').toLowerCase().includes(q) ||
      (p.kecamatan || []).some((kec: string) => (kec || '').toLowerCase().includes(q))
    );
  });

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="public-portal min-h-screen bg-[#f1f5f9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans p-0 sm:p-3 md:p-6 selection:bg-blue-600 selection:text-white flex flex-col items-center">
      
      {/* ─────────────────────────────────────────────
          MAIN DASHBOARD CONTAINER (Theme: Biru Putih & Mode Gelap)
      ───────────────────────────────────────────── */}
      <div className="max-w-[1360px] w-full mx-auto bg-white dark:bg-slate-900 sm:rounded-3xl lg:rounded-[32px] shadow-sm overflow-hidden flex flex-col min-h-screen sm:min-h-[94vh]">
        
        {/* 1. TOPBAR / HEADER */}
        <LandingHeader
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenLogin={() => setShowLoginModal(true)}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* 2. DASHBOARD BODY */}
        <div className="p-3.5 sm:p-6 md:p-8 lg:p-9 space-y-6 sm:space-y-7 flex-1">
          
          {/* Top Hero Banner With Module Cards */}
          <LandingHeroSection
            onSelectModule={(modKey) => {
              if (modKey === 'bitpro') {
                setDetailView('populasi');
                scrollToSection('modul');
              } else if (modKey === 'keswan') {
                setFacilityTab('puskeswan');
                scrollToSection('puskeswan');
              } else if (modKey === 'kesmavet') {
                setFacilityTab('rph');
                scrollToSection('puskeswan');
              }
            }}
          />

          {/* Section 1: Stat Cards (Ringkasan Wilayah) */}
          <LandingStatsSection
            isDataLoading={isDataLoading}
            totalPopulasi={totalPopulasi}
            totalProdDagingTon={totalProdDagingTon}
            totalProdTelurTon={totalProdTelurTon}
            totalSapiPo={totalSapiPo}
            puskeswanCount={puskeswanList.length}
            topUnggas={topUnggas}
            topDaging={topDaging}
            topTelur={topTelur}
            sapiPotongPop={sapiPotongPop}
            onOpenPopulasi={(subTab) => {
              setSubTabProd(subTab);
              setDetailView('populasi');
              scrollToSection('modul');
            }}
            onScrollToPuskeswan={() => {
              setFacilityTab('puskeswan');
              scrollToSection('puskeswan');
            }}
          />

          {/* Section 2: Puskeswan & RPH */}
          <LandingFacilitiesSection
            facilityTab={facilityTab}
            setFacilityTab={setFacilityTab}
            puskeswanList={puskeswanList}
            searchPuskeswan={searchPuskeswan}
            setSearchPuskeswan={setSearchPuskeswan}
            filteredPuskeswan={filteredPuskeswan}
            puskeswanViewMode={puskeswanViewMode}
            setPuskeswanViewMode={setPuskeswanViewMode}
            expandedPuskeswanLayanan={expandedPuskeswanLayanan}
            setExpandedPuskeswanLayanan={setExpandedPuskeswanLayanan}
            expandedTableLayanan={expandedTableLayanan}
            setExpandedTableLayanan={setExpandedTableLayanan}
            searchRphFilter={searchRphFilter}
            setSearchRphFilter={setSearchRphFilter}
            rphViewMode={rphViewMode}
            setRphViewMode={setRphViewMode}
          />

          {/* Section 3: Visual Bar Charts */}
          <LandingChartsSection
            populasiTernak8={populasiTernak8}
            totalTernakHewan={totalTernakHewan}
            maxTernak={maxTernak}
            populasiUnggas8={populasiUnggas8}
            totalUnggas={totalUnggas}
            maxUnggas={maxUnggas}
            dataProduksiDaging={dataProduksiDaging}
            totalProdDagingTon={totalProdDagingTon}
            maxDagingTon={maxDagingTon}
            dataProduksiTelur={dataProduksiTelur}
            totalProdTelurTon={totalProdTelurTon}
            maxTelurTon={maxTelurTon}
          />

          {/* Section 4: Modul Pelayanan & Layanan Data */}
          <LandingServicesSection
            detailView={detailView}
            setDetailView={setDetailView}
            subTabProd={subTabProd}
            setSubTabProd={setSubTabProd}
            populasi16={populasi16}
            dagingList={dagingList}
            telurList={telurList}
            sebaranFarmList={sebaranFarmList}
            totalFarm={totalFarm}
            puskeswanCount={puskeswanList.length}
            vaksinasiList={vaksinasiList}
            searchVaksin={searchVaksin}
            setSearchVaksin={setSearchVaksin}
            filteredVaksinasi={filteredVaksinasi}
            rphList={rphList}
            nkvList={nkvList}
            onSelectPuskeswanTab={() => {
              setFacilityTab('puskeswan');
              scrollToSection('puskeswan');
            }}
          />

        </div>

        {/* 3. FOOTER */}
        <LandingFooter />

      </div>

      {/* 4. MODAL LOGIN PETUGAS */}
      <LandingLoginModal
        showLoginModal={showLoginModal}
        setShowLoginModal={setShowLoginModal}
        loginId={loginId}
        setLoginId={setLoginId}
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        error={error}
        isLoading={isLoading}
        captchaToken={captchaToken}
        setCaptchaToken={setCaptchaToken}
        turnstileRef={turnstileRef}
        isDark={isDark}
        handleLogin={handleLogin}
      />

      {/* 5. FLOATING BACK TO TOP BUTTON (Mobile & Desktop) */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg border-2 border-white dark:border-slate-800 flex items-center justify-center transition-all animate-in fade-in zoom-in-75 duration-200 cursor-pointer active:scale-95"
          aria-label="Kembali ke atas halaman"
          title="Kembali ke atas"
        >
          <ArrowUp size={18} />
        </button>
      )}

    </div>
  );
}