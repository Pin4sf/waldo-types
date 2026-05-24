# waldo-types — Claude Code Instructions

## What this repo is

The **shared type contract** for Waldo. One npm package: `@waldo/types`. Consumed by `waldo-backend` (Supabase Edge Functions + CF Worker + Durable Object) and `waldo-app` (Expo iOS + Android). Zero runtime code. Just types + Zod schemas + adapter interfaces.

Single source of truth for: `HealthSnapshot`, `CrsResult`, `TriggerType`, `BriefVariant`, `InvocationContext`, `WaldoCard` union (ADR-0013), `ToolHandler`, `ChannelAdapter`, `LLMProvider`, `HealthDataSource`, `StorageAdapter`, `CalendarProvider` (ADR-0040), `TranscriptionProvider` (ADR-0041), `MemoryHall`, `Episode`, `Trigger`, `ToolACL`.

## Tech stack

- TypeScript 5.4+ strict mode (`"strict": true`, `"noUncheckedIndexedAccess": true`)
- Zod 3.x for runtime validation schemas (derive types via `z.infer<typeof Schema>`)
- tsup for dual ESM + CJS builds
- changesets for semver discipline
- pnpm 9.x (workspaces not needed — single package)
- Node 22 LTS minimum
- Private npm registry (Verdaccio self-hosted OR Cloudflare Pages npm proxy)

## Commands

```bash
pnpm install           # install
pnpm typecheck         # tsc --noEmit
pnpm build             # tsup → dist/
pnpm test              # vitest
pnpm changeset         # cut version bump
pnpm release           # publish to private npm
```

## Issue tracker

**Linear team HeyWaldo** → [linear.app/heywaldo](https://linear.app/heywaldo)

- Every PR title must include `HEY-NN` (Linear ticket ID)
- Branch name: `hey-NN-<slug>` (Linear auto-detects)
- PR description: `Closes HEY-NN` (auto-transitions on merge)
- Active tickets for this repo: filter `repo:waldo-types`

## Triage labels (Matt Pocock state machine)

| Label | Meaning | When to apply |
|---|---|---|
| `ready-for-agent` | Spec complete · safe to run AFK | After /grill-with-docs on ADR · no external blocker |
| `ready-for-human` | Needs judgment / design / review | UI polish · cross-team coordination · production push |
| `needs-info` | Spec gap · waiting on Shivansh | Block work, don't guess |
| `external-blocker` | Out of our control | Apple Developer, vendor approval, etc. |
| `P0` — `P3` | Priority | P0 = Demo Day blocker · P1 = launch-quality · P2 = nice · P3 = backlog |
| `type:adr` `type:tool` `type:adapter` `type:schema` `type:security` `type:test` `type:docs` | Work category | Use for filtering + assignment |
| `repo:waldo-types` | This repo | Always present |

## Domain docs (waldo-brain — separate repo)

Source of truth for all decisions:

- **`waldo-brain/01-Waldo/planning/WALDO_V1_MASTER_PLAN.md`** — the build plan
- **`waldo-brain/01-Waldo/Architecture Decision Records (ADR)/`** — 42 ADRs
- Critical ADRs for this repo:
  - **ADR-0001** Three repos, one type contract
  - **ADR-0029** `@waldo/types` v0.1.0 package contract
  - **ADR-0013** WaldoCard inline GenUI schema
  - **ADR-0021** Copilot tool surface (+7 tools)
  - **ADR-0040** CalendarProvider Phase 1
  - **ADR-0041** Voice memo pipeline (TranscriptionProvider adapter)
- **`waldo-brain/.claude/rules/`** — coding rules, NEVER list, language
- **`waldo-brain/03-References/ADL/`** — research grounding

## Rules

See `.claude/rules/INDEX.md` for the full imported rule set. Highlights:

- All exported types must be Zod-derived (`z.infer`) — never hand-typed
- All adapter interfaces live in `src/adapters/<name>.ts`
- Discriminated unions for state machines (e.g. `CrsState`)
- Named exports only — no default exports
- No `any`, no `unknown` without Zod parsing it
- Files under 400 lines (split if approaching 800)

## Conventional commits

`feat(types): ...` · `fix(zod): ...` · `docs: ...` · `test: ...` · `chore: ...` · `refactor: ...`

Commit message ≤70 chars subject. Body explains the WHY (not WHAT — diff shows WHAT).

## NEVER

- Never use `--no-verify` on commits (pre-commit hooks run typecheck + lint)
- Never publish without a changeset (semver discipline)
- Never break a published version (only minor/major bumps for type changes)
- Never import from `waldo-backend` or `waldo-app` (this is the leaf)
- Never embed secrets in types (no API key constants, no production URLs)
- Never log raw health values (HRV, HR, sleep hours, SpO2) — applies even in test fixtures

## Build → Break → Fix philosophy

1. Define interface from ADR
2. Write Zod schema
3. Write `z.infer` derived type
4. Write failing test (golden fixture)
5. Implement until green
6. Run /grill-me on the interface — try to break it semantically
7. Lock as accepted in ADR

## Source of truth

When in doubt, in order:
1. `waldo-brain/01-Waldo/Architecture Decision Records (ADR)/` — the locked decisions
2. `waldo-brain/01-Waldo/planning/WALDO_V1_MASTER_PLAN.md` — the master plan
3. The ADR's "Grounded in" references for deeper context

Anything in `Docs/archive/` in waldo-brain is superseded — don't read it.
