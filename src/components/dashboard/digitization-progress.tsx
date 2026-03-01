'use client';

import { HardDrive } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardAction, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { WarehouseProgress } from '@/lib/dashboard/queries';

interface DigitizationProgressProps {
  warehouses: WarehouseProgress[];
}

export function DigitizationProgress({ warehouses }: DigitizationProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Digitization Progress</CardTitle>
        <CardAction>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {warehouses.length === 0 && (
            <p className="text-sm text-muted-foreground">No warehouses configured.</p>
          )}
          {warehouses.map((warehouse) => {
            const percentage =
              warehouse.total_documents > 0
                ? Math.round(
                    (warehouse.digitized_documents / warehouse.total_documents) * 100
                  )
                : 0;

            return (
              <div key={warehouse.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{warehouse.name}</span>
                  <span className="text-muted-foreground">{percentage}%</span>
                </div>
                <Progress value={percentage} />
                <p className="text-xs text-muted-foreground">
                  {warehouse.digitized_documents} / {warehouse.total_documents} docs
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
