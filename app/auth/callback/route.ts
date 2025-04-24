import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (code) {
    try {
      // Create the proper server-side client for route handlers
      const supabase = createRouteHandlerClient({ 
        cookies
      });      
      
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error in exchangeCodeForSession:', error);
        throw error;
      }
      
      console.log('Session established in callback route:', !!data.session);
      
      // Return HTML that will redirect the user to the dashboard or stored redirect path
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <script>
              // Try to get the stored redirectTo path or default to dashboard
              const redirectTo = localStorage.getItem('redirectTo') || '/dashboard';
              console.log('Redirecting to:', redirectTo);
              // Clear the stored redirect path
              localStorage.removeItem('redirectTo');
              // Add a small delay to ensure cookies are properly set
              setTimeout(() => {
                // Redirect to the appropriate page
                window.location.href = redirectTo;
              }, 1000);
            </script>
          </head>
          <body>
            <p>Authentication successful! Redirecting...</p>
          </body>
        </html>`,
        {
          headers: {
            'Content-Type': 'text/html',
          },
        }
      );
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      // Return an error page with more details
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>Authentication Error</title>
          </head>
          <body>
            <h1>Authentication Error</h1>
            <p>There was an error processing your authentication. Please try again.</p>
            <p>Error details: ${error instanceof Error ? error.message : 'Unknown error'}</p>
            <p><a href="/auth">Return to login</a></p>
          </body>
        </html>`,
        {
          status: 400,
          headers: {
            'Content-Type': 'text/html',
          },
        }
      );
    }
  }
  
  // If we get here, something went wrong or there was no code
  return NextResponse.redirect(`${requestUrl.origin}/auth`);
}