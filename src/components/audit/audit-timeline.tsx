'use client';

import type { AuditLog } from '@/lib/db/types';

const ACTION_LABELS: Record<string, string> = {
  upload: 'Uploaded document',
  view: 'Viewed document',
  download: 'Downloaded document',
  edit: 'Edited document',
  delete: 'Deleted document',
  status_change: 'Changed status',
  ocr_complete: 'OCR completed',
  link_claim: 'Linked to claim',
  unlink_claim: 'Unlinked from claim',
  review: 'Reviewed document',
  approve: 'Approved document',
  reject: 'Rejected document',
  archive: 'Archived document',
};

const ACTION_COLORS: Record<string, string> = {
  upload: 'bg-blue-500',
  view: 'bg-gray-400',
  download: 'bg-gray-400',
  edit: 'bg-yellow-500',
  status_change: 'bg-purple-500',
  ocr_complete: 'bg-green-500',
  approve: 'bg-green-500',
  reject: 'bg-red-500',
  archive: 'bg-yellow-500',
  link_claim: 'bg-blue-400',
};

interface AuditTimelineProps {
  logs: AuditLog[];
  loading?: boolean;
}

export function AuditTimeline({ logs, loading }: AuditTimelineProps) {
  if (loading) {
    return <p className="text-sm text-gray-500">Loading audit trail...</p>;
  }

  if (logs.length === 0) {
    return <p className="text-sm text-gray-500">No audit entries found.</p>;
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {logs.map((log, idx) => (
          <li key={log.id}>
            <div className="relative pb-8">
              {idx < logs.length - 1 && (
                <span className="absolute left-3 top-3 -ml-px h-full w-0.5 bg-gray-200" />
              )}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${
                      ACTION_COLORS[log.action] ?? 'bg-gray-400'
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </p>
                    <time className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </time>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    by {log.actor_email}
                    {log.actor_role && ` (${log.actor_role})`}
                  </p>
                  {log.old_status && log.new_status && (
                    <p className="mt-1 text-xs text-gray-600">
                      {log.old_status} &rarr; {log.new_status}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
