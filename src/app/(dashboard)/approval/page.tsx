import { requirePermission } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { ApprovalCard } from '@/components/documents/approval-card';
import type { AppRole } from '@/lib/auth/roles';
import type { Document } from '@/lib/db/types';

export default async function ApprovalQueuePage() {
  const { profile } = await requirePermission('document:approve');
  const supabase = await createClient();

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('status', 'reviewed')
    .order('created_at', { ascending: true });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Approval Queue</h1>
      <p className="mb-4 text-sm text-gray-500">
        Documents pending approval. ({documents?.length ?? 0} documents)
      </p>
      <div className="space-y-4">
        {(documents as Document[] ?? []).map((doc) => (
          <ApprovalCard key={doc.id} document={doc} role={profile.role as AppRole} />
        ))}
        {(!documents || documents.length === 0) && (
          <div className="rounded-lg border bg-white p-8 text-center text-sm text-gray-500">
            No documents pending approval.
          </div>
        )}
      </div>
    </div>
  );
}
