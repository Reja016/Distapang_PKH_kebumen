'use client';

import React from 'react';
import { Download, X, Image as ImageIcon } from 'lucide-react';

interface KegiatanCameraModalProps {
  showCameraModal: boolean;
  videoRef: React.RefObject<any>;
  canvasRef: React.RefObject<any>;
  takePhoto: () => void;
  closeCamera: () => void;
}

export function KegiatanCameraModal({
  showCameraModal,
  videoRef,
  canvasRef,
  takePhoto,
  closeCamera,
}: KegiatanCameraModalProps) {
  if (!showCameraModal) return null;

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4">
        <h3 className="font-bold text-slate-900 text-center text-base">Ambil Foto Kegiatan</h3>
        <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-3">
          <button
            type="button"
            onClick={takePhoto}
            className="flex-1 min-h-touch h-11 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 cursor-pointer"
          >
            📸 Ambil Foto
          </button>
          <button
            type="button"
            onClick={closeCamera}
            className="min-h-touch h-11 px-5 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-200 cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

interface KegiatanPreviewPhotoModalProps {
  previewPhotoModal: { url: string; title: string } | null;
  onClose: () => void;
}

export function KegiatanPreviewPhotoModal({
  previewPhotoModal,
  onClose,
}: KegiatanPreviewPhotoModalProps) {
  if (!previewPhotoModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-800/90 border-b border-slate-700 text-white">
          <div className="flex items-center gap-2 min-w-0">
            <ImageIcon size={16} className="text-emerald-400 shrink-0" />
            <h4 className="font-bold text-xs sm:text-sm truncate text-slate-100">
              {previewPhotoModal.title}
            </h4>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <a
              href={previewPhotoModal.url}
              download="dokumentasi_kegiatan_ktt.jpg"
              className="h-8 px-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Unduh Foto Asli"
            >
              <Download size={13} strokeWidth={2.5} />
              <span className="hidden sm:inline">Unduh</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-lg bg-slate-700 hover:bg-red-600 hover:text-white text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup (ESC)"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Area Foto */}
        <div className="p-2 sm:p-4 bg-black/50 flex items-center justify-center overflow-auto max-h-[75vh]">
          <img
            src={previewPhotoModal.url}
            alt={previewPhotoModal.title}
            className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}
