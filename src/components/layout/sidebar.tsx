'use client';

import { useState } from 'react';
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
  Menu,
} from 'lucide-react';
import { NAV_ITEMS } from './nav-items';
import { hasPermission } from '@/lib/auth/permissions';
import type { AppRole } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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

interface SidebarProps {
  role: AppRole;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(role, item.permission)
  );

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <>
      {/* Mobile: hamburger + sheet drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden fixed top-3 left-3 z-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-slate-900 p-0 border-0">
          <div className="p-4">
            <h2 className="text-lg font-bold text-white">PLN Insurance</h2>
            <p className="text-xs text-slate-400">Document Management</p>
          </div>
          <nav className="flex-1 p-2">
            <ul className="space-y-1">
              {visibleItems.map((item) => {
                const Icon = ICON_MAP[item.icon];
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSheetOpen(false)}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-white/10 text-white'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0" />}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop: floating icon rail */}
      <aside className="hidden md:flex flex-col items-center w-[72px] py-4 gap-1 bg-slate-900 rounded-2xl m-3 shrink-0">
        {/* Logo */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 font-bold text-sm mb-2">
          P
        </div>

        {/* Nav icons */}
        <nav className="flex flex-col items-center gap-1 flex-1">
          {visibleItems.map((item) => {
            const Icon = ICON_MAP[item.icon];
            const active = isActive(item.href);
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                      active
                        ? 'bg-white text-slate-900'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

      </aside>
    </>
  );
}
