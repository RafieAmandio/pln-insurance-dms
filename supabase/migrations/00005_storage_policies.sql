-- Migration 00005: Storage bucket and policies

-- Create the documents storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/tiff', 'application/pdf']
);

-- PIC Gudang, Manager, and Super Admin can upload files
CREATE POLICY storage_documents_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('pic_gudang', 'manager', 'super_admin')
  );

-- All authenticated users can read files
CREATE POLICY storage_documents_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents');
