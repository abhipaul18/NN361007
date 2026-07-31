'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';
import type { UserRole, Profile } from '@/src/types/database';
import {
  signInUser,
  signUpUser,
  signInWithGoogle,
  signOutUser,
  resetUserPassword,
  getCurrentUserRole,
} from '@/services/authService';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  role: UserRole;
  loading: boolean;
  slowAuthWarning: boolean;
  authError: string | null;
  login: typeof signInUser;
  register: typeof signUpUser;
  loginWithGoogle: typeof signInWithGoogle;
  logout: () => Promise<void>;
  resetPassword: typeof resetUserPassword;
  refreshSession: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('citizen');
  const [loading, setLoading] = useState<boolean>(true);
  const [slowAuthWarning, setSlowAuthWarning] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
    setSlowAuthWarning(false);
  }, []);

  const fetchProfileAsync = useCallback(async (userId: string) => {
    try {
      console.log('[Auth Debug] Profile fetch started for:', userId);
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[Auth Debug] Profile fetch returned error (non-fatal):', error.message);
      } else if (profileData) {
        setProfile(profileData as Profile);
        console.log('[Auth Debug] Profile fetched successfully');
      }
    } catch (err) {
      console.warn('[Auth Debug] Unexpected profile fetch exception (non-fatal):', err);
    }
  }, []);

  // Refresh profile on demand — used by Karma Reward Engine to update UI immediately
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfileAsync(user.id);
    }
  }, [user?.id, fetchProfileAsync]);

  const refreshSession = useCallback(async () => {
    console.log('[Auth Debug] Session check started');
    setLoading(true);
    setAuthError(null);

    // 10s Safety Timeout
    const timeoutTimer = setTimeout(() => {
      console.warn('[Auth Debug] Authentication session restore exceeded 10s timeout.');
      setSlowAuthWarning(true);
      setAuthError('Authentication is taking longer than expected.');
      setLoading(false);
      console.log('[Auth Debug] Loading cleared via 10s safety timeout');
    }, 10000);

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('[Auth Debug] Error getting Supabase session:', error.message);
      }

      const session = data?.session;
      if (session?.user) {
        console.log('[Auth Debug] Session restored:', session.user.id);
        setUser(session.user);
        console.log('[Auth Debug] User fetched:', session.user.email);

        // Fetch role safely
        try {
          const userRole = await getCurrentUserRole(session.user.id);
          setRole(userRole);
        } catch {
          setRole('citizen');
        }

        // Fetch profile asynchronously without blocking UI
        fetchProfileAsync(session.user.id);
      } else {
        console.log('[Auth Debug] No active session found.');
        setUser(null);
        setProfile(null);
        setRole('citizen');
      }
    } catch (err) {
      console.error('[Auth Debug] Session restoration exception:', err);
    } finally {
      clearTimeout(timeoutTimer);
      setLoading(false);
      console.log('[Auth Debug] Loading cleared');
    }
  }, [fetchProfileAsync]);

  useEffect(() => {
    refreshSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[Auth Debug] Auth state change event: ${event}`);
        try {
          if (session?.user) {
            console.log('[Auth Debug] Auth state change session user:', session.user.id);
            setUser(session.user);

            try {
              const userRole = await getCurrentUserRole(session.user.id);
              setRole(userRole);
            } catch {
              setRole('citizen');
            }

            fetchProfileAsync(session.user.id);
          } else {
            console.log('[Auth Debug] Auth state change cleared session');
            setUser(null);
            setProfile(null);
            setRole('citizen');
          }
        } catch (err) {
          console.error('[Auth Debug] Exception in onAuthStateChange handler:', err);
        } finally {
          setLoading(false);
          console.log('[Auth Debug] Loading cleared from auth listener');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshSession, fetchProfileAsync]);

  const handleLogout = async () => {
    console.log('[Auth Debug] Logout started');
    setLoading(true);
    try {
      await signOutUser();
      setUser(null);
      setProfile(null);
      setRole('citizen');
      console.log('[Auth Debug] Logout complete');
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('[Auth Debug] Logout error:', err);
    } finally {
      setLoading(false);
      console.log('[Auth Debug] Loading cleared after logout');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        slowAuthWarning,
        authError,
        login: signInUser,
        register: signUpUser,
        loginWithGoogle: signInWithGoogle,
        logout: handleLogout,
        resetPassword: resetUserPassword,
        refreshSession,
        refreshProfile,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
