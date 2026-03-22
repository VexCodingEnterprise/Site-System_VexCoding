import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { parseSessionCookie } from '@/lib/server/auth';

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  const session = parseSessionCookie(request.cookies.get('vexcoding_session')?.value);

  if (!session) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
