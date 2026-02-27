-- Migration 00002: Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS app_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ==================== PROFILES ====================

-- All authenticated users can view profiles
CREATE POLICY profiles_select ON profiles
  FOR SELECT TO authenticated
  USING (true);

-- Users can update their own profile (except role)
CREATE POLICY profiles_update_self ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Managers can update any profile
CREATE POLICY profiles_update_manager ON profiles
  FOR UPDATE TO authenticated
  USING (get_user_role() = 'manager')
  WITH CHECK (get_user_role() = 'manager');

-- ==================== DOCUMENTS ====================

-- All authenticated users can view documents
CREATE POLICY documents_select ON documents
  FOR SELECT TO authenticated
  USING (true);

-- PIC Gudang can upload (insert) documents
CREATE POLICY documents_insert_gudang ON documents
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() = 'pic_gudang'
    AND uploaded_by = auth.uid()
  );

-- PIC Gudang can update own drafts
CREATE POLICY documents_update_gudang ON documents
  FOR UPDATE TO authenticated
  USING (
    get_user_role() = 'pic_gudang'
    AND uploaded_by = auth.uid()
    AND status = 'draft'
  )
  WITH CHECK (
    get_user_role() = 'pic_gudang'
    AND uploaded_by = auth.uid()
  );

-- PIC Klaim can update draft/reviewed documents
CREATE POLICY documents_update_klaim ON documents
  FOR UPDATE TO authenticated
  USING (
    get_user_role() = 'pic_klaim'
    AND status IN ('draft', 'reviewed')
  )
  WITH CHECK (get_user_role() = 'pic_klaim');

-- Manager can update all documents
CREATE POLICY documents_update_manager ON documents
  FOR UPDATE TO authenticated
  USING (get_user_role() = 'manager')
  WITH CHECK (get_user_role() = 'manager');

-- ==================== DOCUMENT BATCHES ====================

-- All authenticated can view batches
CREATE POLICY batches_select ON document_batches
  FOR SELECT TO authenticated
  USING (true);

-- PIC Gudang can create batches
CREATE POLICY batches_insert_gudang ON document_batches
  FOR INSERT TO authenticated
  WITH CHECK (
    get_user_role() = 'pic_gudang'
    AND uploaded_by = auth.uid()
  );

-- Users can update their own batches
CREATE POLICY batches_update_own ON document_batches
  FOR UPDATE TO authenticated
  USING (uploaded_by = auth.uid())
  WITH CHECK (uploaded_by = auth.uid());

-- ==================== CLAIMS ====================

-- All authenticated can view claims
CREATE POLICY claims_select ON claims
  FOR SELECT TO authenticated
  USING (true);

-- PIC Klaim and Manager can create claims
CREATE POLICY claims_insert ON claims
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('pic_klaim', 'manager'));

-- PIC Klaim and Manager can update claims
CREATE POLICY claims_update ON claims
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('pic_klaim', 'manager'))
  WITH CHECK (get_user_role() IN ('pic_klaim', 'manager'));

-- ==================== CLAIM DOCUMENTS ====================

-- All authenticated can view claim-document links
CREATE POLICY claim_documents_select ON claim_documents
  FOR SELECT TO authenticated
  USING (true);

-- PIC Klaim and Manager can link documents to claims
CREATE POLICY claim_documents_insert ON claim_documents
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('pic_klaim', 'manager'));

-- ==================== AUDIT LOGS ====================

-- All authenticated can view audit logs
CREATE POLICY audit_logs_select ON audit_logs
  FOR SELECT TO authenticated
  USING (true);

-- All authenticated can insert audit logs
CREATE POLICY audit_logs_insert ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);
