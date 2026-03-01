import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProcessingQueue, type QueueFile } from '@/components/documents/processing-queue';

const mockFiles: QueueFile[] = [
  { name: 'policy-001.pdf', size: 2048576, status: 'completed' },
  { name: 'claim-report.tiff', size: 5120000, status: 'processing_ocr' },
  { name: 'invoice-2024.png', size: 1024, status: 'uploading', progress: 45 },
  { name: 'corrupt-file.jpg', size: 512000, status: 'failed' },
];

describe('ProcessingQueue', () => {
  it('renders file list with names and sizes', () => {
    render(<ProcessingQueue files={mockFiles} />);

    expect(screen.getByText('policy-001.pdf')).toBeInTheDocument();
    expect(screen.getByText('claim-report.tiff')).toBeInTheDocument();
    expect(screen.getByText('invoice-2024.png')).toBeInTheDocument();
    expect(screen.getByText('corrupt-file.jpg')).toBeInTheDocument();

    expect(screen.getByText('2.0 MB')).toBeInTheDocument();
    expect(screen.getByText('4.9 MB')).toBeInTheDocument();
    expect(screen.getByText('1.0 KB')).toBeInTheDocument();
    expect(screen.getByText('500.0 KB')).toBeInTheDocument();
  });

  it('shows correct status indicators', () => {
    render(<ProcessingQueue files={mockFiles} />);

    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Processing OCR')).toBeInTheDocument();
    expect(screen.getByText('Uploading')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('shows remove buttons when onRemove is provided', () => {
    const onRemove = vi.fn();
    render(<ProcessingQueue files={mockFiles} onRemove={onRemove} />);

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    expect(removeButtons).toHaveLength(4);
  });

  it('shows file count badge', () => {
    render(<ProcessingQueue files={mockFiles} />);

    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Processing Queue')).toBeInTheDocument();
  });

  it('renders nothing when files array is empty', () => {
    const { container } = render(<ProcessingQueue files={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls onRemove with correct index when remove button clicked', () => {
    const onRemove = vi.fn();
    render(<ProcessingQueue files={mockFiles} onRemove={onRemove} />);

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    removeButtons[1].click();
    expect(onRemove).toHaveBeenCalledWith(1);
  });
});
