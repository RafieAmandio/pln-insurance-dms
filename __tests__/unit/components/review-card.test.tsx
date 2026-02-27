import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { ReviewCard } from '@/components/documents/review-card';
import type { Document } from '@/lib/db/types';

const mockDocument: Document = {
  id: 'doc-1',
  title: 'Fire Damage Report',
  description: 'Report on warehouse fire damage',
  status: 'draft',
  asset_type: 'report',
  policy_number: 'POL-001',
  claim_number: '',
  file_path: 'user/file.pdf',
  file_name: 'report.pdf',
  file_size: 2048,
  mime_type: 'application/pdf',
  file_hash: '',
  page_count: 3,
  ocr_text: '',
  ocr_metadata: {},
  ocr_confidence: 0,
  ocr_completed_at: null,
  search_vector: null,
  tags: [],
  metadata: {},
  uploaded_by: 'user-1',
  reviewed_by: null,
  approved_by: null,
  reviewed_at: null,
  approved_at: null,
  batch_id: null,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

describe('ReviewCard', () => {
  it('renders document title', () => {
    render(<ReviewCard document={mockDocument} role="pic_klaim" />);
    expect(screen.getByText('Fire Damage Report')).toBeInTheDocument();
  });

  it('shows status badge', () => {
    render(<ReviewCard document={mockDocument} role="pic_klaim" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('shows Submit for Review button for pic_klaim', () => {
    render(<ReviewCard document={mockDocument} role="pic_klaim" />);
    expect(screen.getByText('Submit for Review')).toBeInTheDocument();
  });

  it('shows policy number', () => {
    render(<ReviewCard document={mockDocument} role="pic_klaim" />);
    expect(screen.getByText(/POL-001/)).toBeInTheDocument();
  });

  it('shows View Details link', () => {
    render(<ReviewCard document={mockDocument} role="pic_klaim" />);
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });
});
