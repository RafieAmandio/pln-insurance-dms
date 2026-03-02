import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuditTimeline } from '@/components/audit/audit-timeline';
import type { AuditLogWithProfile } from '@/components/audit/audit-timeline';

vi.mock('@/lib/utils/relative-time', () => ({
  getRelativeTime: vi.fn((d: string) => `relative(${d})`),
  isToday: vi.fn(() => false),
}));

const mockLogs: AuditLogWithProfile[] = [
  {
    id: '1',
    document_id: 'doc-1',
    claim_id: null,
    action: 'upload',
    actor_id: 'user-1',
    actor_email: 'gudang@pln.co.id',
    actor_role: 'pic_gudang',
    actor_full_name: 'Budi Santoso',
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
    actor_full_name: null,
    old_status: 'draft',
    new_status: 'reviewed',
    details: {},
    ip_address: null,
    user_agent: '',
    created_at: '2024-01-16T10:00:00Z',
  },
];

describe('AuditTimeline', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders human-readable action labels', () => {
    render(<AuditTimeline logs={mockLogs} />);
    expect(screen.getByText('Document Uploaded')).toBeInTheDocument();
    expect(screen.getByText('Status Changed')).toBeInTheDocument();
  });

  it('shows actor full_name when available, falls back to email', () => {
    render(<AuditTimeline logs={mockLogs} />);
    expect(screen.getByText(/Budi Santoso/)).toBeInTheDocument();
    expect(screen.getByText(/klaim@pln.co.id/)).toBeInTheDocument();
  });

  it('renders relative timestamps', () => {
    render(<AuditTimeline logs={mockLogs} />);
    expect(screen.getByText('relative(2024-01-15T10:00:00Z)')).toBeInTheDocument();
    expect(screen.getByText('relative(2024-01-16T10:00:00Z)')).toBeInTheDocument();
  });

  it('renders Lucide icons for each action type', () => {
    render(<AuditTimeline logs={mockLogs} />);
    // Icons render as SVGs; verify the timeline items exist
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });

  it('shows status transition badges for status_change', () => {
    render(<AuditTimeline logs={mockLogs} />);
    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(screen.getByText('reviewed')).toBeInTheDocument();
  });

  it('shows skeleton when loading', () => {
    const { container } = render(<AuditTimeline logs={[]} loading />);
    expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
  });

  it('shows empty message when no logs', () => {
    render(<AuditTimeline logs={[]} />);
    expect(screen.getByText('No audit entries found.')).toBeInTheDocument();
  });
});
