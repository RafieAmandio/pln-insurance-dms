import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('system_settings')
    .select('key, value');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Convert array of {key, value} to a single object
  const settings: Record<string, unknown> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }

  return NextResponse.json({ data: settings });
}

export async function PUT(request: NextRequest) {
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

  if (!profile || !['manager', 'super_admin'].includes(profile.role)) {
    return NextResponse.json(
      { error: 'Only managers and super admins can update settings' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const entries = Object.entries(body) as [string, unknown][];

  if (entries.length === 0) {
    return NextResponse.json({ error: 'No settings provided' }, { status: 400 });
  }

  // Upsert each setting
  const upserts = entries.map(([key, value]) => ({
    key,
    value: JSON.parse(JSON.stringify(value)),
    updated_at: new Date().toISOString(),
    updated_by: user.id,
  }));

  const { error } = await supabase
    .from('system_settings')
    .upsert(upserts, { onConflict: 'key' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
