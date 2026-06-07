# waldo-types — Claude Code Instructions

## Universal Cross-Repo Rules (read first)

These six files are mirrored from `waldo-brain` (the canonical source per [ADR-0063](https://github.com/Pin4sf/waldo-brain/blob/main/01-Waldo/Architecture%20Decision%20Records%20%28ADR%29/0063-canonical-rule-files-mirroring.md)). Read them before this file.

**Core philosophy: every line of code earns its place.** No 1000-line features. Only the most optimised and best possible lines a thoughtful reviewer would ship.

| File | What it governs |
|---|---|
| [`.claude/rules/posture.md`](.claude/rules/posture.md) | Role · truthfulness (`[inference]`/`[blocked]`) · communication · verification · destructive actions. Read first. |
| [`.claude/rules/mental-model.md`](.claude/rules/mental-model.md) | 6 disciplines: problem-first · product-first · first-principles · test-heavy · NO AI SLOP · architecture-first. Includes the "no cross-references to tickets/PRs/dates in code" rule. |
| [`.claude/rules/language.md`](.claude/rules/language.md) | Architecture vocabulary (Module · Interface · Seam · Adapter · Depth · Leverage · Locality). |
| [`.claude/rules/hey-109-workflow.md`](.claude/rules/hey-109-workflow.md) | Multi-agent coordination — cluster split (waldo-types is Claude's), Linear labels, Agent-Ready bar. |
| [`.claude/rules/work-modes.md`](.claude/rules/work-modes.md) | Five surfaces (engineering · writing · strategy · ideation · evangelism) · trigger modes · writing block. |
| [`.claude/rules/security-checklist.md`](.claude/rules/security-checklist.md) | 5 Always-Check invariants every change · conditional checks (DB · auth · API · CI/CD · K8s · IaC · LLM · shell · frontend · containers) · severity matrix · health-data overlay. |

See [`.claude/rules/INDEX.md`](.claude/rules/INDEX.md) for the full index + per-type ADR map.

---

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
- **`.claude/rules/`** — local mirrors of the universal coding rules, security checklist, and language
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

## Mental model (the 6 non-negotiable disciplines)

Before any work, read [`.claude/rules/mental-model.md`](.claude/rules/mental-model.md). It is the meta-rule that all other rules build on. Summary:

1. **Problem-first thinking** — find ROOT CAUSE at system + library level. Never patch symptoms. Use `/diagnose`.
2. **Product-first thinking** — every line traces to a JTBD. If you can't name the user problem, delete it. Use `/grill-me`.
3. **First-principles thinking** — decompose every claim to physics-level constraints. Cite primary sources. Use `/grill-with-docs`.
4. **Test-heavy + thorough QA** — E2E is the only truth. Failing test FIRST. Use `/tdd` + `qa-breaker`.
5. **NO AI SLOP** — every line earns its place. Slop = correct-but-bad: verbose where tight wins, generic where specific is needed, hedged where opinion was asked, format-drift, unrequested disclaimers, junk that fills context windows for the next session. Each line of code answers: WHY is it here, is it solving the requested purpose, is it the real fix not a patch, would a thoughtful reviewer ship it without changes. Delete anything that fails the test. See [`.claude/rules/mental-model.md`](.claude/rules/mental-model.md) §5.
6. **Architecture-first** — services, ownership, state — get them right before code. Name the services touched, locate the state, draw the boundary, check against locked ADRs. New service / new state location / new ownership boundary = ADR, not commit. See [`.claude/rules/mental-model.md`](.claude/rules/mental-model.md) §6.

## Build → Break → Fix philosophy (for THIS repo)

1. Read the ADR (the source-of-truth spec)
2. **First-principles check** — does the ADR actually solve the JTBD? If the ADR feels off, push back BEFORE coding.
3. Write Zod schema from the ADR's contract
4. Write `z.infer` derived type
5. **Test-first** — failing golden test (valid + invalid pairs) BEFORE implementation. `/tdd`.
6. Implement until green
7. Run `/grill-me` on the interface — try to break it semantically
8. Run `/grill-with-docs` — verify the interface still matches its grounding ADR + research
9. Open PR with `Closes HEY-NN`
10. If anything fails downstream after merge — `/diagnose` for ROOT CAUSE, never quick patch

## Source of truth

When in doubt, in order:
1. `waldo-brain/01-Waldo/Architecture Decision Records (ADR)/` — the locked decisions
2. `waldo-brain/01-Waldo/planning/WALDO_V1_MASTER_PLAN.md` — the master plan
3. The ADR's "Grounded in" references for deeper context

Anything in `Docs/archive/` in waldo-brain is superseded — don't read it.

## Cross-session bus

**[MUST]** Invoke `/session-bus` at session START and END. Reads/writes Linear `State — waldo-types` doc + Linear Session Log issue + `waldo-brain/04-Sessions/handoffs/waldo-types/`. See ADR-0043. This is how Shivansh, Pranav, Aachi avoid divergence across machines.
