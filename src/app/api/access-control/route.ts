import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { AppRole } from '@/lib/db/types';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['super_admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch roles
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('*')
    .order('name');

  if (rolesError) {
    return NextResponse.json({ error: rolesError.message }, { status: 500 });
  }

  // Count users per role
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('role');

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  const userCounts: Record<string, number> = {};
  for (const p of profiles ?? []) {
    userCounts[p.role] = (userCounts[p.role] ?? 0) + 1;
  }

  const rolesWithCounts = (roles ?? []).map((role) => ({
    ...role,
    user_count: userCounts[role.name] ?? 0,
  }));

  return NextResponse.json({ data: rolesWithCounts });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['super_admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { roleId, permissions } = body as { roleId: string; permissions: string[] };

  if (!roleId || !Array.isArray(permissions)) {
    return NextResponse.json({ error: 'roleId and permissions are required' }, { status: 400 });
  }

  const { data: updatedRole, error } = await supabase
    .from('roles')
    .update({ permissions, updated_at: new Date().toISOString() })
    .eq('id', roleId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: updatedRole });
}
