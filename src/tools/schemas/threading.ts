import { z } from 'zod';
import { waldoCardSchema } from '../../ui/card';

export const createThreadArgs = z.object({
  topic_tags: z.array(z.string().max(50)).max(5).optional(),
  entry_context: z.string().max(500).optional(),
  initial_card: waldoCardSchema.optional(),
});
export type CreateThreadArgs = z.infer<typeof createThreadArgs>;

export const deleteMessageArgs = z.object({
  message_id: z.string().min(1),
  thread_id: z.string().min(1),
});
export type DeleteMessageArgs = z.infer<typeof deleteMessageArgs>;

export const restoreMessageArgs = z.object({
  message_id: z.string().min(1),
  thread_id: z.string().min(1),
});
export type RestoreMessageArgs = z.infer<typeof restoreMessageArgs>;

export const archiveThreadArgs = z.object({
  thread_id: z.string().min(1),
});
export type ArchiveThreadArgs = z.infer<typeof archiveThreadArgs>;

export const updateThreadTopicsArgs = z.object({
  thread_id: z.string().min(1),
  topic_tags: z.array(z.string().max(50)).min(1).max(5),
});
export type UpdateThreadTopicsArgs = z.infer<typeof updateThreadTopicsArgs>;
