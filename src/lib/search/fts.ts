import type { SupabaseClient } from '@supabase/supabase-js';
import type { SearchFilters } from './filters';

export function sanitizeQuery(query: string): string {
  // Remove special PostgreSQL FTS characters that could cause errors
  return query
    .replace(/[&|!<>():*\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function searchDocuments(
  supabase: SupabaseClient,
  filters: SearchFilters
) {
  const sanitizedQuery = filters.query ? sanitizeQuery(filters.query) : '';

  const { data, error } = await supabase.rpc('search_documents', {
    search_query: sanitizedQuery || '',
    filter_status: filters.status ?? null,
    filter_asset_type: filters.asset_type ?? null,
    filter_policy_number: filters.policy_number ?? null,
    filter_warehouse_id: filters.warehouse_id ?? null,
    filter_date_from: filters.date_from ?? null,
    filter_date_to: filters.date_to ?? null,
    page_number: filters.page ?? 1,
    page_size: filters.page_size ?? 20,
  });

  if (error) {
    throw new Error(`Search failed: ${error.message}`);
  }

  const total = data?.[0]?.total_count ?? 0;

  return {
    results: data ?? [],
    pagination: {
      page: filters.page ?? 1,
      pageSize: filters.page_size ?? 20,
      total: Number(total),
      totalPages: Math.ceil(Number(total) / (filters.page_size ?? 20)),
    },
  };
}
