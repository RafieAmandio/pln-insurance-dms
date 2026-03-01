'use client';

import { Check, X, Pencil } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Role } from '@/lib/db/types';

interface PermissionCategory {
  label: string;
  keys: string[];
}

const PERMISSION_CATEGORIES: PermissionCategory[] = [
  { label: 'View', keys: ['document:view', 'claim:view'] },
  { label: 'Upload', keys: ['document:upload'] },
  { label: 'Download', keys: ['document:download'] },
  { label: 'Edit', keys: ['document:edit', 'claim:edit'] },
  { label: 'Delete', keys: ['document:delete'] },
  { label: 'Admin', keys: ['user:manage'] },
];

interface RoleCardProps {
  role: Role & { user_count: number };
  onEdit?: (role: Role) => void;
}

export function RoleCard({ role, onEdit }: RoleCardProps) {
  const hasCategory = (category: PermissionCategory): boolean => {
    return category.keys.some((key) => role.permissions.includes(key));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold">{role.display_name}</h3>
            <Badge variant="secondary">{role.user_count} users</Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit?.(role)}
            aria-label={`Edit ${role.display_name}`}
          >
            <Pencil className="size-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{role.description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {PERMISSION_CATEGORIES.map((category) => {
            const granted = hasCategory(category);
            return (
              <Badge
                key={category.label}
                variant={granted ? 'default' : 'outline'}
                className={
                  granted
                    ? 'bg-green-100 text-green-800 hover:bg-green-100'
                    : 'text-gray-400'
                }
              >
                {granted ? (
                  <Check className="size-3" />
                ) : (
                  <X className="size-3" />
                )}
                {category.label}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
