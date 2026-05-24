import { describe, expect, it } from 'vitest';
import { pushPayloadSchema } from '../notification';
import { channelMessageSchema } from '../../adapters/channel';

describe('pushPayloadSchema', () => {
  it('accepts valid push payload', () => {
    expect(() =>
      pushPayloadSchema.parse({
        title: 'Morning Wag',
        body: 'HRV 72 — solid recovery.',
        channel: 'apns',
        user_id: 'user_01',
        idempotency_key: 'key_abc',
      })
    ).not.toThrow();
  });
  it('accepts payload with card', () => {
    expect(() =>
      pushPayloadSchema.parse({
        title: 'Adjust?',
        body: 'Move meeting forward?',
        channel: 'telegram',
        user_id: 'user_01',
        idempotency_key: 'key_def',
        card: {
          kind: 'adjustment_proposal',
          subtype: 'meeting_move',
          reasoning: 'HRV low',
          proposed_change: {},
          actions: [],
        },
      })
    ).not.toThrow();
  });
  it('rejects invalid channel', () => {
    expect(() =>
      pushPayloadSchema.parse({
        title: 'x', body: 'y', channel: 'sms', user_id: 'u', idempotency_key: 'k',
      })
    ).toThrow();
  });
});

describe('channelMessageSchema', () => {
  it('accepts valid channel message', () => {
    expect(() =>
      channelMessageSchema.parse({
        channel: 'telegram',
        user_id: 'user_01',
        text: 'Hello',
        received_at: '2026-01-01T10:00:00Z',
      })
    ).not.toThrow();
  });
  it('rejects missing text', () => {
    expect(() =>
      channelMessageSchema.parse({
        channel: 'telegram', user_id: 'user_01', received_at: '2026-01-01T10:00:00Z',
      })
    ).toThrow();
  });
});
