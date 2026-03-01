'use client';

import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/documents/validation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
      <Card
        className={`transition-colors ${
          isDragging ? 'border-blue-400 bg-blue-50' : ''
        }`}
      >
        <CardContent
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10"
        >
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mb-1 text-base font-medium text-foreground">
            Drag and drop files here
          </p>
          <p className="mb-5 text-sm text-muted-foreground">
            Supports PDF, TIFF, JPG, PNG — up to 50MB per file
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                Browse Files
                <input
                  type="file"
                  accept={ALLOWED_MIME_TYPES.join(',')}
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <label className="cursor-pointer">
                Bulk Upload
                <input
                  type="file"
                  multiple
                  accept={ALLOWED_MIME_TYPES.join(',')}
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>
      {errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-destructive" role="alert">
              {err}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
