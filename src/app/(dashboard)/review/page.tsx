import { requirePermission } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { ReviewCard } from '@/components/documents/review-card';
import type { AppRole } from '@/lib/auth/roles';
import type { Document } from '@/lib/db/types';

export default async function ReviewQueuePage() {
  const { profile } = await requirePermission('document:review');
  const supabase = await createClient();

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: true });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Review Queue</h1>
      <p className="mb-4 text-sm text-gray-500">
        Documents pending review. ({documents?.length ?? 0} documents)
      </p>
      <div className="space-y-4">
        {(documents as Document[] ?? []).map((doc) => (
          <ReviewCard key={doc.id} document={doc} role={profile.role as AppRole} />
        ))}
        {(!documents || documents.length === 0) && (
          <div className="rounded-lg border bg-white p-8 text-center text-sm text-gray-500">
            No documents pending review.
          </div>
        )}
      </div>
    </div>
  );
}
