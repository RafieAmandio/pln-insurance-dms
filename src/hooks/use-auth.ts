'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AppRole } from '@/lib/auth/roles';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  role: AppRole | null;
  profile: { id: string; email: string; full_name: string; role: AppRole; department: string } | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setState({ user: null, role: null, profile: null, loading: false });
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, department')
        .eq('id', user.id)
        .single();

      setState({
        user,
        role: profile?.role as AppRole ?? null,
        profile: profile as AuthState['profile'],
        loading: false,
      });
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
