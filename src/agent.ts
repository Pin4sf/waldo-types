/**
 * @waldo/types — Agent contracts
 * AgentMessage, TriggerType, tools, patrol entries, spots.
 */

export type TriggerType =
  | 'morning_wag'
  | 'fetch_alert'
  | 'patrol'
  | 'handoff_explore'   // EPA Phase 1 — read-only tools
  | 'handoff_plan'      // EPA Phase 2 — propose_action
  | 'handoff_act'       // EPA Phase 3 — execute_action (approval-gated only)
  | 'user_message'
  | 'dreaming_mode';

export type DeliveryStatus = 'sent' | 'fallback' | 'suppressed' | 'failed';
export type LlmFallbackLevel = 1 | 2 | 3 | 4;

export interface AgentMessage {
  traceId: string;
  triggerType: TriggerType;
  content: string;
  actions?: ActionButton[];
  channel: 'telegram' | 'apns' | 'fcm' | 'in_app';
  llmModel: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
  deliveryStatus: DeliveryStatus;
  llmFallbackLevel: LlmFallbackLevel;
}

export interface ActionButton {
  text: string;
  callbackData: string;
}

export interface WaldoTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;  // JSON Schema
  permittedTriggers: TriggerType[];
}

export interface PatrolEntry {
  id: string;
  userId: string;
  occurredAt: string;
  entryType: 'brief' | 'fetch' | 'adjustment' | 'spot' | 'window' | 'handoff' | 'close' | 'intervention';
  title: string;
  reasoning: string;
  isReversible: boolean;
  reversedAt: string | null;
  causalChainId: string | null;
  chainPosition: number | null;
  userThumbs: 'up' | 'down' | null;
  traceId: string;
}

export interface SpotObservation {
  id: string;
  userId: string;
  date: string;
  category: 'body' | 'schedule' | 'comms' | 'tasks' | 'mood' | 'pattern';
  observation: string;                 // Waldo-voice, no raw values
  confidence: number;                  // for ordering only — NEVER displayed to user
  linkedCategories: string[];
  expiresAt: string;                   // 90 days from generated_at
  dismissedAt: string | null;
  constellationId: string | null;
}

export interface AgentContext {
  userId: string;
  traceId: string;
  trigger: TriggerType;
  date: string;
  iteration: number;
}

export interface AgentResult {
  traceId: string;
  deliveryStatus: DeliveryStatus;
  fallbackLevel: LlmFallbackLevel;
  iterationsUsed: number;
  totalTokens: number;
  estimatedCostUsd: number;
  toolsCalled: string[];
  errorClass?: import('./adapters').HarnessErrorClass;
}
