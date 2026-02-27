import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { StateTransitionButton } from '@/components/documents/state-transition-button';

describe('StateTransitionButton', () => {
  it('shows Submit for Review for pic_klaim on draft', () => {
    render(
      <StateTransitionButton documentId="doc-1" currentState="draft" role="pic_klaim" />
    );
    expect(screen.getByText('Submit for Review')).toBeInTheDocument();
  });

  it('shows no buttons for pic_gudang on draft', () => {
    const { container } = render(
      <StateTransitionButton documentId="doc-1" currentState="draft" role="pic_gudang" />
    );
    expect(container.innerHTML).toBe('');
  });

  it('shows Approve and Reject for manager on reviewed', () => {
    render(
      <StateTransitionButton documentId="doc-1" currentState="reviewed" role="manager" />
    );
    expect(screen.getByText('Approve')).toBeInTheDocument();
    expect(screen.getByText('Reject')).toBeInTheDocument();
  });

  it('shows Archive for manager on approved', () => {
    render(
      <StateTransitionButton documentId="doc-1" currentState="approved" role="manager" />
    );
    expect(screen.getByText('Archive')).toBeInTheDocument();
  });

  it('shows no buttons for archived state', () => {
    const { container } = render(
      <StateTransitionButton documentId="doc-1" currentState="archived" role="manager" />
    );
    expect(container.innerHTML).toBe('');
  });

  it('shows no buttons for pic_klaim on reviewed', () => {
    const { container } = render(
      <StateTransitionButton documentId="doc-1" currentState="reviewed" role="pic_klaim" />
    );
    expect(container.innerHTML).toBe('');
  });
});
