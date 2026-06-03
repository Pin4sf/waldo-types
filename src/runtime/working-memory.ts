import { z } from 'zod';
import { iso8601Schema } from '../core/error';

// In-context working memory: capped LRU carryover buckets that survive context compaction
// (ADR-0034) and are rebuilt from the run journal (ADR-0054) on resume after DO eviction.
// Distinct from long-term memory recall (ADR-0031). Caps per ADR-0057.

export const carryoverBucketNameSchema = z.enum([
  'recent_work_log',
  'recent_verified_work',
  'read_file_state',
  'async_agent_state',
]);
export type CarryoverBucketName = z.infer<typeof carryoverBucketNameSchema>;

export const CARRYOVER_BUCKET_CAPS = {
  recent_work_log: 10,
  recent_verified_work: 10,
  read_file_state: 6,
  async_agent_state: 8,
} as const satisfies Record<CarryoverBucketName, number>;

export const carryoverEntrySchema = z.object({
  at: iso8601Schema,
  summary: z.string(),
});
export type CarryoverEntry = z.infer<typeof carryoverEntrySchema>;

export const carryoverBucketSchema = z.object({
  name: carryoverBucketNameSchema,
  cap: z.number().int().min(1),
  // LRU — most recent last; length never exceeds cap
  entries: z.array(carryoverEntrySchema),
});
export type CarryoverBucket = z.infer<typeof carryoverBucketSchema>;

// What is re-attached into context after compaction instead of being dropped.
export const compactAttachmentSchema = z.object({
  bucket: carryoverBucketNameSchema,
  rendered: z.string(),
  entry_count: z.number().int().min(0),
});
export type CompactAttachment = z.infer<typeof compactAttachmentSchema>;
