import { describe, expect, it } from 'vitest';
import {
  workspaceFileSchema,
  workspacePathSchema,
  parseWorkspacePath,
  type WorkspaceMount,
  type R2Mount,
} from '../workspace';

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

describe('WorkspacePath branding (compile-time guard)', () => {
  // Mock used purely for the type-assertion test cases below.
  const mount: WorkspaceMount = {
    readFile: async () => null,
    writeFile: async () => undefined,
    list: async () => [],
    commit: async () => ({ change_id: 'c_01' }),
    discard: () => undefined,
  };

  it('rejects raw string at the type level; accepts parsed WorkspacePath', () => {
    // Without @ts-expect-error this line would fail tsc — branding makes raw string non-assignable.
    // @ts-expect-error — raw string is not assignable to branded WorkspacePath
    void mount.readFile('arbitrary-string');
    // Parsed path compiles cleanly — no @ts-expect-error needed.
    void mount.readFile(parseWorkspacePath('today.md'));
    expect(true).toBe(true);
  });

  it('parseWorkspacePath throws on traversal (applies schema, not blind cast)', () => {
    expect(() => parseWorkspacePath('skills/../etc/passwd')).toThrow();
  });
});
