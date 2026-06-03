import { describe, expect, it } from 'vitest';
import { routingPolicySchema, modelRouteSchema, gatewayStepSchema } from '../routing';
import { runStateSchema, runRecordSchema, outboxEntrySchema } from '../run';
import { sessionStateSchema } from '../session';
import {
  carryoverBucketSchema, compactAttachmentSchema, CARRYOVER_BUCKET_CAPS,
} from '../working-memory';

describe('gatewayStepSchema', () => {
  it('valid', () => {
    expect(() => gatewayStepSchema.parse({ provider: 'workers_ai', model: 'gemma-4-27b' })).not.toThrow();
  });
  it('invalid: unknown provider', () => {
    expect(() => gatewayStepSchema.parse({ provider: 'openai', model: 'gemma-4-27b' })).toThrow();
  });
});

describe('routingPolicySchema / modelRouteSchema', () => {
  it('valid: route with fallback + escalation default', () => {
    const parsed = routingPolicySchema.parse({
      routes: [{
        trigger: 'brief',
        primary: { provider: 'workers_ai', model: 'gemma-4-27b', cache: 'none' },
        fallback: [{ provider: 'anthropic', model: 'claude-sonnet-4-6', cache: 'anthropic_native' }],
      }],
    });
    expect(parsed.template_fallback).toBe(true);
    expect(parsed.escalation).toEqual([]);
  });
  it('invalid: route with unknown trigger', () => {
    expect(() => modelRouteSchema.parse({
      trigger: 'morning_wag',
      primary: { provider: 'workers_ai', model: 'gemma-4-27b' },
    })).toThrow();
  });
});

describe('runStateSchema', () => {
  const states = [
    'PENDING', 'CONTEXT_BUILT', 'LLM_CALLED', 'TOOLS_DONE', 'GATED', 'DELIVERED', 'DONE', 'FAILED',
  ] as const;
  it('accepts the full lifecycle', () => {
    for (const s of states) expect(runStateSchema.parse(s)).toBe(s);
  });
  it('rejects unknown state', () => {
    expect(() => runStateSchema.parse('RUNNING')).toThrow();
  });
});

describe('runRecordSchema', () => {
  it('valid', () => {
    expect(() => runRecordSchema.parse({
      run_id: 'run_01', user_id: 'u', trigger: 'brief', variant: 'morning',
      state: 'CONTEXT_BUILT', step: 1, run_nonce: 'nonce_abc',
      created_at: '2026-01-01T06:00:00Z', updated_at: '2026-01-01T06:00:01Z',
    })).not.toThrow();
  });
  it('invalid: negative step', () => {
    expect(() => runRecordSchema.parse({
      run_id: 'run_01', user_id: 'u', trigger: 'brief',
      state: 'PENDING', step: -1, run_nonce: 'n',
      created_at: '2026-01-01T06:00:00Z', updated_at: '2026-01-01T06:00:00Z',
    })).toThrow();
  });
});

describe('outboxEntrySchema', () => {
  it('valid: keyed by idempotency id, defaults pending', () => {
    const parsed = outboxEntrySchema.parse({
      id: 'hash_user_brief_morning_nonce', run_id: 'run_01', kind: 'telegram',
      payload_json: { content: 'hi' }, created_at: '2026-01-01T06:00:00Z',
    });
    expect(parsed.status).toBe('pending');
    expect(parsed.attempts).toBe(0);
  });
  it('invalid: unknown outbox kind', () => {
    expect(() => outboxEntrySchema.parse({
      id: 'x', run_id: 'r', kind: 'email', payload_json: {}, created_at: '2026-01-01T06:00:00Z',
    })).toThrow();
  });
});

