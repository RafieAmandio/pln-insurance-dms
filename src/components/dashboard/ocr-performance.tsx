'use client';

import { TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';

interface OcrPerformanceProps {
  avgConfidence: number;
  avgProcessTime: number;
  failureRate: number;
}

export function OcrPerformance({ avgConfidence, avgProcessTime, failureRate }: OcrPerformanceProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>OCR Performance</CardTitle>
        <CardAction>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{avgConfidence.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Avg Confidence</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{avgProcessTime.toFixed(1)}s</p>
            <p className="text-xs text-muted-foreground">Avg Process Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{failureRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Failure Rate</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
