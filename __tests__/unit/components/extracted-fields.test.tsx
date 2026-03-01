import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExtractedFields } from '@/components/ocr-validation/extracted-fields';
import type { Document } from '@/lib/db/types';

const makeDoc = (overrides: Partial<Document> = {}): Document => ({
  id: 'doc-1',
  title: 'Fire Damage Report',
  description: '',
  status: 'ocr_review',
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
  ocr_metadata: {
    field_confidences: [
      { field_name: 'policy_number', value: 'POL-12345', confidence: 0.95, approved: false },
      { field_name: 'policyholder', value: 'John Doe', confidence: 0.8, approved: false },
      { field_name: 'effective_date', value: '2024-01-01', confidence: 0.6, approved: false },
      { field_name: 'expiry_date', value: '2025-01-01', confidence: 0.92, approved: false },
      { field_name: 'sum_insured', value: '500000000', confidence: 0.75, approved: false },
      { field_name: 'premium', value: '5000000', confidence: 0.88, approved: false },
      { field_name: 'coverage_type', value: 'Property All Risk', confidence: 0.7, approved: false },
      { field_name: 'property_address', value: 'Jl. Sudirman No. 10', confidence: 0.55, approved: false },
    ],
  },
  ocr_confidence: 0.78,
  ocr_completed_at: '2024-01-15T10:00:00Z',
  search_vector: null,
  tags: [],
  metadata: {},
  uploaded_by: 'user-1',
  reviewed_by: null,
  approved_by: null,
  reviewed_at: null,
  approved_at: null,
  batch_id: null,
  warehouse_id: null,
  version: 1,
  locked_by: null,
  locked_at: null,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  ...overrides,
});

describe('ExtractedFields', () => {
  it('renders field labels', () => {
    render(
      <ExtractedFields
        document={makeDoc()}
        onApprove={vi.fn()}
        onReprocess={vi.fn()}
      />
    );
    expect(screen.getByText('Policy Number')).toBeInTheDocument();
    expect(screen.getByText('Policyholder')).toBeInTheDocument();
    expect(screen.getByText('Effective Date')).toBeInTheDocument();
    expect(screen.getByText('Expiry Date')).toBeInTheDocument();
    expect(screen.getByText('Sum Insured')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    expect(screen.getByText('Coverage Type')).toBeInTheDocument();
    expect(screen.getByText('Property Address')).toBeInTheDocument();
  });

  it('renders field values in inputs', () => {
    render(
      <ExtractedFields
        document={makeDoc()}
        onApprove={vi.fn()}
        onReprocess={vi.fn()}
      />
    );
    const input = screen.getByDisplayValue('POL-12345');
    expect(input).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
  });

  it('shows confidence badges', () => {
    render(
      <ExtractedFields
        document={makeDoc()}
        onApprove={vi.fn()}
        onReprocess={vi.fn()}
      />
    );
    // Overall confidence 78%
    expect(screen.getByText('78%')).toBeInTheDocument();
    // Field confidence 95%
    expect(screen.getByText('95%')).toBeInTheDocument();
  });

  it('shows Approve & Index and Reprocess buttons', () => {
    render(
      <ExtractedFields
        document={makeDoc()}
        onApprove={vi.fn()}
        onReprocess={vi.fn()}
      />
    );
    expect(screen.getByText('Approve & Index')).toBeInTheDocument();
    expect(screen.getByText('Reprocess')).toBeInTheDocument();
  });

  it('shows placeholder when no document selected', () => {
    render(
      <ExtractedFields
        document={null}
        onApprove={vi.fn()}
        onReprocess={vi.fn()}
      />
    );
    expect(screen.getByText('Select a document to view fields')).toBeInTheDocument();
  });

  it('renders header with title', () => {
    render(
      <ExtractedFields
        document={makeDoc()}
        onApprove={vi.fn()}
        onReprocess={vi.fn()}
      />
    );
    expect(screen.getByText('Extracted Fields')).toBeInTheDocument();
  });
});
