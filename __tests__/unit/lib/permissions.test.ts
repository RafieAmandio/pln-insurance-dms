import { describe, it, expect } from 'vitest';
import { hasPermission, getPermissions, ROLE_PERMISSIONS } from '@/lib/auth/permissions';
import type { AppRole } from '@/lib/auth/roles';

describe('Permissions', () => {
  describe('PIC Gudang', () => {
    const role: AppRole = 'pic_gudang';

    it('can upload documents', () => {
      expect(hasPermission(role, 'document:upload')).toBe(true);
    });

    it('can view documents', () => {
      expect(hasPermission(role, 'document:view')).toBe(true);
    });

    it('can edit documents', () => {
      expect(hasPermission(role, 'document:edit')).toBe(true);
    });

    it('can download documents', () => {
      expect(hasPermission(role, 'document:download')).toBe(true);
    });

    it('cannot review documents', () => {
      expect(hasPermission(role, 'document:review')).toBe(false);
    });

    it('cannot approve documents', () => {
      expect(hasPermission(role, 'document:approve')).toBe(false);
    });

    it('cannot create claims', () => {
      expect(hasPermission(role, 'claim:create')).toBe(false);
    });

    it('cannot manage users', () => {
      expect(hasPermission(role, 'user:manage')).toBe(false);
    });
  });

  describe('PIC Klaim', () => {
    const role: AppRole = 'pic_klaim';

    it('cannot upload documents', () => {
      expect(hasPermission(role, 'document:upload')).toBe(false);
    });

    it('can review documents', () => {
      expect(hasPermission(role, 'document:review')).toBe(true);
    });

    it('cannot approve documents', () => {
      expect(hasPermission(role, 'document:approve')).toBe(false);
    });

    it('can create claims', () => {
      expect(hasPermission(role, 'claim:create')).toBe(true);
    });

    it('can link documents to claims', () => {
      expect(hasPermission(role, 'claim:link_document')).toBe(true);
    });

    it('cannot view global audit', () => {
      expect(hasPermission(role, 'audit:view_global')).toBe(false);
    });
  });

  describe('Manager', () => {
    const role: AppRole = 'manager';

    it('can approve documents', () => {
      expect(hasPermission(role, 'document:approve')).toBe(true);
    });

    it('can archive documents', () => {
      expect(hasPermission(role, 'document:archive')).toBe(true);
    });

    it('can view global audit', () => {
      expect(hasPermission(role, 'audit:view_global')).toBe(true);
    });

    it('can manage users', () => {
      expect(hasPermission(role, 'user:manage')).toBe(true);
    });

    it('can create claims', () => {
      expect(hasPermission(role, 'claim:create')).toBe(true);
    });
  });

  describe('getPermissions', () => {
    it('returns correct permissions for each role', () => {
      expect(getPermissions('pic_gudang')).toEqual(ROLE_PERMISSIONS.pic_gudang);
      expect(getPermissions('pic_klaim')).toEqual(ROLE_PERMISSIONS.pic_klaim);
      expect(getPermissions('manager')).toEqual(ROLE_PERMISSIONS.manager);
    });
  });
});
