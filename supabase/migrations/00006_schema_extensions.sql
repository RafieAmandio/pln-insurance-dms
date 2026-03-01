-- Phase 1: Schema Extensions for DMS v2

-- 1. Extend document_status enum
ALTER TYPE document_status ADD VALUE IF NOT EXISTS 'indexed';
ALTER TYPE document_status ADD VALUE IF NOT EXISTS 'processing';
ALTER TYPE document_status ADD VALUE IF NOT EXISTS 'failed';
ALTER TYPE document_status ADD VALUE IF NOT EXISTS 'ocr_review';

-- 2. Extend audit_action enum
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'permission_change';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'version_create';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'user_login';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'bulk_upload';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'validate';

-- 3. Extend app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'super_admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'document_control';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'operations';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'compliance';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'read_only';

-- 4. Create warehouses table
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_documents INTEGER NOT NULL DEFAULT 0,
  digitized_documents INTEGER NOT NULL DEFAULT 0,
  storage_size_bytes BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create document_versions table
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  description TEXT DEFAULT '',
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(document_id, version_number)
);

-- 6. Create roles table for dynamic role management
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name app_role NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  permissions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Add columns to documents table
ALTER TABLE documents ADD COLUMN IF NOT EXISTS warehouse_id UUID REFERENCES warehouses(id);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES profiles(id);
ALTER TABLE documents ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_documents_warehouse_id ON documents(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_documents_locked_by ON documents(locked_by);

-- 9. Updated_at triggers for new tables
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER warehouses_updated_at
  BEFORE UPDATE ON warehouses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 10. RLS policies
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Warehouses: all authenticated can read, only managers/super_admin can write
CREATE POLICY "warehouses_select" ON warehouses FOR SELECT TO authenticated USING (true);
CREATE POLICY "warehouses_insert" ON warehouses FOR INSERT TO authenticated WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'super_admin')
);
CREATE POLICY "warehouses_update" ON warehouses FOR UPDATE TO authenticated USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('manager', 'super_admin')
);

-- Document versions: all authenticated can read, authenticated can insert
CREATE POLICY "document_versions_select" ON document_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "document_versions_insert" ON document_versions FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

-- Roles: all authenticated can read, only super_admin can modify
CREATE POLICY "roles_select" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "roles_insert" ON roles FOR INSERT TO authenticated WITH CHECK (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
CREATE POLICY "roles_update" ON roles FOR UPDATE TO authenticated USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- 11. Seed roles table
INSERT INTO roles (name, display_name, description, permissions) VALUES
  ('super_admin', 'Super Admin', 'Full system access including configuration', ARRAY['document:upload','document:view','document:edit','document:download','document:review','document:approve','document:archive','document:delete','claim:create','claim:view','claim:edit','claim:link_document','audit:view','audit:view_global','user:manage']),
  ('document_control', 'Document Control', 'Upload, index, and validate documents', ARRAY['document:upload','document:view','document:edit','document:download','document:review','claim:view','audit:view']),
  ('operations', 'Operations', 'Search, view, and download permitted documents', ARRAY['document:view','document:download','claim:view','audit:view']),
  ('compliance', 'Compliance', 'View all documents and audit trails', ARRAY['document:view','document:download','audit:view','audit:view_global']),
  ('read_only', 'Read Only', 'View-only access to assigned documents', ARRAY['document:view']),
  ('manager', 'Manager', 'Full document and user management', ARRAY['document:view','document:edit','document:download','document:review','document:approve','document:archive','document:delete','claim:create','claim:view','claim:edit','claim:link_document','audit:view','audit:view_global','user:manage']),
  ('pic_gudang', 'PIC Gudang', 'Warehouse document officer', ARRAY['document:upload','document:view','document:edit','document:download','claim:view','audit:view']),
  ('pic_klaim', 'PIC Klaim', 'Claims processing officer', ARRAY['document:view','document:download','document:review','claim:create','claim:view','claim:edit','claim:link_document','audit:view'])
ON CONFLICT (name) DO NOTHING;
