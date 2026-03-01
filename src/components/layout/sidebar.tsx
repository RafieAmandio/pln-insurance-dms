'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  ScanSearch,
  Search,
  FileText,
  GitBranch,
  Shield,
  Warehouse,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { NAV_ITEMS } from './nav-items';
import { hasPermission } from '@/lib/auth/permissions';
import type { AppRole } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Upload,
  ScanSearch,
  Search,
  FileText,
  GitBranch,
  Shield,
  Warehouse,
  ScrollText,
  Settings,
};

const STORAGE_KEY = 'dms-sidebar-collapsed';

interface SidebarProps {
  role: AppRole;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setCollapsed(stored === 'true');
    }
  }, []);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(role, item.permission)
  );

  return (
    <aside
      className={`flex flex-col bg-slate-900 text-white transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="p-4">
        {collapsed ? (
          <div className="flex h-10 items-center justify-center">
            <span className="text-lg font-bold">P</span>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-bold text-white">PLN Insurance</h2>
            <p className="text-xs text-slate-400">Document Management</p>
          </>
        )}
      </div>

      <Separator className="bg-slate-700" />

      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = ICON_MAP[item.icon];
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));

            const linkContent = (
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-700/50 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <li key={item.href}>
                  <Tooltip>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            }

            return <li key={item.href}>{linkContent}</li>;
          })}
        </ul>
      </nav>

      <Separator className="bg-slate-700" />

      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapsed}
          className="w-full justify-center text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Collapse
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
