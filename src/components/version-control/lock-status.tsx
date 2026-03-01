'use client';

import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LockStatusProps {
  documentId: string;
  isLocked: boolean;
  lockedByName?: string;
  lockedByUserId?: string;
  currentUserId?: string;
  currentUserRole?: string;
  onLockChange?: () => void;
}

export function LockStatus({
  documentId,
  isLocked,
  lockedByName,
  lockedByUserId,
  currentUserId,
  currentUserRole,
  onLockChange,
}: LockStatusProps) {
  const [loading, setLoading] = useState(false);

  const canUnlock =
    lockedByUserId === currentUserId ||
    currentUserRole === 'manager' ||
    currentUserRole === 'super_admin';

  async function handleLock() {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/lock`, {
        method: 'POST',
      });
      if (res.ok) {
        onLockChange?.();
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlock() {
    setLoading(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/lock`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onLockChange?.();
      }
    } finally {
      setLoading(false);
    }
  }

  if (!isLocked) {
    return (
      <div className="flex items-center gap-2">
        <Unlock className="h-4 w-4 text-green-600" />
        <span className="text-sm text-green-700">Unlocked</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLock}
          disabled={loading}
        >
          <Lock className="mr-1 h-3 w-3" />
          Lock
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Lock className="h-4 w-4 text-orange-600" />
      <span className="text-sm font-medium text-orange-700">
        Locked by {lockedByName ?? 'unknown'}
      </span>
      {canUnlock && (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleUnlock}
          disabled={loading}
        >
          Unlock
        </Button>
      )}
    </div>
  );
}
