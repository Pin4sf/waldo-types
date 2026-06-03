import { z } from 'zod';
import { triggerTypeSchema } from '../core/trigger';
import { modelNameSchema } from '../adapters/llm';

// Model-agnostic router (ADR-0004 single CF AI Gateway seam, ADR-0003 cheap-primary/
// expensive-reasoning split). The model pick is swappable adapter config; the durable
// decision is the routing policy + per-trigger escalation curve.

export const gatewayStepSchema = z.object({
  provider: z.enum(['workers_ai', 'anthropic']),
  model: modelNameSchema,
  cache: z.enum(['none', 'exact', 'anthropic_native']).default('none'),
  max_tokens: z.number().int().min(1).max(8192).optional(),
});
export type GatewayStep = z.infer<typeof gatewayStepSchema>;

export const modelRouteSchema = z.object({
  trigger: triggerTypeSchema,
  primary: gatewayStepSchema,
  fallback: z.array(gatewayStepSchema).default([]),
});
export type ModelRoute = z.infer<typeof modelRouteSchema>;

export const escalationConfigSchema = z.object({
  // escalate the primary route to a reasoning model when the cheap route is not enough
  escalate_to: gatewayStepSchema,
  // 0-1 confidence below which the cheap route escalates (shadow-eval gated, ADR-0003)
  min_confidence: z.number().min(0).max(1).default(0.7),
  reason: z.enum(['low_confidence', 'pattern_analysis', 'dreaming_mode', 'safety_review']),
});
export type EscalationConfig = z.infer<typeof escalationConfigSchema>;

export const routingPolicySchema = z.object({
  routes: z.array(modelRouteSchema),
  escalation: z.array(escalationConfigSchema).default([]),
  // L3 template fallback floor when the gateway is dark (ADR-0004 SPOF mitigation)
  template_fallback: z.boolean().default(true),
});
export type RoutingPolicy = z.infer<typeof routingPolicySchema>;
