'use client';

import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendColor?: string;
}

export function StatCard({ title, value, icon: Icon, trend, trendColor = 'text-green-600' }: StatCardProps) {
  return (
    <Card className="py-4">
      <CardContent className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
        {trend && (
          <p className={`text-xs ${trendColor}`}>{trend}</p>
        )}
      </CardContent>
    </Card>
  );
}
