'use client';

import { useState } from 'react';
import type { UploadDocumentInput } from '@/lib/documents/validation';
import type { AssetType } from '@/lib/db/types';

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
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="asset_type" className="block text-sm font-medium text-gray-700">
            Asset Type
          </label>
          <select
            id="asset_type"
            value={assetType}
            onChange={(e) => setAssetType(e.target.value as AssetType)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {ASSET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="policy_number" className="block text-sm font-medium text-gray-700">
            Policy Number
          </label>
          <input
            id="policy_number"
            type="text"
            value={policyNumber}
            onChange={(e) => setPolicyNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="claim_number" className="block text-sm font-medium text-gray-700">
          Claim Number
        </label>
        <input
          id="claim_number"
          type="text"
          value={claimNumber}
          onChange={(e) => setClaimNumber(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
          Tags (comma-separated)
        </label>
        <input
          id="tags"
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="e.g., urgent, fire-claim, jakarta"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {loading ? 'Uploading...' : 'Upload Document'}
      </button>
    </form>
  );
}
