import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WarehouseCard } from '@/components/warehouses/warehouse-card';
import type { Warehouse } from '@/lib/db/types';

const mockWarehouse: Warehouse = {
  id: 'wh-1',
  name: 'Gudang Jakarta Utara',
  address: 'Jl. Pelabuhan No. 42, Jakarta Utara',
  is_active: true,
  total_documents: 10000,
  digitized_documents: 7500,
  storage_size_bytes: 5368709120, // ~5 GB
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-15T00:00:00Z',
};

describe('WarehouseCard', () => {
  it('renders warehouse name', () => {
    render(<WarehouseCard warehouse={mockWarehouse} />);
    expect(screen.getByText('Gudang Jakarta Utara')).toBeInTheDocument();
  });

  it('renders warehouse address', () => {
    render(<WarehouseCard warehouse={mockWarehouse} />);
    expect(
      screen.getByText('Jl. Pelabuhan No. 42, Jakarta Utara')
    ).toBeInTheDocument();
  });

  it('shows Active badge when is_active is true', () => {
    render(<WarehouseCard warehouse={mockWarehouse} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows Inactive badge when is_active is false', () => {
    const inactive = { ...mockWarehouse, is_active: false };
    render(<WarehouseCard warehouse={inactive} />);
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('shows correct progress percentage', () => {
    render(<WarehouseCard warehouse={mockWarehouse} />);
    expect(screen.getByText('75.0%')).toBeInTheDocument();
  });

  it('shows remaining documents count', () => {
    render(<WarehouseCard warehouse={mockWarehouse} />);
    expect(screen.getByText(/2,500 documents remaining/)).toBeInTheDocument();
  });

  it('shows total documents count', () => {
    render(<WarehouseCard warehouse={mockWarehouse} />);
    expect(screen.getByText('10,000')).toBeInTheDocument();
  });

  it('does not show remaining when fully digitized', () => {
    const complete = {
      ...mockWarehouse,
      digitized_documents: 10000,
    };
    render(<WarehouseCard warehouse={complete} />);
    expect(
      screen.queryByText(/documents remaining/)
    ).not.toBeInTheDocument();
  });
});
