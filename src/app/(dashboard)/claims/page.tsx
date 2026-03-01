import { requireAuth } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { hasPermission } from '@/lib/auth/permissions';
import Link from 'next/link';
import type { AppRole } from '@/lib/auth/roles';
import type { Claim } from '@/lib/db/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
        <h1 className="text-2xl font-bold">Claims</h1>
        {hasPermission(profile.role as AppRole, 'claim:create') && (
          <Button asChild>
            <Link href="/claims/new">New Claim</Link>
          </Button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Claim #</TableHead>
              <TableHead>Claimant</TableHead>
              <TableHead>Policy #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(claims as Claim[] ?? []).map((claim) => (
              <TableRow key={claim.id}>
                <TableCell>
                  <Link href={`/claims/${claim.id}`} className="font-medium text-blue-600 hover:text-blue-800">
                    {claim.claim_number}
                  </Link>
                </TableCell>
                <TableCell>{claim.claimant_name}</TableCell>
                <TableCell className="text-muted-foreground">{claim.policy_number || '-'}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {claim.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: claim.currency }).format(claim.amount)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(claim.created_at).toLocaleDateString('id-ID')}
                </TableCell>
              </TableRow>
            ))}
            {(!claims || claims.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No claims found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
