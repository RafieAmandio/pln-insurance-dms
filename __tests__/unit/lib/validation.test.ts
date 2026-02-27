import { describe, it, expect } from 'vitest';
import { uploadDocumentSchema, updateDocumentSchema } from '@/lib/documents/validation';

describe('Document Validation', () => {
  describe('uploadDocumentSchema', () => {
    it('accepts valid input with all fields', () => {
      const result = uploadDocumentSchema.safeParse({
        title: 'Test Document',
        description: 'A test document',
        asset_type: 'policy',
        policy_number: 'POL-001',
        claim_number: 'CLM-001',
        tags: ['urgent', 'fire'],
      });
      expect(result.success).toBe(true);
    });

    it('accepts minimal input (title only)', () => {
      const result = uploadDocumentSchema.safeParse({
        title: 'Test Document',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe('');
        expect(result.data.asset_type).toBe('other');
        expect(result.data.tags).toEqual([]);
      }
    });

    it('rejects empty title', () => {
      const result = uploadDocumentSchema.safeParse({
        title: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing title', () => {
      const result = uploadDocumentSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('rejects invalid asset_type', () => {
      const result = uploadDocumentSchema.safeParse({
        title: 'Test',
        asset_type: 'invalid',
      });
      expect(result.success).toBe(false);
    });

    it('accepts all valid asset types', () => {
      const types = ['policy', 'claim', 'endorsement', 'invoice', 'correspondence', 'photo', 'report', 'other'];
      for (const type of types) {
        const result = uploadDocumentSchema.safeParse({ title: 'Test', asset_type: type });
        expect(result.success).toBe(true);
      }
    });

    it('rejects too many tags', () => {
      const result = uploadDocumentSchema.safeParse({
        title: 'Test',
        tags: Array.from({ length: 21 }, (_, i) => `tag${i}`),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateDocumentSchema', () => {
    it('accepts partial update', () => {
      const result = updateDocumentSchema.safeParse({
        title: 'Updated Title',
      });
      expect(result.success).toBe(true);
    });

    it('accepts empty object', () => {
      const result = updateDocumentSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('rejects empty string for title', () => {
      const result = updateDocumentSchema.safeParse({
        title: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
