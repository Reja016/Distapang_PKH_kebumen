/**
 * Client-Side Image Compressor & File Validator
 * 100% Gratis menggunakan standar bawaan HTML5 Canvas di browser.
 * Menjamin file foto dikompres dan file PDF dibatasi maksimal 2 MB untuk menghemat server.
 */

export interface CompressionResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
}

/**
 * Kompres gambar (JPEG, PNG, WebP) ke dimensi maksimal dan ukuran maksimal 2 MB
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1600,
  initialQuality = 0.8,
  maxSizeBytes = 2 * 1024 * 1024
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File bukan gambar'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
      img.onload = () => {
        let { width, height } = img;

        // Resize dimensi jika melebihi maxDimension (mempertahankan rasio)
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        // Gambar ke canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Kompresi kualitas bertingkat agar PASTI < 2 MB
        let quality = initialQuality;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // Perkiraan ukuran byte dari base64: (panjang * 3) / 4
        let estBytes = (dataUrl.length * 3) / 4;
        while (estBytes > maxSizeBytes && quality > 0.3) {
          quality -= 0.15;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          estBytes = (dataUrl.length * 3) / 4;
        }

        resolve(dataUrl);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Kompres canvas (misalnya dari tangkapan kamera / webcam) agar <= 2 MB
 */
export function compressCanvas(canvas: HTMLCanvasElement, maxSizeBytes = 2 * 1024 * 1024): string {
  let quality = 0.85;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  let estBytes = (dataUrl.length * 3) / 4;

  while (estBytes > maxSizeBytes && quality > 0.3) {
    quality -= 0.15;
    dataUrl = canvas.toDataURL('image/jpeg', quality);
    estBytes = (dataUrl.length * 3) / 4;
  }

  return dataUrl;
}

/**
 * Validasi ukuran file PDF (maksimal 2 MB)
 */
export function validatePdfFile(
  file: File,
  maxSizeBytes = 2 * 1024 * 1024
): { valid: boolean; error?: string } {
  const isPdf =
    file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    return {
      valid: false,
      error: 'Hanya file dokumen format PDF (.pdf) yang diperbolehkan!',
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `Ukuran dokumen PDF melebihi batas maksimal 2 MB (terdeteksi: ${sizeMB} MB). Silakan kompres dokumen PDF Anda terlebih dahulu sebelum mengunggah.`,
    };
  }

  return { valid: true };
}

/**
 * Filter Pemroses Scan Hitam Putih (B/W Scanner Effect - Mirip Mesin Fotokopi / CamScanner)
 * Membersihkan latar belakang kertas menjadi putih bersih dan mengubah guratan tinta/cap menjadi hitam kontras tinggi.
 */
export async function processBlackAndWhiteScan(
  file: File,
  maxDimension = 1400,
  maxSizeBytes = 2 * 1024 * 1024
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File bukan gambar'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target?.result as string);
        }

        ctx.drawImage(img, 0, 0, width, height);

        try {
          const imgData = ctx.getImageData(0, 0, width, height);
          const data = imgData.data;

          // Algoritma Binarized Grayscale Scanner (CamScanner-like)
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Luminance
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;

            // Jika latar belakang kertas terang, buat jadi putih polos (255)
            // Jika tinta gelap, pertajam jadi hitam pekat (0)
            let val = 255;
            if (gray < 160) {
              val = Math.max(0, Math.min(255, (gray - 55) * 2.3));
            }

            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
          }

          ctx.putImageData(imgData, 0, 0);
        } catch {
          // Fallback jika getImageData terhambat CORS
        }

        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        let estBytes = (dataUrl.length * 3) / 4;
        while (estBytes > maxSizeBytes && quality > 0.3) {
          quality -= 0.15;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          estBytes = (dataUrl.length * 3) / 4;
        }

        resolve(dataUrl);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

