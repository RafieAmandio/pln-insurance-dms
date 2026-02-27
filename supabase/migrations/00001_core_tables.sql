-- Migration 00001: Core Tables

-- Enums
CREATE TYPE app_role AS ENUM ('pic_gudang', 'pic_klaim', 'manager');
CREATE TYPE document_status AS ENUM ('draft', 'reviewed', 'approved', 'archived');
CREATE TYPE asset_type AS ENUM ('policy', 'claim', 'endorsement', 'invoice', 'correspondence', 'photo', 'report', 'other');
CREATE TYPE batch_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE claim_status AS ENUM ('open', 'in_review', 'approved', 'denied', 'closed');
CREATE TYPE audit_action AS ENUM (
  'upload', 'view', 'download', 'edit', 'delete',
  'status_change', 'ocr_complete', 'link_claim', 'unlink_claim',
  'review', 'approve', 'reject', 'archive'
);

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role app_role NOT NULL DEFAULT 'pic_gudang',
  department TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status document_status NOT NULL DEFAULT 'draft',
  asset_type asset_type NOT NULL DEFAULT 'other',
  policy_number TEXT DEFAULT '',
  claim_number TEXT DEFAULT '',
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL,
  file_hash TEXT DEFAULT '',
  page_count INTEGER DEFAULT 0,
  ocr_text TEXT DEFAULT '',
  ocr_metadata JSONB DEFAULT '{}',
  ocr_confidence REAL DEFAULT 0,
  ocr_completed_at TIMESTAMPTZ,
  search_vector TSVECTOR,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  reviewed_by UUID REFERENCES profiles(id),
  approved_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  batch_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Document Batches
CREATE TABLE document_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  total_files INTEGER NOT NULL DEFAULT 0,
  processed_files INTEGER NOT NULL DEFAULT 0,
  failed_files INTEGER NOT NULL DEFAULT 0,
  status batch_status NOT NULL DEFAULT 'pending',
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add batch foreign key to documents
ALTER TABLE documents ADD CONSTRAINT fk_documents_batch
  FOREIGN KEY (batch_id) REFERENCES document_batches(id);

-- Claims
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number TEXT NOT NULL UNIQUE,
  policy_number TEXT NOT NULL DEFAULT '',
  claimant_name TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  claim_date DATE,
  status claim_status NOT NULL DEFAULT 'open',
  amount NUMERIC(15, 2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'IDR',
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Claim-Document link table
CREATE TABLE claim_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  linked_by UUID NOT NULL REFERENCES profiles(id),
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT DEFAULT '',
  UNIQUE(claim_id, document_id)
);

-- Audit Logs (immutable)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id),
  claim_id UUID REFERENCES claims(id),
  action audit_action NOT NULL,
  actor_id UUID NOT NULL REFERENCES profiles(id),
  actor_email TEXT NOT NULL DEFAULT '',
  actor_role app_role,
  old_status TEXT,
  new_status TEXT,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_asset_type ON documents(asset_type);
CREATE INDEX idx_documents_policy_number ON documents(policy_number);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_search_vector ON documents USING GIN(search_vector);
CREATE INDEX idx_documents_batch_id ON documents(batch_id);
CREATE INDEX idx_claims_claim_number ON claims(claim_number);
CREATE INDEX idx_claims_policy_number ON claims(policy_number);
CREATE INDEX idx_audit_logs_document_id ON audit_logs(document_id);
CREATE INDEX idx_audit_logs_claim_id ON audit_logs(claim_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Triggers

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_batches_updated_at
  BEFORE UPDATE ON document_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Prevent audit log modification
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_update
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER prevent_audit_delete
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
