import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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
    .select('file_path, file_name')
    .eq('id', id)
    .single();

  if (error || !document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const { data: signedUrl } = await supabase.storage
    .from('documents')
    .createSignedUrl(document.file_path, 3600); // 1 hour expiry

  if (!signedUrl) {
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
  }

  if (profile) {
    await logAudit({
      supabase,
      action: 'download',
      actorId: user.id,
      actorEmail: profile.email,
      actorRole: profile.role as AppRole,
      documentId: id,
      details: { file_name: document.file_name },
    });
  }

  return NextResponse.json({ data: { url: signedUrl.signedUrl, file_name: document.file_name } });
}
