import { z } from 'zod';

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/tiff',
  'application/pdf',
] as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const assetTypeSchema = z.enum([
  'policy', 'claim', 'endorsement', 'invoice',
  'correspondence', 'photo', 'report', 'other',
]);

export const uploadDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(2000).optional().default(''),
  asset_type: assetTypeSchema.optional().default('other'),
  policy_number: z.string().max(100).optional().default(''),
  claim_number: z.string().max(100).optional().default(''),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
  warehouse_id: z.string().uuid().optional(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  asset_type: assetTypeSchema.optional(),
  policy_number: z.string().max(100).optional(),
  claim_number: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
