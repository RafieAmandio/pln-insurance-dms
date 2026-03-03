'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleCard } from '@/components/access-control/role-card';
import { UserAssignments } from '@/components/access-control/user-assignments';
import { EditRoleDialog } from '@/components/access-control/edit-role-dialog';
import type { Role, Profile } from '@/lib/db/types';

interface AccessControlTabsProps {
  roles: (Role & { user_count: number })[];
  users: Profile[];
}

export function AccessControlTabs({ roles, users }: AccessControlTabsProps) {
  const [editRole, setEditRole] = useState<Role | null>(null);

  return (
    <>
      <Tabs defaultValue="roles">
        <TabsList>
          <TabsTrigger value="roles">Roles &amp; Permissions</TabsTrigger>
          <TabsTrigger value="users">User Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {roles.map((role) => (
              <RoleCard key={role.id} role={role} onEdit={setEditRole} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="mt-4">
            <UserAssignments users={users} />
          </div>
        </TabsContent>
      </Tabs>

      {editRole && (
        <EditRoleDialog
          role={editRole}
          open={!!editRole}
          onOpenChange={(open) => { if (!open) setEditRole(null); }}
        />
      )}
    </>
  );
}
