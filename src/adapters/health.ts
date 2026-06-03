import { z } from 'zod';
import { errorCodeSchema, iso8601Schema } from '../core/error';
import { crsResultSchema, type CrsResult } from '../health/crs';

// Raw values (HRV, HR, sleep hours, SpO2) NEVER in type names or logs (mental-model.md)
// CrsResult + Zone are the single source in health/crs.ts; re-export so callers of the
// HealthDataSource adapter keep importing them from here.
export { crsResultSchema, type CrsResult } from '../health/crs';

export const healthSnapshotSchema = z.object({
  user_id: z.string(),
  date: iso8601Schema,
  crs: crsResultSchema,
  // Derived categories only — no raw biometric values (ADR privacy wall)
  recovery_category: z.enum(['optimal', 'good', 'moderate', 'poor']),
  sleep_quality_category: z.enum(['optimal', 'good', 'moderate', 'poor']),
  strain_level: z.enum(['low', 'moderate', 'high', 'very_high']),
  has_wearable_data: z.boolean(),
  sources: z.array(z.string()),
});
export type HealthSnapshot = z.infer<typeof healthSnapshotSchema>;

export interface HealthDataSource {
  source_id: string;

  get_snapshot(args: {
    user_id: string;
    date?: string;
  }): Promise<
    | { ok: true; snapshot: HealthSnapshot }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;

  get_crs(args: {
    user_id: string;
    range_days?: number;
  }): Promise<
    | { ok: true; result: CrsResult }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;
}
