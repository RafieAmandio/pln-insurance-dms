import { requireAuth } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { DocumentTable } from '@/components/documents/document-table';
import { DocumentFiltersWrapper } from '@/components/documents/document-filters-wrapper';
import Link from 'next/link';
import { hasPermission } from '@/lib/auth/permissions';
import type { AppRole } from '@/lib/auth/roles';
import type { Document } from '@/lib/db/types';
import { Button } from '@/components/ui/button';

const PAGE_SIZE = 20;

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function DocumentsPage({ searchParams }: PageProps) {
  const { profile } = await requireAuth();
  const supabase = await createClient();
  const params = await searchParams;

  const page = Math.max(1, parseInt((params.page as string) ?? '1', 10));
  const search = (params.search as string) ?? '';
  const type = (params.type as string) ?? '';
  const status = (params.status as string) ?? '';
  const warehouseId = (params.warehouse_id as string) ?? '';
  const dateFrom = (params.date_from as string) ?? '';
  const dateTo = (params.date_to as string) ?? '';
  const policyNumber = (params.policy_number as string) ?? '';

  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase
    .from('documents')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`title.ilike.%${search}%,id.ilike.%${search}%`);
  }
  if (type) {
    query = query.eq('asset_type', type);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (warehouseId) {
    query = query.eq('warehouse_id', warehouseId);
  }
  if (dateFrom) {
    query = query.gte('created_at', dateFrom);
  }
  if (dateTo) {
    query = query.lte('created_at', `${dateTo}T23:59:59`);
  }
  if (policyNumber) {
    query = query.ilike('policy_number', `%${policyNumber}%`);
  }

  const { data: documents, count } = await query.range(offset, offset + PAGE_SIZE - 1);

  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage all indexed documents
          </p>
        </div>
        {hasPermission(profile.role as AppRole, 'document:upload') && (
          <Button asChild>
            <Link href="/documents/upload">Upload Document</Link>
          </Button>
        )}
      </div>

      <DocumentFiltersWrapper
        initialFilters={{
          search,
          type: type as '' | Document['asset_type'],
          status: status as '' | Document['status'],
          warehouse_id: warehouseId,
          date_from: dateFrom,
          date_to: dateTo,
          policy_number: policyNumber,
        }}
        totalCount={total}
      />

      <div className="mt-4">
        <DocumentTable
          documents={(documents ?? []) as Document[]}
          pagination={{
            page,
            totalPages,
            total,
          }}
        />
      </div>
    </div>
  );
}
