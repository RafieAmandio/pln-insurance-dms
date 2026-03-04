-- =============================================================================
-- PLN Insurance DMS — Full Seed Data (matching lofi prototype)
-- =============================================================================
-- Run with: supabase db reset (applies migrations + seed)
-- Or manually: psql -f supabase/seed.sql
--
-- NOTE: This seed creates auth users + profiles + all demo data.
-- Auth test credentials:
--   gudang@pln.co.id / password123     (pic_gudang)
--   klaim@pln.co.id  / password123     (pic_klaim)
--   manager@pln.co.id / password123    (manager)
--   budi.santoso@pln-insurance.co.id / password123 (document_control)
--   sari.dewi@pln-insurance.co.id / password123    (operations)
--   andi.wijaya@pln-insurance.co.id / password123  (document_control)
--   rina.mariani@pln-insurance.co.id / password123 (compliance)
--   hendra.kusuma@pln-insurance.co.id / password123 (super_admin)
--   fitri.handayani@pln-insurance.co.id / password123 (read_only, inactive)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. AUTH USERS (required before profiles due to FK constraint)
-- ---------------------------------------------------------------------------
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, recovery_token,
  email_change_token_new, email_change, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at
) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'budi.santoso@pln-insurance.co.id', crypt('password123', gen_salt('bf')),
   now(), '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'sari.dewi@pln-insurance.co.id', crypt('password123', gen_salt('bf')),
   now(), '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, now(), now()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'andi.wijaya@pln-insurance.co.id', crypt('password123', gen_salt('bf')),
   now(), '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, now(), now()),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'rina.mariani@pln-insurance.co.id', crypt('password123', gen_salt('bf')),
   now(), '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, now(), now()),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'hendra.kusuma@pln-insurance.co.id', crypt('password123', gen_salt('bf')),
   now(), '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, now(), now()),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'fitri.handayani@pln-insurance.co.id', crypt('password123', gen_salt('bf')),
   now(), '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, now(), now()),
  -- Auth test users
  ('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'gudang@pln.co.id', crypt('password123', gen_salt('bf')),
   now(), '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, now(), now()),
  ('b2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'klaim@pln.co.id', crypt('password123', gen_salt('bf')),
   now(), '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, now(), now()),
  ('c3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'manager@pln.co.id', crypt('password123', gen_salt('bf')),
   now(), '', '', '', '', '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Auth identities (required by GoTrue)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
SELECT id, id, email, jsonb_build_object('sub', id::text, 'email', email), 'email', now(), now(), now()
FROM auth.users
WHERE id IN (
  '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006',
  'a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222',
  'c3333333-3333-3333-3333-333333333333'
)
ON CONFLICT (provider_id, provider) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 1. PROFILES (Users)
-- ---------------------------------------------------------------------------
INSERT INTO profiles (id, email, full_name, role, department, is_active) VALUES
  ('00000000-0000-0000-0000-000000000001', 'budi.santoso@pln-insurance.co.id', 'Budi Santoso', 'document_control', 'Document Control', true),
  ('00000000-0000-0000-0000-000000000002', 'sari.dewi@pln-insurance.co.id', 'Sari Dewi', 'operations', 'Operations', true),
  ('00000000-0000-0000-0000-000000000003', 'andi.wijaya@pln-insurance.co.id', 'Andi Wijaya', 'document_control', 'Document Control', true),
  ('00000000-0000-0000-0000-000000000004', 'rina.mariani@pln-insurance.co.id', 'Rina Mariani', 'compliance', 'Compliance', true),
  ('00000000-0000-0000-0000-000000000005', 'hendra.kusuma@pln-insurance.co.id', 'Hendra Kusuma', 'super_admin', 'IT Admin', true),
  ('00000000-0000-0000-0000-000000000006', 'fitri.handayani@pln-insurance.co.id', 'Fitri Handayani', 'read_only', 'General', false),
  ('a1111111-1111-1111-1111-111111111111', 'gudang@pln.co.id', 'PIC Gudang User', 'pic_gudang', 'Gudang Arsip', true),
  ('b2222222-2222-2222-2222-222222222222', 'klaim@pln.co.id', 'PIC Klaim User', 'pic_klaim', 'Klaim', true),
  ('c3333333-3333-3333-3333-333333333333', 'manager@pln.co.id', 'Manager User', 'manager', 'Manajemen', true)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  is_active = EXCLUDED.is_active;

-- ---------------------------------------------------------------------------
-- 2. WAREHOUSES
-- ---------------------------------------------------------------------------
INSERT INTO warehouses (id, name, address, is_active, total_documents, digitized_documents, storage_size_bytes) VALUES
  ('00000000-0000-0000-0000-aaaaaaaaa001', 'Bekasi-A', 'Jl. Industri Raya, Bekasi', true, 42500, 38200, 2638827906560),
  ('00000000-0000-0000-0000-aaaaaaaaa002', 'Bekasi-C', 'Jl. Raya Narogong, Bekasi', true, 31200, 24960, 1978685030400),
  ('00000000-0000-0000-0000-aaaaaaaaa003', 'Karawang-A', 'Jl. Tuparev, Karawang', true, 28700, 27265, 1759218604032),
  ('00000000-0000-0000-0000-aaaaaaaaa004', 'Karawang-B', 'Jl. Galuh Mas, Karawang', true, 22432, 15700, 1209462790144)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  is_active = EXCLUDED.is_active,
  total_documents = EXCLUDED.total_documents,
  digitized_documents = EXCLUDED.digitized_documents,
  storage_size_bytes = EXCLUDED.storage_size_bytes;

-- ---------------------------------------------------------------------------
-- 3. DOCUMENTS (matching lofi prototype data)
-- ---------------------------------------------------------------------------
INSERT INTO documents (
  id, title, description, status, asset_type, policy_number, file_path, file_name,
  file_size, mime_type, page_count, ocr_text, ocr_metadata, ocr_confidence,
  ocr_completed_at, tags, uploaded_by, warehouse_id, version, locked_by, locked_at
) VALUES
  -- Fire Insurance Policy (locked by Budi, v3, indexed)
  (
    '00000000-0000-0000-0000-bbbbbbbb0001',
    'Fire Insurance Policy',
    'Fire & Allied Perils coverage for PT Pembangkit Jawa Bali',
    'indexed', 'policy', 'POL-FI-2023-04521',
    'documents/pol-fi-2023-04521.pdf', 'POL-FI-2023-04521.pdf',
    2516582, 'application/pdf', 4,
    'Fire Insurance Policy POL-FI-2023-04521 PT Pembangkit Jawa Bali',
    '{"field_confidences": [
      {"field_name": "policy_number", "value": "POL-FI-2023-04521", "confidence": 98, "approved": true},
      {"field_name": "policyholder", "value": "PT Pembangkit Jawa Bali", "confidence": 94, "approved": true},
      {"field_name": "effective_date", "value": "2023-03-15", "confidence": 91, "approved": true},
      {"field_name": "expiry_date", "value": "2024-03-14", "confidence": 89, "approved": true},
      {"field_name": "sum_insured", "value": "Rp 125,000,000,000", "confidence": 85, "approved": true},
      {"field_name": "premium", "value": "Rp 312,500,000", "confidence": 78, "approved": true},
      {"field_name": "coverage_type", "value": "Fire & Allied Perils", "confidence": 96, "approved": true},
      {"field_name": "property_address", "value": "Jl. Raya Muara Karang, Jakarta", "confidence": 72, "approved": true}
    ]}'::jsonb,
    92, '2024-01-15 14:32:00+07',
    ARRAY['fire', 'jawa-bali'],
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-aaaaaaaaa001',
    3,
    '00000000-0000-0000-0000-000000000001',
    '2024-01-15 14:32:00+07'
  ),

  -- Marine Cargo Policy (OCR review, v1)
  (
    '00000000-0000-0000-0000-bbbbbbbb0002',
    'Marine Cargo Policy',
    'Marine cargo coverage for PT PLN Batubara',
    'ocr_review', 'policy', 'POL-MC-2024-00234',
    'documents/pol-mc-2024-00234.pdf', 'POL-MC-2024-00234.pdf',
    1887437, 'application/pdf', 3,
    'Marine Cargo Policy POL-MC-2024-00234 PT PLN Batubara',
    '{"field_confidences": [
      {"field_name": "policy_number", "value": "POL-MC-2023-08832", "confidence": 95, "approved": false},
      {"field_name": "policyholder", "value": "PT PLN Batubara", "confidence": 88, "approved": false},
      {"field_name": "effective_date", "value": "2023-06-01", "confidence": 82, "approved": false},
      {"field_name": "sum_insured", "value": "Rp 50,000,000,000", "confidence": 80, "approved": false}
    ]}'::jsonb,
    87, '2024-02-01 11:20:00+07',
    ARRAY['marine', 'batubara'],
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-aaaaaaaaa004',
    1, NULL, NULL
  ),

  -- Motor Vehicle Policy (ocr_review, v2)
  (
    '00000000-0000-0000-0000-bbbbbbbb0003',
    'Motor Vehicle Policy',
    'Motor vehicle coverage for PT Indonesia Power',
    'ocr_review', 'policy', 'POL-MV-2024-00112',
    'documents/pol-mv-2024-00112.pdf', 'POL-MV-2024-00112.pdf',
    3250586, 'application/pdf', 2,
    'Motor Vehicle Policy POL-MV-2024-00112 PT Indonesia Power',
    '{"field_confidences": [
      {"field_name": "policy_number", "value": "POL-MV-2024-00112", "confidence": 92, "approved": false},
      {"field_name": "policyholder", "value": "PT Indonesia Power", "confidence": 75, "approved": false},
      {"field_name": "sum_insured", "value": "Rp 850,000,000", "confidence": 55, "approved": false}
    ]}'::jsonb,
    68, '2024-01-28 16:40:00+07',
    ARRAY['motor', 'vehicle'],
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-aaaaaaaaa002',
    2, NULL, NULL
  ),

  -- Property All Risk Policy (indexed, v5)
  (
    '00000000-0000-0000-0000-bbbbbbbb0004',
    'Property All Risk Policy',
    'Comprehensive property coverage',
    'indexed', 'policy', 'POL-PAR-2022-11200',
    'documents/pol-par-2022-11200.pdf', 'POL-PAR-2022-11200.pdf',
    4404019, 'application/pdf', 6,
    'Property All Risk Policy POL-PAR-2022-11200',
    '{"field_confidences": [
      {"field_name": "policy_number", "value": "POL-PAR-2022-11200", "confidence": 40, "approved": false},
      {"field_name": "policyholder", "value": "PT PLN Persero", "confidence": 35, "approved": false},
      {"field_name": "sum_insured", "value": "Rp 500,000,000,000", "confidence": 20, "approved": false}
    ]}'::jsonb,
    45, '2023-11-20 08:30:00+07',
    ARRAY['property', 'all-risk'],
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-aaaaaaaaa003',
    5, NULL, NULL
  ),

  -- Liability Insurance (processing, v1)
  (
    '00000000-0000-0000-0000-bbbbbbbb0005',
    'Liability Insurance',
    'General liability coverage for PT PLN Nusantara Power',
    'processing', 'policy', 'POL-LI-2024-00045',
    'documents/pol-li-2024-00045.pdf', 'POL-LI-2024-00045.pdf',
    1572864, 'application/pdf', 3,
    '',
    '{}'::jsonb,
    0, NULL,
    ARRAY['liability'],
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-aaaaaaaaa001',
    1, NULL, NULL
  ),

  -- Fire Insurance Endorsement (indexed, v2)
  (
    '00000000-0000-0000-0000-bbbbbbbb0006',
    'Fire Insurance Endorsement',
    'Endorsement to fire insurance POL-FI-2023-03890',
    'indexed', 'endorsement', 'POL-FI-2023-03890',
    'documents/pol-fi-2023-03890.pdf', 'POL-FI-2023-03890.pdf',
    943718, 'application/pdf', 2,
    'Fire Insurance Endorsement POL-FI-2023-03890',
    '{"field_confidences": [
      {"field_name": "policy_number", "value": "POL-FI-2023-03890", "confidence": 97, "approved": true},
      {"field_name": "policyholder", "value": "PT PLN Energi Primer", "confidence": 93, "approved": true}
    ]}'::jsonb,
    95, '2023-09-14 10:15:00+07',
    ARRAY['fire', 'endorsement'],
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-aaaaaaaaa001',
    2, NULL, NULL
  ),

  -- Marine Hull Policy (indexed, v4)
  (
    '00000000-0000-0000-0000-bbbbbbbb0007',
    'Marine Hull Policy',
    'Marine hull coverage',
    'indexed', 'policy', 'POL-MC-2023-08712',
    'documents/pol-mc-2023-08712.pdf', 'POL-MC-2023-08712.pdf',
    2831155, 'application/pdf', 4,
    'Marine Hull Policy POL-MC-2023-08712',
    '{"field_confidences": [
      {"field_name": "policy_number", "value": "POL-MC-2023-08712", "confidence": 96, "approved": true},
      {"field_name": "policyholder", "value": "PT PLN Batubara", "confidence": 91, "approved": true}
    ]}'::jsonb,
    93, '2023-07-22 15:30:00+07',
    ARRAY['marine', 'hull'],
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-aaaaaaaaa004',
    4, NULL, NULL
  ),

  -- Personal Accident Policy (failed, v1)
  (
    '00000000-0000-0000-0000-bbbbbbbb0008',
    'Personal Accident Policy',
    'Personal accident coverage',
    'failed', 'policy', 'POL-PA-2024-00301',
    'documents/pol-pa-2024-00301.pdf', 'POL-PA-2024-00301.pdf',
    1258291, 'application/pdf', 2,
    '',
    '{}'::jsonb,
    0, NULL,
    ARRAY['personal', 'accident'],
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-aaaaaaaaa003',
    1, NULL, NULL
  ),

  -- Liability Policy for OCR queue
  (
    '00000000-0000-0000-0000-bbbbbbbb0009',
    'Liability Policy',
    'Liability coverage for PT PLN Nusantara Power',
    'ocr_review', 'policy', 'POL-LI-2023-06677',
    'documents/pol-li-2023-06677.pdf', 'POL-LI-2023-06677.pdf',
    1887437, 'application/pdf', 3,
    'Liability Policy POL-LI-2023-06677 PT PLN Nusantara Power',
    '{"field_confidences": [
      {"field_name": "policy_number", "value": "POL-LI-2023-06677", "confidence": 97, "approved": false},
      {"field_name": "policyholder", "value": "PT PLN Nusantara Power", "confidence": 93, "approved": false},
      {"field_name": "sum_insured", "value": "Rp 200,000,000,000", "confidence": 88, "approved": false}
    ]}'::jsonb,
    91, '2023-12-15 09:50:00+07',
    ARRAY['liability'],
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-aaaaaaaaa001',
    1, NULL, NULL
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  status = EXCLUDED.status,
  ocr_metadata = EXCLUDED.ocr_metadata,
  ocr_confidence = EXCLUDED.ocr_confidence,
  warehouse_id = EXCLUDED.warehouse_id,
  version = EXCLUDED.version,
  locked_by = EXCLUDED.locked_by;

