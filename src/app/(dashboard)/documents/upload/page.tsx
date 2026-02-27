'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadDropzone } from '@/components/documents/upload-dropzone';
import { MetadataForm } from '@/components/documents/metadata-form';
import type { UploadDocumentInput } from '@/lib/documents/validation';

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleUpload(metadata: UploadDocumentInput) {
    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      for (const file of files) {
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
          throw new Error(data.error || 'Upload failed');
        }
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
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Upload Documents</h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6">
        <UploadDropzone onFilesSelected={setFiles} />
        {files.length > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            {files.length} file(s) selected
          </p>
        )}
      </div>

      <MetadataForm onSubmit={handleUpload} loading={loading} />
    </div>
  );
}
