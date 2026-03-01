'use client';

import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RecentDocument } from '@/lib/dashboard/queries';

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  processing: 'outline',
  ocr_review: 'destructive',
  reviewed: 'default',
  approved: 'default',
  indexed: 'default',
  archived: 'secondary',
  failed: 'destructive',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  processing: 'Processing',
  ocr_review: 'OCR Review',
  reviewed: 'Reviewed',
  approved: 'Approved',
  indexed: 'Indexed',
  archived: 'Archived',
  failed: 'Failed',
};

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

interface RecentDocumentsProps {
  documents: RecentDocument[];
}

export function RecentDocuments({ documents }: RecentDocumentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Documents</CardTitle>
        <CardAction>
          <Badge variant="outline" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents.length === 0 && (
            <p className="text-sm text-muted-foreground">No documents yet.</p>
          )}
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {doc.title || doc.policy_number}
                </p>
                <p className="text-xs text-muted-foreground">
                  {doc.asset_type}
                  {doc.warehouse?.name ? ` - ${doc.warehouse.name}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={STATUS_VARIANTS[doc.status] ?? 'secondary'}>
                  {STATUS_LABELS[doc.status] ?? doc.status}
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(doc.created_at)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
