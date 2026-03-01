'use client';

import { useEffect, useState } from 'react';
import type { DocumentStatus, AssetType } from '@/lib/db/types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface WarehouseOption {
  id: string;
  name: string;
}

interface FilterPanelProps {
  filters: {
    status?: DocumentStatus;
    asset_type?: AssetType;
    date_from?: string;
    date_to?: string;
    policy_number?: string;
    warehouse_id?: string;
  };
  onFilterChange: (filters: FilterPanelProps['filters']) => void;
}

const STATUSES: { value: DocumentStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'approved', label: 'Approved' },
  { value: 'archived', label: 'Archived' },
];

const ASSET_TYPES: { value: AssetType; label: string }[] = [
  { value: 'policy', label: 'Policy' },
  { value: 'claim', label: 'Claim' },
  { value: 'endorsement', label: 'Endorsement' },
  { value: 'invoice', label: 'Invoice' },
  { value: 'correspondence', label: 'Correspondence' },
  { value: 'photo', label: 'Photo' },
  { value: 'report', label: 'Report' },
  { value: 'other', label: 'Other' },
];

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);

  useEffect(() => {
    fetch('/api/warehouses?pageSize=100')
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          setWarehouses(json.data.map((w: WarehouseOption) => ({ id: w.id, name: w.name })));
        }
      })
      .catch(() => {
        // Silently fail - warehouse filter will just be empty
      });
  }, []);

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-white p-4">
      <div>
        <label htmlFor="filter-status" className="block text-xs font-medium text-muted-foreground">Status</label>
        <Select
          value={filters.status ?? '_all'}
          onValueChange={(val) =>
            onFilterChange({ ...filters, status: val === '_all' ? undefined : val as DocumentStatus })
          }
        >
          <SelectTrigger className="mt-1 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="filter-type" className="block text-xs font-medium text-muted-foreground">Type</label>
        <Select
          value={filters.asset_type ?? '_all'}
          onValueChange={(val) =>
            onFilterChange({ ...filters, asset_type: val === '_all' ? undefined : val as AssetType })
          }
        >
          <SelectTrigger className="mt-1 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All</SelectItem>
            {ASSET_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="filter-policy" className="block text-xs font-medium text-muted-foreground">Policy #</label>
        <Input
          id="filter-policy"
          type="text"
          value={filters.policy_number ?? ''}
          onChange={(e) => onFilterChange({ ...filters, policy_number: e.target.value || undefined })}
          placeholder="POL-..."
          className="mt-1 w-32"
        />
      </div>

      <div>
        <label htmlFor="filter-from" className="block text-xs font-medium text-muted-foreground">From</label>
        <Input
          id="filter-from"
          type="date"
          value={filters.date_from ?? ''}
          onChange={(e) => onFilterChange({ ...filters, date_from: e.target.value || undefined })}
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="filter-to" className="block text-xs font-medium text-muted-foreground">To</label>
        <Input
          id="filter-to"
          type="date"
          value={filters.date_to ?? ''}
          onChange={(e) => onFilterChange({ ...filters, date_to: e.target.value || undefined })}
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="filter-warehouse" className="block text-xs font-medium text-muted-foreground">Warehouse</label>
        <Select
          value={filters.warehouse_id ?? '_all'}
          onValueChange={(val) =>
            onFilterChange({ ...filters, warehouse_id: val === '_all' ? undefined : val })
          }
        >
          <SelectTrigger className="mt-1 w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Warehouses</SelectItem>
            {warehouses.map((w) => (
              <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onFilterChange({})}
      >
        Clear
      </Button>
    </div>
  );
}
