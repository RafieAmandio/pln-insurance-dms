'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import type { Document } from '@/lib/db/types';

interface DocumentPreviewProps {
  document: Document | null;
}

export function DocumentPreview({ document }: DocumentPreviewProps) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalPages = document?.page_count ?? 1;
  const isImage = document?.mime_type?.startsWith('image/') ?? false;

  const fetchSignedUrl = useCallback(async (docId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${docId}/download`);
      if (res.ok) {
        const json = await res.json();
        setSignedUrl(json.data?.url ?? null);
      } else {
        setSignedUrl(null);
      }
    } catch {
      setSignedUrl(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (document?.id) {
      setCurrentPage(1);
      fetchSignedUrl(document.id);
    } else {
      setSignedUrl(null);
    }
  }, [document?.id, fetchSignedUrl]);

  if (!document) {
    return (
      <Card className="flex h-full items-center justify-center">
        <div className="text-center text-sm text-gray-500">
          <FileText className="mx-auto mb-2 h-10 w-10 text-gray-300" />
          <p>Select a document to preview</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-none border-b px-4 py-3">
        <CardTitle className="truncate text-sm font-semibold">
          {document.title}
        </CardTitle>
        <div className="mt-1 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-gray-500">
            Page {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center overflow-auto p-4">
        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : isImage && signedUrl ? (
          <img
            src={signedUrl}
            alt={document.title}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
            <div className="text-center">
              <FileText className="mx-auto mb-2 h-12 w-12 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">Document preview area</p>
              <p className="text-xs text-gray-400">{document.file_name}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
