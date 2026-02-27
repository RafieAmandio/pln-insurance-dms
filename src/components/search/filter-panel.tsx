'use client';

import type { DocumentStatus, AssetType } from '@/lib/db/types';

interface FilterPanelProps {
  filters: {
    status?: DocumentStatus;
    asset_type?: AssetType;
    date_from?: string;
    date_to?: string;
    policy_number?: string;
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
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-white p-4">
      <div>
        <label htmlFor="filter-status" className="block text-xs font-medium text-gray-500">Status</label>
        <select
          id="filter-status"
          value={filters.status ?? ''}
          onChange={(e) =>
            onFilterChange({ ...filters, status: (e.target.value || undefined) as DocumentStatus | undefined })
          }
          className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-type" className="block text-xs font-medium text-gray-500">Type</label>
        <select
          id="filter-type"
          value={filters.asset_type ?? ''}
          onChange={(e) =>
            onFilterChange({ ...filters, asset_type: (e.target.value || undefined) as AssetType | undefined })
          }
          className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All</option>
          {ASSET_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-policy" className="block text-xs font-medium text-gray-500">Policy #</label>
        <input
          id="filter-policy"
          type="text"
          value={filters.policy_number ?? ''}
          onChange={(e) => onFilterChange({ ...filters, policy_number: e.target.value || undefined })}
          placeholder="POL-..."
          className="mt-1 w-32 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label htmlFor="filter-from" className="block text-xs font-medium text-gray-500">From</label>
        <input
          id="filter-from"
          type="date"
          value={filters.date_from ?? ''}
          onChange={(e) => onFilterChange({ ...filters, date_from: e.target.value || undefined })}
          className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label htmlFor="filter-to" className="block text-xs font-medium text-gray-500">To</label>
        <input
          id="filter-to"
          type="date"
          value={filters.date_to ?? ''}
          onChange={(e) => onFilterChange({ ...filters, date_to: e.target.value || undefined })}
          className="mt-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
      </div>

      <button
        onClick={() => onFilterChange({})}
        className="rounded-md border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
      >
        Clear
      </button>
    </div>
  );
}
