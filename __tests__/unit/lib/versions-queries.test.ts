import { describe, it, expect, vi } from 'vitest';
import { lockDocument, unlockDocument, createVersion } from '@/lib/versions/queries';

/**
 * Creates a mock Supabase client where all chainable methods return the mock itself,
 * and `single` is set up for sequential mockResolvedValueOnce calls.
 * For non-single terminal calls (like update().eq() returning { error }),
 * use eq.mockReturnValueOnce after the single mocks are set up.
 */
function createChainMock() {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  chain.from = vi.fn().mockReturnValue(chain);
  chain.select = vi.fn().mockReturnValue(chain);
  chain.insert = vi.fn().mockReturnValue(chain);
  chain.update = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn();
  chain.order = vi.fn().mockReturnValue(chain);
  return chain;
}

describe('lockDocument', () => {
  it('rejects if already locked by another user', async () => {
    const supabase = createChainMock();
    supabase.single.mockResolvedValueOnce({
      data: { locked_by: 'other-user', locked_at: '2024-01-01T00:00:00Z' },
      error: null,
    });

    await expect(
      lockDocument(supabase as never, 'doc-1', 'current-user')
    ).rejects.toThrow('Document is already locked by another user');
  });

  it('allows locking if not locked', async () => {
    const supabase = createChainMock();
    supabase.single
      .mockResolvedValueOnce({
        data: { locked_by: null, locked_at: null },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { locked_by: 'current-user', locked_at: '2024-01-01T00:00:00Z' },
        error: null,
      });

    const result = await lockDocument(supabase as never, 'doc-1', 'current-user');
    expect(result.locked_by).toBe('current-user');
  });

  it('allows re-locking by the same user', async () => {
    const supabase = createChainMock();
    supabase.single
      .mockResolvedValueOnce({
        data: { locked_by: 'current-user', locked_at: '2024-01-01T00:00:00Z' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { locked_by: 'current-user', locked_at: '2024-01-02T00:00:00Z' },
        error: null,
      });

    const result = await lockDocument(supabase as never, 'doc-1', 'current-user');
    expect(result.locked_by).toBe('current-user');
  });
});

describe('unlockDocument', () => {
  it('allows the locking user to unlock', async () => {
    const supabase = createChainMock();
    // 1st chain: from().select().eq().single() -> returns locked_by
    supabase.single.mockResolvedValueOnce({
      data: { locked_by: 'user-1' },
      error: null,
    });
    // 2nd chain: from().update().eq() -> the last eq returns { error: null }
    // eq is called multiple times: once in select chain (.eq('id',...)), once in update chain (.eq('id',...))
    // The default mockReturnValue(chain) handles the first eq (select chain -> goes to single)
    // We need the 2nd eq call (update chain) to return { error: null }
    // eq calls: 1st = select path (needs chain for .single()), 2nd = update path (terminal)
    // Since eq default is chain, after single resolves, the update path calls eq again
    // We track calls: eq call #1 for select, eq call #2 for update
    let eqCallCount = 0;
    supabase.eq.mockImplementation(() => {
      eqCallCount++;
      if (eqCallCount <= 1) return supabase; // select chain, leads to .single()
      return { error: null }; // update chain, terminal
    });

    await expect(
      unlockDocument(supabase as never, 'doc-1', 'user-1')
    ).resolves.toBeUndefined();
  });

  it('allows manager to unlock any document', async () => {
    const supabase = createChainMock();
    supabase.single.mockResolvedValueOnce({
      data: { locked_by: 'other-user' },
      error: null,
    });
    let eqCallCount = 0;
    supabase.eq.mockImplementation(() => {
      eqCallCount++;
      if (eqCallCount <= 1) return supabase;
      return { error: null };
    });

    await expect(
      unlockDocument(supabase as never, 'doc-1', 'manager-user', 'manager')
    ).resolves.toBeUndefined();
  });

  it('allows super_admin to unlock any document', async () => {
    const supabase = createChainMock();
    supabase.single.mockResolvedValueOnce({
      data: { locked_by: 'other-user' },
      error: null,
    });
    let eqCallCount = 0;
    supabase.eq.mockImplementation(() => {
      eqCallCount++;
      if (eqCallCount <= 1) return supabase;
      return { error: null };
    });

    await expect(
      unlockDocument(supabase as never, 'doc-1', 'admin-user', 'super_admin')
    ).resolves.toBeUndefined();
  });

  it('rejects if different user without elevated role', async () => {
    const supabase = createChainMock();
    supabase.single.mockResolvedValueOnce({
      data: { locked_by: 'other-user' },
      error: null,
    });

    await expect(
      unlockDocument(supabase as never, 'doc-1', 'regular-user', 'pic_gudang')
    ).rejects.toThrow('Only the locking user, manager, or super_admin can unlock');
  });
});

describe('createVersion', () => {
  it('increments version number from current document version', async () => {
    const supabase = createChainMock();

    // single() call #1: get document version
    supabase.single.mockResolvedValueOnce({
      data: { version: 2 },
      error: null,
    });
    // single() call #2: insert version record
    supabase.single.mockResolvedValueOnce({
      data: {
        id: 'ver-1',
        document_id: 'doc-1',
        version_number: 3,
        description: 'Test version',
        file_path: 'docs/test.pdf',
        file_size: 1024,
        created_by: 'user-1',
      },
      error: null,
    });
    // eq() for update path (3rd eq call): from().update().eq() -> { error: null }
    // eq calls: #1 select.eq(id), #2 insert (none), #3 update.eq(id)
    // Actually insert chain is: from().insert().select().single() - no eq
    // update chain is: from().update().eq() -> terminal
    let eqCallCount = 0;
    supabase.eq.mockImplementation(() => {
      eqCallCount++;
      if (eqCallCount <= 1) return supabase; // select chain eq
      return { error: null }; // update chain eq (terminal)
    });

    const result = await createVersion(
      supabase as never,
      'doc-1',
      'Test version',
      'docs/test.pdf',
      1024,
      'user-1'
    );

    expect(result.version_number).toBe(3);
  });

  it('throws if document not found', async () => {
    const supabase = createChainMock();
    supabase.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'Not found' },
    });

    await expect(
      createVersion(supabase as never, 'missing', 'desc', 'path', 100, 'user-1')
    ).rejects.toThrow('Document not found');
  });
});
