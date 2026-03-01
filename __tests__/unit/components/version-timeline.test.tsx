import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VersionTimeline, type VersionEntry } from '@/components/version-control/version-timeline';

const mockVersions: VersionEntry[] = [
  {
    id: 'v1',
    version_number: 3,
    description: 'Updated cover page',
    file_path: 'docs/v3.pdf',
    file_size: 204800,
    created_by: 'user-1',
    created_at: '2024-06-15T10:00:00Z',
    profiles: { full_name: 'Budi Santoso', email: 'budi@pln.co.id' },
  },
  {
    id: 'v2',
    version_number: 2,
    description: 'Added appendix',
    file_path: 'docs/v2.pdf',
    file_size: 153600,
    created_by: 'user-2',
    created_at: '2024-06-14T10:00:00Z',
    profiles: { full_name: 'Sari Dewi', email: 'sari@pln.co.id' },
  },
  {
    id: 'v3',
    version_number: 1,
    description: 'Initial upload',
    file_path: 'docs/v1.pdf',
    file_size: 102400,
    created_by: 'user-1',
    created_at: '2024-06-13T10:00:00Z',
    profiles: { full_name: 'Budi Santoso', email: 'budi@pln.co.id' },
  },
];

describe('VersionTimeline', () => {
  it('renders version entries with correct version numbers', () => {
    render(<VersionTimeline versions={mockVersions} />);
    expect(screen.getByText('v3')).toBeInTheDocument();
    expect(screen.getByText('v2')).toBeInTheDocument();
    expect(screen.getByText('v1')).toBeInTheDocument();
  });

  it('shows "Current" badge on the latest version only', () => {
    render(<VersionTimeline versions={mockVersions} />);
    const badges = screen.getAllByText('Current');
    expect(badges).toHaveLength(1);
  });

  it('shows Restore button only on non-current versions', () => {
    render(<VersionTimeline versions={mockVersions} />);
    const restoreButtons = screen.getAllByRole('button', { name: /Restore/i });
    expect(restoreButtons).toHaveLength(2);
  });

  it('shows View button on all versions', () => {
    render(<VersionTimeline versions={mockVersions} />);
    const viewButtons = screen.getAllByRole('button', { name: /View/i });
    expect(viewButtons).toHaveLength(3);
  });

  it('shows loading message when loading', () => {
    render(<VersionTimeline versions={[]} loading />);
    expect(screen.getByText('Loading version history...')).toBeInTheDocument();
  });

  it('shows empty message when no versions', () => {
    render(<VersionTimeline versions={[]} />);
    expect(screen.getByText('No versions found.')).toBeInTheDocument();
  });

  it('shows author names', () => {
    render(<VersionTimeline versions={mockVersions} />);
    expect(screen.getAllByText(/Budi Santoso/)).toHaveLength(2);
    expect(screen.getByText(/Sari Dewi/)).toBeInTheDocument();
  });

  it('shows descriptions', () => {
    render(<VersionTimeline versions={mockVersions} />);
    expect(screen.getByText('Updated cover page')).toBeInTheDocument();
    expect(screen.getByText('Added appendix')).toBeInTheDocument();
    expect(screen.getByText('Initial upload')).toBeInTheDocument();
  });

  it('calls onView when View button is clicked', async () => {
    const onView = vi.fn();
    render(<VersionTimeline versions={mockVersions} onView={onView} />);
    const viewButtons = screen.getAllByRole('button', { name: /View/i });
    await userEvent.click(viewButtons[0]);
    expect(onView).toHaveBeenCalledWith(mockVersions[0]);
  });

  it('calls onRestore when Restore button is clicked', async () => {
    const onRestore = vi.fn();
    render(<VersionTimeline versions={mockVersions} onRestore={onRestore} />);
    const restoreButtons = screen.getAllByRole('button', { name: /Restore/i });
    await userEvent.click(restoreButtons[0]);
    expect(onRestore).toHaveBeenCalledWith(mockVersions[1]);
  });
});
