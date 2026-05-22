/**
 * @waldo/types — Adapter interfaces
 *
 * All external integrations implement these interfaces.
 * Agent logic, CRS engine, and delivery never reference a provider directly.
 * Swap any implementation by changing the adapter file only.
 */

import type {
  AgentMessage,
  TriggerType,
  AgentContext,
  AgentResult,
} from './agent';

// ─── Delivery ────────────────────────────────────────────────────────────────

export interface ActionButton {
  text: string;
  callbackData: string;
}

export interface DeliveryResult {
  delivered: boolean;
  channel: string;
  idempotencyKey: string;
  error?: string;
}

/**
 * ChannelAdapter — messaging delivery abstraction.
 * Implementations: TelegramAdapter, PushAdapter (APNs + FCM)
 */
export interface ChannelAdapter {
  send(msg: AgentMessage, idempotencyKey: string): Promise<void>;
  /** Renders approval buttons inline (Telegram InlineKeyboardButton / APNs UNNotificationAction) */
  sendProposal(proposalId: string, text: string, options: ActionButton[]): Promise<void>;
  deliverAll(msgs: AgentMessage[]): Promise<DeliveryResult[]>;
}

/**
 * GatewayAdapter — extends ChannelAdapter with lifecycle hooks.
 * Session key namespacing follows Hermes convention: never construct manually.
 */
export interface GatewayAdapter extends ChannelAdapter {
  onSessionStart(userId: string): Promise<void>;
  onSessionEnd(userId: string): Promise<void>;
  onAgentStep(traceId: string, iteration: number): Promise<void>;
  /** Always use this — never construct session keys manually */
  buildSessionKey(platform: 'telegram' | 'in_app' | 'apns' | 'fcm', userId: string, threadId?: string): string;
}

// ─── LLM ─────────────────────────────────────────────────────────────────────

export type ApiMode = 'chat_completions' | 'anthropic_messages' | 'workers_ai';

export interface ResolvedProvider {
  provider: string;
  model: string;
  baseUrl: string;
  apiMode: ApiMode;
}

export interface AgentResponse {
  content: string;
  toolCalls: ToolCall[];
  inputTokens: number;
  outputTokens: number;
  finishReason: 'stop' | 'tool_use' | 'max_tokens' | 'error';
}

export interface ToolCall {
  id: string;
  name: string;
  args: unknown;
}

export interface PromptContext {
  trigger: TriggerType;
  userId: string;
  date: string;
  systemPrompt: string;
  messages: Message[];
  tools: WaldoTool[];
}

export interface Message {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
}

export interface WaldoTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>; // JSON Schema
  permittedTriggers: TriggerType[];
}

/**
 * LLMProvider — AI model abstraction.
 * Implementations: GemmaProvider (primary), AnthropicProvider (reasoning), FallbackChain
 */
export interface LLMProvider {
  generate(ctx: PromptContext): Promise<AgentResponse>;
  estimateCost(inputTokens: number, outputTokens: number): number;
}

/**
 * ProviderRuntime — resolves (trigger, model) to runtime provider config.
 * Handles 3 API modes, credential pools, fallback chain activation.
 * Pattern from Hermes: provider resolution is a first-class concern, not scattered in agent loop.
 */
export interface ProviderRuntime {
  /** Resolve which model+provider to use for this trigger */
  resolve(trigger: TriggerType): ResolvedProvider;
  /**
   * Activate next fallback after failure.
   * Returns null if fallback chain exhausted (caller falls back to template).
   * Hermes pattern: rebuilds client, swaps provider/model/baseUrl/apiMode, resets retry count.
   */
  activateFallback(error: ProviderError): ResolvedProvider | null;
  /**
   * Cheaper auxiliary model for side tasks (compression, eval judge, skill crystallization).
   * NOT used for Morning Wag, The Fetch, or user chat.
   * Hermes pattern: separate model for housekeeping prevents main model cost inflation.
   */
  auxiliaryModel(): ResolvedProvider;
}

export interface ProviderError {
  code: 401 | 403 | 404 | 429 | 500 | 502 | 503;
  provider: string;
  retryCount: number;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;
}

export interface UserBaselines {
  userId: string;
  computedAt: string;
  hrvBaseline: number | null;
  rhrBaseline: number | null;
  sleepBaseline: number | null;
  formBaseline: number | null;
}

/**
 * HealthDataSource — wearable data abstraction.
 * Implementations: SupabaseHealthSource (DO reads via REST — never stores raw values)
 */
export interface HealthDataSource {
  query(userId: string, range: DateRange): Promise<import('./health').HealthDaily[]>;
  queryBaselines(userId: string): Promise<UserBaselines>;
}

// ─── Voice ───────────────────────────────────────────────────────────────────

export interface VoiceInput {
  startRecording(): Promise<void>;
  stopRecording(): Promise<AudioBlob>;
  transcribe(audio: AudioBlob): Promise<string>;
  isAvailable(): boolean;
}

export interface AudioBlob {
  data: Uint8Array;
  mimeType: string;
  durationMs: number;
}

// ─── Memory (Hermes MemoryProvider pattern) ──────────────────────────────────

