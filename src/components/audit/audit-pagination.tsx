'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function AuditPagination({ currentPage, totalPages }: AuditPaginationProps) {
  const pages = generatePageNumbers(currentPage, totalPages);

  return (
    <nav className="mt-6 flex items-center justify-center gap-1" aria-label="Audit trail pagination">
      <Button variant="outline" size="icon" asChild disabled={currentPage <= 1}>
        <Link href={`/audit?page=${currentPage - 1}`} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>
      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-sm text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="icon"
            asChild={page !== currentPage}
          >
            {page === currentPage ? (
              <span>{page}</span>
            ) : (
              <Link href={`/audit?page=${page}`}>{page}</Link>
            )}
          </Button>
        )
      )}
      <Button variant="outline" size="icon" asChild disabled={currentPage >= totalPages}>
        <Link href={`/audit?page=${currentPage + 1}`} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </nav>
  );
}

function generatePageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('...');

  pages.push(total);

  return pages;
}
