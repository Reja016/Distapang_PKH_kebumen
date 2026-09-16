import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_SECRET = process.env.SESSION_SECRET || 'simantap_pkh_kebumen_secure_key_2026_super_secret';

export interface SessionPayload {
  id: number;
  nip_username: string;
  role: string;
  nama: string;
  exp: number; // timestamp in seconds
}

// Helper Base64URL encoding/decoding yang kompatibel dengan Edge Runtime dan Node.js
function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Tanda tangan kriptografi menggunakan Web Crypto API standar (Bisa berjalan di Edge & Node.js)
async function signHmacSha256(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const bytes = new Uint8Array(signature);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Buat session token bertanda tangan HMAC-SHA256
 */
export async function createSessionToken(user: {
  id: number;
  nip_username: string;
  role: string;
  nama: string;
}): Promise<string> {
  const payload: SessionPayload = {
    id: user.id,
    nip_username: user.nip_username,
    role: user.role,
    nama: user.nama,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 hari
  };

  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const signature = await signHmacSha256(payloadB64, SESSION_SECRET);

  return `${payloadB64}.${signature}`;
}

/**
 * Verifikasi session token menggunakan Web Crypto API
 */
export async function verifySessionToken(token?: string | null): Promise<SessionPayload | null> {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;

  try {
    const expectedSignature = await signHmacSha256(payloadB64, SESSION_SECRET);

    if (signature !== expectedSignature) {
      return null;
    }

    const jsonStr = base64UrlDecode(payloadB64);
    const payload: SessionPayload = JSON.parse(jsonStr);

    // Cek waktu kedaluwarsa
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Ekstrak dan verifikasi session dari Request
 */
export async function getSessionFromRequest(req: Request | NextRequest): Promise<SessionPayload | null> {
  let token: string | undefined;

  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/simantap_session=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  return await verifySessionToken(token);
}

/**
 * Guard untuk Route Handler API: Mengharuskan user sudah login
 */
export async function requireAuth(req: Request): Promise<{ session: SessionPayload } | { errorResponse: NextResponse }> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Akses Ditolak: Anda belum login atau sesi telah berakhir.' },
        { status: 401 }
      ),
    };
  }
  return { session };
}

/**
 * Guard untuk Route Handler API: Mengharuskan role Administrator
 */
export async function requireAdmin(req: Request): Promise<{ session: SessionPayload } | { errorResponse: NextResponse }> {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Akses Ditolak: Anda wajib login terlebih dahulu.' },
        { status: 401 }
      ),
    };
  }

  if (session.role !== 'Administrator') {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Akses Dilarang: Hanya Administrator yang berhak mengakses fitur ini.' },
        { status: 403 }
      ),
    };
  }

  return { session };
}
