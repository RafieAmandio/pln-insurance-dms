import type { Permission } from '@/lib/auth/permissions';

export interface NavItem {
  label: string;
  href: string;
  permission?: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/' },
  { label: 'Documents', href: '/documents' },
  { label: 'Upload', href: '/documents/upload', permission: 'document:upload' },
  { label: 'Review Queue', href: '/review', permission: 'document:review' },
  { label: 'Approval Queue', href: '/approval', permission: 'document:approve' },
  { label: 'Claims', href: '/claims', permission: 'claim:view' },
  { label: 'Audit Log', href: '/audit', permission: 'audit:view_global' },
];
