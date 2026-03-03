'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Bell, LogOut, Search } from 'lucide-react';
import { ROLE_LABELS, type AppRole } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  email: string;
  role: AppRole;
  fullName: string;
}

export function Header({ email, role, fullName }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');

  const currentPeriod = searchParams.get('period') ?? 'month';

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  function handlePeriodChange(period: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);
    router.push(`${pathname}?${params.toString()}`);
  }

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="flex items-center justify-between bg-background/80 backdrop-blur-sm border-b border-border/50 px-6 py-3">
      {/* Left: filter pills */}
      <div className="hidden sm:block">
        <Tabs value={currentPeriod} onValueChange={handlePeriodChange}>
          <TabsList className="h-9 bg-muted/50 rounded-full p-1">
            <TabsTrigger
              value="today"
              className="rounded-full px-4 text-xs data-[state=active]:bg-foreground data-[state=active]:text-background"
            >
              Today
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="rounded-full px-4 text-xs data-[state=active]:bg-foreground data-[state=active]:text-background"
            >
              This Week
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className="rounded-full px-4 text-xs data-[state=active]:bg-foreground data-[state=active]:text-background"
            >
              This Month
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Center: search */}
      <form onSubmit={handleSearchSubmit} className="hidden sm:block relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search documents..."
          className="pl-9 rounded-full bg-muted/30 border-0 h-9 w-64"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Right: bell + avatar */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm font-medium sm:inline-block">
                {fullName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{fullName}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
              <p className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</p>
            </div>
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
