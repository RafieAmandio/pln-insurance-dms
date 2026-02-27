import { requireAuth } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { DocumentTable } from '@/components/documents/document-table';
import Link from 'next/link';
import { hasPermission } from '@/lib/auth/permissions';
import type { AppRole } from '@/lib/auth/roles';
import type { Document } from '@/lib/db/types';

export default async function DocumentsPage() {
  const { profile } = await requireAuth();
  const supabase = await createClient();

  const { data: documents, count } = await supabase
    .from('documents')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(0, 19);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        {hasPermission(profile.role as AppRole, 'document:upload') && (
          <Link
            href="/documents/upload"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Upload Document
          </Link>
        )}
      </div>
      <DocumentTable
        documents={(documents ?? []) as Document[]}
        pagination={{
          page: 1,
          totalPages: Math.ceil((count ?? 0) / 20),
          total: count ?? 0,
        }}
      />
    </div>
  );
}
