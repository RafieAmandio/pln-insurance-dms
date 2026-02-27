'use client';

import Link from 'next/link';
import { StatusBadge } from '@/components/documents/status-badge';
import type { Document, DocumentStatus } from '@/lib/db/types';

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
    return <p className="text-sm text-gray-500">No documents linked to this claim.</p>;
  }

  return (
    <div className="space-y-3">
      {links.map((link) => (
        <div key={link.id} className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Link
              href={`/documents/${link.document_id}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {link.documents.title}
            </Link>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={link.documents.status as DocumentStatus} />
              <span className="text-xs text-gray-500">{link.documents.file_name}</span>
            </div>
            {link.notes && (
              <p className="mt-1 text-xs text-gray-500">{link.notes}</p>
            )}
          </div>
          <time className="text-xs text-gray-400">
            {new Date(link.linked_at).toLocaleDateString('id-ID')}
          </time>
        </div>
      ))}
    </div>
  );
}
