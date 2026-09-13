import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const getRedirect = (request: NextRequest, path: string) => {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = '';
  url.searchParams.set('redirect', request.nextUrl.pathname);
  return url;
};

export async function middleware(request: NextRequest) {
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isClientDashboard = request.nextUrl.pathname.startsWith('/cliente/dashboard');

  if (!isDashboard && !isClientDashboard) {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
  let validSupabaseUrl = false;
  try {
    const parsedUrl = new URL(supabaseUrl);
    validSupabaseUrl = /^https?:$/.test(parsedUrl.protocol) && Boolean(parsedUrl.hostname);
  } catch {
    validSupabaseUrl = false;
  }

  if (!validSupabaseUrl || !publishableKey || publishableKey.includes('SUA_PUBLISHABLE_KEY')) {
    return NextResponse.redirect(getRedirect(request, isClientDashboard ? '/cliente' : '/login'));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    const redirectResponse = NextResponse.redirect(getRedirect(request, isClientDashboard ? '/cliente' : '/login'));
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/cliente/dashboard/:path*'],
};
