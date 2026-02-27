import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UploadDropzone } from '@/components/documents/upload-dropzone';

function createMockFile(name: string, type: string, size: number = 1024): File {
  const file = new File(['x'.repeat(size)], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('UploadDropzone', () => {
  it('renders upload instructions', () => {
    render(<UploadDropzone onFilesSelected={vi.fn()} />);
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
    expect(screen.getByText(/JPEG, PNG, TIFF, PDF/i)).toBeInTheDocument();
  });

  it('accepts valid file types via input', () => {
    const onFiles = vi.fn();
    render(<UploadDropzone onFilesSelected={onFiles} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile('test.pdf', 'application/pdf');

    fireEvent.change(input, { target: { files: [file] } });
    expect(onFiles).toHaveBeenCalledWith([file]);
  });

  it('rejects invalid file types', () => {
    const onFiles = vi.fn();
    render(<UploadDropzone onFilesSelected={onFiles} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile('test.exe', 'application/x-msdownload');

    fireEvent.change(input, { target: { files: [file] } });
    expect(onFiles).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/invalid file type/i);
  });

  it('rejects files larger than 50MB', () => {
    const onFiles = vi.fn();
    render(<UploadDropzone onFilesSelected={onFiles} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = createMockFile('big.pdf', 'application/pdf', 60 * 1024 * 1024);

    fireEvent.change(input, { target: { files: [file] } });
    expect(onFiles).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/too large/i);
  });
});
