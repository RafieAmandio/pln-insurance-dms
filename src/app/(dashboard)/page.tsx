import { requireAuth } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { getDashboardStats } from '@/lib/dashboard/queries';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentDocuments } from '@/components/dashboard/recent-documents';
import { DigitizationProgress } from '@/components/dashboard/digitization-progress';
import { OcrPerformance } from '@/components/dashboard/ocr-performance';
import { SearchCompliance } from '@/components/dashboard/search-compliance';

export default async function DashboardPage() {
  await requireAuth();
  const supabase = await createClient();
  const stats = await getDashboardStats(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          PLN Insurance Document Management Overview
        </p>
      </div>

      {/* Top row: stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Documents"
          value={stats.totalDocuments}
          iconName="FileText"
          trend="+2.4% this month"
          trendColor="text-green-600"
        />
        <StatCard
          title="Pending Upload"
          value={stats.pendingUpload}
          iconName="Upload"
          trend="3 in queue"
          trendColor="text-yellow-600"
        />
        <StatCard
          title="OCR Completed"
          value={stats.ocrCompleted}
          iconName="CheckCircle"
          trend="+12 today"
          trendColor="text-green-600"
        />
        <StatCard
          title="Needs Validation"
          value={stats.needsValidation}
          iconName="AlertTriangle"
          trend="5 urgent"
          trendColor="text-red-600"
        />
      </div>

      {/* Middle row: recent documents + digitization progress */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentDocuments documents={stats.recentDocuments} />
        </div>
        <div className="lg:col-span-2">
          <DigitizationProgress warehouses={stats.warehouseProgress} />
        </div>
      </div>

      {/* Bottom row: OCR performance + search & compliance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OcrPerformance
          avgConfidence={stats.ocrPerformance.avgConfidence}
          avgProcessTime={stats.ocrPerformance.avgProcessTime}
          failureRate={stats.ocrPerformance.failureRate}
        />
        <SearchCompliance
          avgSearchTime={45}
          searchesToday={128}
          auditCompliance={98.5}
        />
      </div>
    </div>
  );
}
