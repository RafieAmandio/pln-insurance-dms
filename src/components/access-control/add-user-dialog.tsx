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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { APP_ROLES, ROLE_LABELS, type AppRole } from '@/lib/auth/roles';

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<AppRole>('read_only');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  function resetForm() {
    setEmail('');
    setFullName('');
    setRole('read_only');
    setDepartment('');
    setPassword('');
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: fullName, role, department, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create user');
      }

      setOpen(false);
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button>+ Add User</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="add-name" className="text-sm font-medium">Full Name</label>
            <Input
              id="add-name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="add-email" className="text-sm font-medium">Email</label>
            <Input
              id="add-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@pln-insurance.co.id"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="add-password" className="text-sm font-medium">Password</label>
            <Input
              id="add-password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="add-role" className="text-sm font-medium">Role</label>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
              <SelectTrigger id="add-role">
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
            <label htmlFor="add-dept" className="text-sm font-medium">Department</label>
            <Input
              id="add-dept"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Finance, Operations"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
