import type { SupabaseClient } from '@supabase/supabase-js';
import type { Document, Warehouse } from '@/lib/db/types';

export interface RecentDocument {
  id: string;
  title: string;
  policy_number: string;
  asset_type: string;
  status: string;
  created_at: string;
  warehouse: { name: string } | null;
}

export interface WarehouseProgress {
  name: string;
  total_documents: number;
  digitized_documents: number;
}

export interface OcrPerformance {
  avgConfidence: number;
  avgProcessTime: number;
  failureRate: number;
}

export interface DashboardStats {
  totalDocuments: number;
  pendingUpload: number;
  ocrCompleted: number;
  needsValidation: number;
  recentDocuments: RecentDocument[];
  warehouseProgress: WarehouseProgress[];
  ocrPerformance: OcrPerformance;
}

export async function getDashboardStats(
  supabase: SupabaseClient
): Promise<DashboardStats> {
  const [
    totalResult,
    pendingResult,
    ocrCompletedResult,
    needsValidationResult,
    recentResult,
    warehouseResult,
    ocrStatsResult,
    failedResult,
  ] = await Promise.all([
    supabase
      .from('documents')
      .select('*', { count: 'exact', head: true }),

    supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .in('status', ['draft', 'processing']),

    supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .not('ocr_completed_at', 'is', null),

    supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ocr_review'),

    supabase
      .from('documents')
      .select('id, title, policy_number, asset_type, status, created_at, warehouse:warehouses(name)')
      .order('created_at', { ascending: false })
      .limit(5),

    supabase
      .from('warehouses')
      .select('name, total_documents, digitized_documents')
      .eq('is_active', true)
      .order('name'),

    supabase
      .from('documents')
      .select('ocr_confidence, ocr_completed_at, created_at')
      .not('ocr_completed_at', 'is', null),

    supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed'),
  ]);

  const totalDocuments = totalResult.count ?? 0;
  const pendingUpload = pendingResult.count ?? 0;
  const ocrCompleted = ocrCompletedResult.count ?? 0;
  const needsValidation = needsValidationResult.count ?? 0;

  const recentDocuments: RecentDocument[] = (recentResult.data ?? []).map(
    (doc) => ({
      id: doc.id,
      title: doc.title,
      policy_number: doc.policy_number,
      asset_type: doc.asset_type,
      status: doc.status,
      created_at: doc.created_at,
      warehouse: Array.isArray(doc.warehouse) ? doc.warehouse[0] ?? null : doc.warehouse,
    })
  );

  const warehouseProgress: WarehouseProgress[] = (warehouseResult.data ?? []).map(
    (w) => ({
      name: w.name,
      total_documents: w.total_documents ?? 0,
      digitized_documents: w.digitized_documents ?? 0,
    })
  );

  const ocrDocs = ocrStatsResult.data ?? [];
  const failedCount = failedResult.count ?? 0;

  let avgConfidence = 0;
  let avgProcessTime = 0;

  if (ocrDocs.length > 0) {
    const totalConfidence = ocrDocs.reduce(
      (sum, doc) => sum + (doc.ocr_confidence ?? 0),
      0
    );
    avgConfidence = totalConfidence / ocrDocs.length;

    const processTimesMs = ocrDocs
      .filter((doc) => doc.created_at && doc.ocr_completed_at)
      .map((doc) => {
        const start = new Date(doc.created_at).getTime();
        const end = new Date(doc.ocr_completed_at).getTime();
        return end - start;
      });

    if (processTimesMs.length > 0) {
      const totalMs = processTimesMs.reduce((sum, ms) => sum + ms, 0);
      avgProcessTime = totalMs / processTimesMs.length / 1000;
    }
  }

  const failureRate =
    totalDocuments > 0 ? (failedCount / totalDocuments) * 100 : 0;

  return {
    totalDocuments,
    pendingUpload,
    ocrCompleted,
    needsValidation,
    recentDocuments,
    warehouseProgress,
    ocrPerformance: {
      avgConfidence,
      avgProcessTime,
      failureRate,
    },
  };
}
