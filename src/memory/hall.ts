import { z } from 'zod';
import { iso8601Schema } from '../core/error';

// hall_facts is immutable post-onboarding — write ACL enforced by Scribe (ADR-0005/0006)
export const hallTypeSchema = z.enum(['facts', 'events', 'discoveries', 'preferences', 'advice']);
export type HallType = z.infer<typeof hallTypeSchema>;

// content-derived stable id (md5(normalize(claim)+sorted_conditions)[:12]) for
// supersede/reject/rollback chains (ADR-0037).
export const memoryDecisionActionSchema = z.enum(['create', 'supersede', 'reject', 'rollback']);
export type MemoryDecisionAction = z.infer<typeof memoryDecisionActionSchema>;

export const memoryDecisionEntrySchema = z.object({
  at: iso8601Schema,
  action: memoryDecisionActionSchema,
  reason: z.string().max(500),
});
export type MemoryDecisionEntry = z.infer<typeof memoryDecisionEntrySchema>;

export const memoryBlockSchema = z.object({
  id: z.string(),
  hall: hallTypeSchema,
  content: z.string().min(1).max(2000),
  tags: z.array(z.string()).optional(),
  created_at: iso8601Schema,
  updated_at: iso8601Schema,
  version: z.number().int().min(1),
  pattern_id: z.string().length(12).nullable(),
  rejection_count: z.number().int().min(0).default(0),
  decision_log: z.array(memoryDecisionEntrySchema).default([]),
  rolled_back_from: z.string().optional(),
});
export type MemoryBlock = z.infer<typeof memoryBlockSchema>;

export const memoryHallSchema = z.object({
  hall: hallTypeSchema,
  blocks: z.array(memoryBlockSchema),
  loaded_at: iso8601Schema,
  token_count: z.number().int().min(0),
});
export type MemoryHall = z.infer<typeof memoryHallSchema>;
