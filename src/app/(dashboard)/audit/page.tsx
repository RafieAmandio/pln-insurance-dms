import { requirePermission } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { AuditTimeline } from '@/components/audit/audit-timeline';
import type { AuditLogWithProfile } from '@/components/audit/audit-timeline';
import { AuditPagination } from '@/components/audit/audit-pagination';

const PAGE_SIZE = 25;

interface AuditPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function GlobalAuditPage({ searchParams }: AuditPageProps) {
  await requirePermission('audit:view_global');
  const supabase = await createClient();
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { count } = await supabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true });

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*, profiles:actor_id(full_name)')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

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
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Audit Trail</h1>
      <div className="rounded-lg border bg-white p-6">
        <AuditTimeline logs={enrichedLogs} />
        {totalPages > 1 && (
          <AuditPagination currentPage={currentPage} totalPages={totalPages} />
        )}
      </div>
    </div>
  );
}
