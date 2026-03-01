import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ValidationQueue } from '@/components/ocr-validation/validation-queue';
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
  ocr_metadata: {},
  ocr_confidence: 0.85,
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
  warehouse_id: null,
  version: 1,
  locked_by: null,
  locked_at: null,
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
  ...overrides,
});

describe('ValidationQueue', () => {
  it('renders queue items', () => {
    const docs = [
      makeDoc({ id: 'doc-1', title: 'Report A', ocr_confidence: 0.85 }),
      makeDoc({ id: 'doc-2', title: 'Report B', ocr_confidence: 0.6 }),
    ];
    render(
      <ValidationQueue documents={docs} selectedId={null} onSelect={vi.fn()} />
    );
    expect(screen.getByText('Report A')).toBeInTheDocument();
    expect(screen.getByText('Report B')).toBeInTheDocument();
    expect(screen.getByText('2 documents')).toBeInTheDocument();
  });

  it('color-codes confidence with green dot for high confidence', () => {
    const docs = [makeDoc({ id: 'doc-1', title: 'High Conf', ocr_confidence: 0.95 })];
    const { container } = render(
      <ValidationQueue documents={docs} selectedId={null} onSelect={vi.fn()} />
    );
    const dot = container.querySelector('.bg-green-500');
    expect(dot).toBeInTheDocument();
  });

  it('color-codes confidence with yellow dot for medium confidence', () => {
    const docs = [makeDoc({ id: 'doc-1', title: 'Med Conf', ocr_confidence: 0.8 })];
    const { container } = render(
      <ValidationQueue documents={docs} selectedId={null} onSelect={vi.fn()} />
    );
    const dot = container.querySelector('.bg-yellow-500');
    expect(dot).toBeInTheDocument();
  });

  it('color-codes confidence with red dot for low confidence', () => {
    const docs = [makeDoc({ id: 'doc-1', title: 'Low Conf', ocr_confidence: 0.5 })];
    const { container } = render(
      <ValidationQueue documents={docs} selectedId={null} onSelect={vi.fn()} />
    );
    const dot = container.querySelector('.bg-red-500');
    expect(dot).toBeInTheDocument();
  });

  it('handles empty queue', () => {
    render(
      <ValidationQueue documents={[]} selectedId={null} onSelect={vi.fn()} />
    );
    expect(screen.getByText('No documents pending validation.')).toBeInTheDocument();
    expect(screen.getByText('0 documents')).toBeInTheDocument();
  });

  it('calls onSelect when item is clicked', () => {
    const onSelect = vi.fn();
    const docs = [makeDoc({ id: 'doc-1', title: 'Report A' })];
    render(
      <ValidationQueue documents={docs} selectedId={null} onSelect={onSelect} />
    );
    fireEvent.click(screen.getByText('Report A'));
    expect(onSelect).toHaveBeenCalledWith('doc-1');
  });

  it('highlights selected item', () => {
    const docs = [makeDoc({ id: 'doc-1', title: 'Report A' })];
    const { container } = render(
      <ValidationQueue documents={docs} selectedId="doc-1" onSelect={vi.fn()} />
    );
    const button = container.querySelector('.bg-blue-50');
    expect(button).toBeInTheDocument();
  });
});
