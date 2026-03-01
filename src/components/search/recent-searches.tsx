'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

const STORAGE_KEY = 'dms-recent-searches';
const MAX_RECENT = 5;

interface RecentSearchesProps {
  onSelect: (query: string) => void;
}

export function addRecentSearch(query: string): void {
  if (!query.trim()) return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const existing: string[] = stored ? JSON.parse(stored) : [];
    const filtered = existing.filter((q) => q !== query.trim());
    const updated = [query.trim(), ...filtered].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage unavailable
  }
}

export function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function RecentSearches({ onSelect }: RecentSearchesProps) {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    setSearches(getRecentSearches());
  }, []);

  if (searches.length === 0) return null;

  return (
    <div className="flex items-center gap-2" data-testid="recent-searches">
      <span className="text-xs text-muted-foreground">Recent:</span>
      {searches.map((query) => (
        <Badge
          key={query}
          variant="secondary"
          className="cursor-pointer"
          onClick={() => onSelect(query)}
          data-testid="recent-search-tag"
        >
          {query}
        </Badge>
      ))}
    </div>
  );
}
