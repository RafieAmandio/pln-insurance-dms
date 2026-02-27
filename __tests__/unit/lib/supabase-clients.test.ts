import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => ({
    auth: { getSession: vi.fn() },
    from: vi.fn(),
  })),
  createServerClient: vi.fn(() => ({
    auth: { getSession: vi.fn() },
    from: vi.fn(),
  })),
}));

// Mock @supabase/supabase-js
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: { admin: {} },
    from: vi.fn(),
  })),
}));

describe('Supabase Clients', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('browser client creates without throwing', async () => {
    const { createClient } = await import('@/lib/supabase/client');
    expect(() => createClient()).not.toThrow();
  });

  it('browser client returns object with auth and from', async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const client = createClient();
    expect(client).toHaveProperty('auth');
    expect(client).toHaveProperty('from');
  });

  it('admin client creates without throwing', async () => {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    expect(() => createAdminClient()).not.toThrow();
  });

  it('admin client returns object with auth.admin', async () => {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const client = createAdminClient();
    expect(client.auth).toHaveProperty('admin');
  });
});
