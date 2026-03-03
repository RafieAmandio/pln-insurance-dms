'use client';

import { useState, useCallback } from 'react';
import { DocumentSelector } from '@/components/version-control/document-selector';
import { LockStatus } from '@/components/version-control/lock-status';
import { VersionTimeline, type VersionEntry } from '@/components/version-control/version-timeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeftRight, Download } from 'lucide-react';

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
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareA, setCompareA] = useState('');
  const [compareB, setCompareB] = useState('');

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

  function handleDownload(version: VersionEntry) {
    const link = document.createElement('a');
    link.href = `/api/documents/${selectedDocId}/download?version=${version.version_number}`;
    link.download = `version_${version.version_number}`;
    link.click();
  }

  function handleCompare() {
    if (!compareA || !compareB || !selectedDocId) return;
    // Open both versions in new tabs for side-by-side comparison
    window.open(`/api/documents/${selectedDocId}/download?version=${compareA}`, '_blank');
    window.open(`/api/documents/${selectedDocId}/download?version=${compareB}`, '_blank');
    setCompareOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Version Control</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track document versions, compare changes, and restore
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCompareA('');
            setCompareB('');
            setCompareOpen(true);
          }}
          disabled={versions.length < 2}
        >
          <ArrowLeftRight className="mr-1.5 h-4 w-4" />
          Compare Versions
        </Button>
      </div>

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
              onDownload={handleDownload}
            />
          </div>
        </>
      )}

      {/* Compare Versions Dialog */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compare Versions</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Select two versions to compare side by side.
          </p>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Version A</label>
              <Select value={compareA} onValueChange={setCompareA}>
                <SelectTrigger>
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((v) => (
                    <SelectItem key={v.id} value={String(v.version_number)}>
                      Version {v.version_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Version B</label>
              <Select value={compareB} onValueChange={setCompareB}>
                <SelectTrigger>
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((v) => (
                    <SelectItem key={v.id} value={String(v.version_number)}>
                      Version {v.version_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompareOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompare} disabled={!compareA || !compareB || compareA === compareB}>
              Compare
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