-- ---------------------------------------------------------------------------
-- 4. DOCUMENT VERSIONS (matching lofi version control data)
-- ---------------------------------------------------------------------------

-- Fire Insurance Policy versions (3 versions)
INSERT INTO document_versions (id, document_id, version_number, description, file_path, file_size, created_by, created_at) VALUES
  ('00000000-0000-0000-0000-cccccccc0001', '00000000-0000-0000-0000-bbbbbbbb0001', 1, 'Initial OCR ingestion', 'documents/pol-fi-2023-04521_v1.pdf', 2202009, '00000000-0000-0000-0000-000000000001', '2024-01-08 16:40:00+07'),
  ('00000000-0000-0000-0000-cccccccc0002', '00000000-0000-0000-0000-bbbbbbbb0001', 2, 'Updated beneficiary information', 'documents/pol-fi-2023-04521_v2.pdf', 2411724, '00000000-0000-0000-0000-000000000002', '2024-01-10 09:15:00+07'),
  ('00000000-0000-0000-0000-cccccccc0003', '00000000-0000-0000-0000-bbbbbbbb0001', 3, 'OCR correction on clause 4.2', 'documents/pol-fi-2023-04521_v3.pdf', 2516582, '00000000-0000-0000-0000-000000000001', '2024-01-15 14:32:00+07')
