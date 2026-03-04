import { requirePermission } from '@/lib/auth/guards';
import { AdminConsoleClient } from '@/components/admin/admin-console-client';

export default async function AdminConsolePage() {
  await requirePermission('user:manage');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
        <p className="text-sm text-muted-foreground">
          System configuration and monitoring
        </p>
      </div>
      <AdminConsoleClient />
    </div>
  );
}
