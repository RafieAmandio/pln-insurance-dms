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
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          PLN Insurance Document Management Overview
        </p>
      </div>

      {/* Top row: stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Content: 3-column grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <RecentDocuments documents={stats.recentDocuments} />
        <DigitizationProgress warehouses={stats.warehouseProgress} />
        <div className="space-y-5">
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
    </div>
  );
}
