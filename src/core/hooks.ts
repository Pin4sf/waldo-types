import { z } from 'zod';
import type { InvocationContext } from './trigger';
import { errorCodeSchema, type ErrorCode } from './error';
import { toolNameSchema } from '../tools/permissions';
import { modelNameSchema } from '../adapters/llm';

// Hooks-based safety layers: zero-token deterministic middleware around every invocation
// (ADR-0032 / ADR-0029). 9 events, priority-ordered, independent traversal.
// Canonical fields (tool/model/code) reuse the package's own enums so the safety seam
// rejects non-canonical runtime events at the boundary, not downstream.
// Casing: payload fields use ADR-0029 pinned snake_case (trace_id/tokens_in/tokens_out/
// latency_ms); InvocationContext.traceId keeps v0.1.0 camelCase — package-wide reconcile out of scope.

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

// HookPayload — pinned to the ADR-0029 v0.2.0 union. traceId/trigger are NOT repeated here:
// every HookHandler.handle(payload, ctx) already receives InvocationContext (which carries them),
// so putting them on every payload was redundant. Each variant carries only what is NOT in ctx.
export const hookPayloadSchema = z.discriminatedUnion('event', [
  z.object({ event: z.literal('OnInvocationStart'), trace_id: z.string() }),         // ADR-0029 pinned
  z.object({ event: z.literal('PrePromptBuild') }),                                   // ADR-0029 silent; skill_loader/recall read ctx → no payload field earns a place
  z.object({ event: z.literal('PostPromptBuild'), prompt: z.string() }),              // the assembled prompt is the build product, not in ctx → size/canary/audit hooks need it
  z.object({ event: z.literal('PreLLMCall'), messages: z.array(z.unknown()), model: modelNameSchema }),   // ADR-0029 pinned
  z.object({ event: z.literal('PostLLMCall'), response: z.unknown(), tokens_in: z.number().int().min(0), tokens_out: z.number().int().min(0) }), // ADR-0029 pinned
  z.object({ event: z.literal('PreToolUse'), tool: toolNameSchema, args: z.unknown() }),   // ADR-0029 pinned; canonical arg validation is a separate PreToolUse hook (ADR-0032), not this payload's job → args stays opaque
  z.object({ event: z.literal('PostToolUse'), tool: toolNameSchema, result: z.unknown(), latency_ms: z.number().int().min(0) }), // ADR-0029 pinned
  z.object({ event: z.literal('OnError'), error: z.string(), code: errorCodeSchema }),      // ADR-0029 pinned (canonical code)
  z.object({ event: z.literal('OnInvocationEnd'), outcome: z.enum(['success', 'fallback', 'failure']) }), // ADR-0029 pinned
]);
export type HookPayload = z.infer<typeof hookPayloadSchema>;

// HookResult / HookHandler stay plain TS (ADR-0032 runner authority — supersedes ADR-0029's
// `mutated?`/no-code wording): the runner does `currentPayload = result.payload` (full replace,
// no merge logic) and emits `hook_halt` with a machine-readable code.
export type HookResult =
  | { ok: true; payload?: HookPayload }                              // full replacement (runner assigns result.payload), not a partial merge — the runner has no merge logic
  | { ok: false; halt: true; reason: string; code: ErrorCode };      // ADR-0032 hook_halt audit needs a machine-readable code; ErrorCode keeps it consistent with the OnError payload

export interface HookHandler {   // ≡ ADR-0032 `Hook`; keeping the existing export name (no gratuitous rename)
  name: string;            // ADR-0032: hook_halt audit + registry identity
  event: HookEvent;
  priority: number;
  timeout_ms?: number;     // ADR-0032 runner: withTimeout(handle, timeout_ms ?? 100); optional, default applied by the runner
  handle(payload: HookPayload, ctx: InvocationContext): Promise<HookResult>;
}
