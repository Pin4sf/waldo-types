import { z } from 'zod';
import { iso8601Schema } from '../core/error';
import { triggerTypeSchema } from '../core/trigger';

export const episodeSchema = z.object({
  id: z.string(),
  pattern_id: z.string(),    // stable ID per ADR-0037 (never changes on edit)
  trigger: triggerTypeSchema,
  summary: z.string().min(1).max(1000),
  tags: z.array(z.string()).optional(),
  started_at: iso8601Schema,
  ended_at: iso8601Schema.optional(),
  tool_names_used: z.array(z.string()).optional(),
  outcome_signal: z.enum(['positive', 'neutral', 'negative', 'unknown']).optional(),
});
export type Episode = z.infer<typeof episodeSchema>;

export const episodeSummarySchema = z.object({
  id: z.string(),
  pattern_id: z.string(),
  summary: z.string(),
  started_at: iso8601Schema,
  tags: z.array(z.string()).optional(),
});
export type EpisodeSummary = z.infer<typeof episodeSummarySchema>;
