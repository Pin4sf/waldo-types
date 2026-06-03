import { describe, expect, it } from 'vitest';
import { narrativeContextSchema } from '../narrative';

describe('narrativeContextSchema', () => {
  it('valid: derived-only body+mind block', () => {
    const parsed = narrativeContextSchema.parse({
      zone: 'steady',
      recovery_descriptor: 'solid',
      load_descriptor: 'moderate',
      day_summary: 'Board call at 2pm, two deep-work blocks before lunch.',
      compiled_at: '2026-01-01T06:00:00Z',
    });
    expect(parsed.active_goals).toEqual([]);
    expect(parsed.upcoming_high_stakes).toEqual([]);
  });
  it('invalid: zone peak (uses health/crs Zone)', () => {
    expect(() => narrativeContextSchema.parse({
      zone: 'peak', recovery_descriptor: 'solid', load_descriptor: 'light',
      day_summary: 'x', compiled_at: '2026-01-01T06:00:00Z',
    })).toThrow();
  });
  it('invalid: unknown recovery_descriptor', () => {
    expect(() => narrativeContextSchema.parse({
      zone: 'steady', recovery_descriptor: 'great', load_descriptor: 'light',
      day_summary: 'x', compiled_at: '2026-01-01T06:00:00Z',
    })).toThrow();
  });
});
