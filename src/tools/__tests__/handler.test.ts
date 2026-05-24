import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import type { ToolHandler, ToolResult } from '../handler';
import { toolResultSchema } from '../handler';

describe('toolResultSchema', () => {
  it('valid: ok result', () => {
    expect(() =>
      toolResultSchema(z.string()).parse({ ok: true, data: 'hello' })
    ).not.toThrow();
  });
  it('valid: error result', () => {
    expect(() =>
      toolResultSchema(z.string()).parse({ ok: false, error: 'failed', code: 'auth_failed' })
    ).not.toThrow();
  });
  it('invalid: missing error code on failure', () => {
    expect(() =>
      toolResultSchema(z.string()).parse({ ok: false, error: 'oops' })
    ).toThrow();
  });
});

describe('ToolHandler type', () => {
  it('structural: mock handler satisfies interface', () => {
    const mockHandler: ToolHandler<{ query: string }, string> = {
      name: 'web_search',
      description: 'Search the web',
      schema: z.object({ query: z.string() }),
      trigger_allowlist: ['user_message', 'handoff_explore'],
      autonomy_gated: false,
      handle: async (_args, _ctx) => ({ ok: true, data: 'result' }),
    };
    expect(mockHandler.name).toBe('web_search');
    expect(mockHandler.autonomy_gated).toBe(false);
  });
});
