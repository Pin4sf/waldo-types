import { z } from 'zod';
import { iso8601Schema } from './error';
import { userSchema } from './user';
import { zoneSchema } from '../health/crs';

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
  canaryTokens: z.array(z.string()),
  zone: zoneSchema,
  activeSandbox: z.string().optional(),
  user: userSchema,
  // DurableObjectStubReference — structural marker, not serialisable via Zod at runtime
  do: z.object({ _kind: z.literal('do-stub') }),
});
export type InvocationContext = z.infer<typeof invocationContextSchema>;
