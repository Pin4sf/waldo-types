import { z } from 'zod';
import { iso8601Schema } from '../core/error';

// hall_facts is immutable post-onboarding — write ACL enforced by Scribe (ADR-0005/0006)
export const hallTypeSchema = z.enum(['facts', 'events', 'discoveries', 'preferences', 'advice']);
export type HallType = z.infer<typeof hallTypeSchema>;

export const memoryBlockSchema = z.object({
  id: z.string(),
  hall: hallTypeSchema,
  content: z.string().min(1).max(2000),
  tags: z.array(z.string()).optional(),
  created_at: iso8601Schema,
  updated_at: iso8601Schema,
  version: z.number().int().min(1),
});
export type MemoryBlock = z.infer<typeof memoryBlockSchema>;

export const memoryHallSchema = z.object({
  hall: hallTypeSchema,
  blocks: z.array(memoryBlockSchema),
  loaded_at: iso8601Schema,
  token_count: z.number().int().min(0),
});
export type MemoryHall = z.infer<typeof memoryHallSchema>;
