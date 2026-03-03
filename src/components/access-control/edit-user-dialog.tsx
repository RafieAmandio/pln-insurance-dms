'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { APP_ROLES, ROLE_LABELS, type AppRole } from '@/lib/auth/roles';
import type { Profile } from '@/lib/db/types';

interface EditUserDialogProps {
  user: Profile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState(user.full_name);
  const [role, setRole] = useState<AppRole>(user.role);
  const [department, setDepartment] = useState(user.department);
  const [isActive, setIsActive] = useState(user.is_active);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          full_name: fullName,
          role,
          department,
          is_active: isActive,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update user');
      }

      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input value={user.email} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APP_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Department</label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={isActive ? 'active' : 'inactive'} onValueChange={(v) => setIsActive(v === 'active')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
