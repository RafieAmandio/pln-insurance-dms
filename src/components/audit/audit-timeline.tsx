'use client';

import type { AuditLog } from '@/lib/db/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getRelativeTime, isToday } from '@/lib/utils/relative-time';
import {
  Upload,
  Eye,
  Pencil,
  Download,
  ArrowRight,
  ScanSearch,
  Link,
  Shield,
  GitBranch,
  User,
  FolderUp,
  CheckCircle,
  Trash2,
  Archive,
  FileCheck,
  FileX,
  Unlink,
  type LucideIcon,
} from 'lucide-react';

const ACTION_ICONS: Record<string, LucideIcon> = {
  upload: Upload,
  view: Eye,
  edit: Pencil,
  download: Download,
  transition: ArrowRight,
  status_change: ArrowRight,
  ocr_complete: ScanSearch,
  link_claim: Link,
  unlink_claim: Unlink,
  permission_change: Shield,
  version_create: GitBranch,
  user_login: User,
  bulk_upload: FolderUp,
  validate: CheckCircle,
  delete: Trash2,
  review: FileCheck,
  approve: CheckCircle,
  reject: FileX,
  archive: Archive,
};

const ACTION_COLORS: Record<string, string> = {
  upload: 'bg-blue-100 text-blue-600',
  view: 'bg-gray-100 text-gray-600',
  download: 'bg-gray-100 text-gray-600',
  edit: 'bg-yellow-100 text-yellow-600',
  status_change: 'bg-purple-100 text-purple-600',
  transition: 'bg-purple-100 text-purple-600',
  ocr_complete: 'bg-green-100 text-green-600',
  approve: 'bg-green-100 text-green-600',
  validate: 'bg-green-100 text-green-600',
  reject: 'bg-red-100 text-red-600',
  archive: 'bg-yellow-100 text-yellow-600',
  link_claim: 'bg-blue-100 text-blue-600',
  unlink_claim: 'bg-orange-100 text-orange-600',
  delete: 'bg-red-100 text-red-600',
  permission_change: 'bg-indigo-100 text-indigo-600',
  version_create: 'bg-teal-100 text-teal-600',
  user_login: 'bg-sky-100 text-sky-600',
  bulk_upload: 'bg-blue-100 text-blue-600',
  review: 'bg-amber-100 text-amber-600',
};

const ACTION_LABELS: Record<string, string> = {
  upload: 'Document Uploaded',
  view: 'Document Viewed',
  download: 'Document Downloaded',
  edit: 'Document Edited',
  delete: 'Document Deleted',
  status_change: 'Status Changed',
  transition: 'Status Transitioned',
  ocr_complete: 'OCR Completed',
  link_claim: 'Linked to Claim',
  unlink_claim: 'Unlinked from Claim',
  review: 'Document Reviewed',
  approve: 'Document Approved',
  reject: 'Document Rejected',
  archive: 'Document Archived',
  permission_change: 'Permission Changed',
  version_create: 'Version Created',
  user_login: 'User Login',
  bulk_upload: 'Bulk Upload',
  validate: 'OCR Validated',
};

export interface AuditLogWithProfile extends AuditLog {
  actor_full_name?: string | null;
}

interface AuditTimelineProps {
  logs: AuditLogWithProfile[];
  loading?: boolean;
}

export function AuditTimeline({ logs, loading }: AuditTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return <p className="text-sm text-muted-foreground">No audit entries found.</p>;
  }

  let todaySeparatorInserted = false;

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {logs.map((log, idx) => {
          const Icon = ACTION_ICONS[log.action] ?? Eye;
          const colorClass = ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-600';
          const actorDisplay = log.actor_full_name || log.actor_email;

          let showTodaySeparator = false;
          if (!todaySeparatorInserted && !isToday(log.created_at) && idx > 0) {
            todaySeparatorInserted = true;
            showTodaySeparator = true;
          }
          // Edge case: if first entry is not today, still mark separator done
          if (idx === 0 && !isToday(log.created_at)) {
            todaySeparatorInserted = true;
          }

          return (
            <li key={log.id}>
              {showTodaySeparator && (
                <div className="relative pb-4 pt-2">
                  <div className="flex items-center gap-3">
                    <Separator className="flex-1" />
                    <Badge variant="secondary" className="text-xs whitespace-nowrap">
                      Older
                    </Badge>
                    <Separator className="flex-1" />
                  </div>
                </div>
              )}
              <div className="relative pb-8">
                {idx < logs.length - 1 && (
                  <span className="absolute left-4 top-8 -ml-px h-full w-0.5 bg-border" />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-background ${colorClass}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <Card className="min-w-0 flex-1">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">
                          {ACTION_LABELS[log.action] ?? log.action}
                        </p>
                        <time
                          className="text-xs text-muted-foreground whitespace-nowrap"
                          title={new Date(log.created_at).toLocaleString('id-ID')}
                        >
                          {getRelativeTime(log.created_at)}
                        </time>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        by {actorDisplay}
                        {log.actor_role && ` (${log.actor_role})`}
                      </p>
                      {log.old_status && log.new_status && (
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="outline">{log.old_status}</Badge>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <Badge variant="secondary">{log.new_status}</Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
