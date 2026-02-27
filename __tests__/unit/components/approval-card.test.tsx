import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { ApprovalCard } from '@/components/documents/approval-card';
import type { Document } from '@/lib/db/types';

const mockDocument: Document = {
  id: 'doc-1',
  title: 'Reviewed Policy Document',
  description: 'Policy that has been reviewed',
  status: 'reviewed',
  asset_type: 'policy',
  policy_number: 'POL-002',
  claim_number: '',
  file_path: 'user/file.pdf',
  file_name: 'policy.pdf',
  file_size: 4096,
  mime_type: 'application/pdf',
  file_hash: '',
  page_count: 5,
  ocr_text: 'Some OCR text',
  ocr_metadata: {},
  ocr_confidence: 0.85,
  ocr_completed_at: '2024-01-15T12:00:00Z',
  search_vector: null,
  tags: [],
  metadata: {},
  uploaded_by: 'user-1',
  reviewed_by: 'user-2',
  approved_by: null,
  reviewed_at: '2024-01-15T11:00:00Z',
  approved_at: null,
  batch_id: null,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T11:00:00Z',
};

describe('ApprovalCard', () => {
  it('renders document title', () => {
    render(<ApprovalCard document={mockDocument} role="manager" />);
    expect(screen.getByText('Reviewed Policy Document')).toBeInTheDocument();
  });

  it('shows Reviewed status badge', () => {
    render(<ApprovalCard document={mockDocument} role="manager" />);
    expect(screen.getByText('Reviewed')).toBeInTheDocument();
  });

  it('shows Approve and Reject buttons for manager', () => {
    render(<ApprovalCard document={mockDocument} role="manager" />);
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('shows OCR confidence', () => {
    render(<ApprovalCard document={mockDocument} role="manager" />);
    expect(screen.getByText(/OCR Confidence: 85%/)).toBeInTheDocument();
  });

  it('shows Audit Trail link', () => {
    render(<ApprovalCard document={mockDocument} role="manager" />);
    expect(screen.getByText('Audit Trail')).toBeInTheDocument();
  });
});
