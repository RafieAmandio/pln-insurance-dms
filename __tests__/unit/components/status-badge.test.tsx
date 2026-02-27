import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/documents/status-badge';

describe('StatusBadge', () => {
  it('renders Draft with gray styling', () => {
    render(<StatusBadge status="draft" />);
    const badge = screen.getByText('Draft');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-gray-100');
    expect(badge.className).toContain('text-gray-700');
  });

  it('renders Reviewed with blue styling', () => {
    render(<StatusBadge status="reviewed" />);
    const badge = screen.getByText('Reviewed');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-blue-100');
    expect(badge.className).toContain('text-blue-700');
  });

  it('renders Approved with green styling', () => {
    render(<StatusBadge status="approved" />);
    const badge = screen.getByText('Approved');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-green-100');
    expect(badge.className).toContain('text-green-700');
  });

  it('renders Archived with yellow styling', () => {
    render(<StatusBadge status="archived" />);
    const badge = screen.getByText('Archived');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('bg-yellow-100');
    expect(badge.className).toContain('text-yellow-700');
  });
});