ON CONFLICT (document_id, version_number) DO NOTHING;

-- Property All Risk Policy versions (5 versions)
INSERT INTO document_versions (id, document_id, version_number, description, file_path, file_size, created_by, created_at) VALUES
  ('00000000-0000-0000-0000-cccccccc0004', '00000000-0000-0000-0000-bbbbbbbb0004', 1, 'Initial OCR ingestion', 'documents/pol-par-2022-11200_v1.pdf', 3670016, '00000000-0000-0000-0000-000000000001', '2023-03-05 16:15:00+07'),
  ('00000000-0000-0000-0000-cccccccc0005', '00000000-0000-0000-0000-bbbbbbbb0004', 2, 'Corrected policy holder name', 'documents/pol-par-2022-11200_v2.pdf', 3984588, '00000000-0000-0000-0000-000000000001', '2023-06-10 08:30:00+07'),
  ('00000000-0000-0000-0000-cccccccc0006', '00000000-0000-0000-0000-bbbbbbbb0004', 3, 'Coverage extension', 'documents/pol-par-2022-11200_v3.pdf', 4089446, '00000000-0000-0000-0000-000000000002', '2023-09-22 14:45:00+07'),
  ('00000000-0000-0000-0000-cccccccc0007', '00000000-0000-0000-0000-bbbbbbbb0004', 4, 'Premium adjustment', 'documents/pol-par-2022-11200_v4.pdf', 4299161, '00000000-0000-0000-0000-000000000003', '2023-12-15 10:00:00+07'),
  ('00000000-0000-0000-0000-cccccccc0008', '00000000-0000-0000-0000-bbbbbbbb0004', 5, 'Annual endorsement update', 'documents/pol-par-2022-11200_v5.pdf', 4404019, '00000000-0000-0000-0000-000000000003', '2024-02-01 11:20:00+07')
