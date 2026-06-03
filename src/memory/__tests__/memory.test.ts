import { describe, expect, it } from 'vitest';
import { hallTypeSchema, memoryBlockSchema } from '../hall';
import { episodeSchema } from '../episode';
import { skillSchema } from '../skill';
import { HALL_WRITE_ACL, retrieveResultSchema } from '../recall';

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
  it('valid: with all 4 v0.2.0 fields (ADR-0037)', () => {
    const parsed = memoryBlockSchema.parse({
      id: 'mb_01', hall: 'events', content: 'Board call went well.',
      created_at: '2026-01-01T10:00:00Z', updated_at: '2026-01-01T10:00:00Z', version: 1,
      pattern_id: 'f3a92c4b18e7', rejection_count: 2,
      decision_log: [{ at: '2026-01-01T10:00:00Z', action: 'supersede', reason: 'wake time changed' }],
      rolled_back_from: 'mb_00',
    });
    expect(parsed.pattern_id).toBe('f3a92c4b18e7');
    expect(parsed.rejection_count).toBe(2);
    expect(parsed.decision_log[0]?.action).toBe('supersede');
    expect(parsed.rolled_back_from).toBe('mb_00');
  });
  it('valid: pattern_id null + defaulted counters', () => {
    const parsed = memoryBlockSchema.parse({
      id: 'mb_01', hall: 'events', content: 'Board call went well.',
      created_at: '2026-01-01T10:00:00Z', updated_at: '2026-01-01T10:00:00Z', version: 1,
      pattern_id: null,
    });
    expect(parsed.rejection_count).toBe(0);
    expect(parsed.decision_log).toEqual([]);
  });
  it('invalid: pattern_id missing (required, nullable not optional)', () => {
    expect(() => memoryBlockSchema.parse({
      id: 'mb_01', hall: 'events', content: 'Board call went well.',
      created_at: '2026-01-01T10:00:00Z', updated_at: '2026-01-01T10:00:00Z', version: 1,
    })).toThrow();
  });
  it('invalid: pattern_id wrong length', () => {
    expect(() => memoryBlockSchema.parse({
      id: 'mb_01', hall: 'events', content: 'x',
      created_at: '2026-01-01T10:00:00Z', updated_at: '2026-01-01T10:00:00Z', version: 1,
      pattern_id: 'tooshort',
    })).toThrow();
  });
  it('invalid: decision_log unknown action', () => {
    expect(() => memoryBlockSchema.parse({
      id: 'mb_01', hall: 'events', content: 'x',
      created_at: '2026-01-01T10:00:00Z', updated_at: '2026-01-01T10:00:00Z', version: 1,
      pattern_id: null,
      decision_log: [{ at: '2026-01-01T10:00:00Z', action: 'graduate', reason: 'x' }],
    })).toThrow();
  });
  it('invalid: empty content', () => {
    expect(() => memoryBlockSchema.parse({
      id: 'mb_01', hall: 'events', content: '',
      created_at: '2026-01-01T10:00:00Z', updated_at: '2026-01-01T10:00:00Z', version: 1,
      pattern_id: null,
    })).toThrow();
  });
});

describe('memory recall (ADR-0031)', () => {
  it('HALL_WRITE_ACL: facts immutable post-onboarding, others writable', () => {
    expect(HALL_WRITE_ACL.facts).toBe(false);
    expect(HALL_WRITE_ACL.events).toBe(true);
    expect(HALL_WRITE_ACL.advice).toBe(true);
  });
  it('retrieveResultSchema: valid RRF result with default k', () => {
    const parsed = retrieveResultSchema.parse({
      hits: [{ hall_type: 'events', content: 'x', bm25_rank: 1, vector_rank: null, rrf_score: 0.016 }],
      query_used: 'recovery',
    });
    expect(parsed.rrf_k).toBe(60);
  });
  it('retrieveResultSchema: invalid bm25_rank < 1', () => {
    expect(() => retrieveResultSchema.parse({
      hits: [{ hall_type: 'events', content: 'x', bm25_rank: 0, vector_rank: null, rrf_score: 0.1 }],
      query_used: 'q',
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
