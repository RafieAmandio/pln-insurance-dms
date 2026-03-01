'use client';

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DocumentOption {
  id: string;
  title: string;
}

interface DocumentSelectorProps {
  initialDocuments?: DocumentOption[];
  selectedId?: string;
  onSelect: (documentId: string) => void;
}

export function DocumentSelector({
  initialDocuments,
  selectedId,
  onSelect,
}: DocumentSelectorProps) {
  const [documents, setDocuments] = useState<DocumentOption[]>(initialDocuments ?? []);
  const [loading, setLoading] = useState(!initialDocuments);

  useEffect(() => {
    if (initialDocuments) return;

    async function fetchDocuments() {
      try {
        const res = await fetch('/api/documents?pageSize=100');
        const json = await res.json();
        if (json.data) {
          setDocuments(
            json.data.map((d: { id: string; title: string }) => ({
              id: d.id,
              title: d.title,
            }))
          );
        }
      } finally {
        setLoading(false);
      }
    }

    fetchDocuments();
  }, [initialDocuments]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading documents...</p>;
  }

  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">No documents found.</p>;
  }

  return (
    <Select value={selectedId} onValueChange={onSelect}>
      <SelectTrigger className="w-full max-w-md">
        <SelectValue placeholder="Select a document..." />
      </SelectTrigger>
      <SelectContent>
        {documents.map((doc) => (
          <SelectItem key={doc.id} value={doc.id}>
            {doc.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
