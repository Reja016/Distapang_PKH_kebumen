import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('simantap_session')?.value;
  const validSession = await verifySessionToken(sessionCookie);

  // 1. Proteksi endpoint khusus Administrator:
  // - /api/admin/* (Backup database, restore, dll)
  // - /api/anggota (Kelola pengguna dan hak akses)
  // - /api/import-* (Skrip pembersih / seeder data awal yang ada TRUNCATE)
  // - /api/init-* (Inisialisasi tabel)
  const isAdminOnlyApi =
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/anggota') ||
    pathname.startsWith('/api/import-') ||
    pathname.startsWith('/api/init-');

  if (isAdminOnlyApi) {
    if (!validSession) {
      return NextResponse.json(
        { success: false, error: 'Akses Ditolak: Anda wajib login sebagai Administrator.' },
        { status: 401 }
      );
    }
    if (validSession.role !== 'Administrator') {
      return NextResponse.json(
        { success: false, error: 'Akses Dilarang: Fitur ini hanya untuk Administrator.' },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // 2. Proteksi seluruh operasi modifikasi (POST, PUT, PATCH, DELETE) pada API internal
  // Endpoint publik yang dikecualikan: /api/auth/login, /api/auth/logout, /api/ai-chat, /api/portal-stats
  const isPublicApi =
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/logout' ||
    pathname === '/api/ai-chat' ||
    pathname === '/api/portal-stats';

  if (pathname.startsWith('/api/') && !isPublicApi) {
    const isMutatingMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method);
    if (isMutatingMethod && !validSession) {
      return NextResponse.json(
        { success: false, error: 'Akses Ditolak: Operasi data ini membutuhkan autentikasi login.' },
        { status: 401 }
      );
    }
  }

  // 3. Daftar route internal halaman web yang wajib login
  const protectedPages = ['/beranda', '/bitpro', '/keswan', '/kesmavet', '/aset'];

  const isProtectedPage = protectedPages.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Jika mencoba akses halaman proteksi tanpa sesi login yang valid
  if (isProtectedPage && !validSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan mencoba akses halaman /login
  if (pathname === '/login' && validSession) {
    return NextResponse.redirect(new URL('/beranda', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/beranda',
    '/beranda/:path*',
    '/bitpro/:path*',
    '/keswan/:path*',
    '/kesmavet/:path*',
    '/aset/:path*',
    '/login',
    '/api/:path*',
  ],
};
