import { describe, it, expect } from 'vitest';
import { sanitizeQuery } from '@/lib/search/fts';
import { searchFiltersSchema } from '@/lib/search/filters';

describe('FTS Query Builder', () => {
  describe('sanitizeQuery', () => {
    it('removes special FTS characters', () => {
      expect(sanitizeQuery('hello & world')).toBe('hello world');
      expect(sanitizeQuery('test|foo')).toBe('test foo');
      expect(sanitizeQuery('query!')).toBe('query');
      expect(sanitizeQuery('(test)')).toBe('test');
      expect(sanitizeQuery('wild*')).toBe('wild');
    });

    it('normalizes whitespace', () => {
      expect(sanitizeQuery('  hello    world  ')).toBe('hello world');
    });

    it('handles empty string', () => {
      expect(sanitizeQuery('')).toBe('');
    });

    it('preserves normal text', () => {
      expect(sanitizeQuery('polis asuransi kebakaran')).toBe('polis asuransi kebakaran');
    });

    it('handles Indonesian text', () => {
      expect(sanitizeQuery('pembayaran klaim')).toBe('pembayaran klaim');
    });
  });

  describe('searchFiltersSchema', () => {
    it('accepts empty filters', () => {
      const result = searchFiltersSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.page_size).toBe(20);
      }
    });

    it('accepts all valid filters', () => {
      const result = searchFiltersSchema.safeParse({
        query: 'test',
        status: 'draft',
        asset_type: 'policy',
        policy_number: 'POL-001',
        date_from: '2024-01-01',
        date_to: '2024-12-31',
        page: '2',
        page_size: '50',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid status', () => {
      const result = searchFiltersSchema.safeParse({ status: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('rejects page_size > 100', () => {
      const result = searchFiltersSchema.safeParse({ page_size: '200' });
      expect(result.success).toBe(false);
    });

    it('coerces string numbers to integers', () => {
      const result = searchFiltersSchema.safeParse({ page: '3', page_size: '10' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
        expect(result.data.page_size).toBe(10);
      }
    });
  });
});
