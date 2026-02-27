'use client';

import Link from 'next/link';
import { StatusBadge } from './status-badge';
import { StateTransitionButton } from './state-transition-button';
import type { Document, DocumentStatus } from '@/lib/db/types';
import type { AppRole } from '@/lib/auth/roles';

interface ApprovalCardProps {
  document: Document;
  role: AppRole;
}

export function ApprovalCard({ document, role }: ApprovalCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href={`/documents/${document.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            {document.title}
          </Link>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={document.status as DocumentStatus} />
            <span className="text-xs capitalize text-gray-500">{document.asset_type}</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {document.file_name} &middot; {(document.file_size / 1024).toFixed(1)} KB
          </p>
          {document.policy_number && (
            <p className="mt-1 text-xs text-gray-500">
              Policy: {document.policy_number}
            </p>
          )}
          {document.ocr_confidence > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              OCR Confidence: {(document.ocr_confidence * 100).toFixed(0)}%
            </p>
          )}
          {document.description && (
            <p className="mt-2 text-sm text-gray-600 line-clamp-2">
              {document.description}
            </p>
          )}
        </div>
        <time className="text-xs text-gray-400">
          {new Date(document.created_at).toLocaleDateString('id-ID')}
        </time>
      </div>
      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <div className="flex gap-3">
          <Link
            href={`/documents/${document.id}`}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            View Details
          </Link>
          <Link
            href={`/documents/${document.id}/audit`}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Audit Trail
          </Link>
        </div>
        <StateTransitionButton
          documentId={document.id}
          currentState={document.status as DocumentStatus}
          role={role}
        />
      </div>
    </div>
  );
}
