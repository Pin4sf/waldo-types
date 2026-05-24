import { z } from 'zod';
import { iso8601Schema } from '../core/error';
import { triggerTypeSchema } from '../core/trigger';

export const toolInvocationLogSchema = z.object({
  tool_name: z.string(),
  trigger: triggerTypeSchema,
  duration_ms: z.number().int().min(0),
  ok: z.boolean(),
  error_code: z.string().optional(),
  invoked_at: iso8601Schema,
});
export type ToolInvocationLog = z.infer<typeof toolInvocationLogSchema>;

export const skillInvocationLogSchema = z.object({
  skill_name: z.string(),
  trigger: triggerTypeSchema,
  tools_called: z.array(z.string()),
  duration_ms: z.number().int().min(0),
  ok: z.boolean(),
  invoked_at: iso8601Schema,
});
export type SkillInvocationLog = z.infer<typeof skillInvocationLogSchema>;

export const agentLogSchema = z.object({
  trace_id: z.string(),
  user_id: z.string(),
  trigger: triggerTypeSchema,
  started_at: iso8601Schema,
  ended_at: iso8601Schema.optional(),
  tools: z.array(toolInvocationLogSchema),
  skills: z.array(skillInvocationLogSchema),
  total_input_tokens: z.number().int().min(0),
  total_output_tokens: z.number().int().min(0),
  ok: z.boolean(),
});
export type AgentLog = z.infer<typeof agentLogSchema>;
