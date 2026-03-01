'use client';

import { useState, useEffect } from 'react';
import type { UploadDocumentInput } from '@/lib/documents/validation';
import type { AssetType } from '@/lib/db/types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

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

interface Warehouse {
  id: string;
  name: string;
}

interface MetadataFormProps {
  onSubmit: (data: UploadDocumentInput) => void;
  loading?: boolean;
}

export function MetadataForm({ onSubmit, loading }: MetadataFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('other');
  const [policyNumber, setPolicyNumber] = useState('');
  const [claimNumber, setClaimNumber] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    async function fetchWarehouses() {
      try {
        const res = await fetch('/api/warehouses');
        if (res.ok) {
          const json = await res.json();
          setWarehouses(json.data ?? []);
        }
      } catch {
        // silently fail — warehouse list is optional
      }
    }
    fetchWarehouses();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    onSubmit({
      title,
      description,
      asset_type: assetType,
      policy_number: policyNumber,
      claim_number: claimNumber,
      tags,
      warehouse_id: warehouseId || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground">
          Title *
        </label>
        <Input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="asset_type" className="block text-sm font-medium text-foreground">
            Document Type
          </label>
          <Select value={assetType} onValueChange={(val) => setAssetType(val as AssetType)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASSET_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="warehouse_source" className="block text-sm font-medium text-foreground">
            Warehouse Source
          </label>
          <Select value={warehouseId} onValueChange={setWarehouseId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select warehouse" />
            </SelectTrigger>
            <SelectContent>
              {warehouses.map((w) => (
                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="policy_number" className="block text-sm font-medium text-foreground">
            Policy Number
          </label>
          <Input
            id="policy_number"
            type="text"
            value={policyNumber}
            onChange={(e) => setPolicyNumber(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="document_date" className="block text-sm font-medium text-foreground">
            Document Date
          </label>
          <Input
            id="document_date"
            type="date"
            value={documentDate}
            onChange={(e) => setDocumentDate(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <label htmlFor="claim_number" className="block text-sm font-medium text-foreground">
          Claim Number
        </label>
        <Input
          id="claim_number"
          type="text"
          value={claimNumber}
          onChange={(e) => setClaimNumber(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-foreground">
          Tags (comma-separated)
        </label>
        <Input
          id="tags"
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="e.g., urgent, fire-claim, jakarta"
          className="mt-1"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Uploading...' : 'Upload Document'}
      </Button>
    </form>
  );
}
