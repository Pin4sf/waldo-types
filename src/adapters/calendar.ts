import { z } from 'zod';
import { errorCodeSchema, iso8601Schema } from '../core/error';

// STUB — full implementation in waldo-backend/waldo-app Sprint 2 (ADR-0040, HEY-63/64)

export const calendarProviderNameSchema = z.enum(['google_calendar', 'apple_calendar']);
export type CalendarProviderName = z.infer<typeof calendarProviderNameSchema>;

export const calendarEventSchema = z.object({
  event_id: z.string(),
  title: z.string(),  // PII — category inference only, never quote verbatim in prompts (ADR-0040)
  start: iso8601Schema,
  end: iso8601Schema,
  attendee_count: z.number().int().min(0),
  is_recurring: z.boolean(),
  calendar_id: z.string(),
  provider: calendarProviderNameSchema,
});
export type CalendarEvent = z.infer<typeof calendarEventSchema>;

export const slotSchema = z.object({
  start: iso8601Schema,
  end: iso8601Schema,
  form_zone_score: z.number().min(0).max(1),
});
export type Slot = z.infer<typeof slotSchema>;

export interface CalendarProvider {
  provider: CalendarProviderName;

  query_events(args: {
    date_range: { from: string; to: string };
    include_declined?: boolean;
    limit?: number;
  }): Promise<
    | { ok: true; events: CalendarEvent[] }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;

  find_slots(args: {
    attendees: string[];
    duration_min: number;
    earliest: string;
    latest: string;
    prefer_zone?: 'peak' | 'steady' | 'avoid_trough';
  }): Promise<
    | { ok: true; slots: Slot[] }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;

  propose_event(args: {
    title: string;
    start: string;
    end: string;
    attendees: string[];
    description?: string;
    idempotency_key: string;
  }): Promise<
    | { ok: true; event_id: string; decision_id: string }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;
}
