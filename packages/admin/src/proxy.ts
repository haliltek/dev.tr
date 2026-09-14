import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { jwtVerify } from 'jose';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const JWT_SECRET_STRING = process.env.ADMIN_JWT_SECRET || 'devcore-admin-super-secure-secret-token-key-2026';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static files and public assets bypass auth
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Public login API bypasses auth
  if (pathname === '/api/auth/login') {
    return NextResponse.next();
  }

  // Check auth session
  const token = req.cookies.get('devcore_admin_session')?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload && payload.role === 'admin') {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // Handle all API routes
  if (pathname.startsWith('/api/')) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Yetkisiz erişim. Oturum açın.' }, { status: 401 });
    }
    // Direct passthrough to Next.js API route handler without intl rewriting
    return NextResponse.next();
  }

  // Is signin page?
  const isSignInPage = pathname === '/signin' || pathname.endsWith('/signin');

  if (!isAuthenticated && !isSignInPage) {
    const signInUrl = new URL('/signin', req.url);
    return NextResponse.redirect(signInUrl);
  }

  if (isAuthenticated && isSignInPage) {
    const dashboardUrl = new URL('/', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
