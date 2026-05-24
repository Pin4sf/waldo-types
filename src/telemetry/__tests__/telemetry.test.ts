import { describe, expect, it } from 'vitest';
import { agentLogSchema, toolInvocationLogSchema } from '../log';
import { effectivenessSignalSchema, outcomeSignalSchema } from '../outcome';

describe('toolInvocationLogSchema', () => {
  it('valid', () => {
    expect(() => toolInvocationLogSchema.parse({
      tool_name: 'get_crs', trigger: 'brief',
      duration_ms: 120, ok: true, invoked_at: '2026-01-01T06:30:00Z',
    })).not.toThrow();
  });
  it('invalid: unknown trigger', () => {
    expect(() => toolInvocationLogSchema.parse({
      tool_name: 'get_crs', trigger: 'morning_wag',
      duration_ms: 120, ok: true, invoked_at: '2026-01-01T06:30:00Z',
    })).toThrow();
  });
});

describe('agentLogSchema', () => {
  it('valid: empty tools+skills', () => {
    expect(() => agentLogSchema.parse({
      trace_id: 'tr_01', user_id: 'u_01', trigger: 'user_message',
      started_at: '2026-01-01T10:00:00Z',
      tools: [], skills: [],
      total_input_tokens: 500, total_output_tokens: 200, ok: true,
    })).not.toThrow();
  });
  it('invalid: negative token count', () => {
    expect(() => agentLogSchema.parse({
      trace_id: 'tr_01', user_id: 'u_01', trigger: 'brief',
      started_at: '2026-01-01T10:00:00Z',
      tools: [], skills: [], total_input_tokens: -1, total_output_tokens: 0, ok: false,
    })).toThrow();
  });
});

describe('outcomeSignalSchema', () => {
  it('valid: thumbs_up', () => {
    expect(() => outcomeSignalSchema.parse({
      trace_id: 'tr_01', user_id: 'u_01', trigger: 'brief',
      signal: 'thumbs_up', recorded_at: '2026-01-01T06:35:00Z',
    })).not.toThrow();
  });
  it('invalid: unknown signal', () => {
    expect(() => outcomeSignalSchema.parse({
      trace_id: 'tr_01', user_id: 'u_01', trigger: 'brief',
      signal: 'loved_it', recorded_at: '2026-01-01T06:35:00Z',
    })).toThrow();
  });
});

describe('effectivenessSignalSchema', () => {
  it('valid', () => {
    expect(() => effectivenessSignalSchema.parse({
      skill_name: 'morning-brief', trigger: 'brief',
      window_days: 30, positive_count: 22, negative_count: 3, neutral_count: 5,
      effectiveness_score: 0.73, computed_at: '2026-02-01T00:00:00Z',
    })).not.toThrow();
  });
  it('invalid: effectiveness_score > 1', () => {
    expect(() => effectivenessSignalSchema.parse({
      skill_name: 'x', trigger: 'patrol', window_days: 7,
      positive_count: 5, negative_count: 0, neutral_count: 0,
      effectiveness_score: 1.2, computed_at: '2026-02-01T00:00:00Z',
    })).toThrow();
  });
});
