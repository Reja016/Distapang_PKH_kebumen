'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

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

export const CloudflareTurnstile = forwardRef<CloudflareTurnstileRef, CloudflareTurnstileProps>(
  function CloudflareTurnstile({ onChange, theme = 'auto', className = '' }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    const [siteKey, setSiteKey] = useState<string | null>(
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || null
    );
    const [isLoadingKey, setIsLoadingKey] = useState<boolean>(
      !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    );

    // Ambil site key aktual secara dinamis dari API server runtime (.env di server)
    useEffect(() => {
      let isMounted = true;
      if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
        fetch('/api/auth/turnstile-config')
          .then((res) => res.json())
          .then((data) => {
            if (isMounted) {
              setSiteKey(data.siteKey || DEFAULT_TEST_SITE_KEY);
              setIsLoadingKey(false);
            }
          })
          .catch(() => {
            if (isMounted) {
              setSiteKey(DEFAULT_TEST_SITE_KEY);
              setIsLoadingKey(false);
            }
          });
      }

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
      // Jangan render sebelum siteKey valid tersedia agar tidak muncul flash test key
      if (!siteKey) return;

      let isMounted = true;

      const renderWidget = () => {
        if (!containerRef.current || !window.turnstile) return;
        if (widgetIdRef.current !== null) return; // Already rendered

        try {
          const id = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: theme,
            callback: (token: string) => {
              if (isMounted) onChange(token);
            },
            'expired-callback': () => {
              if (isMounted) onChange(null);
            },
            'error-callback': () => {
              if (isMounted) onChange(null);
            },
          });
          widgetIdRef.current = id;
        } catch (e) {
          // May throw if rendered already
        }
      };

      if (typeof window !== 'undefined') {
        if (typeof window.turnstile?.render === 'function') {
          renderWidget();
        } else {
          // Ensure Turnstile script is loaded
          const existingScript = document.getElementById('cloudflare-turnstile-script');
          if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'cloudflare-turnstile-script';
            script.src =
              'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad&render=explicit';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
          }

          const prevOnLoad = window.onTurnstileLoad;
          window.onTurnstileLoad = () => {
            if (prevOnLoad) prevOnLoad();
            if (isMounted) renderWidget();
          };
        }
      }

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
    }, [siteKey, theme, onChange]);

    return (
      <div className={`flex justify-center my-2 min-h-[65px] items-center ${className}`}>
        {isLoadingKey && (
          <div className="w-[300px] h-[65px] bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60 flex items-center justify-center gap-2.5 animate-pulse shadow-sm">
            <span className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Memverifikasi keamanan...
            </span>
          </div>
        )}
        <div ref={containerRef} className={isLoadingKey ? 'hidden' : 'block'} />
      </div>
    );
  }
);
