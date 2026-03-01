'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { DocumentFilters, type DocumentFilterValues } from './document-filters';

interface DocumentFiltersWrapperProps {
  initialFilters: DocumentFilterValues;
  totalCount: number;
}

export function DocumentFiltersWrapper({
  initialFilters,
  totalCount,
}: DocumentFiltersWrapperProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = useCallback(
    (filters: DocumentFilterValues) => {
      const params = new URLSearchParams();

      if (filters.search) params.set('search', filters.search);
      if (filters.type) params.set('type', filters.type);
      if (filters.status) params.set('status', filters.status);
      if (filters.warehouse_id) params.set('warehouse_id', filters.warehouse_id);
      if (filters.date_from) params.set('date_from', filters.date_from);
      if (filters.date_to) params.set('date_to', filters.date_to);
      if (filters.policy_number) params.set('policy_number', filters.policy_number);

      // Reset to page 1 on filter change
      const qs = params.toString();
      router.push(`/documents${qs ? `?${qs}` : ''}`);
    },
    [router]
  );

  return (
    <DocumentFilters
      filters={initialFilters}
      totalCount={totalCount}
      onChange={handleChange}
    />
  );
}
