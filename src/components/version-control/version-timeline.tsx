'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, RotateCcw } from 'lucide-react';

export interface VersionEntry {
  id: string;
  version_number: number;
  description: string;
  file_path: string;
  file_size: number;
  created_by: string;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

interface VersionTimelineProps {
  versions: VersionEntry[];
  loading?: boolean;
  onView?: (version: VersionEntry) => void;
  onRestore?: (version: VersionEntry) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function VersionTimeline({
  versions,
  loading,
  onView,
  onRestore,
}: VersionTimelineProps) {
  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading version history...</p>;
  }

  if (versions.length === 0) {
    return <p className="text-sm text-muted-foreground">No versions found.</p>;
  }

  const latestVersion = versions[0].version_number;

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {versions.map((version, idx) => {
          const isCurrent = version.version_number === latestVersion;
          const authorName =
            version.profiles?.full_name ?? version.profiles?.email ?? version.created_by;

          return (
            <li key={version.id}>
              <div className="relative pb-8">
                {idx < versions.length - 1 && (
                  <span className="absolute left-3 top-3 -ml-px h-full w-0.5 bg-border" />
                )}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${
                        isCurrent ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <Card className="min-w-0 flex-1">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            v{version.version_number}
                          </span>
                          {isCurrent && (
                            <Badge variant="default">Current</Badge>
                          )}
                        </div>
                        <time className="text-xs text-muted-foreground">
                          {new Date(version.created_at).toLocaleString('id-ID')}
                        </time>
                      </div>
                      <p className="mt-1 text-sm text-gray-700">
                        {version.description}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span>by {authorName}</span>
                        <span>{formatFileSize(version.file_size)}</span>
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView?.(version)}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        {!isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRestore?.(version)}
                          >
                            <RotateCcw className="mr-1 h-3 w-3" />
                            Restore
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
