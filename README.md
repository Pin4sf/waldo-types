# @pin4sf/waldo-types

Shared TypeScript contracts for Waldo. Single npm package consumed by `waldo-backend` (CF Worker + Durable Object + Supabase Edge Functions) and `waldo-app` (Expo iOS/Android). Zero runtime code beyond Zod schemas.

## Install

```bash
# .npmrc must point @pin4sf scope to GitHub Packages (copy .npmrc.template)
npm install @pin4sf/waldo-types
```

## Package structure

```
src/
├── core/        TriggerType, BriefVariant, InvocationContext, AutonomyLevel, User, ErrorCode, ISO8601
├── ui/          WaldoCard (10 variants), PushPayload
├── tools/       ToolHandler, ToolResult, 29 Zod arg schemas, TOOL_PERMISSIONS map
├── adapters/    9 interfaces: channel, doc, sheet, email, calendar*, task, health, llm, transcription*
├── memory/      HallType (5), MemoryBlock, Episode, Skill
└── telemetry/   AgentLog, OutcomeSignal, EffectivenessSignal
```

\* Stub interface — implementation ships Sprint 2/3 per ADR-0040/0041.

## Usage

```typescript
import {
  type InvocationContext,
  type WaldoCard,
  type ToolHandler,
  getCrsArgs,
  writeTaskArgs,
  TOOL_PERMISSIONS,
} from '@pin4sf/waldo-types';

// Validate tool args from LLM output
const args = writeTaskArgs.parse(rawInput);

// Check tool ACL for a trigger
const allowed = TOOL_PERMISSIONS.brief; // ['get_crs', 'get_health', ...]

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
