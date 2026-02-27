import { createMachine } from 'xstate';
import type { AppRole } from '@/lib/auth/roles';

export type DocumentEvent =
  | { type: 'SUBMIT_FOR_REVIEW'; role: AppRole; actorId: string }
  | { type: 'APPROVE'; role: AppRole; actorId: string }
  | { type: 'REJECT'; role: AppRole; actorId: string }
  | { type: 'ARCHIVE'; role: AppRole; actorId: string };

export const documentMachine = createMachine({
  id: 'document',
  initial: 'draft',
  states: {
    draft: {
      on: {
        SUBMIT_FOR_REVIEW: {
          target: 'reviewed',
          guard: ({ event }) => event.role === 'pic_klaim',
        },
      },
    },
    reviewed: {
      on: {
        APPROVE: {
          target: 'approved',
          guard: ({ event }) => event.role === 'manager',
        },
        REJECT: {
          target: 'draft',
          guard: ({ event }) => event.role === 'manager',
        },
      },
    },
    approved: {
      on: {
        ARCHIVE: {
          target: 'archived',
          guard: ({ event }) => event.role === 'manager',
        },
      },
    },
    archived: {
      type: 'final',
    },
  },
});

export type DocumentState = 'draft' | 'reviewed' | 'approved' | 'archived';

export function getAvailableTransitions(
  currentState: DocumentState,
  role: AppRole
): DocumentEvent['type'][] {
  const transitions: DocumentEvent['type'][] = [];

  if (currentState === 'draft' && role === 'pic_klaim') {
    transitions.push('SUBMIT_FOR_REVIEW');
  }
  if (currentState === 'reviewed' && role === 'manager') {
    transitions.push('APPROVE');
    transitions.push('REJECT');
  }
  if (currentState === 'approved' && role === 'manager') {
    transitions.push('ARCHIVE');
  }

  return transitions;
}

export const EVENT_LABELS: Record<DocumentEvent['type'], string> = {
  SUBMIT_FOR_REVIEW: 'Submit for Review',
  APPROVE: 'Approve',
  REJECT: 'Reject',
  ARCHIVE: 'Archive',
};

export const EVENT_STYLES: Record<DocumentEvent['type'], string> = {
  SUBMIT_FOR_REVIEW: 'bg-blue-600 hover:bg-blue-700 text-white',
  APPROVE: 'bg-green-600 hover:bg-green-700 text-white',
  REJECT: 'bg-red-600 hover:bg-red-700 text-white',
  ARCHIVE: 'bg-yellow-600 hover:bg-yellow-700 text-white',
};
