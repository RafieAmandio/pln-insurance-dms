'use client';

import { useEffect, useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ValidationQueue } from '@/components/ocr-validation/validation-queue';
import { DocumentPreview } from '@/components/ocr-validation/document-preview';
import { ExtractedFields } from '@/components/ocr-validation/extracted-fields';
import type { Document } from '@/lib/db/types';

export default function OcrValidationPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/documents?status=ocr_review&pageSize=100');
      if (res.ok) {
        const json = await res.json();
        setDocuments(json.data ?? []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const selectedDocument = documents.find((d) => d.id === selectedId) ?? null;

  const handleApprove = async (fields: Record<string, string>) => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/documents/${selectedId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', fields }),
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== selectedId));
        setSelectedId(null);
      }
    } catch {
      // silently fail
    } finally {
      setActionLoading(false);
    }
  };

  const handleReprocess = async () => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/documents/${selectedId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reprocess' }),
      });
      if (res.ok) {
        await fetchDocuments();
      }
    } catch {
      // silently fail
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/documents/${selectedId}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== selectedId));
        setSelectedId(null);
      }
    } catch {
      // silently fail
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            OCR Validation Workbench
          </h1>
          <p className="text-sm text-gray-500">
            Review and correct OCR-extracted data
          </p>
        </div>
        <Badge variant="secondary">
          Queue: {documents.length} document{documents.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {loading ? (
        <div className="grid flex-1 gap-4 grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[300px_1fr_350px]">
          <Card>
            <CardContent className="space-y-3 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-center p-4">
              <Skeleton className="h-96 w-full" />
            </CardContent>
          </Card>
          <Card className="hidden lg:block">
            <CardContent className="space-y-3 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid flex-1 gap-4 grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[300px_1fr_350px]">
          <div className="min-h-0 md:col-span-1">
            <ValidationQueue
              documents={documents}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
          <div className="hidden min-h-0 md:block">
            <DocumentPreview document={selectedDocument} />
          </div>
          <div className="hidden min-h-0 lg:block">
            <ExtractedFields
              document={selectedDocument}
              onApprove={handleApprove}
              onReprocess={handleReprocess}
              onReject={handleReject}
              loading={actionLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
