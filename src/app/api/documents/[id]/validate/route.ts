import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasPermission } from '@/lib/auth/permissions';
import { processDocumentOCR } from '@/lib/ocr/extraction';
import { logAudit } from '@/lib/audit/logger';
import type { AppRole } from '@/lib/db/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 403 });
  }

  if (!hasPermission(profile.role as AppRole, 'document:review')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const body = await request.json();
  const { action, fields } = body as {
    action: 'approve' | 'reprocess';
    fields?: Record<string, string>;
  };

  if (!action || !['approve', 'reprocess'].includes(action)) {
    return NextResponse.json(
      { error: 'Invalid action. Must be "approve" or "reprocess".' },
      { status: 400 }
    );
  }

  const { data: document, error: docError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (docError || !document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  if (action === 'approve') {
    const updatedMetadata = { ...((document.ocr_metadata as Record<string, unknown>) ?? {}) };

    if (fields) {
      updatedMetadata.corrected_fields = fields;

      // Update field_confidences with approved values
      const existingConfidences = (updatedMetadata.field_confidences as Array<{
        field_name: string;
        value: string;
        confidence: number;
        approved: boolean;
      }>) ?? [];

      const updatedConfidences = existingConfidences.map((fc) => {
        if (fields[fc.field_name] !== undefined) {
          return { ...fc, value: fields[fc.field_name], approved: true };
        }
        return fc;
      });

      updatedMetadata.field_confidences = updatedConfidences;
    }

    const { error: updateError } = await supabase
      .from('documents')
      .update({
        status: 'indexed',
        ocr_metadata: updatedMetadata,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    void logAudit({
      supabase,
      action: 'validate',
      actorId: user.id,
      actorEmail: profile.email,
      actorRole: profile.role as AppRole,
      documentId: id,
      oldStatus: document.status,
      newStatus: 'indexed',
      details: {
        validation_action: 'approve',
        corrected_fields: fields ? Object.keys(fields) : [],
      },
    });

    return NextResponse.json({ data: { status: 'indexed' } });
  }

  if (action === 'reprocess') {
    try {
      const result = await processDocumentOCR(id);

      void logAudit({
        supabase,
        action: 'validate',
        actorId: user.id,
        actorEmail: profile.email,
        actorRole: profile.role as AppRole,
        documentId: id,
        details: {
          validation_action: 'reprocess',
          new_confidence: result.confidence,
        },
      });

      return NextResponse.json({ data: result });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Reprocessing failed';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
