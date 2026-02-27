'use client';

import { useCallback, useState } from 'react';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/documents/validation';

interface UploadDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
}

export function UploadDropzone({ onFilesSelected, maxFiles = 10 }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFiles = useCallback(
    (files: File[]): { valid: File[]; errors: string[] } => {
      const valid: File[] = [];
      const errs: string[] = [];

      for (const file of files) {
        if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
          errs.push(`${file.name}: Invalid file type (${file.type})`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE) {
          errs.push(`${file.name}: File too large (max 50MB)`);
          continue;
        }
        valid.push(file);
      }

      if (valid.length > maxFiles) {
        errs.push(`Too many files. Maximum is ${maxFiles}.`);
        return { valid: valid.slice(0, maxFiles), errors: errs };
      }

      return { valid, errors: errs };
    },
    [maxFiles]
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      const { valid, errors } = validateFiles(files);
      setErrors(errors);
      if (valid.length > 0) {
        onFilesSelected(valid);
      }
    },
    [validateFiles, onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [handleFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      handleFiles(files);
    },
    [handleFiles]
  );

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 bg-white'
        }`}
      >
        <p className="mb-2 text-sm text-gray-600">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-gray-400">
          JPEG, PNG, TIFF, PDF up to 50MB
        </p>
        <input
          type="file"
          multiple
          accept={ALLOWED_MIME_TYPES.join(',')}
          onChange={handleChange}
          className="mt-4"
        />
      </div>
      {errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-red-600" role="alert">
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
