import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecentDocuments } from '@/components/dashboard/recent-documents';
import type { RecentDocument } from '@/lib/dashboard/queries';

const mockDocuments: RecentDocument[] = [
  {
    id: '1',
    title: 'Policy ABC-123',
    policy_number: 'ABC-123',
    asset_type: 'policy',
    status: 'approved',
    created_at: new Date().toISOString(),
    warehouse: { name: 'Warehouse A' },
  },
  {
    id: '2',
    title: 'Claim Report XYZ',
    policy_number: 'XYZ-456',
    asset_type: 'claim',
    status: 'ocr_review',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    warehouse: null,
  },
];

describe('RecentDocuments', () => {
  it('renders document titles', () => {
    render(<RecentDocuments documents={mockDocuments} />);
    expect(screen.getByText('Policy ABC-123')).toBeInTheDocument();
    expect(screen.getByText('Claim Report XYZ')).toBeInTheDocument();
  });

  it('renders status badges', () => {
    render(<RecentDocuments documents={mockDocuments} />);
    expect(screen.getByText('Approved')).toBeInTheDocument();
    expect(screen.getByText('OCR Review')).toBeInTheDocument();
  });

  it('renders header with View All link', () => {
    render(<RecentDocuments documents={mockDocuments} />);
    expect(screen.getByText('Recent Documents')).toBeInTheDocument();
    expect(screen.getByText('View All')).toBeInTheDocument();
  });

  it('renders empty state when no documents', () => {
    render(<RecentDocuments documents={[]} />);
    expect(screen.getByText('No documents yet.')).toBeInTheDocument();
  });

  it('renders warehouse name when available', () => {
    render(<RecentDocuments documents={mockDocuments} />);
    expect(screen.getByText('policy - Warehouse A')).toBeInTheDocument();
  });
});
