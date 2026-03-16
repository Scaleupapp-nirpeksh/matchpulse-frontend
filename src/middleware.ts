import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPaths = ['/dashboard', '/scorer'];
const authPaths = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken =
    request.cookies.get('accessToken')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAuthPage = authPaths.some((p) => pathname.startsWith(p));

  // Protected routes: redirect to login if not authenticated
  if (isProtected && !accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Auth pages: redirect to dashboard if already authenticated
  if (isAuthPage && accessToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Everything else passes through
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/scorer/:path*',
    '/login',
    '/register',
  ],
};
