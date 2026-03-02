import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { linkDocumentSchema } from '@/lib/claims/validation';
import { hasPermission } from '@/lib/auth/permissions';
import { logAudit } from '@/lib/audit/logger';
import type { AppRole } from '@/lib/auth/roles';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: claimId } = await params;
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

  if (!profile || !hasPermission(profile.role as AppRole, 'claim:link_document')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = linkDocumentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: link, error } = await supabase
    .from('claim_documents')
    .insert({
      claim_id: claimId,
      document_id: parsed.data.document_id,
      linked_by: user.id,
      notes: parsed.data.notes,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Document already linked to this claim' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  void logAudit({
    supabase,
    action: 'link_claim',
    actorId: user.id,
    actorEmail: profile.email,
    actorRole: profile.role as AppRole,
    documentId: parsed.data.document_id,
    claimId,
    details: { notes: parsed.data.notes },
  });

  return NextResponse.json({ data: link }, { status: 201 });
}
