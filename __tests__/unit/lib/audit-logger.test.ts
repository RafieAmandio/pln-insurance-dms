import { describe, it, expect, vi } from 'vitest';
import { logAudit } from '@/lib/audit/logger';

describe('Audit Logger', () => {
  it('inserts correct data into audit_logs', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSupabase = {
      from: vi.fn(() => ({ insert: mockInsert })),
    };

    await logAudit({
      supabase: mockSupabase as never,
      action: 'upload',
      actorId: 'user-1',
      actorEmail: 'test@test.com',
      actorRole: 'pic_gudang',
      documentId: 'doc-1',
      details: { file_name: 'test.pdf' },
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('audit_logs');
    expect(mockInsert).toHaveBeenCalledWith({
      document_id: 'doc-1',
      claim_id: null,
      action: 'upload',
      actor_id: 'user-1',
      actor_email: 'test@test.com',
      actor_role: 'pic_gudang',
      old_status: null,
      new_status: null,
      details: { file_name: 'test.pdf' },
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0',
    });
  });

  it('handles status change parameters', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSupabase = {
      from: vi.fn(() => ({ insert: mockInsert })),
    };

    await logAudit({
      supabase: mockSupabase as never,
      action: 'status_change',
      actorId: 'user-1',
      actorEmail: 'test@test.com',
      actorRole: 'manager',
      documentId: 'doc-1',
      oldStatus: 'reviewed',
      newStatus: 'approved',
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        old_status: 'reviewed',
        new_status: 'approved',
        action: 'status_change',
      })
    );
  });

  it('logs error on failure without throwing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockInsert = vi.fn().mockResolvedValue({ error: { message: 'DB error' } });
    const mockSupabase = {
      from: vi.fn(() => ({ insert: mockInsert })),
    };

    await logAudit({
      supabase: mockSupabase as never,
      action: 'view',
      actorId: 'user-1',
      actorEmail: 'test@test.com',
      actorRole: 'pic_gudang',
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to log audit:', { message: 'DB error' });
    consoleSpy.mockRestore();
  });
});
