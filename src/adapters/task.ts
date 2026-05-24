import { z } from 'zod';
import { errorCodeSchema, iso8601Schema } from '../core/error';

export const taskProviderNameSchema = z.enum([
  'todoist', 'notion', 'linear', 'google_tasks', 'ms_todo',
]);
export type TaskProviderName = z.infer<typeof taskProviderNameSchema>;

export const taskSchema = z.object({
  task_id: z.string(),
  title: z.string(),  // PII boundary — never read description (ADR-0021 privacy wall)
  due: iso8601Schema.optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['todo', 'in_progress', 'done', 'cancelled']),
  tags: z.array(z.string()).optional(),
  parent_task_id: z.string().optional(),
  provider: taskProviderNameSchema,
  created_at: iso8601Schema,
  updated_at: iso8601Schema,
});
export type Task = z.infer<typeof taskSchema>;

export interface TaskProvider {
  provider: TaskProviderName;

  list(args: {
    status?: 'todo' | 'in_progress' | 'done' | 'all';
    limit?: number;
  }): Promise<
    | { ok: true; tasks: Task[] }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;

  create(args: {
    title: string;
    due?: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    parent_task_id?: string;
    idempotency_key: string;
  }): Promise<
    | { ok: true; task_id: string }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;

  update(args: {
    task_id: string;
    changes: {
      title?: string;
      due?: string;
      priority?: 'low' | 'medium' | 'high';
      status?: 'todo' | 'in_progress' | 'done' | 'cancelled';
      tags_add?: string[];
      tags_remove?: string[];
    };
  }): Promise<{ ok: true } | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }>;
}
