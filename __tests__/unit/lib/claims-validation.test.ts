import { describe, it, expect } from 'vitest';
import { createClaimSchema, updateClaimSchema, linkDocumentSchema } from '@/lib/claims/validation';

describe('Claims Validation', () => {
  describe('createClaimSchema', () => {
    it('accepts valid claim', () => {
      const result = createClaimSchema.safeParse({
        claim_number: 'CLM-001',
        claimant_name: 'John Doe',
        policy_number: 'POL-001',
        description: 'Fire damage claim',
        amount: 1000000,
      });
      expect(result.success).toBe(true);
    });

    it('requires claim_number', () => {
      const result = createClaimSchema.safeParse({
        claimant_name: 'John Doe',
      });
      expect(result.success).toBe(false);
    });

    it('requires claimant_name', () => {
      const result = createClaimSchema.safeParse({
        claim_number: 'CLM-001',
      });
      expect(result.success).toBe(false);
    });

    it('defaults currency to IDR', () => {
      const result = createClaimSchema.safeParse({
        claim_number: 'CLM-001',
        claimant_name: 'John Doe',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('IDR');
      }
    });

    it('defaults status to open', () => {
      const result = createClaimSchema.safeParse({
        claim_number: 'CLM-001',
        claimant_name: 'John Doe',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('open');
      }
    });

    it('accepts all valid statuses', () => {
      const statuses = ['open', 'in_review', 'approved', 'denied', 'closed'];
      for (const status of statuses) {
        const result = createClaimSchema.safeParse({
          claim_number: 'CLM-001',
          claimant_name: 'John',
          status,
        });
        expect(result.success).toBe(true);
      }
    });

    it('rejects negative amount', () => {
      const result = createClaimSchema.safeParse({
        claim_number: 'CLM-001',
        claimant_name: 'John',
        amount: -100,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('updateClaimSchema', () => {
    it('accepts partial update', () => {
      const result = updateClaimSchema.safeParse({ status: 'in_review' });
      expect(result.success).toBe(true);
    });

    it('accepts empty object', () => {
      const result = updateClaimSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('linkDocumentSchema', () => {
    it('accepts valid UUID document_id', () => {
      const result = linkDocumentSchema.safeParse({
        document_id: '123e4567-e89b-12d3-a456-426614174000',
        notes: 'Related fire damage photos',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid UUID', () => {
      const result = linkDocumentSchema.safeParse({
        document_id: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('requires document_id', () => {
      const result = linkDocumentSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
