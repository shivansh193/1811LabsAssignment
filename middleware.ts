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

  // Log all cookies for debugging
  console.log('All cookies in middleware:', request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 10)}...`));
  
  // Special handling for callback route - don't interfere with the OAuth flow
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    console.log('Middleware: Auth callback route detected, skipping auth check');
    return res;
  }

  // Create a Supabase client using the newer API signature
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name) {
          const cookie = request.cookies.get(name);
          console.log(`Middleware: Reading cookie ${name}:`, cookie ? 'Found' : 'Not found');
          return cookie?.value;
        },
        set(name, value, options) {
          console.log(`Middleware: Setting cookie ${name}`);
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          console.log(`Middleware: Removing cookie ${name}`);
          res.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: 0,
          });
        },
      },
      // No need to specify cookieOptions here - Supabase will handle this automatically
      // This ensures the cookie name is dynamically determined based on the project reference
    }
  );
  
  // Get the session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (sessionError) {
    console.error('Middleware: Error getting session:', sessionError)
  }

  // Check if the user is authenticated
  const isAuthenticated = !!session
  console.log('Middleware: Authentication check -', isAuthenticated ? 'User is authenticated' : 'User is NOT authenticated')
  if (session?.user) {
    console.log('Middleware: Authenticated user:', session.user.email)
  }
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isRootPage = request.nextUrl.pathname === '/'
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
  console.log('Middleware: Request path:', request.nextUrl.pathname, 
    `(isAuthPage: ${isAuthPage}, isRootPage: ${isRootPage}, isDashboardPage: ${isDashboardPage})`)
  
  // Manual check for any Supabase auth token cookie as a fallback
  const hasAuthCookie = request.cookies.getAll().some(cookie => cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token'))
  console.log('Middleware: Supabase auth cookie present:', hasAuthCookie)
  
  // Use either the session check or the manual cookie check
  const userHasAuth = isAuthenticated || hasAuthCookie

  // If user is not authenticated and trying to access protected routes
  if (!userHasAuth && isDashboardPage) {
    console.log('Middleware: Unauthenticated user trying to access:', request.nextUrl.pathname)
    // Store the original URL to redirect back after authentication
    const redirectUrl = new URL('/auth', request.url)
    redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
    console.log('Middleware: Redirecting to:', redirectUrl.toString())
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access auth pages
  if (userHasAuth && (isAuthPage || isRootPage)) {
    console.log('Middleware: Authenticated user trying to access auth or root page')
    // Get the redirectTo parameter or default to dashboard
    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/dashboard'
    const redirectUrl = new URL(redirectTo, request.url)
    console.log('Middleware: Redirecting authenticated user to:', redirectUrl.toString())
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

// Specify which routes this middleware should run on
export const config = {
  matcher: ['/', '/dashboard/:path*', '/auth/:path*'],
}