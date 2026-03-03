'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Role } from '@/lib/db/types';

const ALL_PERMISSIONS = [
  { key: 'document:view', label: 'View Documents' },
  { key: 'document:upload', label: 'Upload Documents' },
  { key: 'document:download', label: 'Download Documents' },
  { key: 'document:edit', label: 'Edit Documents' },
  { key: 'document:delete', label: 'Delete Documents' },
  { key: 'claim:view', label: 'View Claims' },
  { key: 'claim:edit', label: 'Edit Claims' },
  { key: 'user:manage', label: 'Manage Users (Admin)' },
];

interface EditRoleDialogProps {
  role: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRoleDialog({ role, open, onOpenChange }: EditRoleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [permissions, setPermissions] = useState<string[]>(role.permissions);
  const router = useRouter();

  function togglePermission(key: string) {
    setPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/access-control', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId: role.id, permissions }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update permissions');
      }

      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update permissions');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Permissions — {role.display_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-3">
            {ALL_PERMISSIONS.map((perm) => (
              <label key={perm.key} className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  checked={permissions.includes(perm.key)}
                  onCheckedChange={() => togglePermission(perm.key)}
                />
                <span className="text-sm">{perm.label}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Permissions'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
