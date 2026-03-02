'use client';

import { Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';

interface SearchComplianceProps {
  avgSearchTime: number;
  searchesToday: number;
  auditCompliance: number;
}

export function SearchCompliance({ avgSearchTime, searchesToday, auditCompliance }: SearchComplianceProps) {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle>Search & Compliance</CardTitle>
        <CardAction>
          <Search className="h-4 w-4 text-muted-foreground" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{avgSearchTime.toFixed(0)}ms</p>
            <p className="text-xs text-muted-foreground">Avg Search Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{searchesToday.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Searches Today</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{auditCompliance.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Audit Compliance</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
