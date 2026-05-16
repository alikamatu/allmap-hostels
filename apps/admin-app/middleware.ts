import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/verification-status', '/verification'];
const PUBLIC_AUTH_ROUTE = '/';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));

  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === PUBLIC_AUTH_ROUTE && token) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.searchParams.delete('from');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo|assets|public).*)',
  ],
};
