'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Search, Loader2, ChevronDown, ChevronUp, Map as MapIcon, X, Layers, Compass } from 'lucide-react';

interface InlineLocationPickerProps {
  lat: number | null;
  lng: number | null;
  onChangeLocation: (lat: number, lng: number) => void;
  defaultSearchText?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function InlineLocationPicker({
  lat,
  lng,
  onChangeLocation,
  defaultSearchText = '',
  isOpen,
  onToggle,
}: InlineLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const activeTileLayerRef = useRef<any>(null);

  const [leafletReady, setLeafletReady] = useState(false);
  const [mapType, setMapType] = useState<'satellite' | 'streets'>('satellite'); // Default: Satelit Nyata
  const [searchQuery, setSearchQuery] = useState(defaultSearchText);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ lat: string; lon: string; display_name: string }>>([]);

  // 1. Memastikan Leaflet dimuat
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).L) {
      setLeafletReady(true);
      return;
    }

    if (typeof window !== 'undefined') {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => setLeafletReady(true);
        document.head.appendChild(script);
      } else {
        const checkL = setInterval(() => {
          if ((window as any).L) {
            setLeafletReady(true);
            clearInterval(checkL);
          }
        }, 100);
        return () => clearInterval(checkL);
      }
    }
  }, []);

  // Update default search text jika prop berubah
  useEffect(() => {
    if (defaultSearchText && !searchQuery) {
      setSearchQuery(defaultSearchText);
    }
  }, [defaultSearchText, searchQuery]);

  // Fungsi membuat tile layer sesuai tema (Satelit Nyata vs Jalan)
  const getTileLayer = useCallback((type: 'satellite' | 'streets') => {
    const L = (window as any).L;
    if (!L) return null;

    if (type === 'satellite') {
      // Citra Satelit Nyata Beresolusi Tinggi + Label Jalan & Wilayah (Google Hybrid)
      return L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '© Google Satellite Imagery',
        maxZoom: 20,
      });
    } else {
      // Peta Jalan Standar OpenStreetMap
      return L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      });
    }
  }, []);

  // 2. Inisialisasi Map Leaflet di dalam container inline
  const initMap = useCallback(() => {
    if (!mapContainerRef.current || !leafletReady) return;
    const L = (window as any).L;
    if (!L) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      activeTileLayerRef.current = null;
    }

    const startLat = lat !== null ? lat : -7.668;
    const startLng = lng !== null ? lng : 109.651;
    const startZoom = lat !== null ? 17 : 13;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
      maxZoom: 20,
    }).setView([startLat, startLng], startZoom);

    // Pasang layer default (Satelit Nyata)
    const initialLayer = getTileLayer(mapType);
    if (initialLayer) {
      initialLayer.addTo(map);
      activeTileLayerRef.current = initialLayer;
    }

    // Custom Icon Pin Menarik & Sangat Kontras di Atas Foto Satelit
    const customPin = L.divIcon({
      html: `
        <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;">
          <div style="background: #e11d48; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid #ffffff; box-shadow: 0 4px 14px rgba(0,0,0,0.6);">
          </div>
          <div style="position: absolute; width: 10px; height: 10px; background: white; border-radius: 50%; top: 12px; left: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
        </div>
      `,
      className: '',
      iconSize: [38, 38],
      iconAnchor: [19, 38],
      popupAnchor: [0, -38],
    });

    const marker = L.marker([startLat, startLng], {
      icon: customPin,
      draggable: true,
    });

    if (lat !== null && lng !== null) {
      marker.addTo(map);
      marker.bindPopup('<b>Titik Kandang Terpilih</b><br>Seret pin untuk menggeser tepat di atap kandang').openPopup();
    }

    // Event saat pin diseret
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      const roundLat = Number(pos.lat.toFixed(6));
      const roundLng = Number(pos.lng.toFixed(6));
      onChangeLocation(roundLat, roundLng);
    });

    // Event saat peta diklik
    map.on('click', (e: any) => {
      const roundLat = Number(e.latlng.lat.toFixed(6));
      const roundLng = Number(e.latlng.lng.toFixed(6));
      onChangeLocation(roundLat, roundLng);

      marker.setLatLng([roundLat, roundLng]);
      if (!map.hasLayer(marker)) {
        marker.addTo(map);
      }
      marker.bindPopup('<b>Titik Kandang Ditetapkan</b><br>Seret jika ingin lebih presisi').openPopup();
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [leafletReady, lat, lng, onChangeLocation, getTileLayer, mapType]);

  // Saat panel dibuka, render map
  useEffect(() => {
    if (isOpen && leafletReady) {
      const timer = setTimeout(() => {
        initMap();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, leafletReady, initMap]);

  // Saat berganti tipe peta (Satelit vs Jalan), ganti layernya tanpa reload map
  const handleSwitchMapType = (newType: 'satellite' | 'streets') => {
    setMapType(newType);
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (activeTileLayerRef.current) {
      map.removeLayer(activeTileLayerRef.current);
    }

    const newLayer = getTileLayer(newType);
    if (newLayer) {
      newLayer.addTo(map);
      activeTileLayerRef.current = newLayer;
    }
  };

  // Saat panel ditutup, bersihkan instance
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
      activeTileLayerRef.current = null;
    }
  }, [isOpen]);

  // 3. Pencarian Lokasi / Desa (TANPA FORM TAG - AMAN DARI SUBMIT PARENT)
  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setSearchResults([]);

    try {
      const qFull = query.toLowerCase().includes('kebumen') ? query : `${query}, Kebumen, Jawa Tengah`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        qFull
      )}&countrycodes=id&limit=5`;

      const res = await fetch(url);
      const data = await res.json();

      if (data && data.length > 0) {
        setSearchResults(data);
        const first = data[0];
        const resLat = Number(Number(first.lat).toFixed(6));
        const resLng = Number(Number(first.lon).toFixed(6));
        moveToLocation(resLat, resLng);
      } else {
        alert(`Lokasi "${query}" tidak ditemukan. Coba gunakan nama desa/kecamatan lain.`);
      }
    } catch {
      alert('Gagal mencari lokasi. Pastikan perangkat terhubung ke internet.');
    } finally {
      setIsSearching(false);
    }
  };

  const moveToLocation = (targetLat: number, targetLng: number) => {
    onChangeLocation(targetLat, targetLng);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([targetLat, targetLng], 17, { duration: 1.2 });
      if (markerRef.current) {
        markerRef.current.setLatLng([targetLat, targetLng]);
        if (!mapInstanceRef.current.hasLayer(markerRef.current)) {
          markerRef.current.addTo(mapInstanceRef.current);
        }
        markerRef.current.bindPopup('<b>Lokasi Hasil Pencarian</b><br>Seret pin tepat di atap kandang').openPopup();
      }
    }
    setSearchResults([]);
  };

  return (
    <div className="w-full space-y-2 mt-1">
      {/* Tombol Toggle Buka / Tutup Peta Selebar Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <button
          type="button"
          onClick={onToggle}
          className={`w-full sm:w-auto min-h-touch h-11 px-4 rounded-xl text-xs font-bold flex items-center justify-between sm:justify-start gap-2.5 transition cursor-pointer shadow-xs ${
            isOpen
              ? 'bg-emerald-700 hover:bg-emerald-800 text-white ring-2 ring-emerald-500/30'
              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <MapIcon size={15} className={isOpen ? 'text-white' : 'text-emerald-600'} />
            <span>{isOpen ? '▲ Sembunyikan Peta Satelit' : '🛰️ Buka Peta Satelit'}</span>
            {!isOpen && (
              <span className="hidden sm:inline font-normal opacity-80 text-[11px]">
                (Pilih / Seret Titik Kandang)
              </span>
            )}
          </div>
          {isOpen ? <ChevronUp size={15} className="shrink-0" /> : <ChevronDown size={15} className="shrink-0" />}
        </button>

        {lat !== null && lng !== null && (
          <div className="w-full sm:w-auto min-h-touch h-11 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-700 dark:text-slate-300 flex items-center justify-between sm:justify-start gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0"></span>
              <span className="text-slate-500 dark:text-slate-400 font-sans text-[11px]">Koordinat:</span>
            </div>
            <b>{lat.toFixed(6)}, {lng.toFixed(6)}</b>
          </div>
        )}
      </div>

      {/* Kontainer Peta Inline Melebar Penuh (Full Width di Desktop) */}
      {isOpen && (
        <div className="w-full rounded-3xl border border-emerald-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-5 shadow-md space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header Panel Peta Mobile */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                🛰️
              </span>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                  Peta Satelit Lokasi Kandang
                </h4>
                <p className="text-[10px] text-slate-500 truncate">
                  Tentukan titik koordinat kandang dengan presisi
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggle}
              aria-label="Tutup Peta"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center transition cursor-pointer shrink-0"
              title="Tutup Peta"
            >
              <X size={15} />
            </button>
          </div>

          {/* Baris Kontrol: Pencarian Desa & Switcher Tema Satelit/Jalan */}
          <div className="space-y-2">
            {/* Input Pencarian Desa */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSearch();
                    }
                  }}
                  placeholder="Cari nama desa / kecamatan..."
                  className="w-full min-h-touch h-10 pl-9 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Hapus pencarian"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-pointer transition"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSearch();
                }}
                disabled={isSearching || !searchQuery.trim()}
                className="min-h-touch h-10 px-3.5 sm:px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs shrink-0"
              >
                {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                <span>Cari</span>
              </button>
            </div>

            {/* Switcher Tema: Satelit Nyata vs Peta Jalan */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleSwitchMapType('satellite')}
                className={`min-h-touch h-9 justify-center px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  mapType === 'satellite'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <span>Satelit Nyata</span>
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMapType('streets')}
                className={`min-h-touch h-9 justify-center px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  mapType === 'streets'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <span>Peta Jalan</span>
              </button>
            </div>
          </div>

          {/* Hasil Pencarian List */}
          {searchResults.length > 0 && (
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1 max-h-36 overflow-y-auto">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-2 block">
                Pilih Hasil Pencarian:
              </span>
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    moveToLocation(Number(item.lat), Number(item.lon));
                  }}
                  className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium truncate flex items-center gap-2 cursor-pointer transition min-h-touch"
                >
                  <MapPin size={14} className="text-emerald-600 shrink-0" />
                  <span className="truncate">{item.display_name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Petunjuk Singkat & Rapi */}
          <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 bg-emerald-50/60 dark:bg-emerald-950/30 px-3 py-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
            <span className="shrink-0 text-amber-500">💡</span>
            <span className="leading-tight">
              Ketuk peta atau seret pin merah tepat di atas atap kandang.
            </span>
          </div>

          {/* Area Peta Luas & Membentang Penuh (Tinggi Proporsional di Mobile) */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 h-72 sm:h-[400px] shadow-inner">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Floating Badge Koordinat Aktif di Pojok Bawah Peta */}
            {lat !== null && lng !== null && (
              <div className="absolute bottom-2.5 left-2.5 z-[400] px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-xs border border-white/20 text-white text-[10px] font-mono shadow-md flex items-center gap-1.5 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
                <span>{lat.toFixed(6)}, {lng.toFixed(6)}</span>
              </div>
            )}

            {!leafletReady && (
              <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white">
                <Loader2 size={24} className="animate-spin text-emerald-400" />
                <span className="text-xs font-bold">
                  Memuat citra satelit nyata...
                </span>
              </div>
            )}
          </div>

          {/* Footer Info & Tombol Selesai Mobile-Friendly */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse shrink-0"></span>
              <span>Koordinat tersimpan otomatis</span>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="w-full sm:w-auto min-h-touch h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
            >
              <span>✓ Selesai &amp; Tutup Peta</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
