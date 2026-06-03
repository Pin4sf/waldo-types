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

// Per-user skills dir (waldo-workspace/{user_id}/skills/{name}). Single segment only — the
// regex rejects `..`, dot-only, and nested segments so the path can't escape the mount.
export type WorkspaceSkillPath = `skills/${string}`;
const SKILLS_PATH = /^skills\/(?=.*[A-Za-z0-9_-])[A-Za-z0-9._-]+$/;

// Runtime guard for the writable path surface. Zod 3 has no template-literal type, so the
// inferred type widens to string — the precise `WorkspaceFile | WorkspaceSkillPath` lives on
// the interface signatures below (the type-level guard); this is the parse-time guard.
export const workspacePathSchema = z.union([
  workspaceFileSchema,
  z.string().regex(SKILLS_PATH),
]);
export type WorkspacePath = WorkspaceFile | WorkspaceSkillPath;

export interface WorkspaceMount {
  readFile(path: WorkspacePath): Promise<Uint8Array | null>;
  writeFile(path: WorkspacePath, bytes: Uint8Array): Promise<void>;
  // list(prefix) stays broad: prefix-listing R2 keys is deliberately outside the path enum —
  // a prefix is a directory fragment, not a file the agent reads/writes.
  list(prefix: string): Promise<string[]>;
  commit(message: string): Promise<{ change_id: string }>;
  discard(): void;
}

// R2Mount is the concrete R2-backed adapter at the workspace seam; same interface.
export type R2Mount = WorkspaceMount;
