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
    <div className="flex h-screen">
      <Sidebar role={profile.role as AppRole} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          email={profile.email}
          role={profile.role as AppRole}
          fullName={profile.full_name}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