describe('sessionStateSchema (ADR-0033)', () => {
  const validCanaries = ['0123456789abcdef', '0011223344556677', '8899aabbccddeeff'];
  it('valid: reset slate', () => {
    expect(() => sessionStateSchema.parse({
      toolPermissions: ['get_crs', 'send_message'],
      canaryTokens: validCanaries,
      rateLimitWindow: { start: 0, tool_counts: {} },
    })).not.toThrow();
  });
  it('invalid: tool permission not in ToolName union', () => {
    expect(() => sessionStateSchema.parse({
      toolPermissions: ['delete_everything'],
      canaryTokens: validCanaries,
      rateLimitWindow: { start: 0, tool_counts: {} },
    })).toThrow();
  });
  // Canary invariants — ADR-0032 line 64 pins "fresh per session, 16-char hex × 3".
  const baseValid = {
    toolPermissions: ['get_crs'],
    rateLimitWindow: { start: 0, tool_counts: {} },
  };
  it('invalid canary: empty array', () => {
    expect(sessionStateSchema.safeParse({ ...baseValid, canaryTokens: [] }).success).toBe(false);
  });
  it('invalid canary: 2 tokens (length != 3)', () => {
    expect(sessionStateSchema.safeParse({
      ...baseValid, canaryTokens: ['0123456789abcdef', '0011223344556677'],
    }).success).toBe(false);
  });
  it('invalid canary: 4 tokens (length != 3)', () => {
    expect(sessionStateSchema.safeParse({
      ...baseValid,
      canaryTokens: ['0123456789abcdef', '0011223344556677', '8899aabbccddeeff', 'fedcba9876543210'],
    }).success).toBe(false);
  });
  it('invalid canary: one short token (15 chars)', () => {
    expect(sessionStateSchema.safeParse({
      ...baseValid, canaryTokens: ['0123456789abcde', '0011223344556677', '8899aabbccddeeff'],
    }).success).toBe(false);
  });
  it('invalid canary: one non-hex token', () => {
    expect(sessionStateSchema.safeParse({
      ...baseValid, canaryTokens: ['gggggggggggggggg', '0011223344556677', '8899aabbccddeeff'],
    }).success).toBe(false);
  });
  it('invalid canary: two duplicates (case-insensitive)', () => {
    expect(sessionStateSchema.safeParse({
      ...baseValid,
      canaryTokens: ['0123456789abcdef', '0123456789ABCDEF', 'fedcba9876543210'],
    }).success).toBe(false);
  });
});

describe('working-memory carryover (ADR-0057)', () => {
  it('caps match ADR-0057', () => {
    expect(CARRYOVER_BUCKET_CAPS).toEqual({
      recent_work_log: 10, recent_verified_work: 10, read_file_state: 6, async_agent_state: 8,
    });
  });
  it('carryoverBucketSchema valid', () => {
    expect(() => carryoverBucketSchema.parse({
      name: 'recent_work_log', cap: 10,
      entries: [{ at: '2026-01-01T06:00:00Z', summary: 'read calendar' }],
    })).not.toThrow();
  });
  it('carryoverBucketSchema invalid: unknown bucket name', () => {
    expect(() => carryoverBucketSchema.parse({ name: 'scratch', cap: 10, entries: [] })).toThrow();
  });
  it('carryoverBucketSchema invalid: cap mismatched against ADR-0057', () => {
    expect(() => carryoverBucketSchema.parse({ name: 'read_file_state', cap: 999, entries: [] })).toThrow();
  });
  it('carryoverBucketSchema invalid: entries exceed cap', () => {
    const entries = Array.from({ length: 7 }, (_, i) => ({
      at: '2026-01-01T06:00:00Z', summary: `read ${i}`,
    }));
    // read_file_state cap is 6 — a 7th entry must be rejected (cap matches, length trips)
    expect(() => carryoverBucketSchema.parse({ name: 'read_file_state', cap: 6, entries })).toThrow();
  });
  it('compactAttachmentSchema valid', () => {
    expect(() => compactAttachmentSchema.parse({
      bucket: 'read_file_state', rendered: '...', entry_count: 3,
    })).not.toThrow();
  });
});
