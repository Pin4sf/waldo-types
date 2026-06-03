import { z } from 'zod';

// Scribe sanitiser canonical contract (ADR-0024): destination-aware PII strip + raw-health
// lockout + canary check + instruction-pattern detection + size cap. 10 destinations —
// the 9 of ADR-0024 plus `workspace_file` (ADR-0029 v0.2.0 amendment for the R2 mount).

export const sanitiseDestinationSchema = z.enum([
  'memory_blocks',
  'system_prompt',
  'internal_context',
  'draft_document',
  'draft_email',
  'send_message',
  'sandbox_stdout',
  'skill_body',
  'audit_log',
  'workspace_file',
]);
export type SanitiseDestination = z.infer<typeof sanitiseDestinationSchema>;

export const sanitiseReasonSchema = z.enum([
  'canary_leak',
  'health_value_leak',
  'oversize',
  'untrusted_instruction',
]);
export type SanitiseReason = z.infer<typeof sanitiseReasonSchema>;

export const redactionKindSchema = z.enum([
  'email',
  'phone',
  'attendee_name',
  'address',
  'credit_card',
  'instruction_pattern',
]);
export type RedactionKind = z.infer<typeof redactionKindSchema>;

export const redactionSchema = z.object({
  kind: redactionKindSchema,
  count: z.number().int().min(0),
});
export type Redaction = z.infer<typeof redactionSchema>;

// Redactions are logged with counts, never values (ADR-0024).
export type SanitiseResult =
  | { ok: true; output: string; redactions: Redaction[] }
  | { ok: false; reason: SanitiseReason };
