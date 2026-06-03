import { describe, expect, it } from 'vitest';
// Root-contract guard (Codex Medium #5): the public API is root-only "." (ADR-0029 / PR #3).
// One value symbol from each of the 14 v0.2.0 contract modules, imported from the package's
// own root index — proves every barrel reaches the root export surface. A missing re-export
// fails tsc here (TS2305), so this also guards the contract at compile time.
import {
  // 1 runtime/routing  2 runtime/run  3 runtime/session  4 runtime/working-memory
  routingPolicySchema,
  runStateSchema,
  sessionStateSchema,
  carryoverBucketSchema,
  // 5 core/hooks  6 core/sanitise  13 core/trigger
  hookPayloadSchema,
  sanitiseDestinationSchema,
  triggerTypeSchema,
  // 7 adapters/workspace
  workspacePathSchema,
  // 8 memory/recall  9 memory/hall
  recallResultSchema,
  memoryBlockSchema,
  // 10 telemetry/eval
  traceEvalSchema,
  // 11 health/crs
  crsResultSchema,
  // 12 prompt/narrative
  narrativeContextSchema,
  // 14 tools/permissions
  TOOL_PERMISSIONS,
} from '../index';

describe('public API (root-only export surface)', () => {
  it('exposes a symbol from each of the 14 v0.2.0 contract modules at the root', () => {
    for (const symbol of [
      routingPolicySchema,
      runStateSchema,
      sessionStateSchema,
      carryoverBucketSchema,
      hookPayloadSchema,
      sanitiseDestinationSchema,
      triggerTypeSchema,
      workspacePathSchema,
      recallResultSchema,
      memoryBlockSchema,
      traceEvalSchema,
      crsResultSchema,
      narrativeContextSchema,
      TOOL_PERMISSIONS,
    ]) {
      expect(symbol).toBeDefined();
    }
  });
});
