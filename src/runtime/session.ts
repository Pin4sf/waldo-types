import { z } from 'zod';
import { toolNameSchema } from '../tools/permissions';

// Session trust reset on every invocation (ADR-0033): memory persists, this state resets.
// Distinct from InvocationContext (the immutable per-invocation envelope) — SessionState is
// the mutable, reset-able trust + loop state rebuilt fresh from TOOL_PERMISSIONS[trigger].

export const rateLimitWindowSchema = z.object({
  start: z.number().int().min(0),
  tool_counts: z.record(z.number().int().min(0)),
});
export type RateLimitWindow = z.infer<typeof rateLimitWindowSchema>;

// 16-char hex, exactly 3, unique — ADR-0032 line 64 pins "fresh per session, 16-char hex × 3".
// Each constraint is load-bearing: the regex enforces the format the leak-check scans for;
// .length(3) enforces the cardinality (3 independent tokens widens the detection surface);
// uniqueness via superRefine prevents 3 identical tokens from collapsing to 1 effective canary.
export const canaryTokenSchema = z.string().regex(/^[0-9a-f]{16}$/i);

export const sessionStateSchema = z.object({
  // rebuilt from TOOL_PERMISSIONS[ctx.trigger] — deny-first, never carried forward
  toolPermissions: z.array(toolNameSchema),
  // 3 fresh 16-char hex tokens per session
  canaryTokens: z.array(canaryTokenSchema).length(3).superRefine((tokens, ctx) => {
    if (new Set(tokens.map((t) => t.toLowerCase())).size !== tokens.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'canary tokens must be unique' });
    }
  }),
  iterationCount: z.number().int().min(0).default(0),
  // session-scoped spend, USD; daily cumulative tracked separately
  costSpent: z.number().min(0).default(0),
  pendingApprovals: z.array(z.string()).default([]),
  activeSandbox: z.string().nullable().default(null),
  rateLimitWindow: rateLimitWindowSchema,
});
export type SessionState = z.infer<typeof sessionStateSchema>;
