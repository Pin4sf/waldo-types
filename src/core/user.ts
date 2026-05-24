import { z } from 'zod';
import { autonomyLevelSchema } from './autonomy';

export const connectorStatusSchema = z.enum(['connected', 'degraded', 'disconnected']);
export type ConnectorStatus = z.infer<typeof connectorStatusSchema>;

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  timezone: z.string(),
  chronotype: z.enum(['morning', 'evening', 'flexible', 'unknown']),
  wake_time: z.string().regex(/^\d{2}:\d{2}$/),
  evening_time: z.string().regex(/^\d{2}:\d{2}$/),
  day_type: z.enum(['9_5_flex', 'back_to_back', 'deep_work', 'unpredictable']),
  autonomy_level: autonomyLevelSchema,
  voice_sensitivity: z.enum(['quiet', 'normal', 'talkative']),
  response_depth: z.enum(['short', 'default', 'detailed']),
  protect_morning_focus: z.boolean(),
  block_deep_work_windows: z.boolean(),
  defer_low_urgency_notifications: z.boolean(),
  focus_window_default: z.union([z.literal(25), z.literal(50), z.literal(90)]),
  morning_focus_window: z.string().optional(),
  connectors: z.record(connectorStatusSchema),
  pricing_tier: z.enum(['pup', 'pro', 'pro_max']),
  daily_push_budget_remaining: z.number().int().min(0),
});
export type User = z.infer<typeof userSchema>;
