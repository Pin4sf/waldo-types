import { describe, expect, it } from 'vitest';
import { briefVariantSchema, invocationContextSchema, triggerTypeSchema } from '../trigger';

describe('triggerTypeSchema', () => {
  const valid = [
    'brief', 'fetch_alert', 'patrol', 'handoff_explore', 'handoff_plan',
    'handoff_act', 'handoff_replan', 'intervention', 'user_message', 'dreaming_mode',
    'pre_activity_spot',
  ] as const;

  it('accepts all 11 trigger types', () => {
    for (const t of valid) {
      expect(triggerTypeSchema.parse(t)).toBe(t);
    }
  });
  it('accepts pre_activity_spot (added v0.2.0, ADR-0042)', () => {
    expect(triggerTypeSchema.parse('pre_activity_spot')).toBe('pre_activity_spot');
  });
  it('rejects unknown trigger', () => {
    expect(() => triggerTypeSchema.parse('morning_wag')).toThrow();
  });
});

describe('briefVariantSchema', () => {
  it('accepts all 4 variants', () => {
    for (const v of ['morning', 'midday', 'evening', 'event'] as const) {
      expect(briefVariantSchema.parse(v)).toBe(v);
    }
  });
  it('rejects invalid variant', () => {
    expect(() => briefVariantSchema.parse('afternoon')).toThrow();
  });
});

describe('invocationContextSchema', () => {
  // 3 valid 16-char hex tokens — ADR-0032 line 64. Reused across fixtures so the
  // "rejects invalid zone" test discriminates on zone, not on canary invariant.
  const validCanaries = ['0123456789abcdef', '0011223344556677', '8899aabbccddeeff'];
  const baseUser = {
    id: 'user_01', name: 'Shivansh', timezone: 'Asia/Kolkata',
    chronotype: 'morning' as const, wake_time: '06:30', evening_time: '22:00',
    day_type: 'deep_work' as const, autonomy_level: 'L2' as const,
    voice_sensitivity: 'normal' as const, response_depth: 'default' as const,
    protect_morning_focus: true, block_deep_work_windows: false,
    defer_low_urgency_notifications: true, focus_window_default: 50,
    connectors: {}, pricing_tier: 'pro' as const, daily_push_budget_remaining: 3,
  };
  const baseContext = {
    traceId: 'trace_01',
    userId: 'user_01',
    trigger: 'brief' as const,
    variant: 'morning' as const,
    triggeredAt: '2026-01-01T06:30:00Z',
    canaryTokens: validCanaries,
    zone: 'energized' as const,
    user: baseUser,
    do: { _kind: 'do-stub' as const },
  };

  it('accepts valid context', () => {
    expect(() => invocationContextSchema.parse(baseContext)).not.toThrow();
  });

  it('rejects invalid zone', () => {
    expect(() =>
      invocationContextSchema.parse({ ...baseContext, trigger: 'patrol', zone: 'rested' })
    ).toThrow();
  });

  // Canary invariants — ADR-0032 line 64. Each case PASSES under the pre-fix
  // `z.array(z.string())` schema, so these tests are non-vacuous proof that the
  // strict invariant is now applied at the InvocationContext boundary
  // (where Scribe/PostLLMCall leak-check reads canaries).
  it('invalid canary: empty array', () => {
    expect(invocationContextSchema.safeParse({ ...baseContext, canaryTokens: [] }).success).toBe(false);
  });
  it('invalid canary: 2 tokens (length != 3)', () => {
    expect(invocationContextSchema.safeParse({
      ...baseContext, canaryTokens: ['0123456789abcdef', '0011223344556677'],
    }).success).toBe(false);
  });
  it('invalid canary: 4 tokens (length != 3)', () => {
    expect(invocationContextSchema.safeParse({
      ...baseContext,
      canaryTokens: ['0123456789abcdef', '0011223344556677', '8899aabbccddeeff', 'fedcba9876543210'],
    }).success).toBe(false);
  });
  it('invalid canary: one short token (15 chars)', () => {
    expect(invocationContextSchema.safeParse({
      ...baseContext, canaryTokens: ['0123456789abcde', '0011223344556677', '8899aabbccddeeff'],
    }).success).toBe(false);
  });
  it('invalid canary: one non-hex token', () => {
    expect(invocationContextSchema.safeParse({
      ...baseContext, canaryTokens: ['gggggggggggggggg', '0011223344556677', '8899aabbccddeeff'],
    }).success).toBe(false);
  });
  it('invalid canary: case-insensitive duplicate', () => {
    expect(invocationContextSchema.safeParse({
      ...baseContext,
      canaryTokens: ['0123456789abcdef', '0123456789ABCDEF', 'fedcba9876543210'],
    }).success).toBe(false);
  });
});
