import { requirePermission } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { AuditTimeline } from '@/components/audit/audit-timeline';
import type { AuditLog } from '@/lib/db/types';

export default async function GlobalAuditPage() {
  await requirePermission('audit:view_global');
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Global Audit Log</h1>
      <div className="rounded-lg border bg-white p-6">
        <AuditTimeline logs={(logs ?? []) as AuditLog[]} />
      </div>
    </div>
  );
}
