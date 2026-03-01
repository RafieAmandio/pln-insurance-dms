'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Warehouse, FileText, CheckCircle, TrendingUp } from 'lucide-react';

interface WarehouseStatsProps {
  totalWarehouses: number;
  totalDocuments: number;
  totalDigitized: number;
  overallProgress: number;
}

export function WarehouseStats({
  totalWarehouses,
  totalDocuments,
  totalDigitized,
  overallProgress,
}: WarehouseStatsProps) {
  const stats = [
    {
      title: 'Total Warehouses',
      value: totalWarehouses.toLocaleString(),
      icon: Warehouse,
    },
    {
      title: 'Total Documents',
      value: totalDocuments.toLocaleString(),
      icon: FileText,
    },
    {
      title: 'Digitized',
      value: totalDigitized.toLocaleString(),
      icon: CheckCircle,
    },
    {
      title: 'Overall Progress',
      value: `${overallProgress.toFixed(1)}%`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
