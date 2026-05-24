import { z } from 'zod';
import { iso8601Schema } from '../core/error';
import { triggerTypeSchema } from '../core/trigger';

export const outcomeSignalSchema = z.object({
  trace_id: z.string(),
  user_id: z.string(),
  trigger: triggerTypeSchema,
  signal: z.enum(['thumbs_up', 'thumbs_down', 'dismissed', 'acted', 'ignored']),
  recorded_at: iso8601Schema,
  context: z.record(z.unknown()).optional(),
});
export type OutcomeSignal = z.infer<typeof outcomeSignalSchema>;

export const effectivenessSignalSchema = z.object({
  skill_name: z.string(),
  trigger: triggerTypeSchema,
  window_days: z.number().int().min(1),
  positive_count: z.number().int().min(0),
  negative_count: z.number().int().min(0),
  neutral_count: z.number().int().min(0),
  effectiveness_score: z.number().min(0).max(1),
  computed_at: iso8601Schema,
});
export type EffectivenessSignal = z.infer<typeof effectivenessSignalSchema>;
