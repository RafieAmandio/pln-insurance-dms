'use client';

import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, FileText, HardDrive, Clock } from 'lucide-react';
import type { Warehouse } from '@/lib/db/types';

interface WarehouseCardProps {
  warehouse: Warehouse;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

export function WarehouseCard({ warehouse }: WarehouseCardProps) {
  const progress =
    warehouse.total_documents > 0
      ? (warehouse.digitized_documents / warehouse.total_documents) * 100
      : 0;

  const remaining = warehouse.total_documents - warehouse.digitized_documents;
  const estimatedMonths = remaining > 0 ? Math.ceil(remaining / 500) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{warehouse.name}</CardTitle>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{warehouse.address}</span>
            </div>
          </div>
          <Badge variant={warehouse.is_active ? 'default' : 'secondary'}>
            {warehouse.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Digitization Progress</span>
            <span className="font-medium">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Total Docs</p>
              <p className="font-medium">
                {warehouse.total_documents.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Storage</p>
              <p className="font-medium">
                {formatBytes(warehouse.storage_size_bytes)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground">Docs/month</p>
              <p className="font-medium">~500</p>
            </div>
          </div>
        </div>

        {remaining > 0 && (
          <p className="text-xs text-muted-foreground">
            {remaining.toLocaleString()} documents remaining · Est.{' '}
            {estimatedMonths} {estimatedMonths === 1 ? 'month' : 'months'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
