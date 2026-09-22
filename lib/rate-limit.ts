interface RateLimitRecord {
  count: number;
  resetTime: number; // timestamp dalam milidetik kapan window berakhir
}

// In-memory store untuk pelacakan kuota request
const rateLimitStore = new Map<string, RateLimitRecord>();

let lastCleanup = Date.now();
function cleanup() {
  const now = Date.now();
  // Jalankan garbage collection setiap 5 menit untuk membersihkan record lama
  if (now - lastCleanup > 5 * 60 * 1000) {
    lastCleanup = now;
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }
}

/**
 * Cek dan konsumsi kuota rate limit untuk kunci tertentu (misal: IP atau username).
 *
 * @param key Identifier unik (misal: `login:192.168.1.1` atau `aichat:192.168.1.1`)
 * @param limit Batas maksimal pemanggilan dalam window tertentu
 * @param windowMs Durasi window dalam milidetik (misal: 60 * 1000 untuk 1 menit)
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; retryAfterSeconds: number } {
  cleanup();
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || record.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= limit) {
    const retryAfterSeconds = Math.max(1, Math.ceil((record.resetTime - now) / 1000));
    return {
      success: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: Math.max(0, limit - record.count),
    retryAfterSeconds: Math.max(1, Math.ceil((record.resetTime - now) / 1000)),
  };
}

/**
 * Reset catatan kuota untuk kunci tertentu (biasanya dipanggil saat user berhasil login).
 */
export function resetRateLimit(key: string) {
  rateLimitStore.delete(key);
}

/**
 * Dapatkan alamat IP klien dari Request headers.
 */
export function getClientIp(req: Request): string {
  // Cloudflare Header
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  // Standar X-Forwarded-For (bisa multi-proxy)
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }

  // X-Real-IP
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return '127.0.0.1';
}
