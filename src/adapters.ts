/**
 * @waldo/types — adapters.ts
 *
 * This file intentionally contains only cross-repo shapes.
 *
 * ChannelAdapter, LLMProvider, MemoryProvider, ContextEngine, ProviderRuntime,
 * GatewayAdapter, AgentLifecycleHook, ToolHandler, HarnessError — all
 * backend-internal. They live in waldo-backend, not here.
 *
 * ActionButton is in agent.ts (used by AgentMessage).
 * DeliveryResult is backend-internal (delivery outcome details).
 *
 * If you are about to add an interface here: ask first —
 * "does waldo-app need to know about this?" If no, it does not belong.
 */

// No exports — this file is a reminder, not dead code.
// Delete it if it causes confusion. The comment is the value.
