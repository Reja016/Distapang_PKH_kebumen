'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

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

    const isCustomKey = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
    const siteKey =
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || DEFAULT_TEST_SITE_KEY;

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
        const isLocal =
          typeof window !== 'undefined' &&
          (window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1');
        if (!isCustomKey && !isLocal) {
          onChange('bypass');
        } else {
          onChange(null);
        }
      },
    }));

    useEffect(() => {
      let isMounted = true;
      const isLocal =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1');

      // Jika di domain publik (misal simantap.cloud) dan belum ada key resmi Cloudflare,
      // jangan render widget dummy yang akan diblokir Cloudflare; otomatis loloskan.
      if (!isCustomKey && !isLocal) {
        onChange('bypass');
        return;
      }

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
              if (isMounted) {
                if (!isCustomKey) {
                  onChange('bypass');
                } else {
                  onChange(null);
                }
              }
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
      <div className={`flex justify-center my-2 ${className}`}>
        <div ref={containerRef} />
      </div>
    );
  }
);
