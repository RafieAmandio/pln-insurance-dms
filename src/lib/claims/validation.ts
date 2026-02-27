import { z } from 'zod';

export const createClaimSchema = z.object({
  claim_number: z.string().min(1, 'Claim number is required').max(100),
  policy_number: z.string().max(100).optional().default(''),
  claimant_name: z.string().min(1, 'Claimant name is required').max(255),
  description: z.string().max(2000).optional().default(''),
  claim_date: z.string().optional(),
  status: z.enum(['open', 'in_review', 'approved', 'denied', 'closed']).optional().default('open'),
  amount: z.number().min(0).optional().default(0),
  currency: z.string().max(3).optional().default('IDR'),
});

export const updateClaimSchema = z.object({
  policy_number: z.string().max(100).optional(),
  claimant_name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  claim_date: z.string().optional(),
  status: z.enum(['open', 'in_review', 'approved', 'denied', 'closed']).optional(),
  amount: z.number().min(0).optional(),
  currency: z.string().max(3).optional(),
});

export const linkDocumentSchema = z.object({
  document_id: z.string().uuid('Invalid document ID'),
  notes: z.string().max(500).optional().default(''),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type UpdateClaimInput = z.infer<typeof updateClaimSchema>;
export type LinkDocumentInput = z.infer<typeof linkDocumentSchema>;
