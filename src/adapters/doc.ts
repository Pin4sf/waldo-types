import { z } from 'zod';
import { errorCodeSchema, iso8601Schema } from '../core/error';

export const docProviderSchema = z.enum(['drive', 'notion', 'confluence', 'r2_scratch']);
export type DocProvider = z.infer<typeof docProviderSchema>;

export const docHitSchema = z.object({
  provider: docProviderSchema,
  doc_id: z.string(),
  title: z.string(),
  url: z.string(),
  snippet: z.string().max(500),
  date_modified: iso8601Schema,
  parent: z.object({ id: z.string(), name: z.string() }).nullable(),
});
export type DocHit = z.infer<typeof docHitSchema>;

export const docReadResultSchema = z.object({
  doc_id: z.string(),
  title: z.string(),
  body_markdown: z.string(),
  url: z.string(),
  date_modified: iso8601Schema,
  size_bytes: z.number().int().min(0),
});
export type DocReadResult = z.infer<typeof docReadResultSchema>;

export interface DocAdapter {
  provider: DocProvider;

  search(args: {
    query: string;
    parent_folder_id?: string;
    time_range?: { from: string; to: string };
    limit?: number;
  }): Promise<
    | { ok: true; hits: DocHit[] }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;

  read(args: { doc_id: string }): Promise<
    | { ok: true; doc: DocReadResult }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;

  write(args: {
    title: string;
    body_markdown: string;
    parent_folder_id?: string;
    shareable?: boolean;
    idempotency_key: string;
  }): Promise<
    | { ok: true; doc_id: string; url: string }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;

  list_folders(args: { parent_folder_id?: string }): Promise<
    | { ok: true; folders: Array<{ id: string; name: string }> }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;
}
