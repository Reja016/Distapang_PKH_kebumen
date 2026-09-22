'use client';

import React from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  ChevronRight,
  Globe,
  ShieldCheck,
} from 'lucide-react';

// ============================================================================
// DATA INFORMASI, KONTAK & SOSIAL MEDIA (Bisa Anda ubah mandiri di bawah ini)
// ============================================================================
export const FOOTER_CONFIG = {
  instansi: {
    nama: 'Dinas Pertanian dan Pangan Kabupaten Kebumen',
    bidang: 'Bidang Peternakan dan Kesehatan Hewan (PKH)',
    deskripsi:
      'Sistem Informasi Manajemen Peternakan Terpadu (SiMantap) merupakan platform resmi integrasi data perbibitan ternak, pelayanan kesehatan hewan, kesehatan masyarakat veteriner, dan monitoring peternakan di Kabupaten Kebumen.',
  },
  kontak: {
    alamat: 'Jl. Ronggowarsito No.298, Legok Kidul, Pejagoan, Kec. Pejagoan, Kabupaten Kebumen, Jawa Tengah 54361',
    telepon: '(0287) 382179',
    teleponAlt: '',
    email: 'distapang@kebumenkab.go.id',
    emailPkh: 'pkh.distapang@gmail.com',
    jamKerja: 'Senin - Kamis: 07.30 - 16.00 WIB | Jumat: 07.30 - 11.00 WIB',
    googleMapsUrl: 'https://maps.google.com/?q=Dinas+Pertanian+dan+Pangan+Kabupaten+Kebumen',
  },

  sosmed: [
    {
      nama: 'Instagram',
      url: 'https://www.instagram.com/distapang.kebumen',
      username: '@distapang.kebumen',
      type: 'instagram',
    },
    {
      nama: 'Facebook',
      url: 'https://www.facebook.com/distapangkbm',
      username: 'Distapang Kebumen',
      type: 'facebook',
    },
    {
      nama: 'YouTube',
      url: 'https://www.youtube.com/@distapang.kebumen',
      username: 'Distapang Kebumen',
      type: 'youtube',
    },
    {
      nama: 'Website Resmi',
      url: 'https://distapang.kebumenkab.go.id',
      username: 'distapang.kebumenkab.go.id',
      type: 'website',
    },
  ],
  layananUtama: [
    { nama: 'Perbibitan & Produksi Ternak (Bitpro)', href: '#layanan' },
    { nama: 'Pelayanan Pusat Kesehatan Hewan (Puskeswan)', href: '#fasilitas' },
    { nama: 'Kesehatan Masyarakat Veteriner (Kesmavet & NKV)', href: '#layanan' },
    { nama: 'Monitoring Vaksinasi PMK & LSD', href: '#fasilitas' },
    { nama: 'Sebaran Farm & Populasi Ternak Wilayah', href: '#grafik' },
  ],
  tautanTerkait: [
    { nama: 'Portal Resmi Pemkab Kebumen', url: 'https://www.kebumenkab.go.id' },
    { nama: 'Website Distapang Kebumen', url: 'https://distapang.kebumenkab.go.id' },
    { nama: 'Kementerian Pertanian RI', url: 'https://pertanian.go.id' },
    { nama: 'Ditjen Peternakan & Keswan RI', url: 'https://ditjenpkh.pertanian.go.id' },
  ],
};

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-blue-100/80 dark:border-slate-800 bg-blue-50/70 dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition-colors">
      {/* ── BAGIAN UTAMA FOOTER (MULTI-KOLOM) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* KOLOM 1: IDENTITAS DINAS & PROFIL APLIKASI (Span 5 Kolom) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl p-1.5 bg-white border border-blue-200/80 dark:bg-white/10 dark:border-white/20 flex items-center justify-center shrink-0 backdrop-blur-xs shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-simantap.png"
                  alt="Logo SiMantap"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>SiMantap</span>
                  <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30">
                    PKH
                  </span>
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {FOOTER_CONFIG.instansi.bidang}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {FOOTER_CONFIG.instansi.deskripsi}
            </p>

            {/* Tombol Sosial Media Interaktif */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
                Kanal Resmi &amp; Media Sosial:
              </span>
              <div className="flex flex-wrap gap-2">
                {FOOTER_CONFIG.sosmed.map((s, idx) => {
                  const isAvailable = Boolean(s.url && s.url.trim() !== '' && s.url !== '#');

                  if (isAvailable) {
                    return (
                      <a
                        key={idx}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${s.nama} (${s.username || s.nama})`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200/80 bg-white hover:bg-blue-50/80 text-slate-700 hover:text-blue-700 hover:border-blue-300 dark:border-slate-700/80 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white text-xs font-semibold transition-all group shadow-xs"
                      >
                        {s.type === 'instagram' && (
                          <svg className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        )}
                        {s.type === 'facebook' && (
                          <svg className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                          </svg>
                        )}
                        {s.type === 'youtube' && (
                          <svg className="w-3.5 h-3.5 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                          </svg>
                        )}
                        {s.type === 'website' && (
                          <Globe size={14} className="text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                        )}
                        <span>{s.nama}</span>
                      </a>
                    );
                  }

                  // Opsi B: Belum ada linknya -> Tampil tombol non-aktif "Segera Hadir" (Aman, tidak error, kursor not-allowed)
                  return (
                    <div
                      key={idx}
                      title={`${s.nama}: Kanal resmi segera hadir`}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200/50 bg-white/60 dark:border-slate-800/80 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 text-xs font-medium cursor-not-allowed select-none opacity-60 hover:opacity-75 transition-opacity"
                    >
                      {s.type === 'instagram' && (
                        <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      )}
                      {s.type === 'facebook' && (
                        <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                        </svg>
                      )}
                      {s.type === 'youtube' && (
                        <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                        </svg>
                      )}
                      {s.type === 'website' && (
                        <Globe size={14} className="text-slate-400 dark:text-slate-500" />
                      )}
                      <span>{s.nama}</span>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-blue-100/60 dark:bg-slate-800/80 px-1 py-0.2 rounded border border-blue-200/60 dark:border-slate-700/60">
                        Segera
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* KOLOM 2: LAYANAN UTAMA & NAVIGASI (Span 3 Kolom) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-blue-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-blue-600 dark:text-blue-400" />
              <span>Layanan Utama</span>
            </h4>
            <ul className="space-y-2 text-xs">
              {FOOTER_CONFIG.layananUtama.map((item, idx) => (
                <li key={idx}>
                  <a
                    href={item.href}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white transition-colors flex items-start gap-1.5 group"
                  >
                    <ChevronRight size={13} className="text-slate-400 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                    <span>{item.nama}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* KOLOM 3: KONTAK RESMI & ALAMAT KANTOR (Span 4 Kolom) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-blue-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <MapPin size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Kontak &amp; Sekretariat</span>
            </h4>

            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              {/* Alamat */}
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Kantor Dinas Pertanian &amp; Pangan</p>
                  <p className="text-[11px] leading-relaxed mt-0.5">{FOOTER_CONFIG.kontak.alamat}</p>
                  {Boolean(FOOTER_CONFIG.kontak.googleMapsUrl && FOOTER_CONFIG.kontak.googleMapsUrl.trim() !== '' && FOOTER_CONFIG.kontak.googleMapsUrl !== '#') && (
                    <a
                      href={FOOTER_CONFIG.kontak.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold mt-1"
                    >
                      Buka di Google Maps <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>

              {/* Telepon */}
              {Boolean(FOOTER_CONFIG.kontak.telepon) && (
                <div className="flex items-center gap-2.5 pt-1">
                  <Phone size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{FOOTER_CONFIG.kontak.telepon}</span>
                    {Boolean(FOOTER_CONFIG.kontak.teleponAlt && FOOTER_CONFIG.kontak.teleponAlt.trim() !== '') && (
                      <>
                        <span className="text-slate-400 dark:text-slate-600"></span>
                        <span className="text-slate-600 dark:text-slate-300">{FOOTER_CONFIG.kontak.teleponAlt}</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Email */}
              {Boolean(FOOTER_CONFIG.kontak.email && FOOTER_CONFIG.kontak.email.trim() !== '') && (
                <div className="flex items-center gap-2.5">
                  <Mail size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <a
                    href={`mailto:${FOOTER_CONFIG.kontak.email}`}
                    className="hover:text-blue-600 dark:hover:text-white transition-colors font-medium text-slate-700 dark:text-slate-300"
                  >
                    {FOOTER_CONFIG.kontak.email}
                  </a>
                </div>
              )}

              {/* Jam Pelayanan */}
              {Boolean(FOOTER_CONFIG.kontak.jamKerja && FOOTER_CONFIG.kontak.jamKerja.trim() !== '') && (
                <div className="flex items-start gap-2.5 pt-1">
                  <Clock size={14} className="text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Jam Pelayanan Kantor:</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">{FOOTER_CONFIG.kontak.jamKerja}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ── TAUTAN LEMBAGA TERKAIT ── */}
        <div className="mt-8 pt-6 border-t border-blue-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Tautan Lembaga Terkait:</span>
          <div className="flex flex-wrap items-center gap-4">
            {FOOTER_CONFIG.tautanTerkait.map((item, idx) => (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
              >
                <span>{item.nama}</span>
                <ExternalLink size={10} className="opacity-70" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER BAR PALING BAWAH (COPYRIGHT & STATUS SISTEM) ── */}
      <div className="border-t border-blue-200/60 dark:border-slate-800 bg-blue-100/50 dark:bg-slate-950 py-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <p className="font-medium text-slate-600 dark:text-slate-400">
            &copy; {currentYear} <b className="text-slate-800 dark:text-slate-200">{FOOTER_CONFIG.instansi.bidang}</b>, {FOOTER_CONFIG.instansi.nama}.
          </p>
        </div>
      </div>
    </footer>
  );
}
