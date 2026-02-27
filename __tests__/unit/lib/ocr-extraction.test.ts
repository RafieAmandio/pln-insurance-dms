import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractionResultSchema } from '@/lib/ocr/types';

// Mock the Claude client
vi.mock('@/lib/ocr/claude-client', () => ({
  extractTextFromImage: vi.fn(),
}));

// Mock Supabase admin client
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: 'doc-1',
              file_path: 'user/file.jpg',
              mime_type: 'image/jpeg',
              policy_number: '',
              claim_number: '',
              asset_type: 'other',
            },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null })),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        download: vi.fn(() => ({
          data: new Blob(['fake-image-data']),
          error: null,
        })),
      })),
    },
  })),
}));

describe('OCR Extraction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractionResultSchema', () => {
    it('accepts valid extraction result', () => {
      const result = extractionResultSchema.safeParse({
        full_text: 'Sample document text',
        document_type: 'policy',
        policy_number: 'POL-001',
        claim_number: '',
        date: '2024-01-15',
        parties: ['PT PLN Insurance', 'John Doe'],
        amounts: [{ value: 1000000, currency: 'IDR', description: 'Premium' }],
        summary: 'Insurance policy document',
        confidence: 0.95,
      });
      expect(result.success).toBe(true);
    });

    it('provides defaults for missing optional fields', () => {
      const result = extractionResultSchema.safeParse({
        full_text: 'Some text',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.document_type).toBe('');
        expect(result.data.policy_number).toBe('');
        expect(result.data.parties).toEqual([]);
        expect(result.data.amounts).toEqual([]);
        expect(result.data.confidence).toBe(0.5);
      }
    });

    it('rejects confidence outside 0-1 range', () => {
      const result = extractionResultSchema.safeParse({
        full_text: 'Text',
        confidence: 1.5,
      });
      expect(result.success).toBe(false);
    });

    it('requires full_text field', () => {
      const result = extractionResultSchema.safeParse({
        confidence: 0.8,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('processDocumentOCR', () => {
    it('processes document and returns extraction result', async () => {
      const { extractTextFromImage } = await import('@/lib/ocr/claude-client');
      (extractTextFromImage as ReturnType<typeof vi.fn>).mockResolvedValue(
        JSON.stringify({
          full_text: 'Polis Asuransi No. POL-12345',
          document_type: 'policy',
          policy_number: 'POL-12345',
          claim_number: '',
          date: '2024-01-15',
          parties: ['PT PLN Insurance'],
          amounts: [],
          summary: 'Insurance policy',
          confidence: 0.92,
        })
      );

      const { processDocumentOCR } = await import('@/lib/ocr/extraction');
      const result = await processDocumentOCR('doc-1');

      expect(result.full_text).toBe('Polis Asuransi No. POL-12345');
      expect(result.policy_number).toBe('POL-12345');
      expect(result.confidence).toBe(0.92);
    });

    it('handles malformed JSON from Claude gracefully', async () => {
      const { extractTextFromImage } = await import('@/lib/ocr/claude-client');
      (extractTextFromImage as ReturnType<typeof vi.fn>).mockResolvedValue(
        'This is not valid JSON but is the OCR text'
      );

      const { processDocumentOCR } = await import('@/lib/ocr/extraction');
      const result = await processDocumentOCR('doc-1');

      expect(result.full_text).toBe('This is not valid JSON but is the OCR text');
      expect(result.confidence).toBe(0.3);
    });
  });
});
