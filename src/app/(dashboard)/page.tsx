import { requireAuth } from '@/lib/auth/guards';
import { ROLE_LABELS } from '@/lib/auth/roles';
import type { AppRole } from '@/lib/auth/roles';

export default async function DashboardPage() {
  const { profile } = await requireAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Welcome, {profile.full_name}. You are logged in as{' '}
        <span className="font-medium">{ROLE_LABELS[profile.role as AppRole]}</span>.
      </p>
    </div>
  );
}
