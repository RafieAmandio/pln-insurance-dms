import { requireAuth } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { AuditTimeline } from '@/components/audit/audit-timeline';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { AuditLog } from '@/lib/db/types';

export default async function DocumentAuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAuth();
  const supabase = await createClient();

  const { data: document } = await supabase
    .from('documents')
    .select('id, title')
    .eq('id', id)
    .single();

  if (!document) {
    notFound();
  }

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('document_id', id)
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link href={`/documents/${id}`} className="text-sm text-blue-600 hover:text-blue-800">
          &larr; Back to Document
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Audit Trail: {document.title}
        </h1>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <AuditTimeline logs={(logs ?? []) as AuditLog[]} />
      </div>
    </div>
  );
}
