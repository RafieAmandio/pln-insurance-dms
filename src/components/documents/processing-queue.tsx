'use client';

import { FileText, CheckCircle2, AlertTriangle, Loader2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface QueueFile {
  name: string;
  size: number;
  status: 'uploading' | 'processing_ocr' | 'completed' | 'failed';
  progress?: number;
}

interface ProcessingQueueProps {
  files: QueueFile[];
  onRemove?: (index: number) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusIndicator({ status, progress }: { status: QueueFile['status']; progress?: number }) {
  switch (status) {
    case 'uploading':
      return (
        <div className="flex items-center gap-2 min-w-[140px]">
          <Progress value={progress ?? 0} className="h-2 flex-1" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">Uploading</span>
        </div>
      );
    case 'processing_ocr':
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          <span className="text-xs text-blue-600">Processing OCR</span>
        </div>
      );
    case 'completed':
      return (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-xs text-green-600">Completed</span>
        </div>
      );
    case 'failed':
      return (
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="text-xs text-red-600">Failed</span>
        </div>
      );
  }
}

export function ProcessingQueue({ files, onRemove }: ProcessingQueueProps) {
  if (files.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">Processing Queue</CardTitle>
          <Badge variant="secondary">{files.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 rounded-md border p-3"
            >
              <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </div>
              <StatusIndicator status={file.status} progress={file.progress} />
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => onRemove(index)}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
