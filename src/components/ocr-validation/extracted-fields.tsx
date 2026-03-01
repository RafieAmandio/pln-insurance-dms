'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FieldConfidenceBadge } from './field-confidence-badge';
import { Check, RotateCcw, X } from 'lucide-react';
import type { Document } from '@/lib/db/types';

const FIELD_LABELS: Record<string, string> = {
  policy_number: 'Policy Number',
  policyholder: 'Policyholder',
  effective_date: 'Effective Date',
  expiry_date: 'Expiry Date',
  sum_insured: 'Sum Insured',
  premium: 'Premium',
  coverage_type: 'Coverage Type',
  property_address: 'Property Address',
};

const FIELD_NAMES = Object.keys(FIELD_LABELS);

interface FieldData {
  field_name: string;
  value: string;
  confidence: number;
  approved: boolean;
}

interface ExtractedFieldsProps {
  document: Document | null;
  onApprove: (fields: Record<string, string>) => void;
  onReprocess: () => void;
  loading?: boolean;
}

export function ExtractedFields({
  document,
  onApprove,
  onReprocess,
  loading = false,
}: ExtractedFieldsProps) {
  const [fields, setFields] = useState<FieldData[]>([]);
  const [approvedFields, setApprovedFields] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!document) {
      setFields([]);
      setApprovedFields(new Set());
      return;
    }

    const metadata = (document.ocr_metadata ?? {}) as Record<string, unknown>;
    const fieldConfidences = (metadata.field_confidences ?? []) as FieldData[];

    const fieldMap = new Map<string, FieldData>();
    for (const fc of fieldConfidences) {
      fieldMap.set(fc.field_name, fc);
    }

    const initialFields = FIELD_NAMES.map((name) => {
      const existing = fieldMap.get(name);
      return {
        field_name: name,
        value: existing?.value ?? '',
        confidence: existing?.confidence ?? 0,
        approved: existing?.approved ?? false,
      };
    });

    setFields(initialFields);
    setApprovedFields(new Set(initialFields.filter((f) => f.approved).map((f) => f.field_name)));
  }, [document]);

  const overallConfidence = document?.ocr_confidence ?? 0;

  const handleFieldChange = (fieldName: string, value: string) => {
    setFields((prev) =>
      prev.map((f) => (f.field_name === fieldName ? { ...f, value } : f))
    );
  };

  const handleFieldApprove = (fieldName: string) => {
    setApprovedFields((prev) => {
      const next = new Set(prev);
      if (next.has(fieldName)) {
        next.delete(fieldName);
      } else {
        next.add(fieldName);
      }
      return next;
    });
  };

  const handleApproveAll = () => {
    const fieldValues: Record<string, string> = {};
    for (const f of fields) {
      fieldValues[f.field_name] = f.value;
    }
    onApprove(fieldValues);
  };

  if (!document) {
    return (
      <Card className="flex h-full items-center justify-center">
        <div className="text-center text-sm text-gray-500">
          Select a document to view fields
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-none border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Extracted Fields</CardTitle>
          <FieldConfidenceBadge confidence={overallConfidence} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-y-auto p-4">
        <div className="flex-1 space-y-3">
          {fields.map((field) => (
            <div key={field.field_name}>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700">
                  {FIELD_LABELS[field.field_name] ?? field.field_name}
                </label>
                <FieldConfidenceBadge confidence={field.confidence} />
              </div>
              <div className="flex items-center gap-1.5">
                <Input
                  value={field.value}
                  onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                  className="h-8 text-sm"
                  placeholder={`Enter ${FIELD_LABELS[field.field_name]?.toLowerCase() ?? field.field_name}`}
                />
                <Button
                  variant={approvedFields.has(field.field_name) ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 w-8 shrink-0 p-0"
                  onClick={() => handleFieldApprove(field.field_name)}
                  title={approvedFields.has(field.field_name) ? 'Unapprove field' : 'Approve field'}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex flex-none gap-2">
          <Button
            onClick={handleApproveAll}
            disabled={loading}
            className="flex-1 bg-green-600 text-white hover:bg-green-700"
          >
            <Check className="mr-1.5 h-4 w-4" />
            Approve & Index
          </Button>
          <Button
            variant="outline"
            onClick={onReprocess}
            disabled={loading}
          >
            <RotateCcw className="mr-1.5 h-4 w-4" />
            Reprocess
          </Button>
          <Button
            variant="outline"
            disabled={loading}
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            title="Reject document"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
