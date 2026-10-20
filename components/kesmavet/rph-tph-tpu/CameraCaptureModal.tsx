'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, RotateCcw, Check, RefreshCw, AlertCircle, UploadCloud } from 'lucide-react';
import { showToast } from '@/components/common/CustomToast';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64Image: string) => void;
  title?: string;
}

export default function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  title = 'Ambil Foto via Kamera',
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState<boolean>(true);

  // Hentikan stream saat unmount atau close
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Mulai stream kamera
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    setIsLoadingCamera(true);
    setCameraError(null);
    setCapturedImage(null);

    // Hentikan stream sebelumnya jika ada
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Perangkat atau browser Anda tidak mendukung akses kamera langsung.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Gagal membuka kamera langsung:', err);
      let errMsg = 'Tidak dapat mengakses kamera perangkat.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'Izin akses kamera ditolak. Silakan izinkan akses kamera di pengaturan browser.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = 'Kamera tidak ditemukan pada perangkat ini.';
      }
      setCameraError(errMsg);
    } finally {
      setIsLoadingCamera(false);
    }
  }, [stream]);

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
      setCapturedImage(null);
      setCameraError(null);
    }
    return () => {
      stopStream();
    };
  }, [isOpen]);

  // Ganti kamera depan / belakang
  const handleSwitchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Jepret Foto dari video stream
  const handleShutter = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = canvasRef.current || document.createElement('canvas');
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Jika kamera depan, cerminkan secara natural
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    // Dapatkan data URL (JPEG, kualitas 0.82)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    setCapturedImage(dataUrl);

    // Hentikan stream sementara untuk menghemat baterai & memori
    stopStream();
  };

  // Ulangi / Retake foto
  const handleRetake = () => {
    setCapturedImage(null);
    startCamera(facingMode);
  };

  // Konfirmasi / Gunakan Foto
  const handleConfirm = () => {
    if (!capturedImage) return;
    onCapture(capturedImage);
    stopStream();
    onClose();
  };

  // Fallback ke kamera bawaan via input capture="environment"
  const handleFallbackFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const b64 = evt.target?.result as string;
      onCapture(b64);
      onClose();
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
              <p className="text-[11px] text-slate-400">Bidik kamera langsung ke objek</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopStream();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Viewfinder / Preview Body */}
        <div className="relative flex-1 bg-black min-h-[300px] sm:min-h-[380px] flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            /* PREVIEW HASIL JEPRET */
            <img
              src={capturedImage}
              alt="Hasil Jepret"
              className="w-full h-full object-contain max-h-[60vh]"
            />
          ) : cameraError ? (
            /* STATE ERROR / PERMISSION DENIED */
            <div className="p-6 text-center max-w-sm space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                <AlertCircle size={26} />
              </div>
              <div>
                <p className="text-sm font-bold text-white mb-1">Akses Kamera Terkendala</p>
                <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => fallbackInputRef.current?.click()}
                  className="w-full h-11 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <UploadCloud size={16} />
                  <span>Buka Kamera Bawaan Perangkat</span>
                </button>
                <input
                  ref={fallbackInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFallbackFile}
                />
              </div>
            </div>
          ) : (
            /* LIVE VIDEO VIEWFINDER */
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover min-h-[300px] sm:min-h-[380px]"
              />

              {/* Viewfinder Target Overlay Frame */}
              <div className="absolute inset-6 pointer-events-none border-2 border-white/20 rounded-2xl flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-t-2 border-l-2 border-purple-400 rounded-tl-sm" />
                  <div className="w-4 h-4 border-t-2 border-r-2 border-purple-400 rounded-tr-sm" />
                </div>
                <div className="flex justify-between">
                  <div className="w-4 h-4 border-b-2 border-l-2 border-purple-400 rounded-bl-sm" />
                  <div className="w-4 h-4 border-b-2 border-r-2 border-purple-400 rounded-br-sm" />
                </div>
              </div>

              {isLoadingCamera && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 text-white">
                  <RefreshCw className="animate-spin text-purple-400" size={24} />
                  <span className="text-xs font-medium">Mengaktifkan kamera...</span>
                </div>
              )}
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Toolbar Controls */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between shrink-0">
          {capturedImage ? (
            /* CONTROLS SETELAH JEPRET */
            <div className="flex items-center justify-between w-full gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>Foto Ulang</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 h-11 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-600/30 cursor-pointer"
              >
                <Check size={16} strokeWidth={2.5} />
                <span>Gunakan Foto Ini</span>
              </button>
            </div>
          ) : (
            /* CONTROLS SAAT LIVE CAMERA */
            <div className="flex items-center justify-between w-full">
              {/* Tombol switch kamera */}
              <button
                type="button"
                onClick={handleSwitchCamera}
                disabled={isLoadingCamera || !!cameraError}
                className="w-11 h-11 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                title="Ganti Kamera Depan/Belakang"
              >
                <RefreshCw size={18} />
              </button>

              {/* Tombol Shutter Utama */}
              <button
                type="button"
                onClick={handleShutter}
                disabled={isLoadingCamera || !!cameraError}
                className="w-16 h-16 rounded-full bg-purple-600 hover:bg-purple-500 active:scale-95 text-white flex items-center justify-center transition-all p-1 shadow-lg shadow-purple-600/40 disabled:opacity-40 cursor-pointer border-4 border-slate-900"
                title="Jepret Foto"
              >
                <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                  <Camera size={20} />
                </div>
              </button>

              {/* Batal */}
              <button
                type="button"
                onClick={() => {
                  stopStream();
                  onClose();
                }}
                className="w-11 h-11 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup Kamera"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
