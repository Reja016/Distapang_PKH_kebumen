import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('simantap_session')?.value;
  const validSession = await verifySessionToken(sessionCookie);

  // 1. Proteksi endpoint API Admin (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (!validSession) {
      return NextResponse.json(
        { success: false, error: 'Akses Ditolak: Anda belum login.' },
        { status: 401 }
      );
    }
    if (validSession.role !== 'Administrator') {
      return NextResponse.json(
        { success: false, error: 'Akses Dilarang: Hanya Administrator yang berhak.' },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // 2. Daftar route internal halaman web yang wajib login
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
    '/api/admin/:path*',
  ],
};
