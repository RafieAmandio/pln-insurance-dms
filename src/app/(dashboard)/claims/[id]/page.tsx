import { requireAuth } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { LinkedDocuments } from '@/components/claims/linked-documents';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAuth();
  const supabase = await createClient();

  const { data: claim } = await supabase
    .from('claims')
    .select('*')
    .eq('id', id)
    .single();

  if (!claim) {
    notFound();
  }

  const { data: linkedDocs } = await supabase
    .from('claim_documents')
    .select('*, documents(*)')
    .eq('claim_id', id);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <Link href="/claims" className="text-sm text-blue-600 hover:text-blue-800">
          &larr; Back to Claims
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Claim: {claim.claim_number}
        </h1>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Details</h2>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Claimant</dt>
              <dd className="mt-1 text-sm text-gray-900">{claim.claimant_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Policy Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{claim.policy_number || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm capitalize text-gray-900">{claim.status.replace('_', ' ')}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Amount</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: claim.currency,
                }).format(claim.amount)}
              </dd>
            </div>
            {claim.claim_date && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Claim Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(claim.claim_date).toLocaleDateString('id-ID')}
                </dd>
              </div>
            )}
            {claim.description && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{claim.description}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Linked Documents</h2>
          <LinkedDocuments links={(linkedDocs ?? []) as never} />
        </div>
      </div>
    </div>
  );
}
