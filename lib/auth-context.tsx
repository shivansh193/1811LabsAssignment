'use client'
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { browserClient as supabaseClient } from './supabase-client';
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
        const { data: { session } } = await supabaseClient.auth.getSession();
        console.log('Initial auth session:', session ? 'Found' : 'Not found');
        if (session?.user) {
          console.log('User authenticated:', session.user.email);
        }
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // If the user just signed in, log it and handle redirection
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in successfully:', session.user.email);
          console.log('Session cookie should be set now');
          
          // If we're on the auth page, redirect to dashboard
          if (typeof window !== 'undefined' && 
              (window.location.pathname.startsWith('/auth') || window.location.pathname === '/')) {
            const redirectTo = localStorage.getItem('redirectTo') || '/dashboard';
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
  }, []);

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
      
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Sign in error:', error.message);
        throw error;
      }
      
      if (data?.user) {
        console.log('Sign in successful for user:', data.user.email);
        console.log('Session established:', !!data.session);
        toast.success('Signed in successfully!');
        
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
        
        // Use direct window location for the most reliable redirect
        console.log('Redirecting to:', redirectTo);
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 1000); // Slightly longer delay to ensure session is properly established
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
