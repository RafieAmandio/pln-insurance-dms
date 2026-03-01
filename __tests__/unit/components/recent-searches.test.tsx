import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecentSearches, addRecentSearch, getRecentSearches } from '@/components/search/recent-searches';

const STORAGE_KEY = 'dms-recent-searches';

describe('RecentSearches', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders nothing when no recent searches exist', () => {
    const { container } = render(<RecentSearches onSelect={vi.fn()} />);
    expect(container.querySelector('[data-testid="recent-searches"]')).not.toBeInTheDocument();
  });

  it('renders recent search tags from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['fire damage', 'POL-001']));
    render(<RecentSearches onSelect={vi.fn()} />);

    expect(screen.getByText('Recent:')).toBeInTheDocument();
    expect(screen.getByText('fire damage')).toBeInTheDocument();
    expect(screen.getByText('POL-001')).toBeInTheDocument();
  });

  it('calls onSelect when a tag is clicked', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['fire damage']));
    const onSelect = vi.fn();
    render(<RecentSearches onSelect={onSelect} />);

    fireEvent.click(screen.getByText('fire damage'));
    expect(onSelect).toHaveBeenCalledWith('fire damage');
  });
});

describe('addRecentSearch', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores a search query in localStorage', () => {
    addRecentSearch('fire damage');
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toEqual(['fire damage']);
  });

  it('limits to 5 recent searches', () => {
    addRecentSearch('query 1');
    addRecentSearch('query 2');
    addRecentSearch('query 3');
    addRecentSearch('query 4');
    addRecentSearch('query 5');
    addRecentSearch('query 6');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toHaveLength(5);
    expect(stored[0]).toBe('query 6');
    expect(stored).not.toContain('query 1');
  });

  it('moves duplicate queries to the front', () => {
    addRecentSearch('query 1');
    addRecentSearch('query 2');
    addRecentSearch('query 1');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toEqual(['query 1', 'query 2']);
  });

  it('does not store empty queries', () => {
    addRecentSearch('');
    addRecentSearch('   ');

    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).toBeNull();
  });
});

describe('getRecentSearches', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when no searches stored', () => {
    expect(getRecentSearches()).toEqual([]);
  });

  it('returns stored searches', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['a', 'b']));
    expect(getRecentSearches()).toEqual(['a', 'b']);
  });
});
