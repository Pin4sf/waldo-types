/**
 * @waldo/types — Memory shapes
 *
 * Only the memory shapes the APP needs to render.
 * Currently: none — memory is internal to the DO agent brain.
 *
 * The app shows memory indirectly via:
 * - PatrolEntry (what Waldo did — in agent.ts)
 * - SpotObservation (what Waldo noticed — in agent.ts)
 * - TodayResponse (what to show today — in api.ts)
 *
 * MemoryBlock, Episode, MemoryInboxItem, AgentSkill, AgentEvolution are
 * DO SQLite types — backend-internal. They live in waldo-backend.
 *
 * This file exists as a placeholder for when the Memory Inspector UI (Phase 2)
 * needs to expose memory halls to the app. At that point, add only the
 * shapes the app renders — not the full internal schema.
 */

// No exports yet.
// Phase 2: add MemoryHallSummary (what the Memory Inspector shows to the user)
