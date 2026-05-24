import { z } from 'zod';
import { errorCodeSchema, iso8601Schema } from '../core/error';

// STUB — full implementation in waldo-backend Sprint 3 (ADR-0041, HEY-66/67)
// No tool-bound Zod schemas: TranscriptionProvider is webhook-driven, not LLM-callable

export const transcriptionProviderNameSchema = z.enum([
  'whisper_api',    // Phase 1 (ADR-0041)
  'faster_whisper', // Phase 2 swap candidate
]);
export type TranscriptionProviderName = z.infer<typeof transcriptionProviderNameSchema>;

export const transcriptResultSchema = z.object({
  transcript: z.string(),
  duration_seconds: z.number().min(0),
  provider: transcriptionProviderNameSchema,
  transcribed_at: iso8601Schema,
  // raw audio deleted within 60s of Whisper response (ADR-0041 privacy)
  audio_deleted: z.literal(true),
});
export type TranscriptResult = z.infer<typeof transcriptResultSchema>;

export interface TranscriptionProvider {
  provider: TranscriptionProviderName;

  // audio_url points to R2 staging object (TTL 60s per ADR-0041)
  transcribe(args: {
    audio_url: string;
    user_id: string;
    duration_hint_seconds?: number;
  }): Promise<
    | { ok: true; result: TranscriptResult }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;
}
