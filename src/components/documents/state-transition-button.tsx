'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAvailableTransitions,
  EVENT_LABELS,
  EVENT_STYLES,
  type DocumentState,
  type DocumentEvent,
} from '@/lib/documents/state-machine';
import type { AppRole } from '@/lib/auth/roles';

interface StateTransitionButtonProps {
  documentId: string;
  currentState: DocumentState;
  role: AppRole;
}

export function StateTransitionButton({
  documentId,
  currentState,
  role,
}: StateTransitionButtonProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const transitions = getAvailableTransitions(currentState, role);

  if (transitions.length === 0) return null;

  async function handleTransition(event: DocumentEvent['type']) {
    setLoading(event);
    try {
      const res = await fetch(`/api/documents/${documentId}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Transition failed');
      } else {
        router.refresh();
      }
    } catch {
      alert('Network error');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2">
      {transitions.map((event) => (
        <button
          key={event}
          onClick={() => handleTransition(event)}
          disabled={loading !== null}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${EVENT_STYLES[event]}`}
        >
          {loading === event ? 'Processing...' : EVENT_LABELS[event]}
        </button>
      ))}
    </div>
  );
}