/**
 * MemoryProvider — pluggable memory backend.
 * Default: Waldo's custom DO SQLite (Scribe + BM25 + ACT-R + CARA + bi-temporal).
 * Future: Honcho, vector DB, knowledge graph — swap without touching agent logic.
 *
 * Hermes pattern: single active provider, lifecycle hooks for each conversation event.
 * Only ONE provider active at a time (prevents tool schema conflicts).
 */
export interface MemoryProvider {
  readonly name: string;
  isAvailable(): boolean;
  initialize(userId: string): Promise<void>;

  /**
   * Prefetch relevant memories before API call.
   * Called in Active Memory pre-reply sub-agent.
   * Returns fenced <memory-context> string ready for prompt injection.
   */
  prefetch(query: string): Promise<string>;

  /**
   * Persist conversation after each turn. MUST be non-blocking (fire-and-forget via DO alarm).
   * Hermes: sync_turn runs as daemon thread to not block response delivery.
   */
  syncTurn(userMessage: string, assistantResponse: string): Promise<void>;

  /** Called when session ends (DO alarm completes or user exits chat). */
  onSessionEnd(messages: Message[]): Promise<void>;

  /**
   * Called BEFORE context compression. Extract and save insights while full context is visible.
   * Hermes pattern: save important facts before they're compressed away.
   */
  onPreCompress(messages: Message[]): Promise<void>;

  /**
   * Mirror memory writes to backend.
   * Allows secondary providers (analytics, audit) to observe all memory changes.
   */
  onMemoryWrite(op: 'ADD' | 'UPDATE' | 'DELETE', key: string, value: string): Promise<void>;
}

// ─── Context Engine (Hermes pluggable compression) ───────────────────────────

export interface CompressedResult {
  messages: Message[];
  parentSessionId: string; // lineage tracking — links compressed to original
  compressionCount: number;
  tokensSaved: number;
}

/**
 * ContextEngine — pluggable context compression strategy.
 * Default: Waldo's 5-stage progressive compaction (budget→snip→microcompact→collapse→LLM-last).
 * Alternative: semantic clustering, hierarchical chunking.
 *
 * Hermes pattern: ContextEngine ABC allows swapping compression strategies.
 * Compression thresholds: 50% = check, 80% = warn, 95% = force compress.
 */
export interface ContextEngine {
  /** Check if compression should trigger. Hermes: fires at 50% context window. */
  shouldCompress(currentTokens: number, maxTokens: number): boolean;
  /**
   * Compress conversation. Uses auxiliaryModel() — NOT main model.
   * Creates parent_session_id for lineage tracking.
   */
  compress(messages: Message[], tokenBudget: number): Promise<CompressedResult>;
  /** Navigate lineage: given a sessionId, return full ancestor chain */
  getLineage(sessionId: string): Promise<string[]>;
}

// ─── Lifecycle Hooks (Hermes gateway hook pattern) ───────────────────────────

/**
 * AgentLifecycleHook — runtime hooks inside the DO agent loop.
 * Different from .claude/settings.json hooks (those are dev tooling).
 * These fire at runtime inside the DO on every agent invocation.
 *
 * Hermes: agent:start / agent:step / agent:end / command:*
 * Waldo: OTel spans fire from these hooks = automatic tracing without per-tool instrumentation.
 */
export interface AgentLifecycleHook {
  onAgentStart(ctx: AgentContext): Promise<void>;
  onAgentStep(ctx: AgentContext, iteration: number, toolsCalled: string[]): Promise<void>;
  onAgentEnd(ctx: AgentContext, result: AgentResult): Promise<void>;
  onToolCall(traceId: string, tool: string, args: unknown): Promise<void>;
  onToolResult(traceId: string, tool: string, result: string, latencyMs: number): Promise<void>;
  onError(traceId: string, error: HarnessError): Promise<void>;
}

// ─── Tool Registry (Hermes self-registration pattern) ────────────────────────

/**
 * ToolHandler — contract for all tool implementations.
 * Hermes rules (adopted for Waldo):
 * - MUST return JSON.stringify(result) — never a raw object
 * - Errors MUST return JSON.stringify({ error: 'description' }) — never throw
 * - Never expose raw health values in output (HRV ms, RHR bpm, sleep min)
 */
export type ToolHandler = (args: unknown, ctx: ToolContext) => Promise<string>;

export interface ToolContext {
  userId: string;
  traceId: string;
  trigger: TriggerType;
  db: unknown; // DrizzleSQLite (typed in implementation)
}

export interface ToolRegistration {
  schema: WaldoTool;
  handler: ToolHandler;
  /** Optional guard — return false to skip registration (e.g., tool requires env var not set) */
  checkFn?: () => boolean;
}

// ─── Error Taxonomy ──────────────────────────────────────────────────────────

export type HarnessErrorClass =
  | 'InvalidArguments'       // model sent bad args → schema/harness bug
  | 'UnexpectedEnvironment'  // data not found, state diverged
  | 'ProviderError'          // AI Gateway / Workers AI failed
  | 'UserAborted'            // explicit cancel
  | 'Timeout'                // exceeded budget
  | 'DiminishingReturns';    // last 3 iterations <500 tokens each

export interface HarnessError {
  class: HarnessErrorClass;
  tool?: string;
  message: string;
  retryable: boolean;
}
