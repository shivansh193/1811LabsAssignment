import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Clone the request headers to avoid modifying them directly
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-url', request.url)

  // Create a response with the updated headers
  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Special handling for callback route - don't interfere with the OAuth flow
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    console.log('Middleware: Auth callback route detected, skipping auth check');
    return res;
  }

  // Create a Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({
            name,
            value,
            ...options,
            path: options.path || '/',
          });
        },
        remove(name, options) {
          res.cookies.set({
            name,
            value: '',
            ...options,
            path: options.path || '/',
            maxAge: 0,
          });
        },
      }
    }
  );
  
  // Get the session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Check if the user is authenticated
  const isAuthenticated = !!session;
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isRootPage = request.nextUrl.pathname === '/';
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
  
  // CRITICAL: Add a check to prevent redirect loops
  // If we're already on the auth page and not authenticated, just proceed
  if (isAuthPage && !isAuthenticated) {
    return res;
  }
  
  // If user is not authenticated and trying to access protected routes
  if (!isAuthenticated && isDashboardPage) {
    const redirectUrl = new URL('/auth', request.url);
    // Add a unique parameter to prevent browser caching the redirect
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    redirectUrl.searchParams.set('ts', Date.now().toString());
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated and trying to access auth pages or root
  if (isAuthenticated && (isAuthPage || isRootPage)) {
    // Get the redirectTo parameter or default to dashboard
    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/dashboard';
    const redirectUrl = new URL(redirectTo, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}
// Specify which routes this middleware should run on
export const config = {
  matcher: ['/', '/dashboard/:path*', '/auth/:path*'],
}