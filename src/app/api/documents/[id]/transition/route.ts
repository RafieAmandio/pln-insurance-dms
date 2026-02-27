import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { transitionDocument } from '@/lib/documents/transitions';
import type { DocumentEvent } from '@/lib/documents/state-machine';
import type { AppRole } from '@/lib/auth/roles';

export async function POST(
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
  const event = body.event as DocumentEvent['type'];

  if (!event) {
    return NextResponse.json({ error: 'Event is required' }, { status: 400 });
  }

  const result = await transitionDocument({
    supabase,
    documentId: id,
    event,
    actorId: user.id,
    actorRole: profile.role as AppRole,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json({ data: { newStatus: result.newStatus } });
}
