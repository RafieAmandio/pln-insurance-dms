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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Version Control</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track document versions, compare changes, and restore
          </p>
        </div>
        <button
          disabled
          className="rounded-md border bg-white px-4 py-2 text-sm font-medium text-gray-400 cursor-not-allowed"
        >
          Compare Versions
        </button>
      </div>

      <VersionControlClient
        documents={(documents ?? []).map((d) => ({ id: d.id, title: d.title }))}
      />
    </div>
  );
}
