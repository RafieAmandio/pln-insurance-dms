-- Migration 00003: Full-Text Search with Indonesian Stemming

-- Create Indonesian text search configuration
-- Note: Requires the 'indonesian_stem' dictionary to be available.
-- Falls back to 'simple' if not available.
DO $$
BEGIN
  -- Try to create with Indonesian stemming
  BEGIN
    CREATE TEXT SEARCH CONFIGURATION indonesian (COPY = simple);
    -- If indonesian_stem is available, alter the mapping
    ALTER TEXT SEARCH CONFIGURATION indonesian
      ALTER MAPPING FOR asciiword, word
      WITH indonesian_stem;
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: create using simple config
    RAISE NOTICE 'indonesian_stem not available, using simple configuration';
    -- Config already created with COPY = simple, which is fine
  END;
END $$;

-- Trigger function to update search vector
CREATE OR REPLACE FUNCTION update_document_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('indonesian', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('indonesian', COALESCE(NEW.policy_number, '')), 'A') ||
    setweight(to_tsvector('indonesian', COALESCE(NEW.claim_number, '')), 'A') ||
    setweight(to_tsvector('indonesian', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('indonesian', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('indonesian', COALESCE(NEW.ocr_text, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_search_vector
  BEFORE INSERT OR UPDATE OF title, description, policy_number, claim_number, tags, ocr_text
  ON documents
  FOR EACH ROW EXECUTE FUNCTION update_document_search_vector();

-- Search function with filters and pagination
CREATE OR REPLACE FUNCTION search_documents(
  search_query TEXT DEFAULT '',
  filter_status document_status DEFAULT NULL,
  filter_asset_type asset_type DEFAULT NULL,
  filter_policy_number TEXT DEFAULT NULL,
  filter_date_from TIMESTAMPTZ DEFAULT NULL,
  filter_date_to TIMESTAMPTZ DEFAULT NULL,
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  status document_status,
  asset_type asset_type,
  policy_number TEXT,
  claim_number TEXT,
  file_name TEXT,
  mime_type TEXT,
  ocr_confidence REAL,
  tags TEXT[],
  uploaded_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  rank REAL,
  total_count BIGINT
) AS $$
DECLARE
  ts_query TSQUERY;
  offset_val INTEGER;
BEGIN
  offset_val := (page_number - 1) * page_size;

  -- Build tsquery from search_query
  IF search_query IS NOT NULL AND search_query != '' THEN
    ts_query := plainto_tsquery('indonesian', search_query);
  END IF;

  RETURN QUERY
  WITH filtered AS (
    SELECT
      d.id,
      d.title,
      d.description,
      d.status,
      d.asset_type,
      d.policy_number,
      d.claim_number,
      d.file_name,
      d.mime_type,
      d.ocr_confidence,
      d.tags,
      d.uploaded_by,
      d.created_at,
      d.updated_at,
      CASE
        WHEN ts_query IS NOT NULL AND d.search_vector IS NOT NULL
        THEN ts_rank(d.search_vector, ts_query)
        ELSE 0
      END AS rank
    FROM documents d
    WHERE
      (ts_query IS NULL OR d.search_vector @@ ts_query)
      AND (filter_status IS NULL OR d.status = filter_status)
      AND (filter_asset_type IS NULL OR d.asset_type = filter_asset_type)
      AND (filter_policy_number IS NULL OR d.policy_number ILIKE '%' || filter_policy_number || '%')
      AND (filter_date_from IS NULL OR d.created_at >= filter_date_from)
      AND (filter_date_to IS NULL OR d.created_at <= filter_date_to)
  ),
  counted AS (
    SELECT COUNT(*) AS total FROM filtered
  )
  SELECT
    f.id, f.title, f.description, f.status, f.asset_type,
    f.policy_number, f.claim_number, f.file_name, f.mime_type,
    f.ocr_confidence, f.tags, f.uploaded_by, f.created_at, f.updated_at,
    f.rank,
    c.total AS total_count
  FROM filtered f, counted c
  ORDER BY
    CASE WHEN ts_query IS NOT NULL THEN f.rank ELSE 0 END DESC,
    f.created_at DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
