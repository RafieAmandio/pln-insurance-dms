'use client';

import Link from 'next/link';
import { StatusBadge } from './status-badge';
import { StateTransitionButton } from './state-transition-button';
import type { Document } from '@/lib/db/types';
import type { DocumentState } from '@/lib/documents/state-machine';
import type { AppRole } from '@/lib/auth/roles';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ReviewCardProps {
  document: Document;
  role: AppRole;
}

export function ReviewCard({ document, role }: ReviewCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <Link
              href={`/documents/${document.id}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              {document.title}
            </Link>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={document.status} />
              <Badge variant="outline" className="capitalize">{document.asset_type}</Badge>
            </div>
          </div>
          <time className="text-xs text-muted-foreground">
            {new Date(document.created_at).toLocaleDateString('id-ID')}
          </time>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-xs text-muted-foreground">
          {document.file_name} &middot; {(document.file_size / 1024).toFixed(1)} KB
        </p>
        {document.policy_number && (
          <p className="mt-1 text-xs text-muted-foreground">
            Policy: {document.policy_number}
          </p>
        )}
        {document.description && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {document.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/documents/${document.id}`}>
            View Details
          </Link>
        </Button>
        <StateTransitionButton
          documentId={document.id}
          currentState={document.status as DocumentState}
          role={role}
        />
      </CardFooter>
    </Card>
  );
}
