'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ClaimForm() {
  const [claimNumber, setClaimNumber] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [claimantName, setClaimantName] = useState('');
  const [description, setDescription] = useState('');
  const [claimDate, setClaimDate] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim_number: claimNumber,
          policy_number: policyNumber,
          claimant_name: claimantName,
          description,
          claim_date: claimDate || undefined,
          amount: amount ? parseFloat(amount) : 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create claim');
      }

      router.push('/claims');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create claim');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="claim_number" className="block text-sm font-medium text-foreground">
            Claim Number *
          </label>
          <Input
            id="claim_number"
            type="text"
            required
            value={claimNumber}
            onChange={(e) => setClaimNumber(e.target.value)}
            className="mt-1"
          />
        </div>
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
      </div>

      <div>
        <label htmlFor="claimant_name" className="block text-sm font-medium text-foreground">
          Claimant Name *
        </label>
        <Input
          id="claimant_name"
          type="text"
          required
          value={claimantName}
          onChange={(e) => setClaimantName(e.target.value)}
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
          <label htmlFor="claim_date" className="block text-sm font-medium text-foreground">
            Claim Date
          </label>
          <Input
            id="claim_date"
            type="date"
            value={claimDate}
            onChange={(e) => setClaimDate(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-foreground">
            Amount (IDR)
          </label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating...' : 'Create Claim'}
      </Button>
    </form>
  );
}
