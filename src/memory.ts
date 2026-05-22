/**
 * @waldo/types — Memory system contracts
 * DO SQLite memory schema types. Raw health values NEVER appear here.
 */

export type MemoryHallType = 'facts' | 'events' | 'discoveries' | 'preferences' | 'advice';
export type MemorySourceType = 'health_derived' | 'user_stated' | 'agent_inferred';
export type MemoryOperation = 'ADD' | 'UPDATE' | 'DELETE';

/**
 * One row in DO SQLite memory_blocks.
 * Bi-temporal: valid_from / valid_to / superseded_by — NEVER delete, only invalidate.
 * CARA confidence: +0.1 on confirmation, -0.2 on contradiction, threshold ≥ 0.5
 */
export interface MemoryBlock {
  id: string;
  userId: string;
  hallType: MemoryHallType;
  key: string;
  value: string;                    // NO raw health values (HRV ms, RHR bpm, sleep min)
  // Bi-temporal (MemPalace pattern)
  validFrom: string;                // datetime ISO
  validTo: string | null;           // NULL = still valid
  supersededBy: string | null;      // links to replacement block ID
  // CARA confidence
  confidence: number;               // 0.0-1.0, suppress from context if < 0.5
  sourceType: MemorySourceType;
  provenance: string;               // trace_id that created this
  // Retrieval optimization
  citationRate: number;             // how often this block is cited in responses
  lastCited: string | null;
}

/**
 * Episodic memory — one row per agent session summary.
 * Accumulated 0-90 days in DO SQLite, then archived to R2 JSONL.
 * Session lineage tracked via parentSessionId (Hermes pattern).
 */
export interface Episode {
  id: string;
  userId: string;
  occurredAt: string;
  eventType: string;
  content: string;                  // NO raw health values
  consolidated: boolean;            // false until Dreaming Mode processes
  patternTags: string[];            // for Constellation mining
  outcomeSignal: 'positive' | 'negative' | 'neutral' | null;
  source: 'morning_wag' | 'fetch' | 'user_message' | 'patrol';
  // Session lineage (Hermes session storage pattern)
  parentSessionId: string | null;   // links to original session if this is compressed
  compressionCount: number;         // how many times this episode has been compressed
}

/**
 * Memory inbox — tools NEVER write memory_blocks directly.
 * All writes go through inbox → Scribe flushes during Dreaming Mode.
 * Prevents memory poisoning from prompt injection.
 */
export interface MemoryInboxItem {
  id: string;
  userId: string;
  operation: MemoryOperation;
  hallType: MemoryHallType;
  key: string;
  value: string | null;             // null for DELETE operations
  createdAt: string;
  processed: boolean;
  provenance: string;               // trace_id that initiated this write
}

/** Skill stored in Tier 3 procedures after auto-crystallization */
export interface AgentSkill {
  id: string;
  userId: string;
  name: string;
  content: string;                  // full SKILL.md markdown content
  triggerPhrases: string[];
  effectivenessCount: number;
  effectivenessPositive: number;
  createdAt: string;
  lastUsedAt: string | null;
}

/** Behavioral evolution — Phase G */
export interface AgentEvolution {
  id: string;
  userId: string;
  changeType: 'verbosity' | 'timing' | 'topic_weight' | 'language_style' | 'metric_display';
  changeValue: Record<string, unknown>;
  confidence: number;
  applied: boolean;
  reverted: boolean;
  createdAt: string;
}
