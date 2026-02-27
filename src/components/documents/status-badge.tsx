import type { DocumentStatus } from '@/lib/db/types';

const STATUS_STYLES: Record<DocumentStatus, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Draft' },
  reviewed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Reviewed' },
  approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
  archived: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Archived' },
};

interface StatusBadgeProps {
  status: DocumentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
