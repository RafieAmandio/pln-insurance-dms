import { describe, it, expect, vi, afterEach } from 'vitest';
import { getRelativeTime } from '@/lib/utils/relative-time';

describe('getRelativeTime', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "Just now" for timestamps less than 1 minute ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T12:00:30Z'));
    expect(getRelativeTime('2026-03-01T12:00:00Z')).toBe('Just now');
  });

  it('returns "X min ago" for timestamps less than 60 minutes ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T12:15:00Z'));
    expect(getRelativeTime('2026-03-01T12:00:00Z')).toBe('15 min ago');
  });

  it('returns "X hours ago" for timestamps less than 24 hours ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-01T15:00:00Z'));
    expect(getRelativeTime('2026-03-01T12:00:00Z')).toBe('3 hours ago');
  });

  it('returns "X days ago" for timestamps less than 7 days ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-04T12:00:00Z'));
    expect(getRelativeTime('2026-03-01T12:00:00Z')).toBe('3 days ago');
  });

  it('returns formatted date for timestamps 7+ days ago', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-15T12:00:00Z'));
    const result = getRelativeTime('2026-03-01T12:00:00Z');
    // Should be a formatted date string, not relative
    expect(result).not.toContain('ago');
    expect(result).not.toBe('Just now');
  });
});
