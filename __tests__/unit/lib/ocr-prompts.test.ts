import { describe, it, expect } from 'vitest';
import { OCR_EXTRACTION_PROMPT } from '@/lib/ocr/prompts';

describe('OCR Prompts', () => {
  it('includes instruction to respond with JSON', () => {
    expect(OCR_EXTRACTION_PROMPT).toContain('JSON');
  });

  it('specifies required output fields', () => {
    expect(OCR_EXTRACTION_PROMPT).toContain('full_text');
    expect(OCR_EXTRACTION_PROMPT).toContain('document_type');
    expect(OCR_EXTRACTION_PROMPT).toContain('policy_number');
    expect(OCR_EXTRACTION_PROMPT).toContain('claim_number');
    expect(OCR_EXTRACTION_PROMPT).toContain('confidence');
    expect(OCR_EXTRACTION_PROMPT).toContain('summary');
    expect(OCR_EXTRACTION_PROMPT).toContain('amounts');
    expect(OCR_EXTRACTION_PROMPT).toContain('parties');
  });

  it('mentions Indonesian documents', () => {
    expect(OCR_EXTRACTION_PROMPT).toContain('Indonesian');
  });

  it('mentions PLN Insurance context', () => {
    expect(OCR_EXTRACTION_PROMPT).toContain('PLN Insurance');
  });

  it('includes confidence score guidance', () => {
    expect(OCR_EXTRACTION_PROMPT).toContain('0.0');
    expect(OCR_EXTRACTION_PROMPT).toContain('1.0');
  });
});
