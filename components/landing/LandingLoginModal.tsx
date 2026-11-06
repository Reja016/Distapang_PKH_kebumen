'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Eye, EyeOff, Lock, KeyRound } from 'lucide-react';
import { CloudflareTurnstile, CloudflareTurnstileRef } from '@/components/common/CloudflareTurnstile';

interface LandingLoginModalProps {
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  loginId: string;
  setLoginId: (id: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  error: string;
  isLoading: boolean;
  captchaToken: string | null;
  setCaptchaToken: (token: string | null) => void;
  turnstileRef: React.RefObject<CloudflareTurnstileRef>;
  isDark?: boolean;
  handleLogin: (e: React.FormEvent) => void;
}


export function LandingLoginModal({
  showLoginModal,
  setShowLoginModal,
  loginId,
  setLoginId,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  error,
  isLoading,
  captchaToken,
  setCaptchaToken,
  turnstileRef,
  isDark = false,
  handleLogin,
}: LandingLoginModalProps) {
  const [showForgotHelp, setShowForgotHelp] = useState(false);
  if (!showLoginModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl sm:rounded-3xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 sm:p-8 relative shadow-2xl animate-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setShowLoginModal(false)}
          aria-label="Tutup jendela login"
          className="w-9 h-9 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 absolute top-4 right-4 sm:top-5 sm:right-5 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="mb-5 sm:mb-6 text-left">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border-2 border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
            <ShieldCheck size={22} />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Masuk Sistem SiMantap
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">
            Gunakan ID Petugas / NIP / Username dan kata sandi Anda
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs sm:text-sm font-bold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-3.5 sm:space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              ID Petugas / NIP / Username
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 19800101... / nama@dinas.go.id"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm sm:text-base font-sans outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 pl-3.5 pr-11 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm sm:text-base font-sans outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                className="w-10 h-10 absolute right-0.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowForgotHelp(true)}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-bold transition-colors cursor-pointer"
              >
                Lupa Kata Sandi?
              </button>
            </div>
          </div>

          {/* Cloudflare Turnstile Verification */}
          <div className="pt-1">
            <CloudflareTurnstile
              ref={turnstileRef}
              onChange={setCaptchaToken}
              theme={isDark ? 'dark' : 'light'}
            />
          </div>


          <button
            type="submit"
            disabled={isLoading || !captchaToken}
            className="w-full h-11 rounded-full bg-blue-600 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 mt-5 shadow-xs hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <span>Memverifikasi Akun...</span>
            ) : (
              <>
                <Lock size={15} />
                <span>Masuk ke Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Sistem Informasi Manajemen Peternakan Terpadu &bull; Distapang Kebumen
          </p>
        </div>

        {/* Modal Info Lupa Sandi */}
        {showForgotHelp && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 w-full max-w-sm text-center space-y-3.5 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center shadow-xs">
                <KeyRound size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Lupa Kata Sandi Akun?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed text-justify">
                  Demi keamanan data dinas, reset kata sandi hanya dapat diproses oleh <strong>Administrator IT / Pengelola Sistem Distapang Kebumen</strong>.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-xs text-left space-y-1">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Langkah Reset Kata Sandi:</span>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  1. Hubungi Admin IT Distapang Kebumen.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  2. Sebutkan NIP atau Nama Lengkap Anda untuk verifikasi.
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  3. Admin akan memberikan kata sandi baru yang memenuhi kombinasi aman.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotHelp(false)}
                className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
