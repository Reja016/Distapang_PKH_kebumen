'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveAuthSession } from '@/lib/auth';
import { CloudflareTurnstile, CloudflareTurnstileRef } from '@/components/common/CloudflareTurnstile';
import {
  Eye,
  EyeOff,
  User,
  Lock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Landmark,
} from 'lucide-react';

export default function LoginPage() {
  const [nipUsername, setNipUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [idleLogoutNotice, setIdleLogoutNotice] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<CloudflareTurnstileRef>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('reason') === 'idle') {
        setIdleLogoutNotice(true);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!captchaToken) {
      setErrorMsg('Silakan selesaikan verifikasi keamanan Turnstile terlebih dahulu.');
      return;
    }


    setLoading(true);

    const trimmedId = nipUsername.trim();
    const trimmedPass = password.trim();

    try {
      // 1. Autentikasi ke database tabel anggota_users beserta verifikasi Captcha
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nip_username: trimmedId,
          password: trimmedPass,
          captcha_token: captchaToken,
        }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        // Simpan sesi login petugas ke localStorage
        saveAuthSession(data.user);
        setLoading(false);
        window.location.href = '/beranda';
        return;
      }

      // 2. Jika API mengembalikan error spesifik
      if (!data.success && data.error) {
        setErrorMsg(data.error);
        turnstileRef.current?.reset();
        setLoading(false);
        return;
      }

      setErrorMsg('Login gagal. Periksa kembali ID Petugas atau kata sandi Anda.');
      turnstileRef.current?.reset();
    } catch {
      setErrorMsg('Terjadi gangguan koneksi saat menghubungi server.');
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-emerald-600 selection:text-white">
      
      {/* Top Bar Navigation (Lega) */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex items-center justify-between">
        <Link
          href="/"
          className="min-h-touch h-11 px-4 sm:px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors shadow-xs"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Portal Publik</span>
        </Link>
      </header>

      {/* Main Login Card Area */}
      <main className="w-full max-w-md mx-auto px-4 py-6 sm:py-10">
        
        {/* Brand & Identity */}
        <div className="text-center mb-8 space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-2 mx-auto flex items-center justify-center shadow-xs">
            <img
              src="/logo-simantap.png"
              alt="Logo SiMantap"
              className="w-full h-full object-contain"
              onError={(e: any) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden text-emerald-600 items-center justify-center">
              <Landmark size={24} />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Masuk SiMantap
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto">
            Sistem Informasi Peternakan &amp; Kesehatan Hewan Dinas Pertanian dan Pangan Kebumen
          </p>
        </div>

        {/* Form Box */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Autentikasi Petugas Dinas
              </h2>
              <p className="text-xs text-slate-500">
                Gunakan NIP, username, atau ID petugas terdaftar
              </p>
            </div>
          </div>

          {idleLogoutNotice && (
            <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">Sesi Anda Telah Berakhir</p>
                <p className="text-xs text-amber-800 mt-0.5">
                  Anda otomatis keluar karena tidak ada aktivitas selama 20 menit demi menjaga keamanan akun dan data dinas. Silakan masuk kembali.
                </p>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle size={18} className="shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Field ID Petugas / NIP / Username (Bebas Karakter) */}
            <div>
              <label
                htmlFor="nipUsername"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                ID Petugas / NIP / Username
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="nipUsername"
                  type="text"
                  placeholder="Contoh: 19850712 / budi / ahmad_keswan"
                  required
                  value={nipUsername}
                  onChange={(e) => setNipUsername(e.target.value)}
                  className="w-full min-h-touch-lg h-12 rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Field Password dengan Eye Toggle */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-touch-lg h-12 rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-600 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 transition-colors cursor-pointer"
                  title={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Cloudflare Turnstile Verification */}
            <div className="pt-1">
              <CloudflareTurnstile
                ref={turnstileRef}
                onChange={setCaptchaToken}
              />
            </div>


            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !captchaToken}
                className="w-full min-h-touch-lg h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

        {/* Support Help */}
        <p className="mt-8 text-center text-xs text-slate-400">
          Mengalami kendala akun? Hubungi Administrator IT Distapang Kebumen
        </p>

      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} SiMantap — Bidang Peternakan dan Kesehatan Hewan Kabupaten Kebumen
      </footer>

    </div>
  );
}