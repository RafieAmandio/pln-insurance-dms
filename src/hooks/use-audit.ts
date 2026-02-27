'use client';

import { useEffect, useState } from 'react';
import type { AuditLog } from '@/lib/db/types';

interface UseAuditOptions {
  documentId?: string;
  claimId?: string;
}

interface AuditState {
  logs: AuditLog[];
  loading: boolean;
  error: string | null;
}

export function useAudit({ documentId, claimId }: UseAuditOptions = {}) {
  const [state, setState] = useState<AuditState>({
    logs: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchAudit() {
      const params = new URLSearchParams();
      if (documentId) params.set('document_id', documentId);
      if (claimId) params.set('claim_id', claimId);

      try {
        const res = await fetch(`/api/audit?${params.toString()}`);
        if (!res.ok) throw new Error('Failed to fetch audit logs');
        const json = await res.json();
        setState({ logs: json.data, loading: false, error: null });
      } catch (err) {
        setState({
          logs: [],
          loading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    fetchAudit();
  }, [documentId, claimId]);

  return state;
}
