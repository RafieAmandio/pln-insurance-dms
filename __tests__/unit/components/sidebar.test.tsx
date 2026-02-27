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

  it('renders Documents for all roles', () => {
    render(<Sidebar role="pic_gudang" />);
    expect(screen.getByText('Documents')).toBeInTheDocument();
  });

  describe('PIC Gudang', () => {
    it('shows Upload link', () => {
      render(<Sidebar role="pic_gudang" />);
      expect(screen.getByText('Upload')).toBeInTheDocument();
    });

    it('does not show Review Queue', () => {
      render(<Sidebar role="pic_gudang" />);
      expect(screen.queryByText('Review Queue')).not.toBeInTheDocument();
    });

    it('does not show Approval Queue', () => {
      render(<Sidebar role="pic_gudang" />);
      expect(screen.queryByText('Approval Queue')).not.toBeInTheDocument();
    });

    it('does not show Audit Log', () => {
      render(<Sidebar role="pic_gudang" />);
      expect(screen.queryByText('Audit Log')).not.toBeInTheDocument();
    });
  });

  describe('PIC Klaim', () => {
    it('shows Review Queue', () => {
      render(<Sidebar role="pic_klaim" />);
      expect(screen.getByText('Review Queue')).toBeInTheDocument();
    });

    it('does not show Upload', () => {
      render(<Sidebar role="pic_klaim" />);
      expect(screen.queryByText('Upload')).not.toBeInTheDocument();
    });

    it('does not show Approval Queue', () => {
      render(<Sidebar role="pic_klaim" />);
      expect(screen.queryByText('Approval Queue')).not.toBeInTheDocument();
    });
  });

  describe('Manager', () => {
    it('shows Approval Queue', () => {
      render(<Sidebar role="manager" />);
      expect(screen.getByText('Approval Queue')).toBeInTheDocument();
    });

    it('shows Review Queue', () => {
      render(<Sidebar role="manager" />);
      expect(screen.getByText('Review Queue')).toBeInTheDocument();
    });

    it('shows Audit Log', () => {
      render(<Sidebar role="manager" />);
      expect(screen.getByText('Audit Log')).toBeInTheDocument();
    });

    it('shows Claims', () => {
      render(<Sidebar role="manager" />);
      expect(screen.getByText('Claims')).toBeInTheDocument();
    });
  });
});
