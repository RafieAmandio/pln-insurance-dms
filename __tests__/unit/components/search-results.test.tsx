import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

import { SearchResults, type SearchResult } from '@/components/search/search-results';

const mockResults: SearchResult[] = [
  {
    id: 'doc-1',
    title: 'Fire Damage Report',
    description: 'Warehouse fire damage assessment',
    policy_number: 'POL-2024-001',
    asset_type: 'report',
    status: 'approved',
    version: 3,
    warehouse_name: 'Warehouse Jakarta',
    created_at: '2024-06-15T10:00:00Z',
    relevance_score: 0.98,
  },
  {
    id: 'doc-2',
    title: 'Claim Invoice',
    description: 'Invoice for claim processing',
    policy_number: 'POL-2024-002',
    asset_type: 'invoice',
    status: 'draft',
    version: 1,
    warehouse_name: null,
    created_at: '2024-07-20T08:30:00Z',
    relevance_score: 0.75,
  },
];

describe('SearchResults', () => {
  it('renders result count and timing', () => {
    render(<SearchResults results={mockResults} totalCount={2} searchTimeMs={800} />);
    expect(screen.getByTestId('result-summary')).toHaveTextContent('2 results found');
    expect(screen.getByTestId('result-summary')).toHaveTextContent('0.8 sec');
  });

  it('renders result cards with document info', () => {
    render(<SearchResults results={mockResults} totalCount={2} searchTimeMs={500} />);
    expect(screen.getByText('POL-2024-001')).toBeInTheDocument();
    expect(screen.getByText('POL-2024-002')).toBeInTheDocument();
    expect(screen.getByText('Warehouse fire damage assessment')).toBeInTheDocument();
  });

  it('shows version badges', () => {
    render(<SearchResults results={mockResults} totalCount={2} searchTimeMs={500} />);
    const versions = screen.getAllByTestId('result-version');
    expect(versions[0]).toHaveTextContent('v3');
    expect(versions[1]).toHaveTextContent('v1');
  });

  it('shows status badges', () => {
    render(<SearchResults results={mockResults} totalCount={2} searchTimeMs={500} />);
    const statuses = screen.getAllByTestId('result-status');
    expect(statuses[0]).toHaveTextContent('Approved');
    expect(statuses[1]).toHaveTextContent('Draft');
  });

  it('shows match percentage', () => {
    render(<SearchResults results={mockResults} totalCount={2} searchTimeMs={500} />);
    const matches = screen.getAllByTestId('match-percentage');
    expect(matches[0]).toHaveTextContent('Match: 98%');
    expect(matches[1]).toHaveTextContent('Match: 75%');
  });

  it('shows View and download buttons', () => {
    render(<SearchResults results={mockResults} totalCount={2} searchTimeMs={500} />);
    const viewButtons = screen.getAllByText('View');
    expect(viewButtons).toHaveLength(2);
    const downloadButtons = screen.getAllByLabelText('Download');
    expect(downloadButtons).toHaveLength(2);
  });

  it('shows empty state when no results', () => {
    render(<SearchResults results={[]} totalCount={0} searchTimeMs={200} />);
    expect(screen.getByText('No results found')).toBeInTheDocument();
  });

  it('shows singular result text for one result', () => {
    render(<SearchResults results={[mockResults[0]]} totalCount={1} searchTimeMs={300} />);
    expect(screen.getByTestId('result-summary')).toHaveTextContent('1 result found');
  });
});
