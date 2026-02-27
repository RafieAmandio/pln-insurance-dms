import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const migrationsDir = path.resolve(__dirname, '../../../supabase/migrations');

describe('Database Schema', () => {
  it('migration files exist in correct order', () => {
    const files = fs.readdirSync(migrationsDir).sort();
    expect(files).toContain('00001_core_tables.sql');
    expect(files).toContain('00002_rls_policies.sql');
    expect(files).toContain('00003_fts_indonesian.sql');
    expect(files).toContain('00004_audit_auto_trigger.sql');
    expect(files).toContain('00005_storage_policies.sql');
  });

  describe('Core tables migration', () => {
    const sql = fs.readFileSync(path.join(migrationsDir, '00001_core_tables.sql'), 'utf8');

    it('defines all required enums', () => {
      expect(sql).toContain("CREATE TYPE app_role AS ENUM");
      expect(sql).toContain("'pic_gudang'");
      expect(sql).toContain("'pic_klaim'");
      expect(sql).toContain("'manager'");
      expect(sql).toContain("CREATE TYPE document_status AS ENUM");
      expect(sql).toContain("CREATE TYPE asset_type AS ENUM");
      expect(sql).toContain("CREATE TYPE batch_status AS ENUM");
      expect(sql).toContain("CREATE TYPE claim_status AS ENUM");
      expect(sql).toContain("CREATE TYPE audit_action AS ENUM");
    });

    it('creates all required tables', () => {
      expect(sql).toContain('CREATE TABLE profiles');
      expect(sql).toContain('CREATE TABLE documents');
      expect(sql).toContain('CREATE TABLE document_batches');
      expect(sql).toContain('CREATE TABLE claims');
      expect(sql).toContain('CREATE TABLE claim_documents');
      expect(sql).toContain('CREATE TABLE audit_logs');
    });

    it('documents table has OCR columns', () => {
      expect(sql).toContain('ocr_text');
      expect(sql).toContain('ocr_metadata');
      expect(sql).toContain('ocr_confidence');
      expect(sql).toContain('ocr_completed_at');
      expect(sql).toContain('search_vector TSVECTOR');
    });

    it('creates GIN index on search_vector', () => {
      expect(sql).toContain('USING GIN(search_vector)');
    });

    it('has audit log immutability trigger', () => {
      expect(sql).toContain('prevent_audit_modification');
      expect(sql).toContain("RAISE EXCEPTION 'Audit logs cannot be modified or deleted'");
    });

    it('has handle_new_user trigger', () => {
      expect(sql).toContain('handle_new_user');
      expect(sql).toContain('AFTER INSERT ON auth.users');
    });

    it('claim_documents has unique constraint', () => {
      expect(sql).toContain('UNIQUE(claim_id, document_id)');
    });
  });
});
