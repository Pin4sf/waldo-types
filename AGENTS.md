# @waldo/types — Agent Orchestration

## Universal Cross-Repo Rules (read before this file)

| File | What it governs |
|---|---|
| [`.claude/rules/posture.md`](.claude/rules/posture.md) | Role · truthfulness (`[inference]`/`[blocked]`) · communication · verification · destructive actions. |
| [`.claude/rules/mental-model.md`](.claude/rules/mental-model.md) | 6 disciplines + "every line earns its place" + no-cross-references-in-code. |
| [`.claude/rules/language.md`](.claude/rules/language.md) | Architecture vocabulary. |
| [`.claude/rules/hey-109-workflow.md`](.claude/rules/hey-109-workflow.md) | Multi-agent coordination — cluster split (waldo-types is **Claude's cluster** per HEY-109: contracts + types). Linear labels, lifecycle, Agent-Ready bar (10 items). |
| [`.claude/rules/work-modes.md`](.claude/rules/work-modes.md) | Five surfaces · trigger modes · writing block. |
| [`.claude/rules/security-checklist.md`](.claude/rules/security-checklist.md) | 5 Always-Check invariants · conditional checks · severity matrix · health-data overlay. |

Mirrored from canonical source in `waldo-brain` per [ADR-0063](https://github.com/Pin4sf/waldo-brain/blob/main/01-Waldo/Architecture%20Decision%20Records%20%28ADR%29/0063-canonical-rule-files-mirroring.md). Do not edit locally.

The agent roster + skill list below is repo-specific. It sits on top of the universal rules.

---

## What this repo is

`@waldo/types` — the shared type contract for Waldo. Pure types + Zod schemas + adapter interfaces. The **leaf of the dependency tree**: consumed by `waldo-backend` and `waldo-app`; depends on nothing else.

This is **Claude's cluster** per HEY-109 (contracts ownership). Codex reviews via PR comments; never edits ticket bodies directly.

## Available agents (invoke via Claude Code Agent tool)

### Planning
- **`planner`** — Spec breakdown for a new type or interface. Use before any new adapter or contract.

### Review (run before merging any PR)
- **`security-reviewer`** — When a type touches auth, RBAC, encryption, or any privileged-action surface. Verifies the type-level surface doesn't leak a constraint that should be enforced at runtime.
- **`qa-breaker`** — Adversarial review of Zod schemas. Tries hostile inputs that pass type-check but break invariants (over-long strings, NaN, negative durations, hostile UTF-8, prototype pollution).

### Sanity
- **`check-contract`** — Verifies a Zod schema matches its grounding ADR. Run before any contract-changing PR.

## Dev-QA loop (use for EVERY new type or schema)

```
1. Read the grounding ADR (the source-of-truth spec)
2. /grill-with-docs — verify the ADR still solves the JTBD
3. /tdd — write failing Zod golden test (valid + invalid pairs) FIRST
4. Write the schema · derive type via z.infer
5. Implement until green
6. /grill-me on the interface — try to break it semantically
7. check-contract agent — confirm schema matches ADR
8. qa-breaker — hostile inputs
9. PR with Closes HEY-NN
```

## Skills (invoke with /skill-name)

- `/session-bus` — **MANDATORY at session start AND end.** Cross-session bus, see ADR-0043.
- `/grill-me` — before locking any interface
- `/grill-with-docs` — when extending types based on a new ADR
- `/tdd` — write failing Zod schema + golden test before implementation
- `/diagnose` — when type errors recur in waldo-backend or waldo-app consumers
- `/check-contract` — verify generated types match an ADR's contract section
- `/zoom-out` — when a contract change risks cross-cutting impact on consumers
- `/write-a-skill` — create a new skill for this repo

## Cluster ownership (per HEY-109)

`waldo-types` is in **Claude's cluster**. Claude grabs `ready-for-agent + agent:claude + state:Todo + repo:waldo-types`. Codex reviews via PR comments. The reviewer never edits the body — comment only, writer applies.

Cross-repo dep migrations (e.g. HEY-112 `@waldo/types@1.0.0` → `@pin4sf/waldo-types@^0.2.0`) follow the standard HEY-109 lifecycle: write body → `ready-for-agent` → grab → branch → PR → `review:codex` (or `review:claude` if Claude wrote it and Codex reviews) → fix-pass → merge.

## Things NOT in scope for this repo

This is the leaf of the dependency tree. Push back with `needs-info` if a Linear ticket asks for any of these:

- Runtime code beyond Zod schemas + type guards
- HTTP clients, network calls
- File I/O, database access
- React / Expo / DOM types (those belong in waldo-app)
- Supabase / CF Worker imports (those belong in waldo-backend)
- Tests that mock external services
- ADR authoring (belongs in waldo-brain)

## See also

- [`CLAUDE.md`](CLAUDE.md) — repo operating manual (tech stack · commands · NEVER list · Build → Break → Fix flow)
- [`.claude/rules/INDEX.md`](.claude/rules/INDEX.md) — rule index + per-type ADR map
