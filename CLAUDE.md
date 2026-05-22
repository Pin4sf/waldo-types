# @waldo/types — Claude Code Instructions

## What This Repo Is

The shared contract layer for all Waldo repos. Every interface, type, and Zod schema that crosses a repo boundary lives here. Both `waldo-backend` and `waldo-app` import from this package.

**Semver rule:** Breaking change = semver MAJOR bump. New optional field = MINOR. Both repos must pin exact version (no ^ or ~).

## The One Rule

**Types are contracts, not decorations.** Every interface here is a public API. Changing it silently breaks the consuming repos. Always bump the version before publishing a change.

## Architecture

```
src/
  health.ts     ← HealthDaily, CrsResult, CrsZone, PrimarySource
  agent.ts      ← AgentMessage, TriggerType, WaldoTool, PatrolEntry, SpotObservation
  api.ts        ← TodayResponse, TodayForm, TodayLoad, EFResponse envelope
  memory.ts     ← MemoryBlock, Episode, MemoryHallType, MemoryInboxItem
  adapters.ts   ← ChannelAdapter, LLMProvider, HealthDataSource, VoiceInput
  zod/
    health.ts   ← HealthDailySchema, CrsResultSchema (Zod, derived from types)
    api.ts      ← TodayResponseSchema
  index.ts      ← re-export all
```

## Rules

- Every type in `src/` must be exported from `index.ts`
- Zod schemas live in `src/zod/` and derive from types using `z.infer<>` — single source of truth
- No implementation code here — interfaces only
- No external runtime dependencies — only `zod` as devDependency
- `npm run check` must pass before any commit

## Versioning Checklist

Before changing any interface:
- [ ] Is this a breaking change? (field removed, type narrowed, required field added) → bump MAJOR
- [ ] New optional field? → bump MINOR
- [ ] Comment/doc fix only? → bump PATCH
- [ ] Notify both team leads (Shivansh + Ashish) before pushing MAJOR bump
