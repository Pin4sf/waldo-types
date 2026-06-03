import { z } from 'zod';
import { iso8601Schema } from '../core/error';
import { triggerTypeSchema, briefVariantSchema } from '../core/trigger';

// Durable agent execution: per-run state journal + transactional outbox in DO SQLite,
// keyed by run identity not a time bucket (ADR-0054).

export const runStateSchema = z.enum([
  'PENDING',
  'CONTEXT_BUILT',
  'LLM_CALLED',
  'TOOLS_DONE',
  'GATED',
  'DELIVERED',
  'DONE',
  'FAILED',
]);
export type RunState = z.infer<typeof runStateSchema>;

export const runRecordSchema = z.object({
  run_id: z.string(),
  user_id: z.string(),
  trigger: triggerTypeSchema,
  variant: briefVariantSchema.optional(),
  state: runStateSchema,
  step: z.number().int().min(0),
  attempts: z.number().int().min(0).default(0),
  // hash(user_id, trigger, variant, run_nonce) — survives a 15-min boundary crossing
  run_nonce: z.string(),
  context_json: z.record(z.unknown()).optional(),
  scratch_json: z.record(z.unknown()).optional(),
  created_at: iso8601Schema,
  updated_at: iso8601Schema,
  next_expected_wake: iso8601Schema.optional(),
  failure_reason: z.string().optional(),
});
export type RunRecord = z.infer<typeof runRecordSchema>;

export const outboxKindSchema = z.enum([
  'push',
  'telegram',
  'supabase_log',
  'episode',
  'memory_inbox',
  'r2_write',
]);
export type OutboxKind = z.infer<typeof outboxKindSchema>;

export const outboxStatusSchema = z.enum(['pending', 'flushed', 'failed']);
export type OutboxStatus = z.infer<typeof outboxStatusSchema>;

export const outboxEntrySchema = z.object({
  // PK = idempotency key, enforced by notification_log.idempotency_key UNIQUE
  id: z.string(),
  run_id: z.string(),
  kind: outboxKindSchema,
  payload_json: z.record(z.unknown()),
  status: outboxStatusSchema.default('pending'),
  attempts: z.number().int().min(0).default(0),
  next_retry_at: iso8601Schema.optional(),
  created_at: iso8601Schema,
});
export type OutboxEntry = z.infer<typeof outboxEntrySchema>;
