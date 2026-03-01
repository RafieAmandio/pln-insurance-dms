'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
  showButton?: boolean;
  onSubmit?: () => void;
}

export function SearchBar({
  onSearch,
  placeholder = 'Search documents...',
  defaultValue = '',
  showButton = false,
  onSubmit,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);

  const debouncedSearch = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>;
      return (query: string) => {
        clearTimeout(timer);
        timer = setTimeout(() => onSearch(query), 300);
      };
    })(),
    [onSearch]
  );

  useEffect(() => {
    if (defaultValue !== value) {
      setValue(defaultValue);
    }
    // Only sync when defaultValue changes from parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  useEffect(() => {
    debouncedSearch(value);
  }, [value, debouncedSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={showButton ? 'h-11 pl-10 text-base' : 'pl-9'}
        />
      </div>
      {showButton && (
        <Button onClick={onSubmit} className="h-11">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      )}
    </div>
  );
}
