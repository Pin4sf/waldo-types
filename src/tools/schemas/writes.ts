import { z } from 'zod';
import { iso8601Schema } from '../../core/error';

export const writeTaskArgs = z.object({
  title: z.string().min(1).max(200),
  due: iso8601Schema.optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.array(z.string()).max(10).optional(),
  parent_task_id: z.string().optional(),
  reasoning: z.string().min(1).max(500),
});
export type WriteTaskArgs = z.infer<typeof writeTaskArgs>;

export const updateTaskArgs = z.object({
  task_id: z.string().min(1),
  changes: z.object({
    title: z.string().min(1).max(200).optional(),
    due: iso8601Schema.optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    status: z.enum(['todo', 'in_progress', 'done', 'cancelled']).optional(),
    tags_add: z.array(z.string()).optional(),
    tags_remove: z.array(z.string()).optional(),
  }),
  reasoning: z.string().min(1).max(500),
});
export type UpdateTaskArgs = z.infer<typeof updateTaskArgs>;

export const draftDocumentArgs = z.object({
  title: z.string().min(1).max(200),
  body_markdown: z.string().min(1).max(50_000),
  destination: z.enum(['scratch', 'drive', 'notion', 'confluence']),
  parent_folder_id: z.string().optional(),
  shareable: z.boolean().default(false),
});
export type DraftDocumentArgs = z.infer<typeof draftDocumentArgs>;

export const draftEmailArgs = z.object({
  to: z.array(z.string().email()).min(1).max(50),
  cc: z.array(z.string().email()).max(50).optional(),
  bcc: z.array(z.string().email()).max(50).optional(),
  subject: z.string().min(1).max(200),
  body_markdown: z.string().min(1).max(10_000),
  reply_to_thread_id: z.string().optional(),
  in_reply_to_msg_id: z.string().optional(),
});
export type DraftEmailArgs = z.infer<typeof draftEmailArgs>;

export const searchConnectorArgs = z.object({
  query: z.string().min(1).max(500),
  sources: z.array(z.enum(['drive', 'notion', 'confluence', 'mail', 'calendar', 'tasks'])).optional(),
  time_range: z.object({ from: iso8601Schema, to: iso8601Schema }).optional(),
  limit: z.number().int().min(1).max(50).default(10),
});
export type SearchConnectorArgs = z.infer<typeof searchConnectorArgs>;

export const proposeScheduleArgs = z.object({
  attendees: z.array(z.string().email()).min(1).max(50),
  duration_min: z.number().int().min(15).max(480),
  title: z.string().min(1).max(200),
  description_markdown: z.string().max(2000).optional(),
  earliest: iso8601Schema.optional(),
  latest: iso8601Schema.optional(),
  prefer_user_form_zone: z.enum(['peak', 'steady', 'avoid_trough']).optional(),
});
export type ProposeScheduleArgs = z.infer<typeof proposeScheduleArgs>;

export const writeSheetCellArgs = z.object({
  sheet_id: z.string().min(1),
  range: z.string().min(1).max(100),
  value: z.union([z.string(), z.number()]),
  mode: z.enum(['overwrite', 'append']).default('overwrite'),
});
export type WriteSheetCellArgs = z.infer<typeof writeSheetCellArgs>;

export const executeCodeArgs = z.object({
  language: z.enum(['python', 'js']),
  code: z.string().min(1).max(50_000),
  stdin: z.string().max(10_000).optional(),
  allow_hosts: z.array(z.string()).max(20).default([]),
  timeout_ms: z.number().int().min(1000).max(30_000).default(30_000),
  memory_mb: z.number().int().min(64).max(512).default(256),
});
export type ExecuteCodeArgs = z.infer<typeof executeCodeArgs>;
