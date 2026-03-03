import { Suspense } from 'react';
import { requirePermission } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { AuditTimeline } from '@/components/audit/audit-timeline';
import type { AuditLogWithProfile } from '@/components/audit/audit-timeline';
import { AuditPagination } from '@/components/audit/audit-pagination';
import { AuditFilters } from '@/components/audit/audit-filters';

const PAGE_SIZE = 25;

interface AuditPageProps {
  searchParams: Promise<{ page?: string; action?: string; search?: string }>;
}

export default async function GlobalAuditPage({ searchParams }: AuditPageProps) {
  await requirePermission('audit:view_global');
  const supabase = await createClient();
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;
  const actionFilter = params.action;
  const searchFilter = params.search;

  // Build count query
  let countQuery = supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true });

  if (actionFilter && actionFilter !== 'all') {
    const actions = actionFilter.split(',');
    countQuery = countQuery.in('action', actions);
  }

  if (searchFilter) {
    countQuery = countQuery.or(
      `actor_email.ilike.%${searchFilter}%,action.ilike.%${searchFilter}%`
    );
  }

  const { count } = await countQuery;
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  // Build data query
  let dataQuery = supabase
    .from('audit_logs')
    .select('*, profiles:actor_id(full_name)')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (actionFilter && actionFilter !== 'all') {
    const actions = actionFilter.split(',');
    dataQuery = dataQuery.in('action', actions);
  }

  if (searchFilter) {
    dataQuery = dataQuery.or(
      `actor_email.ilike.%${searchFilter}%,action.ilike.%${searchFilter}%`
    );
  }

  const { data: logs } = await dataQuery;

  const enrichedLogs: AuditLogWithProfile[] = ((logs ?? []) as Record<string, unknown>[]).map(
    (log) => {
      const profiles = log.profiles as { full_name: string } | null;
      return {
        ...log,
        actor_full_name: profiles?.full_name ?? null,
      } as AuditLogWithProfile;
    }
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
          <p className="text-sm text-muted-foreground">
            Track all system activity and document changes
          </p>
        </div>
      </div>
      <div className="rounded-lg border bg-white p-6">
        <Suspense>
          <AuditFilters logs={enrichedLogs} />
        </Suspense>
        <AuditTimeline logs={enrichedLogs} />
        {totalPages > 1 && (
          <AuditPagination currentPage={currentPage} totalPages={totalPages} />
        )}
      </div>
    </div>
  );
}
