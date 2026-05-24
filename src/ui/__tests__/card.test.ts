import { describe, expect, it } from 'vitest';
import { cardActionSchema, waldoCardSchema } from '../card';

const validAction = {
  label: 'Confirm',
  handler: 'execute_action',
  args: { task_id: 'task_01' },
  confirmation_token: 'hmac_abc123',
};

describe('cardActionSchema', () => {
  it('accepts valid action', () => {
    expect(() => cardActionSchema.parse(validAction)).not.toThrow();
  });
  it('accepts action without optional fields', () => {
    expect(() => cardActionSchema.parse({ label: 'OK', handler: 'send_message' })).not.toThrow();
  });
  it('rejects missing label', () => {
    expect(() => cardActionSchema.parse({ handler: 'send_message' })).toThrow();
  });
});

describe('waldoCardSchema', () => {
  it('accepts adjustment_proposal card', () => {
    expect(() =>
      waldoCardSchema.parse({
        kind: 'adjustment_proposal',
        subtype: 'meeting_move',
        reasoning: 'HRV dropped before call',
        proposed_change: { event_id: 'evt_01' },
        actions: [validAction],
      })
    ).not.toThrow();
  });

  it('accepts brief card', () => {
    expect(() =>
      waldoCardSchema.parse({
        kind: 'brief',
        variant: 'morning',
        summary: 'Good recovery. 3 meetings ahead.',
        actions: [],
      })
    ).not.toThrow();
  });

  it('accepts context card', () => {
    expect(() =>
      waldoCardSchema.parse({
        kind: 'context',
        title: 'Board Call at 2pm',
        body: 'Your last board call HRV impact was -18pts.',
        actions: [],
      })
    ).not.toThrow();
  });

  it('rejects unknown card kind', () => {
    expect(() =>
      waldoCardSchema.parse({ kind: 'unknown_card', data: {} })
    ).toThrow();
  });

  it('rejects adjustment_proposal missing subtype', () => {
    expect(() =>
      waldoCardSchema.parse({
        kind: 'adjustment_proposal',
        reasoning: 'test',
        proposed_change: {},
        actions: [],
      })
    ).toThrow();
  });
});
