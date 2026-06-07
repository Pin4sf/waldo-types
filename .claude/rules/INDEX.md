# @waldo/types — Rule Index

Universal rules are mirrored from `waldo-brain` (canonical source, see [ADR-0063](https://github.com/Pin4sf/waldo-brain/blob/main/01-Waldo/Architecture%20Decision%20Records%20%28ADR%29/0063-canonical-rule-files-mirroring.md)). They live locally in `.claude/rules/` and are mirrored verbatim with banner SHA — do not edit locally.

**Core philosophy: every line of code earns its place.** No 1000-line features. Only the most optimised and best possible lines a thoughtful reviewer would ship.

## Universal rules (read first, in order)

0. **[`posture.md`](posture.md)** — **READ FIRST. Always.** Senior-peer posture · priorities (correctness > bravery > momentum > politeness) · truthfulness contract (`[inference]` / `[blocked]` / no fake success) · verification · destructive actions · communication. RFC2119 keywords apply across rule files.
1. **[`mental-model.md`](mental-model.md)** — The 6 non-negotiable disciplines: Problem-first · Product-first · First-principles · Test-heavy + thorough QA · NO AI SLOP · Architecture-first. Includes the "no cross-references to tickets / PRs / dates / names in code" rule.
2. **[`language.md`](language.md)** — Architecture vocabulary: Module · Interface · Implementation · Depth · Seam · Adapter · Leverage · Locality. Apply when discussing design in PR reviews and ADRs — types and adapters live at the seam.
3. **[`hey-109-workflow.md`](hey-109-workflow.md)** — Multi-agent coordination. **waldo-types is Claude's cluster** (contracts ownership). Cluster split · Linear labels · lifecycle · Agent-Ready bar (10 items) · PR pattern.
4. **[`work-modes.md`](work-modes.md)** — Five surfaces (engineering · writing · strategy · ideation · evangelism). Posture constant, vocabulary shifts. Trigger modes (`council` · `X vs Y` · `be creative` · `pre-mortem` · `red-team` · `steel-man`). Writing block — AI-tells to avoid, voice rules.
5. **[`security-checklist.md`](security-checklist.md)** — Universal security baseline. 5 Always-Check invariants every change. Conditional checks (DB queries · auth · API endpoints · CI/CD · K8s · IaC · LLM code · shell scripts · frontend · containers). Severity matrix. Health-data overlay for Waldo's GDPR Art-9 surface.

## Specific ADRs this repo implements

Read these before touching the related types:

| Type / area | Required ADR |
|---|---|
| Package contract overall | ADR-0029 |
| Three-repo split | ADR-0001 |
| LLMProvider interface | ADR-0003 (Gemma 4 primary), ADR-0004 (AI Gateway) |
| 5 typed memory halls | ADR-0005 |
| Scribe inbox-merge | ADR-0006 |
| R2 archival types | ADR-0007 |
| Per-trigger tool ACL | ADR-0008 |
| ChannelAdapter interface | ADR-0012 |
| WaldoCard union schema | ADR-0013 |
| Trigger shape with `variant` | ADR-0015 |
| Adjustment autonomy (L1/L2/L3) | ADR-0018 |
| Window scheduling rules | ADR-0019 |
| Intervention trigger spec | ADR-0020 |
| Copilot tool surface (+7 tools) | ADR-0021 |
| Skill system schema | ADR-0022 |
| `execute_code` primitive | ADR-0023 |
| Scribe sanitiser spec (5 checks) | ADR-0024 |
| DocAdapter contract | ADR-0025 |
| SheetProvider contract | ADR-0026 |
| EmailProvider drafts extension | ADR-0027 |
| Verification layer types | ADR-0030 |
| Channel persona slicing types | ADR-0035 |
| Append-only event log + stable pattern_id | ADR-0037 |
| Threading model types | ADR-0039 |
| **CalendarProvider** | **ADR-0040** |
| **TranscriptionProvider** | **ADR-0041** |
| **`pre_activity_spot` trigger** | **ADR-0042** |
| Durable agent execution types | ADR-0054 |
| **Canonical rules mirroring (this file's pattern)** | **ADR-0063** |

ADRs themselves live in `waldo-brain/01-Waldo/Architecture Decision Records (ADR)/`. They are decision documents (append-only), not rule files. The cross-repo reference is intentional — ADRs are the team's single decision log, versioned in waldo-brain. Browse at https://github.com/Pin4sf/waldo-brain/tree/main/01-Waldo.

## Repo-specific NEVER list

See the `## NEVER` section in [`CLAUDE.md`](../../CLAUDE.md) — canonical NEVER list for this repo.

Highlights:
- All exported types **MUST** be Zod-derived (`z.infer`) — never hand-typed
- All adapter interfaces live in `src/adapters/<name>.ts`
- Discriminated unions for state machines (e.g. `CrsState`)
- Named exports only — no default exports
- No `any`, no `unknown` without Zod parsing it
- Files under 400 lines (split if approaching 800)
- Never import from `waldo-backend` or `waldo-app` — this is the leaf
- Never log raw health values, even in test fixtures

## Skills active for this repo

- `/session-bus` — **MANDATORY at session start AND end.** Cross-session bus, see ADR-0043.
- `/grill-me` — before locking any interface
- `/grill-with-docs` — when extending types based on a new ADR
- `/tdd` — write failing Zod schema + golden test before implementation
- `/diagnose` — when type errors recur in waldo-backend or waldo-app consumers
- `/check-contract` — verify generated types match an ADR's contract section

## Things NOT in scope for this repo

If a Linear ticket asks for any of these, push back with `needs-info`:

- Runtime code beyond Zod schemas + type guards
- HTTP clients, network calls
- File I/O, database access
- React / Expo / DOM types (those belong in waldo-app)
- Supabase / CF Worker imports (those belong in waldo-backend)
- Tests that mock external services
- ADR authoring (belongs in waldo-brain)

This is the leaf of the dependency tree. Pure types only.
