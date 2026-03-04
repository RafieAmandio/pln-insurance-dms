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
  ChevronLeft,
  ChevronRight,
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
  const [collapsed, setCollapsed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(role, item.permission)
  );

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  const navLink = (item: typeof NAV_ITEMS[number], onClick?: () => void) => {
    const Icon = ICON_MAP[item.icon];
    const active = isActive(item.href);

    if (collapsed) {
      return (
        <Tooltip key={item.href}>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              onClick={onClick}
              aria-label={item.label}
              className={`flex items-center justify-center h-10 w-10 rounded-lg text-[13px] font-medium transition-colors ${
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {Icon && <Icon size={18} className="shrink-0" />}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{item.label}</p>
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClick}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
          active
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`}
      >
        {Icon && <Icon size={18} className="shrink-0" />}
        <span>{item.label}</span>
      </Link>
    );
  };

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
        <SheetContent side="left" className="w-[260px] bg-[#022874] p-0 border-0">
          <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden">
              <img src="/logo_pln.png" alt="PLN" className="h-7 w-7 object-contain" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold leading-tight text-white">PLN Insurance</h1>
              <p className="text-[11px] text-white/60">Document Management</p>
            </div>
          </div>
          <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
            {visibleItems.map((item) => {
              const Icon = ICON_MAP[item.icon];
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSheetOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                    active
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {Icon && <Icon size={18} className="shrink-0" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop: collapsible sidebar */}
      <aside
        className={`hidden md:flex flex-col h-screen bg-[#022874] shrink-0 transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/logo_pln.png" alt="PLN" className="h-7 w-7 object-contain" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold leading-tight text-white">PLN Insurance</h1>
              <p className="text-[11px] text-white/60">Document Management</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className={`flex-1 py-3 space-y-0.5 overflow-y-auto ${collapsed ? 'px-2 flex flex-col items-center' : 'px-3'}`}>
          {visibleItems.map((item) => navLink(item))}
        </nav>

        {/* Collapse toggle */}
        <div className={`border-t border-white/10 p-3 ${collapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`flex items-center gap-3 rounded-lg text-[13px] text-white/70 hover:bg-white/10 hover:text-white transition-colors ${
              collapsed
                ? 'h-10 w-10 justify-center'
                : 'px-3 py-2.5 w-full'
            }`}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
