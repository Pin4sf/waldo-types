import { z } from 'zod';
import { iso8601Schema } from '../../core/error';

export const getCrsArgs = z.object({
  range_days: z.number().int().min(1).max(90).default(1),
});
export type GetCrsArgs = z.infer<typeof getCrsArgs>;

export const getHealthArgs = z.object({
  metrics: z.array(z.enum(['hrv', 'hr', 'sleep', 'spo2', 'strain', 'recovery'])).optional(),
  date: iso8601Schema.optional(),
});
export type GetHealthArgs = z.infer<typeof getHealthArgs>;

// Renamed from get_schedule per ADR-0040 naming convention
// (was: get_schedule in original 16-tool surface)
export const queryCalendarArgs = z.object({
  date_range: z.object({ from: iso8601Schema, to: iso8601Schema }).optional(),
  include_declined: z.boolean().default(false),
  limit: z.number().int().min(1).max(50).default(20),
});
export type QueryCalendarArgs = z.infer<typeof queryCalendarArgs>;

export const getCommunicationArgs = z.object({
  date_range: z.object({ from: iso8601Schema, to: iso8601Schema }).optional(),
});
export type GetCommunicationArgs = z.infer<typeof getCommunicationArgs>;

export const getTasksArgs = z.object({
  status: z.enum(['todo', 'in_progress', 'done', 'all']).default('todo'),
  limit: z.number().int().min(1).max(100).default(20),
});
export type GetTasksArgs = z.infer<typeof getTasksArgs>;

export const getMasterMetricsArgs = z.object({
  date: iso8601Schema.optional(),
});
export type GetMasterMetricsArgs = z.infer<typeof getMasterMetricsArgs>;

export const getContextArgs = z.object({
  topic: z.string().min(1).max(200).optional(),
});
export type GetContextArgs = z.infer<typeof getContextArgs>;

export const readMemoryArgs = z.object({
  hall: z.enum(['facts', 'events', 'discoveries', 'preferences', 'advice']).optional(),
  limit: z.number().int().min(1).max(50).default(10),
  query: z.string().max(500).optional(),
});
export type ReadMemoryArgs = z.infer<typeof readMemoryArgs>;

export const updateMemoryArgs = z.object({
  hall: z.enum(['events', 'discoveries', 'preferences', 'advice']),
  content: z.string().min(1).max(2000),
  tags: z.array(z.string()).max(10).optional(),
});
export type UpdateMemoryArgs = z.infer<typeof updateMemoryArgs>;

export const searchEpisodesArgs = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(20).default(5),
  date_range: z.object({ from: iso8601Schema, to: iso8601Schema }).optional(),
});
export type SearchEpisodesArgs = z.infer<typeof searchEpisodesArgs>;

export const proposeActionArgs = z.object({
  action_type: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  reasoning: z.string().min(1).max(500),
  urgency: z.enum(['low', 'medium', 'high']).default('medium'),
});
export type ProposeActionArgs = z.infer<typeof proposeActionArgs>;

export const executeActionArgs = z.object({
  action_id: z.string().min(1),
  confirmation_token: z.string().min(1),
  user_id: z.string().min(1),
});
export type ExecuteActionArgs = z.infer<typeof executeActionArgs>;

export const sendMessageArgs = z.object({
  channel: z.enum(['telegram', 'apns', 'whatsapp', 'discord', 'slack', 'in_app']),
  user_id: z.string().min(1),
  content: z.string().min(1).max(4096),
  idempotency_key: z.string().min(1),
});
export type SendMessageArgs = z.infer<typeof sendMessageArgs>;

export const webSearchArgs = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(10).default(5),
});
export type WebSearchArgs = z.infer<typeof webSearchArgs>;

export const readDocumentArgs = z.object({
  doc_id: z.string().min(1),
  provider: z.enum(['drive', 'notion', 'confluence', 'r2_scratch']).optional(),
});
export type ReadDocumentArgs = z.infer<typeof readDocumentArgs>;

export const callMcpToolArgs = z.object({
  server: z.string().min(1).max(100),
  tool: z.string().min(1).max(100),
  args: z.record(z.unknown()),
});
export type CallMcpToolArgs = z.infer<typeof callMcpToolArgs>;
