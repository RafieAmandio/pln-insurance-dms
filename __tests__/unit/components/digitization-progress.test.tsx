import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DigitizationProgress } from '@/components/dashboard/digitization-progress';
import type { WarehouseProgress } from '@/lib/dashboard/queries';

const mockWarehouses: WarehouseProgress[] = [
  { name: 'Jakarta Central', total_documents: 1000, digitized_documents: 750 },
  { name: 'Surabaya Branch', total_documents: 500, digitized_documents: 200 },
  { name: 'Empty Warehouse', total_documents: 0, digitized_documents: 0 },
];

describe('DigitizationProgress', () => {
  it('renders warehouse names', () => {
    render(<DigitizationProgress warehouses={mockWarehouses} />);
    expect(screen.getByText('Jakarta Central')).toBeInTheDocument();
    expect(screen.getByText('Surabaya Branch')).toBeInTheDocument();
    expect(screen.getByText('Empty Warehouse')).toBeInTheDocument();
  });

  it('renders progress percentages', () => {
    render(<DigitizationProgress warehouses={mockWarehouses} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders document counts', () => {
    render(<DigitizationProgress warehouses={mockWarehouses} />);
    expect(screen.getByText('750 / 1000 docs')).toBeInTheDocument();
    expect(screen.getByText('200 / 500 docs')).toBeInTheDocument();
    expect(screen.getByText('0 / 0 docs')).toBeInTheDocument();
  });

  it('renders progress bars', () => {
    const { container } = render(
      <DigitizationProgress warehouses={mockWarehouses} />
    );
    const progressBars = container.querySelectorAll('[data-slot="progress"]');
    expect(progressBars).toHaveLength(3);
  });

  it('renders empty state when no warehouses', () => {
    render(<DigitizationProgress warehouses={[]} />);
    expect(screen.getByText('No warehouses configured.')).toBeInTheDocument();
  });
});
