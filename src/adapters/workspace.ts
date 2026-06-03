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
const SKILLS_PATH = /^skills\/(?=.*[A-Za-z0-9_-])[A-Za-z0-9._-]+$/;

// Runtime guard for the writable path surface.
export const workspacePathSchema = z.union([
  workspaceFileSchema,
  z.string().regex(SKILLS_PATH),
]);

// Brand type: WorkspacePath values can only be produced by parseWorkspacePath() (which runs the schema).
// Reason: a raw string like 'skills/../etc/passwd' is type-compatible with `skills/${string}`, so the
// adapter interface alone gives no compile-time guard. Branding closes that gap — `readFile(rawString)`
// becomes a type error; callers must parse first, forcing the runtime check.
declare const workspacePathBrand: unique symbol;
export type WorkspacePath = string & { readonly [workspacePathBrand]: true };

export function parseWorkspacePath(input: unknown): WorkspacePath {
  return workspacePathSchema.parse(input) as WorkspacePath;
}

export interface WorkspaceMount {
  readFile(path: WorkspacePath): Promise<Uint8Array | null>;
  writeFile(path: WorkspacePath, bytes: Uint8Array): Promise<void>;
  // list(prefix) takes a broad prefix (intentional): prefix-listing R2 keys is deliberately
  // outside the path enum — a prefix is a directory fragment, not a file the agent reads/writes.
  // Returns branded WorkspacePath[] so callers don't need to re-parse trusted output.
  list(prefix: string): Promise<WorkspacePath[]>;
  commit(message: string): Promise<{ change_id: string }>;
  discard(): void;
}

// R2Mount is the concrete R2-backed adapter at the workspace seam; same interface.
export type R2Mount = WorkspaceMount;
