import { requireAuth } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { VersionControlClient } from './client';

export default async function VersionControlPage() {
  await requireAuth();
  const supabase = await createClient();

  const { data: documents } = await supabase
    .from('documents')
    .select('id, title')
    .order('created_at', { ascending: false })
    .limit(200);

  return (
    <div>
      <VersionControlClient
        documents={(documents ?? []).map((d) => ({ id: d.id, title: d.title }))}
      />
    </div>
  );
}
