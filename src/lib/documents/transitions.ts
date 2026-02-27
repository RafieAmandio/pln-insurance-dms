import { createActor } from 'xstate';
import { documentMachine, type DocumentEvent, type DocumentState } from './state-machine';
import type { AppRole } from '@/lib/auth/roles';
import type { SupabaseClient } from '@supabase/supabase-js';

interface TransitionRequest {
  supabase: SupabaseClient;
  documentId: string;
  event: DocumentEvent['type'];
  actorId: string;
  actorRole: AppRole;
}

interface TransitionResult {
  success: boolean;
  newStatus?: DocumentState;
  error?: string;
}

const STATUS_TO_EVENT_MAP: Record<string, DocumentState> = {
  draft: 'draft',
  reviewed: 'reviewed',
  approved: 'approved',
  archived: 'archived',
};

export async function transitionDocument({
  supabase,
  documentId,
  event,
  actorId,
  actorRole,
}: TransitionRequest): Promise<TransitionResult> {
  // Fetch current document status
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('id, status')
    .eq('id', documentId)
    .single();

  if (docError || !document) {
    return { success: false, error: 'Document not found' };
  }

  const currentStatus = STATUS_TO_EVENT_MAP[document.status];
  if (!currentStatus) {
    return { success: false, error: `Invalid current status: ${document.status}` };
  }

  // Validate transition using XState
  const actor = createActor(documentMachine, {
    snapshot: documentMachine.resolveState({ value: currentStatus, context: {} }),
  });
  actor.start();

  const currentSnap = actor.getSnapshot();
  const canTransition = currentSnap.can({
    type: event,
    role: actorRole,
    actorId,
  } as DocumentEvent);

  actor.stop();

  if (!canTransition) {
    return {
      success: false,
      error: `Transition '${event}' not allowed from '${currentStatus}' for role '${actorRole}'`,
    };
  }

  // Determine new status
  const newStatusMap: Record<string, Record<string, DocumentState>> = {
    draft: { SUBMIT_FOR_REVIEW: 'reviewed' },
    reviewed: { APPROVE: 'approved', REJECT: 'draft' },
    approved: { ARCHIVE: 'archived' },
  };

  const newStatus = newStatusMap[currentStatus]?.[event];
  if (!newStatus) {
    return { success: false, error: 'Invalid transition' };
  }

  // Update document in DB (audit trigger handles logging)
  const updateData: Record<string, unknown> = { status: newStatus };

  if (event === 'SUBMIT_FOR_REVIEW') {
    updateData.reviewed_by = actorId;
    updateData.reviewed_at = new Date().toISOString();
  }
  if (event === 'APPROVE') {
    updateData.approved_by = actorId;
    updateData.approved_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', documentId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true, newStatus };
}
