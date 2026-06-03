import { z } from 'zod';
import { triggerTypeSchema } from './trigger';
import type { InvocationContext } from './trigger';
import { errorCodeSchema } from './error';
import { toolNameSchema } from '../tools/permissions';
import { modelNameSchema } from '../adapters/llm';

// Hooks-based safety layers: zero-token deterministic middleware around every invocation
// (ADR-0032 / ADR-0029). 9 events, priority-ordered, independent traversal.
// Canonical fields (trigger/toolName/model/errorCode) reuse the package's own enums so the
// safety seam rejects non-canonical runtime events at the boundary, not downstream.

export const hookEventSchema = z.enum([
  'OnInvocationStart',
  'PrePromptBuild',
  'PostPromptBuild',
  'PreLLMCall',
  'PostLLMCall',
  'PreToolUse',
  'PostToolUse',
  'OnError',
  'OnInvocationEnd',
]);
export type HookEvent = z.infer<typeof hookEventSchema>;

const basePayloadFields = {
  traceId: z.string(),
  trigger: triggerTypeSchema,
};

// Discriminated by `event` — one variant per hook event (ADR-0029).
export const hookPayloadSchema = z.discriminatedUnion('event', [
  z.object({ ...basePayloadFields, event: z.literal('OnInvocationStart'), canaryTokens: z.array(z.string()) }),
  z.object({ ...basePayloadFields, event: z.literal('PrePromptBuild'), skillHint: z.string().optional() }),
  z.object({ ...basePayloadFields, event: z.literal('PostPromptBuild'), prompt: z.string() }),
  z.object({ ...basePayloadFields, event: z.literal('PreLLMCall'), prompt: z.string(), model: modelNameSchema.optional() }),
  z.object({ ...basePayloadFields, event: z.literal('PostLLMCall'), responseText: z.string(), inputTokens: z.number().int().min(0), outputTokens: z.number().int().min(0) }),
  z.object({ ...basePayloadFields, event: z.literal('PreToolUse'), toolName: toolNameSchema, toolArgs: z.record(z.unknown()) }),
  z.object({ ...basePayloadFields, event: z.literal('PostToolUse'), toolName: toolNameSchema, toolOutput: z.string() }),
  z.object({ ...basePayloadFields, event: z.literal('OnError'), errorCode: errorCodeSchema, errorMessage: z.string() }),
  z.object({ ...basePayloadFields, event: z.literal('OnInvocationEnd'), ok: z.boolean() }),
]);
export type HookPayload = z.infer<typeof hookPayloadSchema>;

// HookResult / HookHandler stay plain TS: HookHandler carries a method, and `mutated` is a
// type-level Partial of the discriminated union that does not express cleanly as Zod.
export type HookResult =
  | { ok: true; mutated?: Partial<HookPayload> }
  | { ok: false; halt: true; reason: string };

export interface HookHandler {
  event: HookEvent;
  priority: number;
  handle(payload: HookPayload, ctx: InvocationContext): Promise<HookResult>;
}
