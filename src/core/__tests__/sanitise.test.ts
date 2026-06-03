import { describe, expect, it } from 'vitest';
import { sanitiseDestinationSchema, redactionSchema, sanitiseReasonSchema } from '../sanitise';

describe('sanitiseDestinationSchema', () => {
  const destinations = [
    'memory_blocks', 'system_prompt', 'internal_context', 'draft_document', 'draft_email',
    'send_message', 'sandbox_stdout', 'skill_body', 'audit_log', 'workspace_file',
  ] as const;

  it('has exactly 10 destinations', () => {
    expect(sanitiseDestinationSchema.options).toHaveLength(10);
  });
  it('accepts every destination including workspace_file', () => {
    for (const d of destinations) expect(sanitiseDestinationSchema.parse(d)).toBe(d);
  });
  it('rejects a non-enum value', () => {
    expect(() => sanitiseDestinationSchema.parse('telegram')).toThrow();
  });
});

describe('redactionSchema', () => {
  it('valid: counts only, never values', () => {
    expect(() => redactionSchema.parse({ kind: 'email', count: 3 })).not.toThrow();
  });
  it('invalid: unknown redaction kind', () => {
    expect(() => redactionSchema.parse({ kind: 'ssn', count: 1 })).toThrow();
  });
});

describe('sanitiseReasonSchema', () => {
  it('valid: canary_leak', () => expect(sanitiseReasonSchema.parse('canary_leak')).toBe('canary_leak'));
  it('invalid: unknown reason', () => expect(() => sanitiseReasonSchema.parse('blocked')).toThrow());
});