ON CONFLICT (document_id, version_number) DO NOTHING;

-- Marine Hull Policy versions (4 versions)
INSERT INTO document_versions (id, document_id, version_number, description, file_path, file_size, created_by, created_at) VALUES
  ('00000000-0000-0000-0000-cccccccc0009', '00000000-0000-0000-0000-bbbbbbbb0007', 1, 'Initial OCR ingestion', 'documents/pol-mc-2023-08712_v1.pdf', 2516582, '00000000-0000-0000-0000-000000000001', '2023-07-22 15:30:00+07'),
  ('00000000-0000-0000-0000-cccccccc0010', '00000000-0000-0000-0000-bbbbbbbb0007', 2, 'Route amendment', 'documents/pol-mc-2023-08712_v2.pdf', 2621440, '00000000-0000-0000-0000-000000000002', '2023-08-14 10:10:00+07'),
  ('00000000-0000-0000-0000-cccccccc0011', '00000000-0000-0000-0000-bbbbbbbb0007', 3, 'Vessel details correction', 'documents/pol-mc-2023-08712_v3.pdf', 2726297, '00000000-0000-0000-0000-000000000001', '2023-11-08 13:25:00+07'),
  ('00000000-0000-0000-0000-cccccccc0012', '00000000-0000-0000-0000-bbbbbbbb0007', 4, 'Compliance review update', 'documents/pol-mc-2023-08712_v4.pdf', 2831155, '00000000-0000-0000-0000-000000000004', '2024-01-20 09:50:00+07')
