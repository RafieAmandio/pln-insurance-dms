import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

import { Sidebar } from '@/components/layout/sidebar';

describe('Sidebar', () => {
  it('renders Dashboard for all roles', () => {
    render(<Sidebar role="pic_gudang" />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders Documents for all roles with document:view', () => {
    render(<Sidebar role="pic_gudang" />);
    expect(screen.getByText('Documents')).toBeInTheDocument();
  });

  describe('PIC Gudang', () => {
    it('shows Document Ingestion link', () => {
      render(<Sidebar role="pic_gudang" />);
      expect(screen.getByText('Document Ingestion')).toBeInTheDocument();
    });

    it('does not show OCR Validation (no document:review)', () => {
      render(<Sidebar role="pic_gudang" />);
      expect(screen.queryByText('OCR Validation')).not.toBeInTheDocument();
    });

    it('does not show Access Control (no user:manage)', () => {
      render(<Sidebar role="pic_gudang" />);
      expect(screen.queryByText('Access Control')).not.toBeInTheDocument();
    });

    it('shows Audit Trail', () => {
      render(<Sidebar role="pic_gudang" />);
      expect(screen.getByText('Audit Trail')).toBeInTheDocument();
    });
  });

  describe('PIC Klaim', () => {
    it('shows OCR Validation (has document:review)', () => {
      render(<Sidebar role="pic_klaim" />);
      expect(screen.getByText('OCR Validation')).toBeInTheDocument();
    });

    it('does not show Document Ingestion (no document:upload)', () => {
      render(<Sidebar role="pic_klaim" />);
      expect(screen.queryByText('Document Ingestion')).not.toBeInTheDocument();
    });

    it('does not show Admin Console (no user:manage)', () => {
      render(<Sidebar role="pic_klaim" />);
      expect(screen.queryByText('Admin Console')).not.toBeInTheDocument();
    });
  });

  describe('Manager', () => {
    it('shows Access Control', () => {
      render(<Sidebar role="manager" />);
      expect(screen.getByText('Access Control')).toBeInTheDocument();
    });

    it('shows OCR Validation', () => {
      render(<Sidebar role="manager" />);
      expect(screen.getByText('OCR Validation')).toBeInTheDocument();
    });

    it('shows Audit Trail', () => {
      render(<Sidebar role="manager" />);
      expect(screen.getByText('Audit Trail')).toBeInTheDocument();
    });

    it('shows Admin Console', () => {
      render(<Sidebar role="manager" />);
      expect(screen.getByText('Admin Console')).toBeInTheDocument();
    });
  });
});
