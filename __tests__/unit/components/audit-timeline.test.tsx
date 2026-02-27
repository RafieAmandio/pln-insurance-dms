import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuditTimeline } from '@/components/audit/audit-timeline';
import type { AuditLog } from '@/lib/db/types';

const mockLogs: AuditLog[] = [
  {
    id: '1',
    document_id: 'doc-1',
    claim_id: null,
    action: 'upload',
    actor_id: 'user-1',
    actor_email: 'gudang@pln.co.id',
    actor_role: 'pic_gudang',
    old_status: null,
    new_status: null,
    details: {},
    ip_address: null,
    user_agent: '',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    document_id: 'doc-1',
    claim_id: null,
    action: 'status_change',
    actor_id: 'user-2',
    actor_email: 'klaim@pln.co.id',
    actor_role: 'pic_klaim',
    old_status: 'draft',
    new_status: 'reviewed',
    details: {},
    ip_address: null,
    user_agent: '',
    created_at: '2024-01-16T10:00:00Z',
  },
];

describe('AuditTimeline', () => {
  it('renders log entries', () => {
    render(<AuditTimeline logs={mockLogs} />);
    expect(screen.getByText('Uploaded document')).toBeInTheDocument();
    expect(screen.getByText('Changed status')).toBeInTheDocument();
  });

  it('shows actor emails', () => {
    render(<AuditTimeline logs={mockLogs} />);
    expect(screen.getByText(/gudang@pln.co.id/)).toBeInTheDocument();
    expect(screen.getByText(/klaim@pln.co.id/)).toBeInTheDocument();
  });

  it('shows status transition for status_change', () => {
    render(<AuditTimeline logs={mockLogs} />);
    expect(screen.getByText(/draft/)).toBeInTheDocument();
    expect(screen.getByText(/reviewed/)).toBeInTheDocument();
  });

  it('shows loading message', () => {
    render(<AuditTimeline logs={[]} loading />);
    expect(screen.getByText('Loading audit trail...')).toBeInTheDocument();
  });

  it('shows empty message when no logs', () => {
    render(<AuditTimeline logs={[]} />);
    expect(screen.getByText('No audit entries found.')).toBeInTheDocument();
  });
});
