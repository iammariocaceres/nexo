import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      loading: false,
      error: null,

      setSession: (session) =>
        set({ session, user: session?.user ?? null }),

      signIn: async (email, password) => {
        set({ loading: true, error: null });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          set({ loading: false, error: error.message });
          return;
        }
        set({ session: data.session, user: data.user, loading: false, error: null });
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'nexo-auth-storage',
      // Only persist the session token — never store raw passwords
      partialize: (state) => ({ session: state.session, user: state.user }),
    }
  )
);
