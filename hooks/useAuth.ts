'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, AuthError } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        loading: false,
      }));
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        user: session?.user ?? null,
        loading: false,
      }));
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      return { success: false, error: error.message };
    }

    setState((prev) => ({ ...prev, loading: false, user: data.user }));
    return { success: true, user: data.user };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      return { success: false, error: error.message };
    }

    setState((prev) => ({ ...prev, loading: false, user: data.user }));
    return { success: true, user: data.user };
  }, []);

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const { error } = await supabase.auth.signOut();

    if (error) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }));
      return { success: false, error: error.message };
    }

    setState({ user: null, loading: false, error: null });
    return { success: true };
  }, []);

  const getUsername = useCallback(() => {
    return state.user?.user_metadata?.username || state.user?.email?.split('@')[0] || 'Anonymous';
  }, [state.user]);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    username: getUsername(),
    signUp,
    signIn,
    signOut,
  };
}
