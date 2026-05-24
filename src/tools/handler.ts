import { z } from 'zod';
import { errorCodeSchema } from '../core/error';
import type { InvocationContext } from '../core/trigger';
import type { WaldoCard } from '../ui/card';

export const toolResultSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.discriminatedUnion('ok', [
    z.object({ ok: z.literal(true), data: dataSchema, card: z.custom<WaldoCard>().optional() }),
    z.object({ ok: z.literal(false), error: z.string(), code: errorCodeSchema }),
  ]);

export type ToolResult<T = unknown> =
  | { ok: true; data: T; card?: WaldoCard }
  | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> };

export interface ToolHandler<Args, Result> {
  name: string;
  description: string;
  schema: z.ZodSchema<Args>;
  trigger_allowlist: z.infer<typeof import('../core/trigger').triggerTypeSchema>[];
  autonomy_gated: boolean;
  handle(args: Args, ctx: InvocationContext): Promise<ToolResult<Result>>;
}
