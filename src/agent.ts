/**
 * @waldo/types — Agent output shapes
 *
 * Types the app reads to render agent-produced content:
 * - Messages delivered by Waldo (Morning Wag, The Fetch, Chat replies)
 * - Patrol entries (audit trail the app shows)
 * - Spots (observations the app shows)
 *
 * NOT here: WaldoTool, AgentContext, AgentResult — backend internal.
 * NOT here: TriggerType details beyond what the app needs to render.
 */

export type TriggerType =
  | 'morning_wag'
  | 'fetch_alert'
  | 'patrol'
  | 'handoff_explore'
  | 'handoff_plan'
  | 'handoff_act'
  | 'user_message'
  | 'dreaming_mode';

export type DeliveryStatus = 'sent' | 'fallback' | 'suppressed' | 'failed';
export type LlmFallbackLevel = 1 | 2 | 3 | 4;

export interface ActionButton {
  text: string;
  callbackData: string;
}

/** A message delivered to the user by Waldo. Rendered in Chat and Patrol. */
export interface AgentMessage {
  traceId: string;
  triggerType: TriggerType;
  content: string;
  actions?: ActionButton[];
  channel: 'telegram' | 'apns' | 'fcm' | 'in_app';
  deliveryStatus: DeliveryStatus;
  llmFallbackLevel: LlmFallbackLevel;
}

/** An entry in The Patrol — immutable audit trail of everything Waldo did. */
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

/** A Spot — single observation shown in the Spots screen. */
export interface SpotObservation {
  id: string;
  userId: string;
  date: string;
  category: 'body' | 'schedule' | 'comms' | 'tasks' | 'mood' | 'pattern';
  observation: string;          // Waldo-voice, no raw values
  confidence: number;           // ordering only — NEVER displayed to user
  linkedCategories: string[];
  expiresAt: string;            // 90 days from generated_at
  dismissedAt: string | null;
  constellationId: string | null;
}
