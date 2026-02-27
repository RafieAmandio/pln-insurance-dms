import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateDocumentSchema } from '@/lib/documents/validation';
import { logAudit } from '@/lib/audit/logger';
import type { AppRole } from '@/lib/db/types';

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  if (profile) {
    await logAudit({
      supabase,
      action: 'view',
      actorId: user.id,
      actorEmail: profile.email,
      actorRole: profile.role as AppRole,
      documentId: id,
    });
  }

  return NextResponse.json({ data: document });
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

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateDocumentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: document, error } = await supabase
    .from('documents')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAudit({
    supabase,
    action: 'edit',
    actorId: user.id,
    actorEmail: profile.email,
    actorRole: profile.role as AppRole,
    documentId: id,
    details: { updated_fields: Object.keys(parsed.data) },
  });

  return NextResponse.json({ data: document });
}
