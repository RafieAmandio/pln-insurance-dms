-- System settings key-value store
CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT 'null'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read settings
CREATE POLICY "Authenticated users can read settings"
  ON system_settings FOR SELECT
  TO authenticated
  USING (true);

-- Only managers/super_admins can modify settings
CREATE POLICY "Managers can modify settings"
  ON system_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('manager', 'super_admin')
    )
  );

-- Seed default settings
INSERT INTO system_settings (key, value) VALUES
  ('maintenance_mode', 'false'::jsonb),
  ('auto_ocr', 'true'::jsonb),
  ('email_notifications', 'true'::jsonb),
  ('download_watermark', 'false'::jsonb),
  ('core_api_url', '"https://core.pln-insurance.co.id/api/v1"'::jsonb),
  ('webhook_url', '"https://dms.pln-insurance.co.id/webhooks/core"'::jsonb),
  ('ocr_endpoint', '"https://ocr.pln-insurance.co.id/process"'::jsonb),
  ('max_retry', '3'::jsonb)
ON CONFLICT (key) DO NOTHING;
