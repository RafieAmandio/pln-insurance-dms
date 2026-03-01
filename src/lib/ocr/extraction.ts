import { createAdminClient } from '@/lib/supabase/admin';
import { extractTextFromImage } from './claude-client';
import { extractionResultSchema, type ExtractionResult } from './types';

export async function processDocumentOCR(documentId: string): Promise<ExtractionResult> {
  const supabase = createAdminClient();

  // Fetch document record
  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (docError || !document) {
    throw new Error(`Document not found: ${documentId}`);
  }

  // Download file from storage
  const { data: fileData, error: downloadError } = await supabase.storage
    .from('documents')
    .download(document.file_path);

  if (downloadError || !fileData) {
    throw new Error(`Failed to download file: ${downloadError?.message}`);
  }

  // Convert to base64
  const buffer = Buffer.from(await fileData.arrayBuffer());
  const base64Data = buffer.toString('base64');

  // Extract text using Claude
  const rawResult = await extractTextFromImage(base64Data, document.mime_type);

  // Parse the JSON response
  let extraction: ExtractionResult;
  try {
    const parsed = JSON.parse(rawResult);
    extraction = extractionResultSchema.parse(parsed);
  } catch {
    // If parsing fails, use the raw text as full_text with low confidence
    extraction = {
      full_text: rawResult,
      document_type: '',
      policy_number: '',
      claim_number: '',
      date: '',
      parties: [],
      amounts: [],
      summary: 'OCR extraction completed but structured parsing failed',
      confidence: 0.3,
      field_confidences: [],
    };
  }

  // Update document with OCR results
  const updateData: Record<string, unknown> = {
    ocr_text: extraction.full_text,
    ocr_metadata: {
      document_type: extraction.document_type,
      date: extraction.date,
      parties: extraction.parties,
      amounts: extraction.amounts,
      summary: extraction.summary,
      field_confidences: extraction.field_confidences,
    },
    ocr_confidence: extraction.confidence,
    ocr_completed_at: new Date().toISOString(),
  };

  // Auto-fill fields from extraction if not already set
  if (!document.policy_number && extraction.policy_number) {
    updateData.policy_number = extraction.policy_number;
  }
  if (!document.claim_number && extraction.claim_number) {
    updateData.claim_number = extraction.claim_number;
  }
  if (document.asset_type === 'other' && extraction.document_type) {
    const typeMap: Record<string, string> = {
      policy: 'policy',
      claim: 'claim',
      'claim form': 'claim',
      invoice: 'invoice',
      endorsement: 'endorsement',
      correspondence: 'correspondence',
      letter: 'correspondence',
      report: 'report',
      photo: 'photo',
    };
    const mappedType = typeMap[extraction.document_type.toLowerCase()];
    if (mappedType) {
      updateData.asset_type = mappedType;
    }
  }

  const { error: updateError } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', documentId);

  if (updateError) {
    throw new Error(`Failed to update document: ${updateError.message}`);
  }

  return extraction;
}
