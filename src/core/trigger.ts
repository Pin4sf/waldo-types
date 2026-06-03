import { z } from 'zod';
import { iso8601Schema } from './error';
import { userSchema } from './user';
import { zoneSchema } from '../health/crs';

// Canary token format: 16-char hex (ADR-0032 line 64 — "fresh per session, 16-char hex × 3").
export const canaryTokenSchema = z.string().regex(/^[0-9a-f]{16}$/i);

// Full canary set invariant — used at every boundary that carries canaries (SessionState, InvocationContext).
// .length(3): three independent tokens widen the leak-detection surface.
// uniqueness: 3 identical tokens collapse to 1 effective canary, weakening detection.
// Reusing one schema means Scribe/PostLLMCall (which read ctx.canaryTokens) get the same invariant the session reset enforces.
export const canaryTokensSchema = z.array(canaryTokenSchema).length(3).superRefine((tokens, ctx) => {
  if (new Set(tokens.map((t) => t.toLowerCase())).size !== tokens.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'canary tokens must be unique' });
  }
});

export const triggerTypeSchema = z.enum([
  'brief',
  'fetch_alert',
  'patrol',
  'handoff_explore',
  'handoff_plan',
  'handoff_act',
  'handoff_replan',
  'intervention',
  'user_message',
  'dreaming_mode',
  'pre_activity_spot',
]);
export type TriggerType = z.infer<typeof triggerTypeSchema>;

export const briefVariantSchema = z.enum(['morning', 'midday', 'evening', 'event']);
export type BriefVariant = z.infer<typeof briefVariantSchema>;

export const invocationContextSchema = z.object({
  traceId: z.string(),
  userId: z.string(),
  trigger: triggerTypeSchema,
  variant: briefVariantSchema.optional(),
  brief_trigger_reason: z.string().optional(),
  triggeredAt: iso8601Schema,
  canaryTokens: canaryTokensSchema,
  zone: zoneSchema,
  activeSandbox: z.string().optional(),
  user: userSchema,
  // DurableObjectStubReference — structural marker, not serialisable via Zod at runtime
  do: z.object({ _kind: z.literal('do-stub') }),
});
export type InvocationContext = z.infer<typeof invocationContextSchema>;
