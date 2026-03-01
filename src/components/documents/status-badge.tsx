import type { DocumentStatus } from '@/lib/db/types';
import { Badge } from '@/components/ui/badge';

const STATUS_CONFIG: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; className?: string }> = {
  draft: { variant: 'secondary', label: 'Draft' },
  reviewed: { variant: 'default', label: 'Reviewed' },
  approved: { variant: 'default', label: 'Approved', className: 'bg-green-600 hover:bg-green-700' },
  archived: { variant: 'outline', label: 'Archived' },
  indexed: { variant: 'default', label: 'Indexed', className: 'bg-green-600 hover:bg-green-700' },
  processing: { variant: 'default', label: 'Processing' },
  failed: { variant: 'destructive', label: 'Failed' },
  ocr_review: { variant: 'default', label: 'OCR Review', className: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
};

interface StatusBadgeProps {
  status: DocumentStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { variant: 'secondary' as const, label: status };
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
}
