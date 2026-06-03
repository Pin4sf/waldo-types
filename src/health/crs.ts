import { z } from 'zod';
import { iso8601Schema } from '../core/error';

export const zoneSchema = z.enum(['energized', 'steady', 'flagging', 'depleted']);
export type Zone = z.infer<typeof zoneSchema>;

export const crsPillarSchema = z.enum(['sleep', 'hrv', 'circadian', 'motion']);
export type CrsPillar = z.infer<typeof crsPillarSchema>;

export const pillarBreakdownSchema = z.object({
  pillar: crsPillarSchema,
  weight: z.number().min(0).max(1),
  contribution: z.number(),
});
export type PillarBreakdown = z.infer<typeof pillarBreakdownSchema>;

export const crsResultSchema = z.object({
  score: z.number().min(0).max(100),
  zone: zoneSchema,
  computed_at: iso8601Schema,
  component_count: z.number().int().min(1),
  pillar_breakdown: z.array(pillarBreakdownSchema).optional(),
  contributing_sources: z.array(z.string()).optional(),
  hrv_confidence: z.number().min(0).max(1).optional(),
});
export type CrsResult = z.infer<typeof crsResultSchema>;
