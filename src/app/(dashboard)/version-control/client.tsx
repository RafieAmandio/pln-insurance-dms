'use client';

import { useState, useCallback } from 'react';
import { DocumentSelector } from '@/components/version-control/document-selector';
import { LockStatus } from '@/components/version-control/lock-status';
import { VersionTimeline, type VersionEntry } from '@/components/version-control/version-timeline';
import { Badge } from '@/components/ui/badge';

interface DocumentOption {
  id: string;
  title: string;
}

interface LockInfo {
  isLocked: boolean;
  lockedBy: string | null;
  lockedByProfile: { full_name: string; email: string } | null;
}

interface VersionControlClientProps {
  documents: DocumentOption[];
}

export function VersionControlClient({ documents }: VersionControlClientProps) {
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>();
  const [versions, setVersions] = useState<VersionEntry[]>([]);
  const [lockInfo, setLockInfo] = useState<LockInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [currentUserRole, setCurrentUserRole] = useState<string | undefined>();

  const fetchVersions = useCallback(async (docId: string) => {
    setLoading(true);
    try {
      const [versionsRes, lockRes, meRes] = await Promise.all([
        fetch(`/api/documents/${docId}/versions`),
        fetch(`/api/documents/${docId}`),
        fetch('/api/auth/me').catch(() => null),
      ]);

      const versionsJson = await versionsRes.json();
      if (versionsJson.data) {
        setVersions(versionsJson.data);
      }

      const docJson = await lockRes.json();
      if (docJson.data) {
        setLockInfo({
          isLocked: !!docJson.data.locked_by,
          lockedBy: docJson.data.locked_by,
          lockedByProfile: null,
        });
      }

      if (meRes?.ok) {
        const meJson = await meRes.json();
        if (meJson.data) {
          setCurrentUserId(meJson.data.id);
          setCurrentUserRole(meJson.data.role);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  function handleDocumentSelect(docId: string) {
    setSelectedDocId(docId);
    fetchVersions(docId);
  }

  function handleLockChange() {
    if (selectedDocId) {
      fetchVersions(selectedDocId);
    }
  }

  async function handleRestore(version: VersionEntry) {
    if (!selectedDocId) return;

    const confirmed = window.confirm(
      `Restore to version ${version.version_number}? This will create a new version.`
    );
    if (!confirmed) return;

    const res = await fetch(`/api/documents/${selectedDocId}/versions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: `Restored from version ${version.version_number}`,
      }),
    });

    if (res.ok) {
      fetchVersions(selectedDocId);
    }
  }

  function handleView(version: VersionEntry) {
    window.open(`/api/documents/${selectedDocId}/download?version=${version.version_number}`, '_blank');
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-white p-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Select Document
        </label>
        <DocumentSelector
          initialDocuments={documents}
          selectedId={selectedDocId}
          onSelect={handleDocumentSelect}
        />
      </div>

      {selectedDocId && (
        <>
          <div className="flex items-center gap-4 rounded-lg border bg-white p-4">
            <Badge variant="secondary">
              {versions.length > 0
                ? `v${versions[0].version_number}`
                : 'v0'}
            </Badge>
            {lockInfo && (
              <LockStatus
                documentId={selectedDocId}
                isLocked={lockInfo.isLocked}
                lockedByName={lockInfo.lockedByProfile?.full_name}
                lockedByUserId={lockInfo.lockedBy ?? undefined}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onLockChange={handleLockChange}
              />
            )}
          </div>

          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Version History
            </h2>
            <VersionTimeline
              versions={versions}
              loading={loading}
              onView={handleView}
              onRestore={handleRestore}
            />
          </div>
        </>
      )}
    </div>
  );
}
