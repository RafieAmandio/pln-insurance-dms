import { Suspense } from 'react';
import { requireAuth } from '@/lib/auth/guards';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import type { AppRole } from '@/lib/auth/roles';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAuth();

  return (
    <div className="flex h-screen bg-background">
      <Sidebar role={profile.role as AppRole} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Suspense fallback={<div className="h-14 border-b" />}>
          <Header
            email={profile.email}
            role={profile.role as AppRole}
            fullName={profile.full_name}
          />
        </Suspense>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
