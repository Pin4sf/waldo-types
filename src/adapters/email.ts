import { z } from 'zod';
import { errorCodeSchema, iso8601Schema } from '../core/error';

export const emailProviderNameSchema = z.enum(['gmail', 'outlook_graph']);
export type EmailProviderName = z.infer<typeof emailProviderNameSchema>;

export const emailDraftSchema = z.object({
  draft_id: z.string(),
  thread_id: z.string().optional(),
  message_id: z.string().optional(),
  subject: z.string(),
  to: z.array(z.string()),
  cc: z.array(z.string()).optional(),
  bcc: z.array(z.string()).optional(),
  // body NEVER persisted in Waldo — only the draft_id reference (ADR-0027)
  created_at: iso8601Schema,
  send_url: z.string().optional(),
});
export type EmailDraft = z.infer<typeof emailDraftSchema>;

export interface EmailProvider {
  provider: EmailProviderName;

  get_metadata(args: {
    date_range: { from: string; to: string };
  }): Promise<{
    ok: true;
    summary: {
      message_count: number;
      after_hours_ratio: number;
      thread_depth_avg: number;
      sender_domains: string[];
    };
  }>;

  create_draft(args: {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body_markdown: string;
    reply_to_thread_id?: string;
    in_reply_to_message_id?: string;
    idempotency_key: string;
  }): Promise<
    | { ok: true; draft: EmailDraft }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;

  list_drafts(args: { limit?: number }): Promise<{ ok: true; drafts: EmailDraft[] }>;

  delete_draft(args: { draft_id: string }): Promise<
    { ok: true } | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;

  // NEVER called from model output — only from user-tap via execute_action (ADR-0027)
  send_draft(args: {
    draft_id: string;
    user_confirmation_token: string;
  }): Promise<
    | { ok: true; message_id: string }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;
}
