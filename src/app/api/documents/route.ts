import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { uploadDocumentSchema, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/documents/validation';
import { logAudit } from '@/lib/audit/logger';
import type { AppRole } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') ?? '1');
  const pageSize = parseInt(searchParams.get('pageSize') ?? '20');
  const status = searchParams.get('status');
  const assetType = searchParams.get('asset_type');
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('documents')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (status) query = query.eq('status', status);
  if (assetType) query = query.eq('asset_type', assetType);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    pagination: {
      page,
      pageSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    },
  });
}

export async function POST(request: NextRequest) {
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

  if (!profile || profile.role !== 'pic_gudang') {
    return NextResponse.json({ error: 'Only PIC Gudang can upload documents' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const metadataStr = formData.get('metadata') as string | null;

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return NextResponse.json({ error: `Invalid file type: ${file.type}` }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 });
  }

  let metadata;
  try {
    metadata = uploadDocumentSchema.parse(JSON.parse(metadataStr ?? '{}'));
  } catch {
    return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
  }

  // Upload file to Supabase Storage
  const filePath = `${user.id}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Create document record
  const { data: document, error: dbError } = await supabase
    .from('documents')
    .insert({
      title: metadata.title,
      description: metadata.description,
      asset_type: metadata.asset_type,
      policy_number: metadata.policy_number,
      claim_number: metadata.claim_number,
      tags: metadata.tags,
      warehouse_id: metadata.warehouse_id ?? null,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: user.id,
      status: 'draft',
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  await logAudit({
    supabase,
    action: 'upload',
    actorId: user.id,
    actorEmail: profile.email,
    actorRole: profile.role as AppRole,
    documentId: document.id,
    details: { file_name: file.name, file_size: file.size },
  });

  return NextResponse.json({ data: document }, { status: 201 });
}
