import { requirePermission } from '@/lib/auth/guards';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

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

      <Card>
        <CardHeader>
          <CardTitle>Under Development</CardTitle>
          <CardDescription>
            This module is under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The admin console will provide system configuration, user management, and monitoring capabilities.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
