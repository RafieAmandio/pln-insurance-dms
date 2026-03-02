'use client';

import { FileText, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
};

interface StatCardProps {
  title: string;
  value: string | number;
  iconName: string;
  trend?: string;
  trendColor?: string;
}

export function StatCard({ title, value, iconName, trend, trendColor = 'text-green-600' }: StatCardProps) {
  const Icon = ICON_MAP[iconName];

  return (
    <Card className="py-4">
      <CardContent className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        {trend && (
          <p className={`text-xs ${trendColor}`}>{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}
