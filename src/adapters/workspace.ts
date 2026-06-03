import { z } from 'zod';

// R2 5-function workspace port (ADR-0007 cold archive, ADR-0022 skill storage).
// The mount is on the critical path — readFile/writeFile/list/commit/discard, per
// WALDO_V1_MASTER_PLAN §8 R2 Workspace Structure.

// Per-user workspace files (waldo-workspace/{user_id}/...).
export const workspaceFileSchema = z.enum([
  'today.md',
  'baselines.md',
  'patterns.md',
  'goals.md',
  'orchestration.md',
  'onboarding.md',
]);
export type WorkspaceFile = z.infer<typeof workspaceFileSchema>;

export interface WorkspaceMount {
  readFile(path: string): Promise<Uint8Array | null>;
  writeFile(path: string, bytes: Uint8Array): Promise<void>;
  list(prefix: string): Promise<string[]>;
  commit(message: string): Promise<{ change_id: string }>;
  discard(): void;
}

// R2Mount is the concrete R2-backed adapter at the workspace seam; same interface.
export type R2Mount = WorkspaceMount;
