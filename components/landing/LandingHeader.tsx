'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Menu,
  X,
  Landmark,
  Sun,
  Moon,
  BarChart3,
  Stethoscope,
  Activity,
} from 'lucide-react';
import { getAuthSession } from '@/lib/auth';

interface LandingHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenLogin: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function LandingHeader({
  isDark,
  onToggleTheme,
  onOpenLogin,
  mobileMenuOpen,
  setMobileMenuOpen,
}: LandingHeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(getAuthSession()));
  }, []);

  const handleLoginClick = () => {
    const current = getAuthSession();
    if (current) {
      window.location.href = '/beranda';
    } else {
      onOpenLogin();
    }
  };

  return (
    <>
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 py-3.5 sm:py-5 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-800 p-1 flex items-center justify-center shrink-0 shadow-2xs">
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
                <Landmark size={18} />
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-lg sm:text-2xl text-blue-600 dark:text-blue-400 tracking-tight">
                SiMantap
              </span>
            </div>
          </div>

          {/* Right Section: Desktop Nav Links & Action Buttons */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 ml-auto">
            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200">
              <a href="#ringkasan" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Ringkasan Wilayah
              </a>
              <a href="#puskeswan" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Puskeswan &amp; RPH
              </a>
              <a href="#modul" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Modul Data
              </a>
            </nav>

            {/* Right Action: Theme Toggle, Officer Login Button & Mobile Menu */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={onToggleTheme}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-300 flex items-center justify-center transition-colors shadow-2xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 shrink-0"
                title={isDark ? 'Beralih ke Tema Terang' : 'Beralih ke Tema Gelap'}
                aria-label="Ganti Tema"
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              <button
                onClick={handleLoginClick}
                className={`h-9 sm:h-10 px-3 xs:px-3.5 sm:px-5 rounded-full text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-xs active:scale-[0.98] transition-all cursor-pointer shrink-0 ${
                  isLoggedIn
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                <span className="inline sm:hidden">{isLoggedIn ? 'Dashboard' : 'Masuk'}</span>
                <span className="hidden sm:inline">{isLoggedIn ? 'Ke Dashboard' : 'Masuk Petugas'}</span>
                <ArrowRight size={14} className="hidden xs:inline" />
              </button>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Buka Menu"
                className="md:hidden w-9 h-9 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-blue-50/50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center active:bg-blue-100 dark:active:bg-slate-700 cursor-pointer shrink-0"
              >
                {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-blue-50/90 dark:bg-slate-900/95 px-5 py-3 space-y-1 animate-in slide-in-from-top-2 duration-200 backdrop-blur-md">
          <div className="max-w-[1360px] mx-auto">
            <a
              href="#ringkasan"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <BarChart3 size={18} className="text-blue-600 dark:text-blue-400" />
              <span>Ringkasan Wilayah</span>
            </a>
            <a
              href="#puskeswan"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Stethoscope size={18} className="text-blue-600 dark:text-blue-400" />
              <span>Puskeswan &amp; RPH</span>
            </a>
            <a
              href="#modul"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <Activity size={18} className="text-blue-600 dark:text-blue-400" />
              <span>Modul Pelayanan Data</span>
            </a>
          </div>
        </div>
      )}
    </>
  );
}
