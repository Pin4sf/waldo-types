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
  it('accepts valid context', () => {
    expect(() =>
      invocationContextSchema.parse({
        traceId: 'trace_01',
        userId: 'user_01',
        trigger: 'brief',
        variant: 'morning',
        triggeredAt: '2026-01-01T06:30:00Z',
        canaryTokens: [],
        zone: 'energized',
        user: {
          id: 'user_01', name: 'Shivansh', timezone: 'Asia/Kolkata',
          chronotype: 'morning', wake_time: '06:30', evening_time: '22:00',
          day_type: 'deep_work', autonomy_level: 'L2',
          voice_sensitivity: 'normal', response_depth: 'default',
          protect_morning_focus: true, block_deep_work_windows: false,
          defer_low_urgency_notifications: true, focus_window_default: 50,
          connectors: {}, pricing_tier: 'pro', daily_push_budget_remaining: 3,
        },
        do: { _kind: 'do-stub' },
      })
    ).not.toThrow();
  });

  it('rejects invalid zone', () => {
    expect(() =>
      invocationContextSchema.parse({
        traceId: 'trace_01', userId: 'user_01', trigger: 'patrol',
        triggeredAt: '2026-01-01T10:00:00Z', canaryTokens: [], zone: 'rested',
        user: {
          id: 'u', name: 'n', timezone: 'UTC', chronotype: 'flexible',
          wake_time: '07:00', evening_time: '22:00', day_type: '9_5_flex',
          autonomy_level: 'L1', voice_sensitivity: 'quiet', response_depth: 'short',
          protect_morning_focus: false, block_deep_work_windows: false,
          defer_low_urgency_notifications: false, focus_window_default: 25,
          connectors: {}, pricing_tier: 'pup', daily_push_budget_remaining: 0,
        },
        do: { _kind: 'do-stub' },
      })
    ).toThrow();
  });
});
