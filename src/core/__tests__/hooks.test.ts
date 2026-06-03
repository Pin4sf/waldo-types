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

describe('hookPayloadSchema', () => {
  it('valid: PreToolUse variant', () => {
    expect(() => hookPayloadSchema.parse({
      event: 'PreToolUse', traceId: 't1', trigger: 'user_message',
      toolName: 'send_message', toolArgs: { content: 'hi' },
    })).not.toThrow();
  });
  it('invalid: PreToolUse missing toolName', () => {
    expect(() => hookPayloadSchema.parse({
      event: 'PreToolUse', traceId: 't1', trigger: 'user_message', toolArgs: {},
    })).toThrow();
  });
  it('narrows by event discriminant', () => {
    const payload = hookPayloadSchema.parse({
      event: 'PostLLMCall', traceId: 't1', trigger: 'brief',
      responseText: 'ok', inputTokens: 100, outputTokens: 50,
    });
    // narrowing: only the PostLLMCall variant exposes responseText
    if (payload.event === 'PostLLMCall') {
      expect(payload.responseText).toBe('ok');
      expect(payload.outputTokens).toBe(50);
    } else {
      throw new Error('discriminant did not narrow to PostLLMCall');
    }
  });
  it('strips fields not on the matched variant', () => {
    const payload: HookPayload = {
      event: 'OnInvocationEnd', traceId: 't1', trigger: 'brief', ok: true,
    };
    // OnInvocationEnd has no responseText — Zod strips unknown keys, never carries it
    expect('responseText' in hookPayloadSchema.parse(payload)).toBe(false);
  });
});
