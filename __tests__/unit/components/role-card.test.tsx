import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleCard } from '@/components/access-control/role-card';
import type { Role } from '@/lib/db/types';

const mockRole: Role & { user_count: number } = {
  id: 'role-1',
  name: 'pic_gudang',
  display_name: 'PIC Gudang',
  description: 'Warehouse staff responsible for document uploads',
  permissions: ['document:upload', 'document:view', 'document:edit', 'document:download', 'claim:view', 'audit:view'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  user_count: 8,
};

describe('RoleCard', () => {
  it('renders role name and description', () => {
    render(<RoleCard role={mockRole} />);
    expect(screen.getByText('PIC Gudang')).toBeInTheDocument();
    expect(screen.getByText('Warehouse staff responsible for document uploads')).toBeInTheDocument();
  });

  it('shows correct user count', () => {
    render(<RoleCard role={mockRole} />);
    expect(screen.getByText('8 users')).toBeInTheDocument();
  });

  it('displays permission badges correctly', () => {
    render(<RoleCard role={mockRole} />);

    // These permissions should be granted (green check)
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Upload')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();

    // Delete and Admin should be present but not granted
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('shows granted permissions with green styling', () => {
    render(<RoleCard role={mockRole} />);

    const viewBadge = screen.getByText('View').closest('[data-slot="badge"]');
    expect(viewBadge).toHaveClass('bg-green-100');
  });

  it('shows denied permissions with outline styling', () => {
    render(<RoleCard role={mockRole} />);

    const adminBadge = screen.getByText('Admin').closest('[data-slot="badge"]');
    expect(adminBadge).toHaveClass('text-gray-400');
  });

  it('shows edit button', () => {
    render(<RoleCard role={mockRole} />);
    expect(screen.getByLabelText('Edit PIC Gudang')).toBeInTheDocument();
  });
});
