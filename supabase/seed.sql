-- Seed data: 3 test users (one per role)
-- These should be inserted after creating the users via Supabase Auth.
-- The handle_new_user trigger will auto-create profiles.
--
-- For local development, you can manually insert profiles:

-- PIC Gudang user
INSERT INTO profiles (id, email, full_name, role, department, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'gudang@pln-insurance.co.id',
  'Budi Santoso',
  'pic_gudang',
  'Gudang Arsip',
  true
) ON CONFLICT (id) DO NOTHING;

-- PIC Klaim user
INSERT INTO profiles (id, email, full_name, role, department, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'klaim@pln-insurance.co.id',
  'Siti Rahayu',
  'pic_klaim',
  'Klaim',
  true
) ON CONFLICT (id) DO NOTHING;

-- Manager user
INSERT INTO profiles (id, email, full_name, role, department, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'manager@pln-insurance.co.id',
  'Ahmad Wijaya',
  'manager',
  'Manajemen',
  true
) ON CONFLICT (id) DO NOTHING;
