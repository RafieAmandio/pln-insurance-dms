'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ROLE_LABELS, type AppRole } from '@/lib/auth/roles';

interface HeaderProps {
  email: string;
  role: AppRole;
  fullName: string;
}

export function Header({ email, role, fullName }: HeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-3">
      <div>
        <h1 className="text-sm font-medium text-gray-900">{fullName}</h1>
        <p className="text-xs text-gray-500">{email}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          {ROLE_LABELS[role]}
        </span>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
