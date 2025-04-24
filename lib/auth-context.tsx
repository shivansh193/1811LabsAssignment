'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { browserClient, browserClient as supabaseClient } from './supabase-client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string, redirectTo?: string) => Promise<void>;
  signInWithGoogle: (redirectTo?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // First try to get the session
        const { data: { session } } = await supabaseClient.auth.getSession();
        console.log('Initial auth session:', session ? 'Found' : 'Not found');
        
        if (session?.user) {
          console.log('User authenticated:', session.user.email);
          setSession(session);
          setUser(session.user);
          setIsLoading(false);
          return;
        }
        
        // If no session, try to get the user directly
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (user) {
          console.log('User found via getUser:', user.email);
          setUser(user);
          // Even without a session, we know the user is authenticated
          setIsLoading(false);
          return;
        }
        
        // No user found
        console.log('No authenticated user found');
        setSession(null);
        setUser(null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    const verifySession = async () => {
      try {
        const { data } = await supabaseClient.auth.getSession();
        if (data.session) {
          console.log('Session verified:', data.session.user?.email);
          setSession(data.session);
          setUser(data.session.user);
        } else {
          console.log('No session found, trying to refresh...');
          const { data: refreshData } = await supabaseClient.auth.refreshSession();
          if (refreshData.session) {
            console.log('Session refreshed:', refreshData.session.user?.email);
            setSession(refreshData.session);
            setUser(refreshData.session.user);
          } else {
            setSession(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Session verification error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    getInitialSession().then(verifySession);


    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
        
        if (session) {
          setSession(session);
          setUser(session.user);
        } else {
          // Try to get the user directly as a fallback
          try {
            const { data: { user } } = await supabaseClient.auth.getUser();
            setUser(user);
          } catch (err) {
            console.error('Error getting user after auth state change:', err);
            setUser(null);
          }
        }
        
        setIsLoading(false);
        
        // If the user just signed in, log it and handle redirection
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in successfully:', session.user.email);
          console.log('Session cookie should be set now');
          
          // If we're on the auth page, redirect to dashboard
          if (typeof window !== 'undefined' && 
              (window.location.pathname.startsWith('/auth') || window.location.pathname === '/')) {
            const redirectTo = '/dashboard';
            console.log('Auth state change detected, redirecting to:', redirectTo);
            
            // Small delay to ensure cookies are properly set
            setTimeout(() => {
              window.location.href = redirectTo;
            }, 500);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signUp = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabaseClient.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Check your email for the confirmation link!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error signing up';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string, redirectTo = '/dashboard') => {
    try {
      setIsLoading(true);
      console.log('Attempting to sign in with email:', email);
      console.log('Will redirect to:', redirectTo);
      
      // Check if the Supabase URL and key are properly set
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('Supabase environment variables are not properly set');
        toast.error('Authentication configuration error. Please contact support.');
        return;
      }
      
      
      // Store the redirectTo in localStorage before authentication
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectTo', redirectTo);
        console.log('Stored redirectTo in localStorage:', redirectTo);
      }
      
      // IMPORTANT: Use browserClient for authentication to ensure cookies are properly set
      const { data, error } = await browserClient.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Sign in error:', error.message);
        throw error;
      }
      if (data?.user) {
        // Wait for session to be established before redirecting
        console.log('Sign in successful for user:', data.user.email);
        toast.success('Signed in successfully!');
        
        // Remove the setTimeout and use router.push instead of direct window.location
        router.refresh(); // Refresh the router cache
        router.push(redirectTo);
      
        // Store the session in localStorage for debugging
        if (typeof window !== 'undefined') {
          localStorage.setItem('lastAuthAttempt', JSON.stringify({
            success: true,
            timestamp: new Date().toISOString(),
            email: data.user.email,
            redirectTo: redirectTo
          }));
        }
        
        // Log all cookies for debugging
        console.log('Cookies after sign in:', document.cookie);
        
        // Verify the session was properly established
        const { data: sessionData } = await browserClient.auth.getSession();
        console.log('Session verification after login:', sessionData.session ? 'Session found' : 'No session');
        
        if (!sessionData.session) {
          console.warn('No session found after login - attempting to repair session');
          // Try to repair the session by refreshing
          await browserClient.auth.refreshSession();
        }
        
        // Use direct window location for the most reliable redirect
        console.log('Redirecting to:', redirectTo);
        
        // Add a longer delay to ensure session is fully established and cookies are set
        console.log('Waiting for session to be fully established before redirecting...');
        setTimeout(() => {
          // Double-check session before redirecting
          browserClient.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
            console.log('Final session check before redirect:', data.session ? 'Session found' : 'No session');
            window.location.href = redirectTo;
          });
        }, 2000); // Longer delay to ensure session is properly established
      } else {
        console.error('Sign in succeeded but no user data returned');
        toast.error('Authentication error. Please try again.');
      }
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error signing in';
      toast.error(errorMessage);
      
      // Store the failed attempt in localStorage for debugging
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastAuthAttempt', JSON.stringify({
          success: false,
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (redirectTo = '/dashboard') => {
    try {
      setIsLoading(true);
      
      // Store the redirectTo in localStorage to use it after OAuth callback
      if (typeof window !== 'undefined') {
        localStorage.setItem('redirectTo', redirectTo);
      }
      
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        throw error;
      }
      
      // If we don't get redirected by Supabase, manually redirect to the URL
      if (data?.url) {
        console.log('Redirecting to OAuth provider URL:', data.url);
        window.location.href = data.url;
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error signing in with Google';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      router.push('/');
      toast.success('Signed out successfully!');
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error signing out';
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
