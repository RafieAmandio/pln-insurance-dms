import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const ftsSql = fs.readFileSync(
  path.resolve(__dirname, '../../../supabase/migrations/00003_fts_indonesian.sql'),
  'utf8'
);

describe('Full-Text Search Setup', () => {
  it('creates Indonesian text search configuration', () => {
    expect(ftsSql).toContain("CREATE TEXT SEARCH CONFIGURATION indonesian");
  });

  it('defines weighted search vector trigger', () => {
    expect(ftsSql).toContain('update_document_search_vector');
    // Title and policy_number should be weight A
    expect(ftsSql).toContain("setweight(to_tsvector('indonesian', COALESCE(NEW.title, '')), 'A')");
    expect(ftsSql).toContain("setweight(to_tsvector('indonesian', COALESCE(NEW.policy_number, '')), 'A')");
    // Description and tags should be weight B
    expect(ftsSql).toContain("setweight(to_tsvector('indonesian', COALESCE(NEW.description, '')), 'B')");
    // OCR text should be weight C
    expect(ftsSql).toContain("setweight(to_tsvector('indonesian', COALESCE(NEW.ocr_text, '')), 'C')");
  });

  it('creates search_documents function with all parameters', () => {
    expect(ftsSql).toContain('CREATE OR REPLACE FUNCTION search_documents');
    expect(ftsSql).toContain('search_query TEXT');
    expect(ftsSql).toContain('filter_status document_status');
    expect(ftsSql).toContain('filter_asset_type asset_type');
    expect(ftsSql).toContain('filter_policy_number TEXT');
    expect(ftsSql).toContain('filter_date_from TIMESTAMPTZ');
    expect(ftsSql).toContain('filter_date_to TIMESTAMPTZ');
    expect(ftsSql).toContain('page_number INTEGER');
    expect(ftsSql).toContain('page_size INTEGER');
  });

  it('search function returns ranked results with total count', () => {
    expect(ftsSql).toContain('rank REAL');
    expect(ftsSql).toContain('total_count BIGINT');
    expect(ftsSql).toContain('ts_rank');
  });

  it('trigger fires on relevant column changes', () => {
    expect(ftsSql).toContain('BEFORE INSERT OR UPDATE OF title, description, policy_number, claim_number, tags, ocr_text');
  });
});
