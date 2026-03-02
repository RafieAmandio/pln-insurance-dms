import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

import { Sidebar } from '@/components/layout/sidebar';

function renderSidebar(role: Parameters<typeof Sidebar>[0]['role']) {
  return render(
    <TooltipProvider>
      <Sidebar role={role} />
    </TooltipProvider>
  );
}

function hasNavLink(name: string) {
  return screen.queryByRole('link', { name }) !== null;
}

describe('Sidebar', () => {
  it('renders Dashboard for all roles', () => {
    renderSidebar('pic_gudang');
    expect(hasNavLink('Dashboard')).toBe(true);
  });

  it('renders Documents for all roles with document:view', () => {
    renderSidebar('pic_gudang');
    expect(hasNavLink('Documents')).toBe(true);
  });

  describe('PIC Gudang', () => {
    it('shows Document Ingestion link', () => {
      renderSidebar('pic_gudang');
      expect(hasNavLink('Document Ingestion')).toBe(true);
    });

    it('does not show OCR Validation (no document:review)', () => {
      renderSidebar('pic_gudang');
      expect(hasNavLink('OCR Validation')).toBe(false);
    });

    it('does not show Access Control (no user:manage)', () => {
      renderSidebar('pic_gudang');
      expect(hasNavLink('Access Control')).toBe(false);
    });

    it('shows Audit Trail', () => {
      renderSidebar('pic_gudang');
      expect(hasNavLink('Audit Trail')).toBe(true);
    });
  });

  describe('PIC Klaim', () => {
    it('shows OCR Validation (has document:review)', () => {
      renderSidebar('pic_klaim');
      expect(hasNavLink('OCR Validation')).toBe(true);
    });

    it('does not show Document Ingestion (no document:upload)', () => {
      renderSidebar('pic_klaim');
      expect(hasNavLink('Document Ingestion')).toBe(false);
    });

    it('does not show Admin Console (no user:manage)', () => {
      renderSidebar('pic_klaim');
      expect(hasNavLink('Admin Console')).toBe(false);
    });
  });

  describe('Manager', () => {
    it('shows Access Control', () => {
      renderSidebar('manager');
      expect(hasNavLink('Access Control')).toBe(true);
    });

    it('shows OCR Validation', () => {
      renderSidebar('manager');
      expect(hasNavLink('OCR Validation')).toBe(true);
    });

    it('shows Audit Trail', () => {
      renderSidebar('manager');
      expect(hasNavLink('Audit Trail')).toBe(true);
    });

    it('shows Admin Console', () => {
      renderSidebar('manager');
      expect(hasNavLink('Admin Console')).toBe(true);
    });
  });
});
