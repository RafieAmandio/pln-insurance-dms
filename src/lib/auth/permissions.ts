import type { AppRole } from './roles';

export const PERMISSIONS = [
  'document:upload',
  'document:view',
  'document:edit',
  'document:download',
  'document:review',
  'document:approve',
  'document:archive',
  'document:delete',
  'claim:create',
  'claim:view',
  'claim:edit',
  'claim:link_document',
  'audit:view',
  'audit:view_global',
  'user:manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<AppRole, readonly Permission[]> = {
  pic_gudang: [
    'document:upload',
    'document:view',
    'document:edit',
    'document:download',
    'claim:view',
    'audit:view',
  ],
  pic_klaim: [
    'document:view',
    'document:download',
    'document:review',
    'claim:create',
    'claim:view',
    'claim:edit',
    'claim:link_document',
    'audit:view',
  ],
  manager: [
    'document:view',
    'document:download',
    'document:review',
    'document:approve',
    'document:archive',
    'document:delete',
    'claim:create',
    'claim:view',
    'claim:edit',
    'claim:link_document',
    'audit:view',
    'audit:view_global',
    'user:manage',
  ],
};

export function hasPermission(role: AppRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function getPermissions(role: AppRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}
