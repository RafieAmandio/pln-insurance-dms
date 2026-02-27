import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const rlsSql = fs.readFileSync(
  path.resolve(__dirname, '../../../supabase/migrations/00002_rls_policies.sql'),
  'utf8'
);

describe('RLS Policies', () => {
  it('enables RLS on all tables', () => {
    expect(rlsSql).toContain('ALTER TABLE profiles ENABLE ROW LEVEL SECURITY');
    expect(rlsSql).toContain('ALTER TABLE documents ENABLE ROW LEVEL SECURITY');
    expect(rlsSql).toContain('ALTER TABLE document_batches ENABLE ROW LEVEL SECURITY');
    expect(rlsSql).toContain('ALTER TABLE claims ENABLE ROW LEVEL SECURITY');
    expect(rlsSql).toContain('ALTER TABLE claim_documents ENABLE ROW LEVEL SECURITY');
    expect(rlsSql).toContain('ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY');
  });

  it('defines get_user_role helper function', () => {
    expect(rlsSql).toContain('CREATE OR REPLACE FUNCTION get_user_role()');
    expect(rlsSql).toContain('RETURNS app_role');
  });

  describe('Document policies', () => {
    it('all authenticated can SELECT documents', () => {
      expect(rlsSql).toContain('documents_select');
      expect(rlsSql).toContain('FOR SELECT TO authenticated');
    });

    it('only pic_gudang can INSERT documents', () => {
      expect(rlsSql).toContain('documents_insert_gudang');
      expect(rlsSql).toContain("get_user_role() = 'pic_gudang'");
    });

    it('pic_gudang can only update own drafts', () => {
      expect(rlsSql).toContain('documents_update_gudang');
      expect(rlsSql).toContain("status = 'draft'");
    });

    it('pic_klaim can update draft/reviewed', () => {
      expect(rlsSql).toContain('documents_update_klaim');
    });

    it('manager can update all documents', () => {
      expect(rlsSql).toContain('documents_update_manager');
    });
  });

  describe('Audit log policies', () => {
    it('all authenticated can SELECT and INSERT audit logs', () => {
      expect(rlsSql).toContain('audit_logs_select');
      expect(rlsSql).toContain('audit_logs_insert');
    });

    it('does NOT define UPDATE or DELETE policies for audit_logs', () => {
      // No update/delete policies should exist for audit_logs
      const auditSection = rlsSql.split('AUDIT LOGS')[1];
      expect(auditSection).not.toContain('FOR UPDATE');
      expect(auditSection).not.toContain('FOR DELETE');
    });
  });

  describe('Claims policies', () => {
    it('pic_klaim and manager can create claims', () => {
      expect(rlsSql).toContain('claims_insert');
      expect(rlsSql).toContain("get_user_role() IN ('pic_klaim', 'manager')");
    });
  });
});
