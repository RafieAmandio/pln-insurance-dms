'use client';

import Link from 'next/link';
import { Download, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  policy_number: string;
  asset_type: string;
  status: string;
  version: number;
  warehouse_name: string | null;
  created_at: string;
  relevance_score: number | null;
}

interface SearchResultsProps {
  results: SearchResult[];
  totalCount: number;
  searchTimeMs: number;
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'approved':
      return 'default';
    case 'archived':
      return 'destructive';
    case 'draft':
    case 'reviewed':
      return 'secondary';
    default:
      return 'outline';
  }
}

function formatStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatAssetType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getMatchPercentage(score: number | null): number {
  if (score === null || score === undefined) return 0;
  return Math.round(score * 100);
}

export function SearchResults({ results, totalCount, searchTimeMs }: SearchResultsProps) {
  const timeInSeconds = (searchTimeMs / 1000).toFixed(1);

  if (results.length === 0 && totalCount === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p className="text-lg">No results found</p>
        <p className="mt-1 text-sm">Try adjusting your search query or filters</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground" data-testid="result-summary">
        {totalCount} {totalCount === 1 ? 'result' : 'results'} found &middot; {timeInSeconds} sec
      </p>

      <div className="space-y-3">
        {results.map((result) => {
          const matchPct = getMatchPercentage(result.relevance_score);

          return (
            <Card key={result.id} className="py-4">
              <CardContent className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold" data-testid="result-doc-number">
                      {result.policy_number || result.title}
                    </span>
                    <Badge variant="outline" className="text-[10px]" data-testid="result-version">
                      v{result.version}
                    </Badge>
                    <Badge variant={getStatusVariant(result.status)} data-testid="result-status">
                      {formatStatusLabel(result.status)}
                    </Badge>
                  </div>

                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {result.description || result.title}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span>{formatAssetType(result.asset_type)}</span>
                    {result.warehouse_name && (
                      <>
                        <span>&middot;</span>
                        <span>{result.warehouse_name}</span>
                      </>
                    )}
                    <span>&middot;</span>
                    <span>{formatDate(result.created_at)}</span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  {matchPct > 0 && (
                    <span className="text-sm font-medium text-muted-foreground" data-testid="match-percentage">
                      Match: {matchPct}%
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/documents/${result.id}`}>
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Download">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
