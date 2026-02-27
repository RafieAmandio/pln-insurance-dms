import { z } from 'zod';

export const extractionResultSchema = z.object({
  full_text: z.string(),
  document_type: z.string().optional().default(''),
  policy_number: z.string().optional().default(''),
  claim_number: z.string().optional().default(''),
  date: z.string().optional().default(''),
  parties: z.array(z.string()).optional().default([]),
  amounts: z.array(z.object({
    value: z.number(),
    currency: z.string().default('IDR'),
    description: z.string().default(''),
  })).optional().default([]),
  summary: z.string().optional().default(''),
  confidence: z.number().min(0).max(1).default(0.5),
});

export type ExtractionResult = z.infer<typeof extractionResultSchema>;
