'use client';

import { useState, useCallback } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/search/search-bar';
import { FilterPanel } from '@/components/search/filter-panel';
import { SearchResults, type SearchResult } from '@/components/search/search-results';
import { RecentSearches, addRecentSearch } from '@/components/search/recent-searches';

interface SearchState {
  results: SearchResult[];
  totalCount: number;
  searchTimeMs: number;
  loading: boolean;
  hasSearched: boolean;
}

export default function SearchPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string | undefined>>({});
  const [state, setState] = useState<SearchState>({
    results: [],
    totalCount: 0,
    searchTimeMs: 0,
    loading: false,
    hasSearched: false,
  });

  const executeSearch = useCallback(async (query: string, currentFilters: Record<string, string | undefined>) => {
    if (!query.trim()) return;

    setState((prev) => ({ ...prev, loading: true }));
    addRecentSearch(query);

    const params = new URLSearchParams();
    params.set('query', query);

    for (const [key, value] of Object.entries(currentFilters)) {
      if (value) params.set(key, value);
    }

    const start = performance.now();

    try {
      const response = await fetch(`/api/search?${params.toString()}`);
      const data = await response.json();
      const elapsed = performance.now() - start;

      if (response.ok) {
        setState({
          results: data.results ?? [],
          totalCount: data.pagination?.total ?? data.results?.length ?? 0,
          searchTimeMs: elapsed,
          loading: false,
          hasSearched: true,
        });
      } else {
        setState({
          results: [],
          totalCount: 0,
          searchTimeMs: elapsed,
          loading: false,
          hasSearched: true,
        });
      }
    } catch {
      setState((prev) => ({
        ...prev,
        results: [],
        totalCount: 0,
        loading: false,
        hasSearched: true,
      }));
    }
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSubmit = useCallback(() => {
    executeSearch(searchQuery, filters);
  }, [searchQuery, filters, executeSearch]);

  const handleRecentSelect = useCallback((query: string) => {
    setSearchQuery(query);
    executeSearch(query, filters);
  }, [filters, executeSearch]);

  const handleFilterChange = useCallback((newFilters: Record<string, string | undefined>) => {
    setFilters(newFilters);
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Advanced Search</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find any document across all warehouses instantly
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search by policy number, document title, or content..."
            defaultValue={searchQuery}
            showButton
            onSubmit={handleSubmit}
          />
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="mt-3">
        <RecentSearches onSelect={handleRecentSelect} />
      </div>

      {showFilters && (
        <div className="mt-4">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
      )}

      <div className="mt-6">
        {state.loading && (
          <div className="py-12 text-center text-muted-foreground">
            Searching...
          </div>
        )}

        {!state.loading && state.hasSearched && (
          <SearchResults
            results={state.results}
            totalCount={state.totalCount}
            searchTimeMs={state.searchTimeMs}
          />
        )}

        {!state.loading && !state.hasSearched && (
          <div className="py-12 text-center text-muted-foreground">
            <p className="text-lg">Enter a search query to find documents</p>
            <p className="mt-1 text-sm">Search by policy number, document title, content, or use filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
