'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, SlidersHorizontal, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AssetType, DocumentStatus, Warehouse } from '@/lib/db/types';

export interface DocumentFilterValues {
  search: string;
  type: AssetType | '';
  status: DocumentStatus | '';
  warehouse_id: string;
  date_from: string;
  date_to: string;
  policy_number: string;
}

interface DocumentFiltersProps {
  filters: DocumentFilterValues;
  totalCount: number;
  onChange: (filters: DocumentFilterValues) => void;
}

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

const STATUSES: { value: DocumentStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'approved', label: 'Approved' },
  { value: 'archived', label: 'Archived' },
  { value: 'indexed', label: 'Indexed' },
  { value: 'processing', label: 'Processing' },
  { value: 'failed', label: 'Failed' },
  { value: 'ocr_review', label: 'OCR Review' },
];

export function DocumentFilters({ filters, totalCount, onChange }: DocumentFiltersProps) {
  const [showMore, setShowMore] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    if (showMore && warehouses.length === 0) {
      fetch('/api/warehouses?pageSize=100')
        .then((res) => res.json())
        .then((json) => {
          if (json.data) setWarehouses(json.data);
        })
        .catch(() => {});
    }
  }, [showMore, warehouses.length]);

  const update = useCallback(
    (patch: Partial<DocumentFilterValues>) => {
      onChange({ ...filters, ...patch });
    },
    [filters, onChange]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID or title..."
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="pl-9"
          />
        </div>

        <Select
          value={filters.type || undefined}
          onValueChange={(val) => update({ type: val === '__all__' ? '' : (val as AssetType) })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Types</SelectItem>
            {ASSET_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status || undefined}
          onValueChange={(val) => update({ status: val === '__all__' ? '' : (val as DocumentStatus) })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Status</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMore(!showMore)}
          data-testid="more-filters-button"
        >
          <SlidersHorizontal className="mr-1.5 size-4" />
          More Filters
          {showMore ? (
            <ChevronUp className="ml-1 size-3" />
          ) : (
            <ChevronDown className="ml-1 size-3" />
          )}
        </Button>

        {(filters.search || filters.type || filters.status || filters.warehouse_id || filters.date_from || filters.date_to || filters.policy_number) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              onChange({
                search: '',
                type: '',
                status: '',
                warehouse_id: '',
                date_from: '',
                date_to: '',
                policy_number: '',
              })
            }
          >
            <X className="mr-1 size-3" />
            Reset
          </Button>
        )}

        <Badge variant="secondary" data-testid="total-count-badge">
          {totalCount} total
        </Badge>
      </div>

      {showMore && (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-3">
          <div className="min-w-[180px]">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Warehouse
            </label>
            <Select
              value={filters.warehouse_id || undefined}
              onValueChange={(val) =>
                update({ warehouse_id: val === '__all__' ? '' : val })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Warehouses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Warehouses</SelectItem>
                {warehouses.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              From
            </label>
            <Input
              type="date"
              value={filters.date_from}
              onChange={(e) => update({ date_from: e.target.value })}
              className="w-[160px]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              To
            </label>
            <Input
              type="date"
              value={filters.date_to}
              onChange={(e) => update({ date_to: e.target.value })}
              className="w-[160px]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Policy Number
            </label>
            <Input
              placeholder="e.g. POL-001"
              value={filters.policy_number}
              onChange={(e) => update({ policy_number: e.target.value })}
              className="w-[180px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
