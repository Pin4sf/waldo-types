import { describe, expect, it } from 'vitest';
import { errorCodeSchema, iso8601Schema } from '../error';

describe('iso8601Schema', () => {
  it('accepts UTC datetime', () => {
    expect(() => iso8601Schema.parse('2026-01-01T00:00:00Z')).not.toThrow();
  });
  it('accepts datetime with offset', () => {
    expect(() => iso8601Schema.parse('2026-01-01T00:00:00+05:30')).not.toThrow();
  });
  it('rejects plain date string', () => {
    expect(() => iso8601Schema.parse('2026-01-01')).toThrow();
  });
  it('rejects arbitrary string', () => {
    expect(() => iso8601Schema.parse('not-a-date')).toThrow();
  });
});

describe('errorCodeSchema', () => {
  it('accepts all 7 valid codes', () => {
    const codes = ['auth_failed', 'not_found', 'forbidden', 'rate_limited', 'transient', 'oversize', 'invalid_args'] as const;
    for (const code of codes) {
      expect(errorCodeSchema.parse(code)).toBe(code);
    }
  });
  it('rejects unknown code', () => {
    expect(() => errorCodeSchema.parse('unknown_error')).toThrow();
  });
});
