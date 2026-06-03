import { z } from 'zod';
import { toolNameSchema } from '../tools/permissions';
import { canaryTokensSchema } from '../core/trigger';

// Session trust reset on every invocation (ADR-0033): memory persists, this state resets.
// Distinct from InvocationContext (the immutable per-invocation envelope) — SessionState is
// the mutable, reset-able trust + loop state rebuilt fresh from TOOL_PERMISSIONS[trigger].

export const rateLimitWindowSchema = z.object({
  start: z.number().int().min(0),
  tool_counts: z.record(z.number().int().min(0)),
});
export type RateLimitWindow = z.infer<typeof rateLimitWindowSchema>;

export const sessionStateSchema = z.object({
  // rebuilt from TOOL_PERMISSIONS[ctx.trigger] — deny-first, never carried forward
  toolPermissions: z.array(toolNameSchema),
  // 3 fresh 16-char hex tokens per session — ADR-0032 line 64.
  // Single source of truth: canaryTokensSchema is also applied to InvocationContext.canaryTokens
  // so Scribe/PostLLMCall leak-check (which read from ctx) get the same invariant the session enforces.
  canaryTokens: canaryTokensSchema,
  iterationCount: z.number().int().min(0).default(0),
  // session-scoped spend, USD; daily cumulative tracked separately
  costSpent: z.number().min(0).default(0),
  pendingApprovals: z.array(z.string()).default([]),
  activeSandbox: z.string().nullable().default(null),
  rateLimitWindow: rateLimitWindowSchema,
});
export type SessionState = z.infer<typeof sessionStateSchema>;
