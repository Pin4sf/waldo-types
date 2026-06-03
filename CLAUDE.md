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

## Multi-agent workflow (Claude × Codex) — HEY-109

This repo is built by two agents in parallel — **Claude Code** and **Codex** — coordinated through Linear **HEY-109** (the session bus, ADR-0043). Read HEY-109 at session start; update at session end.

**Cluster split — single writer per cluster** (reviewer comments, writer applies; reviewer never edits the body):

- **Claude writes:** `@pin4sf/waldo-types` contracts · memory / Scribe / recall · CRS / body-context · GDPR / consent / privacy · product-gap classification · global dependency graph · HEY-109.
- **Codex writes:** DO loop · run-journal / outbox · hooks · tool dispatcher / ACL · Telegram ChannelAdapter · LLMProvider · eval / observability · internal infra.

This repo (`waldo-types`) is squarely in Claude's cluster — the contracts cluster.

**Ownership + review-state labels:**

| Label | Meaning |
|---|---|
| `agent:claude` | Claude Code owns the body + grabs to implement |
| `agent:codex` | Codex owns the body + grabs to implement |
| `review:claude` | Waiting on Claude to review (typically state `In Review`) |
| `review:codex` | Waiting on Codex to review |

**Lifecycle:** owner adds `agent:X` while writing body → `ready-for-agent` once Agent-Ready bar met → agent branches → on PR open flips `agent:X` → `review:Y` (other cluster), state → `In Review` → fix-pass cycles via PR comments until reviewer approves → squash-merge → state `Done`. Labels stay as audit trail.

**Filters:** `ready-for-agent + agent:me + state:Todo` = my next pickup; `review:me` = my review queue.

**Agent-Ready bar (10 items):** SoT links · Module/Interface/Seam · deps · acceptance (golden test) · validation commands · 5-bucket failure paths · reversibility · security/privacy · out-of-scope · zero open founder/legal questions. Missing any → `needs-info` or `ready-for-human`.

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

## Mental model (the 4 non-negotiable disciplines)

Before any work, read **`waldo-brain/.claude/rules/mental-model.md`**. It is the meta-rule that all other rules build on. Summary:

1. **Problem-first thinking** — find ROOT CAUSE at system + library level. Never patch symptoms. Use `/diagnose`.
2. **Product-first thinking** — every line traces to a JTBD. If you can't name the user problem, delete it. Use `/grill-me`.
3. **First-principles thinking** — decompose every claim to physics-level constraints. Cite primary sources. Use `/grill-with-docs`.
4. **Test-heavy + thorough QA** — E2E is the only truth. Failing test FIRST. Use `/tdd` + `qa-breaker`.
5. **NO AI SLOP** — every line earns its place. Slop = correct-but-bad: verbose where tight wins, generic where specific is needed, hedged where opinion was asked, format-drift, unrequested disclaimers, junk that fills context windows for the next session. Each line of code answers: WHY is it here, is it solving the requested purpose, is it the real fix not a patch, would a thoughtful reviewer ship it without changes. Delete anything that fails the test. See `waldo-brain/.claude/rules/mental-model.md` §5.

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
