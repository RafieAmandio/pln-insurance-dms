import { z } from 'zod';

export const searchFiltersSchema = z.object({
  query: z.string().max(500).optional().default(''),
  status: z.enum(['draft', 'reviewed', 'approved', 'archived']).optional(),
  asset_type: z.enum([
    'policy', 'claim', 'endorsement', 'invoice',
    'correspondence', 'photo', 'report', 'other',
  ]).optional(),
  policy_number: z.string().max(100).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  page_size: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;
