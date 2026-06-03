import { describe, expect, it } from 'vitest';
import { zoneSchema, crsResultSchema, pillarBreakdownSchema } from '../crs';

describe('zoneSchema', () => {
  it('has exactly 4 values', () => {
    expect(zoneSchema.options).toHaveLength(4);
  });
  it('accepts energized/steady/flagging/depleted', () => {
    for (const z of ['energized', 'steady', 'flagging', 'depleted'] as const) {
      expect(zoneSchema.parse(z)).toBe(z);
    }
  });
  it("rejects 'peak' (removed v0.2.0)", () => {
    expect(() => zoneSchema.parse('peak')).toThrow();
  });
});

describe('crsResultSchema', () => {
  it('valid: derived-only with optional breakdown', () => {
    expect(() => crsResultSchema.parse({
      score: 82, zone: 'energized', computed_at: '2026-01-01T06:00:00Z', component_count: 4,
      pillar_breakdown: [{ pillar: 'sleep', weight: 0.5, contribution: 41 }],
      contributing_sources: ['oura', 'apple_health'],
      hrv_confidence: 0.85,
    })).not.toThrow();
  });
  it('valid: minimal (new fields optional, back-compat with v0.1.0)', () => {
    expect(() => crsResultSchema.parse({
      score: 60, zone: 'steady', computed_at: '2026-01-01T06:00:00Z', component_count: 1,
    })).not.toThrow();
  });
  it('invalid: hrv_confidence > 1', () => {
    expect(() => crsResultSchema.parse({
      score: 60, zone: 'steady', computed_at: '2026-01-01T06:00:00Z', component_count: 1,
      hrv_confidence: 1.5,
    })).toThrow();
  });
  it('invalid: zone peak', () => {
    expect(() => crsResultSchema.parse({
      score: 90, zone: 'peak', computed_at: '2026-01-01T06:00:00Z', component_count: 4,
    })).toThrow();
  });
});

describe('pillarBreakdownSchema', () => {
  it('valid', () => {
    expect(() => pillarBreakdownSchema.parse({ pillar: 'hrv', weight: 0.35, contribution: 28 })).not.toThrow();
  });
  it('invalid: unknown pillar', () => {
    expect(() => pillarBreakdownSchema.parse({ pillar: 'caffeine', weight: 0.1, contribution: 1 })).toThrow();
  });
});
