import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { lockDocument, unlockDocument } from '@/lib/versions/queries';
import type { AppRole } from '@/lib/db/types';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const lock = await lockDocument(supabase, id, user.id);
    return NextResponse.json({ data: lock });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to lock document';
    const status = message.includes('already locked') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
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
    .select('role')
    .eq('id', user.id)
    .single();

  try {
    await unlockDocument(
      supabase,
      id,
      user.id,
      profile?.role as AppRole | undefined
    );
    return NextResponse.json({ data: { unlocked: true } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to unlock document';
    const status = message.includes('Only the locking user') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
