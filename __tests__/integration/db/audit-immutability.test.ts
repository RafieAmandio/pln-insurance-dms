import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const coreSql = fs.readFileSync(
  path.resolve(__dirname, '../../../supabase/migrations/00001_core_tables.sql'),
  'utf8'
);

describe('Audit Log Immutability', () => {
  it('has a function that raises exception on modification', () => {
    expect(coreSql).toContain('prevent_audit_modification');
    expect(coreSql).toContain("RAISE EXCEPTION 'Audit logs cannot be modified or deleted'");
  });

  it('has UPDATE trigger on audit_logs', () => {
    expect(coreSql).toContain('BEFORE UPDATE ON audit_logs');
  });

  it('has DELETE trigger on audit_logs', () => {
    expect(coreSql).toContain('BEFORE DELETE ON audit_logs');
  });

  it('audit_logs table has no updated_at column (immutable)', () => {
    // Extract the CREATE TABLE audit_logs block
    const auditTableMatch = coreSql.match(/CREATE TABLE audit_logs \(([\s\S]*?)\);/);
    expect(auditTableMatch).not.toBeNull();
    const auditTableDef = auditTableMatch![1];
    expect(auditTableDef).not.toContain('updated_at');
    expect(auditTableDef).toContain('created_at');
  });
});
