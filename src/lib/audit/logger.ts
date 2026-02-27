import type { SupabaseClient } from '@supabase/supabase-js';
import type { AuditAction, AppRole } from '@/lib/db/types';

interface LogAuditParams {
  supabase: SupabaseClient;
  action: AuditAction;
  actorId: string;
  actorEmail: string;
  actorRole: AppRole;
  documentId?: string;
  claimId?: string;
  oldStatus?: string;
  newStatus?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit({
  supabase,
  action,
  actorId,
  actorEmail,
  actorRole,
  documentId,
  claimId,
  oldStatus,
  newStatus,
  details = {},
  ipAddress,
  userAgent,
}: LogAuditParams) {
  const { error } = await supabase.from('audit_logs').insert({
    document_id: documentId ?? null,
    claim_id: claimId ?? null,
    action,
    actor_id: actorId,
    actor_email: actorEmail,
    actor_role: actorRole,
    old_status: oldStatus ?? null,
    new_status: newStatus ?? null,
    details,
    ip_address: ipAddress ?? null,
    user_agent: userAgent ?? '',
  });

  if (error) {
    console.error('Failed to log audit:', error);
  }
}
