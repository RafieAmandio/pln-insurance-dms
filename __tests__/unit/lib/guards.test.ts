import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

// Mock supabase server client
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    })
  ),
}));

import { redirect } from 'next/navigation';

describe('Auth Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  describe('requireAuth', () => {
    it('redirects to /login when no user', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      const { requireAuth } = await import('@/lib/auth/guards');
      await expect(requireAuth()).rejects.toThrow('REDIRECT:/login');
      expect(redirect).toHaveBeenCalledWith('/login');
    });

    it('redirects to /login when no profile', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: '123' } } });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null }),
          }),
        }),
      });

      const { requireAuth } = await import('@/lib/auth/guards');
      await expect(requireAuth()).rejects.toThrow('REDIRECT:/login');
    });

    it('returns user and profile when authenticated', async () => {
      const mockUser = { id: '123', email: 'test@test.com' };
      const mockProfile = { id: '123', role: 'manager', email: 'test@test.com' };
      mockGetUser.mockResolvedValue({ data: { user: mockUser } });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile }),
          }),
        }),
      });

      const { requireAuth } = await import('@/lib/auth/guards');
      const result = await requireAuth();
      expect(result.user).toEqual(mockUser);
      expect(result.profile).toEqual(mockProfile);
    });
  });

  describe('requirePermission', () => {
    it('redirects when user lacks permission', async () => {
      const mockUser = { id: '123' };
      const mockProfile = { id: '123', role: 'pic_gudang', email: 'test@test.com' };
      mockGetUser.mockResolvedValue({ data: { user: mockUser } });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile }),
          }),
        }),
      });

      const { requirePermission } = await import('@/lib/auth/guards');
      // pic_gudang cannot approve
      await expect(requirePermission('document:approve')).rejects.toThrow('REDIRECT:/');
    });

    it('allows when user has permission', async () => {
      const mockUser = { id: '123' };
      const mockProfile = { id: '123', role: 'pic_gudang', email: 'test@test.com' };
      mockGetUser.mockResolvedValue({ data: { user: mockUser } });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile }),
          }),
        }),
      });

      const { requirePermission } = await import('@/lib/auth/guards');
      // pic_gudang can upload
      const result = await requirePermission('document:upload');
      expect(result.profile.role).toBe('pic_gudang');
    });
  });
});
