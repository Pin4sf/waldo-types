import { z } from 'zod';
import { iso8601Schema } from '../core/error';
import { zoneSchema } from '../health/crs';

// NarrativeContext — the body+mind universal-context block (second-brain / harness L1).
// A compiled, derived-only snapshot of the user's biological + situational state that the
// prompt builder threads into every invocation. No raw biometric values (ADR-0011 wall).

export const narrativeContextSchema = z.object({
  // body: derived zone language only — never raw HRV/HR/SpO2/sleep-hours
  zone: zoneSchema,
  recovery_descriptor: z.enum(['excellent', 'solid', 'mixed', 'compromised']),
  load_descriptor: z.enum(['light', 'moderate', 'heavy', 'peak']),
  // mind: situational framing the agent reasons from
  day_summary: z.string().max(2000),
  active_goals: z.array(z.string()).default([]),
  upcoming_high_stakes: z.array(z.string()).default([]),
  compiled_at: iso8601Schema,
});
export type NarrativeContext = z.infer<typeof narrativeContextSchema>;
