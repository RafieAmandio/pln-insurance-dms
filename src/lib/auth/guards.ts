import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import type { AppRole } from './roles';
import { hasPermission, type Permission } from './permissions';

export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  return { user, profile };
}

export async function requireRole(...roles: AppRole[]) {
  const { user, profile } = await requireAuth();

  if (!roles.includes(profile.role as AppRole)) {
    redirect('/');
  }

  return { user, profile };
}

export async function requirePermission(permission: Permission) {
  const { user, profile } = await requireAuth();

  if (!hasPermission(profile.role as AppRole, permission)) {
    redirect('/');
  }

  return { user, profile };
}
