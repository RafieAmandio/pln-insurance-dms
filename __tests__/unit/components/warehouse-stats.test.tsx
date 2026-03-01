import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WarehouseStats } from '@/components/warehouses/warehouse-stats';

describe('WarehouseStats', () => {
  it('renders all 4 stat values correctly', () => {
    render(
      <WarehouseStats
        totalWarehouses={5}
        totalDocuments={50000}
        totalDigitized={35000}
        overallProgress={70}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('50,000')).toBeInTheDocument();
    expect(screen.getByText('35,000')).toBeInTheDocument();
    expect(screen.getByText('70.0%')).toBeInTheDocument();
  });

  it('renders all stat labels', () => {
    render(
      <WarehouseStats
        totalWarehouses={5}
        totalDocuments={50000}
        totalDigitized={35000}
        overallProgress={70}
      />
    );

    expect(screen.getByText('Total Warehouses')).toBeInTheDocument();
    expect(screen.getByText('Total Documents')).toBeInTheDocument();
    expect(screen.getByText('Digitized')).toBeInTheDocument();
    expect(screen.getByText('Overall Progress')).toBeInTheDocument();
  });

  it('handles zero values gracefully', () => {
    render(
      <WarehouseStats
        totalWarehouses={0}
        totalDocuments={0}
        totalDigitized={0}
        overallProgress={0}
      />
    );

    expect(screen.getByText('0.0%')).toBeInTheDocument();
    // All zero values should render as "0"
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(3);
  });
});
