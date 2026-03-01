import type { Permission } from '@/lib/auth/permissions';

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  permission?: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { label: 'Document Ingestion', href: '/documents/upload', icon: 'Upload', permission: 'document:upload' },
  { label: 'OCR Validation', href: '/ocr-validation', icon: 'ScanSearch', permission: 'document:review' },
  { label: 'Search', href: '/search', icon: 'Search', permission: 'document:view' },
  { label: 'Documents', href: '/documents', icon: 'FileText', permission: 'document:view' },
  { label: 'Version Control', href: '/version-control', icon: 'GitBranch', permission: 'document:view' },
  { label: 'Access Control', href: '/access-control', icon: 'Shield', permission: 'user:manage' },
  { label: 'Warehouses', href: '/warehouses', icon: 'Warehouse', permission: 'document:view' },
  { label: 'Audit Trail', href: '/audit', icon: 'ScrollText', permission: 'audit:view' },
  { label: 'Admin Console', href: '/admin', icon: 'Settings', permission: 'user:manage' },
];
