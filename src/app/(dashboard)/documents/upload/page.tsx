'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UploadDropzone } from '@/components/documents/upload-dropzone';
import { MetadataForm } from '@/components/documents/metadata-form';
import { ProcessingQueue, type QueueFile } from '@/components/documents/processing-queue';
import type { UploadDocumentInput } from '@/lib/documents/validation';

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [queueFiles, setQueueFiles] = useState<QueueFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFilesSelected = useCallback((selected: File[]) => {
    setFiles((prev) => [...prev, ...selected]);
    const newQueue: QueueFile[] = selected.map((f) => ({
      name: f.name,
      size: f.size,
      status: 'uploading' as const,
      progress: 0,
    }));
    setQueueFiles((prev) => [...prev, ...newQueue]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setQueueFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleRetryFile = useCallback((index: number) => {
    setQueueFiles((prev) =>
      prev.map((qf, i) =>
        i === index ? { ...qf, status: 'uploading' as const, progress: 0 } : qf
      )
    );
  }, []);

  async function handleUpload(metadata: UploadDocumentInput) {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        setQueueFiles((prev) =>
          prev.map((qf, idx) =>
            idx === i ? { ...qf, status: 'uploading', progress: 30 } : qf
          )
        );

        const formData = new FormData();
        formData.append('file', file);
        formData.append('metadata', JSON.stringify({
          ...metadata,
          title: files.length > 1 ? `${metadata.title} - ${file.name}` : metadata.title,
        }));

        const res = await fetch('/api/documents', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          setQueueFiles((prev) =>
            prev.map((qf, idx) =>
              idx === i ? { ...qf, status: 'failed' } : qf
            )
          );
          throw new Error(data.error || 'Upload failed');
        }

        setQueueFiles((prev) =>
          prev.map((qf, idx) =>
            idx === i ? { ...qf, status: 'processing_ocr', progress: 80 } : qf
          )
        );

        // Mark completed after a brief moment
        setQueueFiles((prev) =>
          prev.map((qf, idx) =>
            idx === i ? { ...qf, status: 'completed', progress: 100 } : qf
          )
        );
      }

      router.push('/documents');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Document Ingestion</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload and digitize legacy insurance documents
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section>
        <UploadDropzone onFilesSelected={handleFilesSelected} />
        {files.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            {files.length} file(s) selected
          </p>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Metadata Assignment</h2>
        <MetadataForm onSubmit={handleUpload} loading={loading} />
      </section>

      <section>
        <ProcessingQueue files={queueFiles} onRemove={handleRemoveFile} onRetry={handleRetryFile} />
      </section>
    </div>
  );
}
