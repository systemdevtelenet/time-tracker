import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip public assets, Next.js internal files, favicon, icons, and auth API endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.') ||
    pathname === '/icon.png' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Read session cookie
  const sessionCookie = request.cookies.get('ctnp_session')?.value;
  let isAuthenticated = false;

  if (sessionCookie) {
    try {
      const parsed = JSON.parse(sessionCookie);
      if (parsed && (parsed.id || parsed.email)) {
        isAuthenticated = true;
      }
    } catch (e) {
      isAuthenticated = false;
    }
  }

  // 3. Unauthenticated access to protected dashboard pages -> Redirect to /login
  if (!isAuthenticated && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Authenticated user attempting to visit /login -> Redirect to /?tab=dashboard
  if (isAuthenticated && pathname === '/login') {
    const dashboardUrl = new URL('/?tab=dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
