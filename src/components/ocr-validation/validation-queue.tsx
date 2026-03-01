'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Document } from '@/lib/db/types';

interface ValidationQueueProps {
  documents: Document[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function ConfidenceDot({ confidence }: { confidence: number }) {
  let bgClass = 'bg-red-500';
  if (confidence >= 0.9) {
    bgClass = 'bg-green-500';
  } else if (confidence >= 0.7) {
    bgClass = 'bg-yellow-500';
  }

  return <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${bgClass}`} />;
}

export function ValidationQueue({ documents, selectedId, onSelect }: ValidationQueueProps) {
  const sorted = [...documents].sort(
    (a, b) => (a.ocr_confidence ?? 0) - (b.ocr_confidence ?? 0)
  );

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-none border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Validation Queue</CardTitle>
          <Badge variant="secondary">
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        {sorted.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No documents pending validation.
          </div>
        ) : (
          <ul className="divide-y">
            {sorted.map((doc) => {
              const confidence = doc.ocr_confidence ?? 0;
              const percentage = Math.round(confidence * 100);
              const isSelected = doc.id === selectedId;

              return (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(doc.id)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50 hover:bg-blue-50' : ''
                    }`}
                  >
                    <ConfidenceDot confidence={confidence} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {doc.file_name}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-gray-500">
                      {percentage}%
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
