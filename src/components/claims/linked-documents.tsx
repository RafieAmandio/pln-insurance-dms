'use client';

import Link from 'next/link';
import { StatusBadge } from '@/components/documents/status-badge';
import type { Document, DocumentStatus } from '@/lib/db/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LinkedDocument {
  id: string;
  document_id: string;
  notes: string;
  linked_at: string;
  documents: Document;
}

interface LinkedDocumentsProps {
  links: LinkedDocument[];
}

export function LinkedDocuments({ links }: LinkedDocumentsProps) {
  if (links.length === 0) {
    return <p className="text-sm text-muted-foreground">No documents linked to this claim.</p>;
  }

  return (
    <div className="space-y-3">
      {links.map((link) => (
        <Card key={link.id}>
          <CardContent className="flex items-center justify-between py-3 px-4">
            <div>
              <Link
                href={`/documents/${link.document_id}`}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {link.documents.title}
              </Link>
              <div className="mt-1 flex items-center gap-2">
                <StatusBadge status={link.documents.status as DocumentStatus} />
                <Badge variant="outline" className="text-xs">{link.documents.file_name}</Badge>
              </div>
              {link.notes && (
                <p className="mt-1 text-xs text-muted-foreground">{link.notes}</p>
              )}
            </div>
            <time className="text-xs text-muted-foreground">
              {new Date(link.linked_at).toLocaleDateString('id-ID')}
            </time>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
