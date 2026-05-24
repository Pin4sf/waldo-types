import { describe, expect, it } from 'vitest';
import { autonomyLevelSchema } from '../autonomy';

describe('autonomyLevelSchema', () => {
  it('accepts L1', () => expect(autonomyLevelSchema.parse('L1')).toBe('L1'));
  it('accepts L2', () => expect(autonomyLevelSchema.parse('L2')).toBe('L2'));
  it('accepts L3', () => expect(autonomyLevelSchema.parse('L3')).toBe('L3'));
  it('rejects invalid level', () => {
    expect(() => autonomyLevelSchema.parse('L4')).toThrow();
  });
  it('rejects empty string', () => {
    expect(() => autonomyLevelSchema.parse('')).toThrow();
  });
});
