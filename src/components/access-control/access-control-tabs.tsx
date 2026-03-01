'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleCard } from '@/components/access-control/role-card';
import { UserAssignments } from '@/components/access-control/user-assignments';
import type { Role, Profile } from '@/lib/db/types';

interface AccessControlTabsProps {
  roles: (Role & { user_count: number })[];
  users: Profile[];
}

export function AccessControlTabs({ roles, users }: AccessControlTabsProps) {
  return (
    <Tabs defaultValue="roles">
      <TabsList>
        <TabsTrigger value="roles">Roles &amp; Permissions</TabsTrigger>
        <TabsTrigger value="users">User Assignments</TabsTrigger>
      </TabsList>

      <TabsContent value="roles">
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {roles.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="users">
        <div className="mt-4">
          <UserAssignments users={users} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
