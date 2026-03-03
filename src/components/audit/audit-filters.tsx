'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Download, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AuditLogWithProfile } from './audit-timeline';

const ACTION_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'view,download', label: 'View / Download' },
  { value: 'upload,bulk_upload', label: 'Create / Upload' },
  { value: 'edit,status_change,transition', label: 'Update / Edit' },
  { value: 'permission_change,user_login', label: 'Security' },
  { value: 'ocr_complete,validate', label: 'OCR / Validation' },
  { value: 'delete,archive', label: 'Delete / Archive' },
];

interface AuditFiltersProps {
  logs: AuditLogWithProfile[];
}

export function AuditFilters({ logs }: AuditFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '');

  const currentAction = searchParams.get('action') ?? 'all';

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    } else {
      params.delete('search');
    }
    params.delete('page');
    router.push(`/audit?${params.toString()}`);
  }

  function handleActionFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('action');
    } else {
      params.set('action', value);
    }
    params.delete('page');
    router.push(`/audit?${params.toString()}`);
  }

  function handleExportCSV() {
    const headers = ['Timestamp', 'Action', 'User', 'Role', 'Document ID', 'Old Status', 'New Status'];
    const rows = logs.map((log) => [
      new Date(log.created_at).toISOString(),
      log.action,
      log.actor_full_name || log.actor_email,
      log.actor_role ?? '',
      log.document_id ?? '',
      log.old_status ?? '',
      log.new_status ?? '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <form onSubmit={handleSearch} className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by action, user, or document..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </form>
      <Select value={currentAction} onValueChange={handleActionFilter}>
        <SelectTrigger className="w-[180px] h-9">
          <Filter className="mr-1.5 h-4 w-4" />
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          {ACTION_TYPES.map((t) => (
            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" className="h-9" onClick={handleExportCSV}>
        <Download className="mr-1.5 h-4 w-4" />
        Export CSV
      </Button>
    </div>
  );
}
