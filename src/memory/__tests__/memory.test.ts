import { describe, expect, it } from 'vitest';
import { hallTypeSchema, memoryBlockSchema } from '../hall';
import { episodeSchema } from '../episode';
import { skillSchema } from '../skill';

describe('hallTypeSchema', () => {
  it('accepts all 5 halls', () => {
    for (const h of ['facts', 'events', 'discoveries', 'preferences', 'advice'] as const) {
      expect(hallTypeSchema.parse(h)).toBe(h);
    }
  });
  it('rejects unknown hall', () => {
    expect(() => hallTypeSchema.parse('goals')).toThrow();
  });
});

describe('memoryBlockSchema', () => {
  it('valid', () => {
    expect(() => memoryBlockSchema.parse({
      id: 'mb_01', hall: 'events', content: 'Board call went well.',
      created_at: '2026-01-01T10:00:00Z', updated_at: '2026-01-01T10:00:00Z', version: 1,
    })).not.toThrow();
  });
  it('invalid: empty content', () => {
    expect(() => memoryBlockSchema.parse({
      id: 'mb_01', hall: 'events', content: '',
      created_at: '2026-01-01T10:00:00Z', updated_at: '2026-01-01T10:00:00Z', version: 1,
    })).toThrow();
  });
});

describe('episodeSchema', () => {
  it('valid', () => {
    expect(() => episodeSchema.parse({
      id: 'ep_01', pattern_id: 'pat_01', trigger: 'brief',
      summary: 'Morning brief delivered. HRV zone: peak.',
      started_at: '2026-01-01T06:30:00Z',
    })).not.toThrow();
  });
  it('invalid: unknown trigger', () => {
    expect(() => episodeSchema.parse({
      id: 'ep_01', pattern_id: 'pat_01', trigger: 'morning_wag',
      summary: 'x', started_at: '2026-01-01T06:30:00Z',
    })).toThrow();
  });
});

describe('skillSchema', () => {
  it('valid', () => {
    expect(() => skillSchema.parse({
      name: 'morning-brief', version: 1, provenance: 'system',
      identity_locked: true, provisional: false,
      trigger_types: ['brief'], trigger_condition: 'trigger === brief',
      required_tools: ['get_crs', 'get_health'], required_connectors: [],
      effectiveness: 0.85, invocations: 42, last_used: '2026-01-01T06:30:00Z',
      body_markdown: '# Morning Brief\nDeliver...', created_by: 'system',
      created_at: '2026-01-01T00:00:00Z',
    })).not.toThrow();
  });
  it('invalid: effectiveness > 1', () => {
    expect(() => skillSchema.parse({
      name: 'x', version: 1, provenance: 'user', identity_locked: false, provisional: true,
      trigger_types: [], trigger_condition: '', required_tools: [], required_connectors: [],
      effectiveness: 1.5, invocations: 0, last_used: null,
      body_markdown: '', created_by: 'u', created_at: '2026-01-01T00:00:00Z',
    })).toThrow();
  });
});
