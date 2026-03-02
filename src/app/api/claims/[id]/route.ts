import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateClaimSchema } from '@/lib/claims/validation';
import { hasPermission } from '@/lib/auth/permissions';
import type { AppRole } from '@/lib/auth/roles';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [{ data: claim, error }, { data: linkedDocs }] = await Promise.all([
    supabase.from('claims').select('*').eq('id', id).single(),
    supabase.from('claim_documents').select('*, documents(*)').eq('claim_id', id),
  ]);

  if (error || !claim) {
    return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
  }

  return NextResponse.json({ data: { ...claim, linked_documents: linkedDocs ?? [] } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || !hasPermission(profile.role as AppRole, 'claim:edit')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateClaimSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: claim, error } = await supabase
    .from('claims')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: claim });
}
