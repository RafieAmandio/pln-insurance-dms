import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { documentMachine, getAvailableTransitions } from '@/lib/documents/state-machine';

function testTransition(
  fromState: string,
  event: { type: string; role: string; actorId: string }
) {
  const actor = createActor(documentMachine, {
    snapshot: documentMachine.resolveState({ value: fromState, context: {} }),
  });
  actor.start();
  const canDo = actor.getSnapshot().can(event);
  actor.stop();
  return canDo;
}

describe('Document State Machine', () => {
  describe('Valid transitions', () => {
    it('PIC Klaim can submit draft for review', () => {
      expect(
        testTransition('draft', {
          type: 'SUBMIT_FOR_REVIEW',
          role: 'pic_klaim',
          actorId: 'user-1',
        })
      ).toBe(true);
    });

    it('Manager can approve reviewed document', () => {
      expect(
        testTransition('reviewed', {
          type: 'APPROVE',
          role: 'manager',
          actorId: 'user-1',
        })
      ).toBe(true);
    });

    it('Manager can reject reviewed document', () => {
      expect(
        testTransition('reviewed', {
          type: 'REJECT',
          role: 'manager',
          actorId: 'user-1',
        })
      ).toBe(true);
    });

    it('Manager can archive approved document', () => {
      expect(
        testTransition('approved', {
          type: 'ARCHIVE',
          role: 'manager',
          actorId: 'user-1',
        })
      ).toBe(true);
    });
  });

  describe('Invalid transitions', () => {
    it('PIC Gudang cannot submit for review', () => {
      expect(
        testTransition('draft', {
          type: 'SUBMIT_FOR_REVIEW',
          role: 'pic_gudang',
          actorId: 'user-1',
        })
      ).toBe(false);
    });

    it('Manager cannot submit for review', () => {
      expect(
        testTransition('draft', {
          type: 'SUBMIT_FOR_REVIEW',
          role: 'manager',
          actorId: 'user-1',
        })
      ).toBe(false);
    });

    it('PIC Klaim cannot approve', () => {
      expect(
        testTransition('reviewed', {
          type: 'APPROVE',
          role: 'pic_klaim',
          actorId: 'user-1',
        })
      ).toBe(false);
    });

    it('PIC Gudang cannot approve', () => {
      expect(
        testTransition('reviewed', {
          type: 'APPROVE',
          role: 'pic_gudang',
          actorId: 'user-1',
        })
      ).toBe(false);
    });

    it('cannot skip states (draft -> approved)', () => {
      expect(
        testTransition('draft', {
          type: 'APPROVE',
          role: 'manager',
          actorId: 'user-1',
        })
      ).toBe(false);
    });

    it('cannot skip states (draft -> archived)', () => {
      expect(
        testTransition('draft', {
          type: 'ARCHIVE',
          role: 'manager',
          actorId: 'user-1',
        })
      ).toBe(false);
    });

    it('archived is final - no transitions allowed', () => {
      expect(
        testTransition('archived', {
          type: 'SUBMIT_FOR_REVIEW',
          role: 'pic_klaim',
          actorId: 'user-1',
        })
      ).toBe(false);

      expect(
        testTransition('archived', {
          type: 'APPROVE',
          role: 'manager',
          actorId: 'user-1',
        })
      ).toBe(false);
    });
  });

  describe('getAvailableTransitions', () => {
    it('returns SUBMIT_FOR_REVIEW for pic_klaim on draft', () => {
      expect(getAvailableTransitions('draft', 'pic_klaim')).toEqual(['SUBMIT_FOR_REVIEW']);
    });

    it('returns empty for pic_gudang on draft', () => {
      expect(getAvailableTransitions('draft', 'pic_gudang')).toEqual([]);
    });

    it('returns APPROVE and REJECT for manager on reviewed', () => {
      expect(getAvailableTransitions('reviewed', 'manager')).toEqual(['APPROVE', 'REJECT']);
    });

    it('returns ARCHIVE for manager on approved', () => {
      expect(getAvailableTransitions('approved', 'manager')).toEqual(['ARCHIVE']);
    });

    it('returns empty for archived', () => {
      expect(getAvailableTransitions('archived', 'manager')).toEqual([]);
    });
  });
});
