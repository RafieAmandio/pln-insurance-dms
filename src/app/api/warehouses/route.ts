import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') ?? '1');
  const pageSize = parseInt(searchParams.get('pageSize') ?? '20');
  const offset = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from('warehouses')
    .select('*', { count: 'exact' })
    .order('name')
    .range(offset, offset + pageSize - 1);

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

  if (!profile || !['manager', 'super_admin'].includes(profile.role)) {
    return NextResponse.json(
      { error: 'Only managers and super admins can create warehouses' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { name, address } = body;

  if (!name || !address) {
    return NextResponse.json(
      { error: 'Name and address are required' },
      { status: 400 }
    );
  }

  const { data: warehouse, error: dbError } = await supabase
    .from('warehouses')
    .insert({
      name,
      address,
      is_active: true,
      total_documents: 0,
      digitized_documents: 0,
      storage_size_bytes: 0,
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ data: warehouse }, { status: 201 });
}
