import { z } from 'zod';

export const iso8601Schema = z.string().datetime({ offset: true }).brand<'ISO8601'>();
export type ISO8601 = z.infer<typeof iso8601Schema>;

// Structural marker — no @cloudflare/workers-types import (leaf package rule)
export interface DurableObjectStubReference {
  readonly _kind: 'do-stub';
}

export const errorCodeSchema = z.enum([
  'auth_failed',
  'not_found',
  'forbidden',
  'rate_limited',
  'transient',
  'oversize',
  'invalid_args',
]);
export type ErrorCode = z.infer<typeof errorCodeSchema>;

// Generic — no Zod schema (generic schemas are factory fns; static type is the contract here)
export type AdapterResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: ErrorCode };
