import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDocumentVersions, createVersion } from '@/lib/versions/queries';
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

  try {
    const versions = await getDocumentVersions(supabase, id);
    return NextResponse.json({ data: versions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch versions';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
  const { description } = body;

  if (!description || typeof description !== 'string') {
    return NextResponse.json({ error: 'Description is required' }, { status: 400 });
  }

  // Get current document to copy file info
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('file_path, file_size')
    .eq('id', id)
    .single();

  if (docError || !document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  try {
    const version = await createVersion(
      supabase,
      id,
      description,
      document.file_path,
      document.file_size,
      user.id
    );

    await logAudit({
      supabase,
      action: 'version_create',
      actorId: user.id,
      actorEmail: profile.email,
      actorRole: profile.role as AppRole,
      documentId: id,
      details: { version_number: version.version_number, description },
    });

    return NextResponse.json({ data: version }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create version';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
