import { z } from 'zod';
import { iso8601Schema } from '../core/error';
import { hallTypeSchema } from './hall';

// Recall-before-act + the retrieve() RRF gateway (ADR-0031 recall, ADR-0007 hot+cold fusion).
// retrieve() federates DO SQLite FTS5 (BM25) and R2/pgvector via Reciprocal Rank Fusion.

export const memoryHitSchema = z.object({
  hall_type: hallTypeSchema,
  content: z.string(),
  confidence: z.number().min(0).max(1),
  valid_from: iso8601Schema,
});
export type MemoryHit = z.infer<typeof memoryHitSchema>;

export const episodeHitSchema = z.object({
  date: iso8601Schema,
  summary: z.string(),
  fts_rank: z.number(),
});
export type EpisodeHit = z.infer<typeof episodeHitSchema>;

export const evolutionHitSchema = z.object({
  change_type: z.string(),
  change_value: z.unknown(),
  source: z.string(),
});
export type EvolutionHit = z.infer<typeof evolutionHitSchema>;

export const recallResultSchema = z.object({
  memory_hits: z.array(memoryHitSchema),
  episode_hits: z.array(episodeHitSchema),
  evolution_hits: z.array(evolutionHitSchema),
  query_used: z.string(),
  duration_ms: z.number().int().min(0),
});
export type RecallResult = z.infer<typeof recallResultSchema>;

export const retrieveArgsSchema = z.object({
  query: z.string().min(1),
  halls: z.array(hallTypeSchema),
  limit: z.number().int().min(1).max(50).default(5),
});
export type RetrieveArgs = z.infer<typeof retrieveArgsSchema>;

// RRF-fused row: a candidate's per-source ranks plus the combined score.
export const retrieveHitSchema = z.object({
  hall_type: hallTypeSchema,
  content: z.string(),
  bm25_rank: z.number().int().min(1).nullable(),
  vector_rank: z.number().int().min(1).nullable(),
  rrf_score: z.number(),
});
export type RetrieveHit = z.infer<typeof retrieveHitSchema>;

export const retrieveResultSchema = z.object({
  hits: z.array(retrieveHitSchema),
  // 1/(k + rank) constant; k=60 is the standard RRF default
  rrf_k: z.number().int().min(1).default(60),
  query_used: z.string(),
});
export type RetrieveResult = z.infer<typeof retrieveResultSchema>;

// facts are immutable post-onboarding (matches updateMemoryArgs facts-rejection).
export const hallWriteAclSchema = z.object({
  hall: hallTypeSchema,
  writable: z.boolean(),
});
export type HallWriteAcl = z.infer<typeof hallWriteAclSchema>;

export const HALL_WRITE_ACL = {
  facts: false,
  events: true,
  discoveries: true,
  preferences: true,
  advice: true,
} as const satisfies Record<z.infer<typeof hallTypeSchema>, boolean>;
