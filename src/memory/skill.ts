import { z } from 'zod';
import { iso8601Schema } from '../core/error';
import { triggerTypeSchema } from '../core/trigger';

export const skillSchema = z.object({
  name: z.string().min(1).max(100),
  version: z.number().int().min(1),
  provenance: z.enum(['system', 'connector', 'user', 'agent_authored']),
  identity_locked: z.boolean(),
  provisional: z.boolean(),
  trigger_types: z.array(triggerTypeSchema),
  trigger_condition: z.string(),
  required_tools: z.array(z.string()),
  required_connectors: z.array(z.string()),
  effectiveness: z.number().min(0).max(1),
  invocations: z.number().int().min(0),
  last_used: iso8601Schema.nullable(),
  body_markdown: z.string(),
  created_by: z.string(),
  created_at: iso8601Schema,
});
export type Skill = z.infer<typeof skillSchema>;

export const skillFilterResultSchema = z.object({
  selected: z.array(skillSchema),
  excluded: z.array(
    z.object({ skill_name: z.string(), reason: z.string() })
  ),
});
export type SkillFilterResult = z.infer<typeof skillFilterResultSchema>;
