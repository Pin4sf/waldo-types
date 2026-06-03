import { describe, expect, it } from 'vitest';
import { hookEventSchema, hookPayloadSchema, type HookPayload } from '../hooks';

describe('hookEventSchema', () => {
  const events = [
    'OnInvocationStart', 'PrePromptBuild', 'PostPromptBuild', 'PreLLMCall', 'PostLLMCall',
    'PreToolUse', 'PostToolUse', 'OnError', 'OnInvocationEnd',
  ] as const;

  it('has exactly 9 members', () => {
    expect(hookEventSchema.options).toHaveLength(9);
  });
  it('accepts every event', () => {
    for (const e of events) expect(hookEventSchema.parse(e)).toBe(e);
  });
  it('rejects unknown event', () => {
    expect(() => hookEventSchema.parse('OnToolError')).toThrow();
  });
});

describe('hookPayloadSchema — ADR-0029 pinned union (each variant parses)', () => {
  it('OnInvocationStart', () => {
    expect(() => hookPayloadSchema.parse({ event: 'OnInvocationStart', trace_id: 't1' })).not.toThrow();
  });
  it('PrePromptBuild (no payload field beyond event)', () => {
    expect(() => hookPayloadSchema.parse({ event: 'PrePromptBuild' })).not.toThrow();
  });
  it('PostPromptBuild', () => {
    expect(() => hookPayloadSchema.parse({ event: 'PostPromptBuild', prompt: 'p' })).not.toThrow();
  });
  it('PreLLMCall', () => {
    expect(() => hookPayloadSchema.parse({ event: 'PreLLMCall', messages: [{ role: 'user' }], model: 'claude-sonnet-4-6' })).not.toThrow();
  });
  it('PostLLMCall', () => {
    expect(() => hookPayloadSchema.parse({ event: 'PostLLMCall', response: { text: 'ok' }, tokens_in: 100, tokens_out: 50 })).not.toThrow();
  });
  it('PreToolUse', () => {
    expect(() => hookPayloadSchema.parse({ event: 'PreToolUse', tool: 'send_message', args: { content: 'hi' } })).not.toThrow();
  });
  it('PostToolUse', () => {
    expect(() => hookPayloadSchema.parse({ event: 'PostToolUse', tool: 'send_message', result: { id: 'm1' }, latency_ms: 12 })).not.toThrow();
  });
  it('OnError', () => {
    expect(() => hookPayloadSchema.parse({ event: 'OnError', error: 'boom', code: 'transient' })).not.toThrow();
  });
  it('OnInvocationEnd', () => {
    expect(() => hookPayloadSchema.parse({ event: 'OnInvocationEnd', outcome: 'success' })).not.toThrow();
  });
});

describe('hookPayloadSchema — old/lossy pre-fix shapes are rejected', () => {
  // The pre-fix shape used responseText/inputTokens/outputTokens. The pinned union renames
  // these to response/tokens_in/tokens_out — so the old keys no longer satisfy the variant.
  it('PostLLMCall with old responseText shape fails (tokens_in/tokens_out missing)', () => {
    expect(() => hookPayloadSchema.parse({ event: 'PostLLMCall', responseText: 'ok', inputTokens: 100, outputTokens: 50 })).toThrow();
  });
  // Pre-fix OnInvocationEnd carried { ok: boolean }; the pinned variant requires `outcome`.
  it('OnInvocationEnd with old { ok: true } shape fails (outcome missing)', () => {
    expect(() => hookPayloadSchema.parse({ event: 'OnInvocationEnd', ok: true })).toThrow();
  });
  // latency_ms is a required pinned field on PostToolUse — omitting it must fail.
  it('PostToolUse without latency_ms fails', () => {
    expect(() => hookPayloadSchema.parse({ event: 'PostToolUse', tool: 'send_message', result: {} })).toThrow();
  });
  // PreLLMCall.model is now required (was .optional() pre-fix) — omitting it must fail.
  it('PreLLMCall without model fails', () => {
    expect(() => hookPayloadSchema.parse({ event: 'PreLLMCall', messages: [] })).toThrow();
  });
  // OnError now carries canonical `code` + `error` (was errorCode/errorMessage) — old keys fail.
  it('OnError with old errorCode/errorMessage shape fails', () => {
    expect(() => hookPayloadSchema.parse({ event: 'OnError', errorCode: 'transient', errorMessage: 'boom' })).toThrow();
  });
});

describe('hookPayloadSchema — canonical-enum rejection (safety seam)', () => {
  it('non-ToolName tool rejected', () => {
    expect(() => hookPayloadSchema.parse({ event: 'PreToolUse', tool: 'delete_everything', args: {} })).toThrow();
  });
  it('unknown model rejected', () => {
    expect(() => hookPayloadSchema.parse({ event: 'PreLLMCall', messages: [], model: 'gpt-5' })).toThrow();
  });
  it('non-canonical OnError code rejected', () => {
    expect(() => hookPayloadSchema.parse({ event: 'OnError', error: 'x', code: 'morning_wag' })).toThrow();
  });
  it('non-canonical OnInvocationEnd outcome rejected', () => {
    expect(() => hookPayloadSchema.parse({ event: 'OnInvocationEnd', outcome: 'done' })).toThrow();
  });
});

describe('hookPayloadSchema — discriminant narrowing', () => {
  it('narrows by event discriminant', () => {
    const payload = hookPayloadSchema.parse({ event: 'PostLLMCall', response: 'ok', tokens_in: 100, tokens_out: 50 });
    if (payload.event === 'PostLLMCall') {
      expect(payload.tokens_out).toBe(50);
    } else {
      throw new Error('discriminant did not narrow to PostLLMCall');
    }
  });
  it('strips fields not on the matched variant', () => {
    const payload: HookPayload = { event: 'OnInvocationEnd', outcome: 'success' };
    // OnInvocationEnd has no `prompt` — Zod strips unknown keys, never carries it
    expect('prompt' in hookPayloadSchema.parse(payload)).toBe(false);
  });
});
