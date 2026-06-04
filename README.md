# @pin4sf/waldo-types

Shared TypeScript contracts for Waldo. Single npm package consumed by `waldo-backend` (CF Worker + Durable Object + Supabase Edge Functions) and `waldo-app` (Expo iOS/Android). Zero runtime code beyond Zod schemas.

## Install

Published to public npmjs registry. No `.npmrc` config required.

```bash
npm install @pin4sf/waldo-types
# or pin to a minor:
npm install @pin4sf/waldo-types@^0.2.0
```

## Publishing (maintainers)

CI workflow (`.github/workflows/publish.yml`) auto-stages on tag push (`v*`). Staged tarballs require manual approval before going public — supply-chain safety gate.

```bash
# release flow:
# 1. bump version in package.json (follows semver — v0.x is pre-stable)
# 2. commit + push
# 3. tag and push: git tag v0.X.Y && git push origin v0.X.Y
# 4. CI runs typecheck + tests + build + `npm stage publish --provenance`
# 5. approve via UI or CLI:
#      https://www.npmjs.com/settings/pin4sf/staged-packages
#      npm stage list && npm stage approve <stage-id>
```

Tarball ships with sigstore provenance attestation linking the artifact to the GitHub Actions build commit. Consumers can verify via `npm audit signatures`.

## Package structure

v0.2.0 — full runtime-spine contract (ADR-0029 amendments 2026-05-30 / 2026-06-02).

```
src/
├── core/        TriggerType, BriefVariant, InvocationContext, AutonomyLevel, User, ErrorCode,
│                ISO8601, HookEvent/HookPayload (9 events), SanitiseDestination (10)
├── ui/          WaldoCard (10 variants), PushPayload
├── tools/       ToolHandler, ToolResult, 29 Zod arg schemas, TOOL_PERMISSIONS map
├── adapters/    10 interfaces: channel, doc, sheet, email, calendar*, task, health, llm,
│                transcription*, WorkspaceMount (R2 mount)
├── memory/      HallType (5), MemoryBlock, Episode, Skill, RecallResult/RetrieveResult
├── telemetry/   AgentLog, OutcomeSignal, EffectivenessSignal, TraceEval, KeepRateEvent
├── runtime/     RoutingPolicy, RunState/RunRecord/OutboxEntry, SessionState, CarryoverBucket
├── health/      CrsResult, Zone (energized/steady/flagging/depleted), PillarBreakdown
└── prompt/      NarrativeContext (body+mind universal-context block)
```

\* Stub interface — implementation ships Sprint 2/3 per ADR-0040/0041.

## Public API

Root-only — import everything from the package root, not subpaths:

```typescript
import { ... } from '@pin4sf/waldo-types';   // ✅
import { ... } from '@pin4sf/waldo-types/runtime'; // ✗ not exported
```

The single `"."` entry is the deliberate contract surface (small interface, deep module):
consumers depend on the symbols, not the internal barrel layout.

## Usage

```typescript
import {
  type InvocationContext,
  type WaldoCard,
  type ToolHandler,
  type CrsResult,
  getCrsArgs,
  writeTaskArgs,
  TOOL_PERMISSIONS,
  carryoverBucketSchema,
} from '@pin4sf/waldo-types';

// Validate tool args from LLM output
const args = writeTaskArgs.parse(rawInput);

// Check tool ACL for a trigger
const allowed = TOOL_PERMISSIONS.brief; // ['get_crs', 'get_health', ...]

// Parse a runtime contract at a boundary
const bucket = carryoverBucketSchema.parse(rawBucket); // enforces ADR-0057 caps

// Implement a tool handler
const handler: ToolHandler<typeof args, { task_id: string }> = {
  name: 'write_task',
  description: 'Create a task in TaskProvider',
  schema: writeTaskArgs,
  trigger_allowlist: ['handoff_act', 'user_message'],
  autonomy_gated: true,
  async handle(args, ctx) {
    return { ok: true, data: { task_id: 'task_01' } };
  },
};
```

## Version policy

Follows semver. v0.x pre-stable — minor bumps for additions, major for breaking changes. v1.0.0 frozen at V1 launch. All version bumps via `pnpm changeset`.

## Spec

[ADR-0029](../waldo-brain/01-Waldo/Architecture%20Decision%20Records%20(ADR)/0029-waldo-types-package-contract.md) — canonical spec for this package.
