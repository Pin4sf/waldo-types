import { z } from 'zod';
import { errorCodeSchema } from '../core/error';
import type { WaldoCard } from '../ui/card';

export const modelNameSchema = z.enum([
  'gemma-4-27b',       // primary: ~95% of calls (ADR-0003)
  'claude-sonnet-4-6', // reasoning: ~5% (pattern analysis, Dreaming Mode)
  'gemma-4-9b',        // topic classification fallback (ADR-0039)
]);
export type ModelName = z.infer<typeof modelNameSchema>;

export const llmRequestSchema = z.object({
  model: modelNameSchema,
  system: z.string().optional(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
  max_tokens: z.number().int().min(1).max(8192).optional(),
  temperature: z.number().min(0).max(2).optional(),
});
export type LLMRequest = z.infer<typeof llmRequestSchema>;

export type LLMResponse = {
  model: ModelName;
  text: string;
  cards?: WaldoCard[];
  input_tokens: number;
  output_tokens: number;
  latency_ms: number;
};

export interface LLMProvider {
  complete(request: LLMRequest): Promise<
    | { ok: true; response: LLMResponse }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;

  classify(content: string, taxonomy: string[]): Promise<string[]>;
}
