'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          theme?: 'auto' | 'light' | 'dark';
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: (error: any) => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export interface CloudflareTurnstileRef {
  reset: () => void;
}

interface CloudflareTurnstileProps {
  onChange: (token: string | null) => void;
  theme?: 'auto' | 'light' | 'dark';
  className?: string;
}

const DEFAULT_TEST_SITE_KEY = '1x00000000000000000000AA';

/**
 * Memastikan script Cloudflare Turnstile dimuat tanpa race condition
 */
function loadTurnstileScript(onReady: () => void) {
  if (typeof window === 'undefined') return;

  if (window.turnstile && typeof window.turnstile.render === 'function') {
    onReady();
    return;
  }

  // Polling pengecekan kesiapan window.turnstile
  const interval = setInterval(() => {
    if (window.turnstile && typeof window.turnstile.render === 'function') {
      clearInterval(interval);
      onReady();
    }
  }, 50);

  setTimeout(() => clearInterval(interval), 15000);

  const existingScript = document.getElementById('cloudflare-turnstile-script');
  if (!existingScript) {
    const script = document.createElement('script');
    script.id = 'cloudflare-turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.turnstile && typeof window.turnstile.render === 'function') {
        clearInterval(interval);
        onReady();
      }
    };
    document.head.appendChild(script);
  }
}

export const CloudflareTurnstile = forwardRef<CloudflareTurnstileRef, CloudflareTurnstileProps>(
  function CloudflareTurnstile({ onChange, theme = 'auto', className = '' }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    const [siteKey, setSiteKey] = useState<string | null>(
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null
    );
    const [isConfigured, setIsConfigured] = useState<boolean>(
      Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY !== DEFAULT_TEST_SITE_KEY)
    );
    const [isLoadingKey, setIsLoadingKey] = useState<boolean>(true);
    const [turnstileError, setTurnstileError] = useState<string | null>(null);
    const [renderKey, setRenderKey] = useState<number>(0);

    // Ambil site key aktual secara dinamis dari API server runtime (.env di server)
    useEffect(() => {
      let isMounted = true;
      fetch('/api/auth/turnstile-config')
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) {
            const key = data.siteKey || DEFAULT_TEST_SITE_KEY;
            setSiteKey(key);
            setIsConfigured(Boolean(data.isConfigured));
            setIsLoadingKey(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setSiteKey(DEFAULT_TEST_SITE_KEY);
            setIsConfigured(false);
            setIsLoadingKey(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }, []);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (
          typeof window !== 'undefined' &&
          window.turnstile &&
          widgetIdRef.current !== null
        ) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch {}
        }
        onChange(null);
      },
    }));

    useEffect(() => {
      if (isLoadingKey || !siteKey) return;

      let isMounted = true;
      const isLocal =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1');

      // Jika di domain online publik tapi belum terkonfigurasi key resmi (masih dummy test key)
      // Cloudflare akan otomatis memblokir rendering. Otomatis loloskan agar tidak mengunci petugas.
      if (!isConfigured && !isLocal && siteKey === DEFAULT_TEST_SITE_KEY) {
        setTurnstileError('Domain belum terdaftar di Cloudflare Turnstile. Verifikasi otomatis diloloskan.');
        onChange('bypass');
        return;
      }

      setTurnstileError(null);

      const renderWidget = () => {
        if (!containerRef.current || !window.turnstile) return;
        if (widgetIdRef.current !== null) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {}
          widgetIdRef.current = null;
        }

        try {
          containerRef.current.innerHTML = '';
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: theme,
            callback: (token: string) => {
              if (isMounted) {
                setTurnstileError(null);
                onChange(token);
              }
            },
            'expired-callback': () => {
              if (isMounted) onChange(null);
            },
            'error-callback': (errorCode: any) => {
              console.warn('[Cloudflare Turnstile Error Code]:', errorCode);
              if (isMounted) {
                const codeStr = typeof errorCode === 'string' ? errorCode : JSON.stringify(errorCode || '');
                // Error 110200 = domain mismatch / invalid key di Cloudflare
                if (codeStr.includes('110200') || !isConfigured) {
                  setTurnstileError('Kunci Cloudflare tidak cocok dengan domain ini. Verifikasi darurat diaktifkan.');
                  onChange('bypass');
                } else {
                  setTurnstileError(`Verifikasi Cloudflare gagal (${codeStr || 'Koneksi'}).`);
                  onChange(null);
                }
              }
            },
          });
          widgetIdRef.current = id;
        } catch (e: any) {
          console.warn('[Cloudflare Turnstile Render Exception]:', e.message);
        }
      };

      loadTurnstileScript(() => {
        if (isMounted) {
          renderWidget();
        }
      });

      return () => {
        isMounted = false;
        if (
          typeof window !== 'undefined' &&
          window.turnstile &&
          widgetIdRef.current !== null
        ) {
          try {
            window.turnstile.remove(widgetIdRef.current);
            widgetIdRef.current = null;
          } catch {}
        }
      };
    }, [siteKey, isConfigured, isLoadingKey, theme, onChange, renderKey]);

    const handleRetry = () => {
      setRenderKey((prev) => prev + 1);
    };

    return (
      <div className={`flex flex-col items-center justify-center my-2 min-h-[65px] ${className}`}>
        {isLoadingKey && (
          <div className="w-[300px] h-[65px] bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-center gap-2.5 animate-pulse shadow-sm">
            <span className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Memuat proteksi keamanan...
            </span>
          </div>
        )}

        {/* Container widget Cloudflare Turnstile */}
        <div
          ref={containerRef}
          style={{ minHeight: isLoadingKey ? '0px' : '65px' }}
          className="flex justify-center items-center"
        />

        {/* Fallback Notice jika kunci belum cocok dengan domain atau terjadi kendala Cloudflare */}
        {turnstileError && (
          <div className="mt-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between gap-2 max-w-sm w-full">
            <div className="flex items-center gap-1.5 truncate">
              <AlertCircle size={14} className="shrink-0 text-amber-600" />
              <span className="truncate">{turnstileError}</span>
            </div>
            <button
              type="button"
              onClick={handleRetry}
              className="shrink-0 p-1 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded text-amber-700 cursor-pointer"
              title="Coba Muat Ulang Captcha"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        )}
      </div>
    );
  }
);