ON CONFLICT (document_id, version_number) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 5. AUDIT LOGS (matching lofi prototype activity log)
-- ---------------------------------------------------------------------------
-- Note: audit_logs has immutability triggers, so we only insert if empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM audit_logs LIMIT 1) THEN
    INSERT INTO audit_logs (action, actor_id, actor_email, actor_role, document_id, details, created_at) VALUES
      ('view', '00000000-0000-0000-0000-000000000001', 'budi.santoso@pln-insurance.co.id', 'document_control', '00000000-0000-0000-0000-bbbbbbbb0001', '{"target": "POL-FI-2023-04521"}'::jsonb, now() - interval '2 minutes'),
      ('upload', '00000000-0000-0000-0000-000000000002', 'sari.dewi@pln-insurance.co.id', 'operations', '00000000-0000-0000-0000-bbbbbbbb0002', '{"target": "POL-MC-2024-00234"}'::jsonb, now() - interval '15 minutes'),
      ('validate', '00000000-0000-0000-0000-000000000003', 'andi.wijaya@pln-insurance.co.id', 'document_control', '00000000-0000-0000-0000-bbbbbbbb0003', '{"target": "POL-MV-2024-00112", "validation_action": "approve"}'::jsonb, now() - interval '32 minutes'),
      ('permission_change', '00000000-0000-0000-0000-000000000005', 'hendra.kusuma@pln-insurance.co.id', 'super_admin', NULL, '{"target": "Role: Operations", "change": "Updated permissions"}'::jsonb, now() - interval '1 hour'),
      ('download', '00000000-0000-0000-0000-000000000004', 'rina.mariani@pln-insurance.co.id', 'compliance', '00000000-0000-0000-0000-bbbbbbbb0004', '{"target": "POL-PAR-2022-11200"}'::jsonb, now() - interval '1 hour'),
      ('version_create', '00000000-0000-0000-0000-000000000001', 'budi.santoso@pln-insurance.co.id', 'document_control', '00000000-0000-0000-0000-bbbbbbbb0001', '{"target": "POL-FI-2023-04521 v3"}'::jsonb, now() - interval '2 hours'),
      ('user_login', '00000000-0000-0000-0000-000000000002', 'sari.dewi@pln-insurance.co.id', 'operations', NULL, '{"target": "IP: 192.168.1.45"}'::jsonb, now() - interval '2 hours'),
      ('bulk_upload', '00000000-0000-0000-0000-000000000001', 'budi.santoso@pln-insurance.co.id', 'document_control', NULL, '{"target": "12 documents", "batch_size": 12}'::jsonb, now() - interval '3 hours'),
      ('view', '00000000-0000-0000-0000-000000000005', 'hendra.kusuma@pln-insurance.co.id', 'super_admin', '00000000-0000-0000-0000-bbbbbbbb0005', '{"target": "POL-LI-2024-00045"}'::jsonb, now() - interval '4 hours'),
      ('permission_change', '00000000-0000-0000-0000-000000000005', 'hendra.kusuma@pln-insurance.co.id', 'super_admin', NULL, '{"target": "Fitri Handayani -> Read Only", "change": "Role updated"}'::jsonb, now() - interval '5 hours');
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 6. ROLES (ensure complete with correct permissions)
-- ---------------------------------------------------------------------------
INSERT INTO roles (name, display_name, description, permissions) VALUES
  ('super_admin', 'Super Admin', 'Full system access including configuration', ARRAY['document:upload','document:view','document:edit','document:download','document:review','document:approve','document:archive','document:delete','claim:create','claim:view','claim:edit','claim:link_document','audit:view','audit:view_global','user:manage']),
  ('document_control', 'Document Control', 'Upload, index, and validate documents', ARRAY['document:upload','document:view','document:edit','document:download','document:review','claim:view','audit:view']),
  ('operations', 'Operations', 'Search, view, and download permitted documents', ARRAY['document:view','document:download','claim:view','audit:view']),
  ('compliance', 'Compliance', 'View all documents and audit trails', ARRAY['document:view','document:download','audit:view','audit:view_global']),
  ('read_only', 'Read Only', 'View-only access to assigned documents', ARRAY['document:view']),
  ('manager', 'Manager', 'Full document and user management', ARRAY['document:view','document:edit','document:download','document:review','document:approve','document:archive','document:delete','claim:create','claim:view','claim:edit','claim:link_document','audit:view','audit:view_global','user:manage']),
  ('pic_gudang', 'PIC Gudang', 'Warehouse document officer', ARRAY['document:upload','document:view','document:edit','document:download','claim:view','audit:view']),
  ('pic_klaim', 'PIC Klaim', 'Claims processing officer', ARRAY['document:view','document:download','document:review','claim:create','claim:view','claim:edit','claim:link_document','audit:view'])
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions;
