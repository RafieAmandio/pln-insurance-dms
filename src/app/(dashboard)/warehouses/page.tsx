import { requireAuth } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { WarehouseStats } from '@/components/warehouses/warehouse-stats';
import { WarehouseCard } from '@/components/warehouses/warehouse-card';
import { AddWarehouseDialog } from '@/components/warehouses/add-warehouse-dialog';
import type { Warehouse } from '@/lib/db/types';

export default async function WarehousesPage() {
  const { profile } = await requireAuth();
  const supabase = await createClient();
  const canCreate = ['manager', 'super_admin'].includes(profile.role);

  const { data: warehouses } = await supabase
    .from('warehouses')
    .select('*')
    .order('name');

  const warehouseList = (warehouses ?? []) as Warehouse[];

  const totalWarehouses = warehouseList.length;
  const totalDocuments = warehouseList.reduce(
    (sum, w) => sum + w.total_documents,
    0
  );
  const totalDigitized = warehouseList.reduce(
    (sum, w) => sum + w.digitized_documents,
    0
  );
  const overallProgress =
    totalDocuments > 0 ? (totalDigitized / totalDocuments) * 100 : 0;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Warehouse Visibility</h1>
          <p className="text-muted-foreground">
            Monitor document storage and digitization across all sites
          </p>
        </div>
        {canCreate && <AddWarehouseDialog />}
      </div>

      <div className="space-y-6">
        <WarehouseStats
          totalWarehouses={totalWarehouses}
          totalDocuments={totalDocuments}
          totalDigitized={totalDigitized}
          overallProgress={overallProgress}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {warehouseList.map((warehouse) => (
            <WarehouseCard key={warehouse.id} warehouse={warehouse} />
          ))}
        </div>
      </div>
    </div>
  );
}
