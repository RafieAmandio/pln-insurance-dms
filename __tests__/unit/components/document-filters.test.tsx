import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DocumentFilters, type DocumentFilterValues } from '@/components/documents/document-filters';

const defaultFilters: DocumentFilterValues = {
  search: '',
  type: '',
  status: '',
  warehouse_id: '',
  date_from: '',
  date_to: '',
  policy_number: '',
};

describe('DocumentFilters', () => {
  it('renders search input', () => {
    render(
      <DocumentFilters filters={defaultFilters} totalCount={8} onChange={() => {}} />
    );
    const input = screen.getByPlaceholderText('Search by ID or title...');
    expect(input).toBeInTheDocument();
  });

  it('renders type dropdown trigger', () => {
    render(
      <DocumentFilters filters={defaultFilters} totalCount={8} onChange={() => {}} />
    );
    const trigger = screen.getByText('All Types');
    expect(trigger).toBeInTheDocument();
  });

  it('renders status dropdown trigger', () => {
    render(
      <DocumentFilters filters={defaultFilters} totalCount={8} onChange={() => {}} />
    );
    const trigger = screen.getByText('All Status');
    expect(trigger).toBeInTheDocument();
  });

  it('renders More Filters button', () => {
    render(
      <DocumentFilters filters={defaultFilters} totalCount={8} onChange={() => {}} />
    );
    const button = screen.getByTestId('more-filters-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('More Filters');
  });

  it('displays total count badge', () => {
    render(
      <DocumentFilters filters={defaultFilters} totalCount={42} onChange={() => {}} />
    );
    const badge = screen.getByTestId('total-count-badge');
    expect(badge).toHaveTextContent('42 total');
  });

  it('calls onChange when search input changes', () => {
    const onChange = vi.fn();
    render(
      <DocumentFilters filters={defaultFilters} totalCount={8} onChange={onChange} />
    );
    const input = screen.getByPlaceholderText('Search by ID or title...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'test' })
    );
  });

  it('shows more filters section when More Filters is clicked', () => {
    render(
      <DocumentFilters filters={defaultFilters} totalCount={8} onChange={() => {}} />
    );
    const button = screen.getByTestId('more-filters-button');
    fireEvent.click(button);
    expect(screen.getByText('Warehouse')).toBeInTheDocument();
    expect(screen.getByText('From')).toBeInTheDocument();
    expect(screen.getByText('To')).toBeInTheDocument();
    expect(screen.getByText('Policy Number')).toBeInTheDocument();
  });
});
