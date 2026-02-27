import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processDocumentOCR } from '@/lib/ocr/extraction';
import { logAudit } from '@/lib/audit/logger';
import type { AppRole } from '@/lib/db/types';

export async function POST(
  _request: NextRequest,
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

  try {
    const result = await processDocumentOCR(id);

    await logAudit({
      supabase,
      action: 'ocr_complete',
      actorId: user.id,
      actorEmail: profile.email,
      actorRole: profile.role as AppRole,
      documentId: id,
      details: {
        confidence: result.confidence,
        document_type: result.document_type,
        text_length: result.full_text.length,
      },
    });

    return NextResponse.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OCR processing failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
