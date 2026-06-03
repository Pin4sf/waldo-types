import { describe, expect, it } from 'vitest';
import { workspaceFileSchema, workspacePathSchema, type WorkspaceMount, type R2Mount } from '../workspace';

describe('workspaceFileSchema', () => {
  const files = [
    'today.md', 'baselines.md', 'patterns.md', 'goals.md', 'orchestration.md', 'onboarding.md',
  ] as const;
  it('accepts every workspace file path', () => {
    for (const f of files) expect(workspaceFileSchema.parse(f)).toBe(f);
  });
  it('rejects an unknown path', () => {
    expect(() => workspaceFileSchema.parse('secrets.md')).toThrow();
  });
});

describe('workspacePathSchema', () => {
  it('accepts every workspace file path', () => {
    for (const f of [
      'today.md', 'baselines.md', 'patterns.md', 'goals.md', 'orchestration.md', 'onboarding.md',
    ] as const) {
      expect(workspacePathSchema.parse(f)).toBe(f);
    }
  });
  it('accepts a per-user skills path', () => {
    expect(workspacePathSchema.parse('skills/morning-brief.md')).toBe('skills/morning-brief.md');
  });
  it('rejects a path-traversal attempt', () => {
    expect(() => workspacePathSchema.parse('../etc/passwd')).toThrow();
    expect(() => workspacePathSchema.parse('skills/../etc/passwd')).toThrow();
    expect(() => workspacePathSchema.parse('skills/..')).toThrow();
  });
  it('rejects an unscoped file path', () => {
    expect(() => workspacePathSchema.parse('random.md')).toThrow();
  });
});

describe('WorkspaceMount / R2Mount structural', () => {
  it('mock satisfies the 5-function port', async () => {
    const mock: WorkspaceMount = {
      readFile: async () => null,
      writeFile: async () => undefined,
      list: async () => [],
      commit: async () => ({ change_id: 'c_01' }),
      discard: () => undefined,
    };
    const r2: R2Mount = mock;
    expect((await r2.commit('msg')).change_id).toBe('c_01');
  });
});
