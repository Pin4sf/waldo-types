import { describe, expect, it } from 'vitest';
import {
  traceEvalSchema, wisComponentsSchema, keepRateEventSchema, medicalGateResultSchema,
} from '../eval';

describe('wisComponentsSchema', () => {
  it('valid', () => {
    expect(() => wisComponentsSchema.parse({
      engagement_rate: 0.7, action_acceptance: 0.5, explicit_positivity: 0.2,
      retention_proxy: 0.8, composite: 0.62,
    })).not.toThrow();
  });
  it('invalid: explicit_positivity out of [-1,1]', () => {
    expect(() => wisComponentsSchema.parse({
      engagement_rate: 0.7, action_acceptance: 0.5, explicit_positivity: 2,
      retention_proxy: 0.8, composite: 0.62,
    })).toThrow();
  });
});

describe('traceEvalSchema', () => {
  it('valid', () => {
    expect(() => traceEvalSchema.parse({
      trace_id: 't1', quality_score: 0.8, quality_breakdown: { tone_consistency: 0.9 },
      wis_contribution: 0.02, memory_health: 'ok', rule_violations: [],
      requires_review: false, evaluated_at: '2026-01-01T07:00:00Z',
    })).not.toThrow();
  });
  it('invalid: unknown memory_health', () => {
    expect(() => traceEvalSchema.parse({
      trace_id: 't1', quality_score: 0.8, quality_breakdown: {},
      wis_contribution: 0, memory_health: 'broken', rule_violations: [],
      requires_review: false, evaluated_at: '2026-01-01T07:00:00Z',
    })).toThrow();
  });
});

describe('keepRateEventSchema', () => {
  it('valid: opened with seconds_to_open', () => {
    expect(() => keepRateEventSchema.parse({
      trace_id: 't1', user_id: 'u', trigger: 'brief', signal: 'opened',
      seconds_to_open: 9000, recorded_at: '2026-01-01T08:00:00Z',
    })).not.toThrow();
  });
  it('invalid: unknown signal', () => {
    expect(() => keepRateEventSchema.parse({
      trace_id: 't1', user_id: 'u', trigger: 'brief', signal: 'snoozed',
      recorded_at: '2026-01-01T08:00:00Z',
    })).toThrow();
  });
});

describe('medicalGateResultSchema', () => {
  it('valid: blocked', () => {
    expect(() => medicalGateResultSchema.parse({
      passed: false, matched_patterns: ['diagnose'], action: 'block',
    })).not.toThrow();
  });
  it('invalid: unknown action', () => {
    expect(() => medicalGateResultSchema.parse({
      passed: true, matched_patterns: [], action: 'escalate',
    })).toThrow();
  });
});
