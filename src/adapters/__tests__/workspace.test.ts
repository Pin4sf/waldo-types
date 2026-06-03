import { describe, expect, it } from 'vitest';
import { workspaceFileSchema, type WorkspaceMount, type R2Mount } from '../workspace';

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
