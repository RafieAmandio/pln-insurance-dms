import { requirePermission } from '@/lib/auth/guards';
import { createClient } from '@/lib/supabase/server';
import { AccessControlTabs } from '@/components/access-control/access-control-tabs';
import { AddUserDialog } from '@/components/access-control/add-user-dialog';
import type { Role, Profile } from '@/lib/db/types';

export default async function AccessControlPage() {
  await requirePermission('user:manage');
  const supabase = await createClient();

  // Fetch roles
  const { data: roles } = await supabase
    .from('roles')
    .select('*')
    .order('name');

  // Fetch profiles for user counts and user list
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name');

  // Compute user counts per role
  const userCounts: Record<string, number> = {};
  for (const p of (profiles ?? []) as Profile[]) {
    userCounts[p.role] = (userCounts[p.role] ?? 0) + 1;
  }

  const rolesWithCounts = ((roles ?? []) as Role[]).map((role) => ({
    ...role,
    user_count: userCounts[role.name] ?? 0,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Access Control</h1>
          <p className="text-sm text-muted-foreground">
            Manage roles, permissions, and user assignments
          </p>
        </div>
        <AddUserDialog />
      </div>

      <AccessControlTabs
        roles={rolesWithCounts}
        users={(profiles ?? []) as Profile[]}
      />
    </div>
  );
}
