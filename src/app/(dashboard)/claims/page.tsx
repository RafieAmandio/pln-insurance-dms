import { requireAuth } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { hasPermission } from '@/lib/auth/permissions';
import Link from 'next/link';
import type { AppRole } from '@/lib/auth/roles';
import type { Claim } from '@/lib/db/types';

export default async function ClaimsPage() {
  const { profile } = await requireAuth();
  const supabase = await createClient();

  const { data: claims } = await supabase
    .from('claims')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Claims</h1>
        {hasPermission(profile.role as AppRole, 'claim:create') && (
          <Link
            href="/claims/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            New Claim
          </Link>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Claim #</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Claimant</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Policy #</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(claims as Claim[] ?? []).map((claim) => (
              <tr key={claim.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <Link href={`/claims/${claim.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                    {claim.claim_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{claim.claimant_name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{claim.policy_number || '-'}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-700">
                    {claim.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: claim.currency }).format(claim.amount)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(claim.created_at).toLocaleDateString('id-ID')}
                </td>
              </tr>
            ))}
            {(!claims || claims.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  No claims found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
