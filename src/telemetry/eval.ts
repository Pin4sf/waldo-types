import { z } from 'zod';
import { iso8601Schema } from '../core/error';
import { triggerTypeSchema } from '../core/trigger';

// Verification layer eval contract (ADR-0030): trace-native production eval, WIS, KeepRate,
// plus a deterministic medical safety gate. Eval output is part of the runtime contract.

// WIS composite (computable from agent_logs + outcome_signals, no LLM call).
export const wisComponentsSchema = z.object({
  engagement_rate: z.number().min(0).max(1),
  action_acceptance: z.number().min(0).max(1),
  explicit_positivity: z.number().min(-1).max(1),
  retention_proxy: z.number().min(0).max(1),
  composite: z.number().min(0).max(1),
});
export type WisComponents = z.infer<typeof wisComponentsSchema>;

export const memoryHealthSchema = z.enum(['ok', 'degraded', 'inconsistent']);
export type MemoryHealth = z.infer<typeof memoryHealthSchema>;

export const traceEvalSchema = z.object({
  trace_id: z.string(),
  quality_score: z.number().min(0).max(1),
  quality_breakdown: z.record(z.number().min(0).max(1)),
  wis_contribution: z.number(),
  memory_health: memoryHealthSchema,
  rule_violations: z.array(z.string()),
  requires_review: z.boolean(),
  verifier_anomaly: z.string().optional(),
  evaluated_at: iso8601Schema,
});
export type TraceEval = z.infer<typeof traceEvalSchema>;

// iOS-sourced engagement signal feeding WIS (opened/dismissed/engaged).
export const keepRateSignalSchema = z.enum(['opened', 'dismissed', 'engaged']);
export type KeepRateSignal = z.infer<typeof keepRateSignalSchema>;

export const keepRateEventSchema = z.object({
  trace_id: z.string(),
  user_id: z.string(),
  trigger: triggerTypeSchema,
  signal: keepRateSignalSchema,
  seconds_to_open: z.number().min(0).optional(),
  recorded_at: iso8601Schema,
});
export type KeepRateEvent = z.infer<typeof keepRateEventSchema>;

// Deterministic banned-output gate — agent is "not a medical device" (ADR-0011/0030).
export const medicalGateResultSchema = z.object({
  passed: z.boolean(),
  matched_patterns: z.array(z.string()),
  action: z.enum(['allow', 'block', 'rewrite']),
});
export type MedicalGateResult = z.infer<typeof medicalGateResultSchema>;
