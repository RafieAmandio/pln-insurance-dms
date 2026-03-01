import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/documents/status-badge';

describe('StatusBadge', () => {
  it('renders Draft badge', () => {
    render(<StatusBadge status="draft" />);
    const badge = screen.getByText('Draft');
    expect(badge).toBeInTheDocument();
  });

  it('renders Reviewed badge', () => {
    render(<StatusBadge status="reviewed" />);
    const badge = screen.getByText('Reviewed');
    expect(badge).toBeInTheDocument();
  });

  it('renders Approved badge with green styling', () => {
    render(<StatusBadge status="approved" />);
    const badge = screen.getByText('Approved');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-green-600');
  });

  it('renders Archived badge', () => {
    render(<StatusBadge status="archived" />);
    const badge = screen.getByText('Archived');
    expect(badge).toBeInTheDocument();
  });
});
