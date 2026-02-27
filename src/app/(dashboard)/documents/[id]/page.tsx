import { requireAuth } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/documents/status-badge';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Document } from '@/lib/db/types';

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAuth();
  const supabase = await createClient();

  const { data: document } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (!document) {
    notFound();
  }

  const doc = document as Document;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/documents" className="text-sm text-blue-600 hover:text-blue-800">
            &larr; Back to Documents
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">{doc.title}</h1>
        </div>
        <StatusBadge status={doc.status} />
      </div>

      <div className="rounded-lg border bg-white p-6">
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">File Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{doc.file_name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Asset Type</dt>
            <dd className="mt-1 text-sm text-gray-900 capitalize">{doc.asset_type}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Policy Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{doc.policy_number || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Claim Number</dt>
            <dd className="mt-1 text-sm text-gray-900">{doc.claim_number || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">File Size</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {(doc.file_size / 1024).toFixed(1)} KB
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Uploaded</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(doc.created_at).toLocaleString('id-ID')}
            </dd>
          </div>
          {doc.description && (
            <div className="col-span-2">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900">{doc.description}</dd>
            </div>
          )}
          {doc.tags.length > 0 && (
            <div className="col-span-2">
              <dt className="text-sm font-medium text-gray-500">Tags</dt>
              <dd className="mt-1 flex flex-wrap gap-1">
                {doc.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
          )}
          {doc.ocr_text && (
            <div className="col-span-2">
              <dt className="text-sm font-medium text-gray-500">OCR Text</dt>
              <dd className="mt-1 max-h-40 overflow-y-auto rounded bg-gray-50 p-3 text-sm text-gray-900 whitespace-pre-wrap">
                {doc.ocr_text}
              </dd>
            </div>
          )}
        </dl>

        <div className="mt-6 flex gap-3">
          <Link
            href={`/documents/${doc.id}/audit`}
            className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View Audit Log
          </Link>
        </div>
      </div>
    </div>
  );
}
