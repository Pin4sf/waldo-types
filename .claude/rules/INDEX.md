# @waldo/types — Rule Index

All canonical rules live in `waldo-brain/.claude/rules/` and `waldo-brain/01-Waldo/Architecture Decision Records (ADR)/`. This index points at the ones an agent working in this repo MUST read before generating code.

## Hard rules (read first)

1. **`waldo-brain/.claude/rules/coding-standards.md`** — TypeScript strict mode + Zod + named exports + path aliases + file size cap. Section "TypeScript" applies verbatim.
2. **`waldo-brain/.claude/rules/architecture.md`** — Locked Decision 1 (Three repos, one type contract). Section "Adapter Pattern" defines which interfaces must exist.
3. **`waldo-brain/.claude/rules/health-data-security.md`** — Privacy rules apply even at the type level. PII tagging required on Calendar event titles, Task titles, etc.
4. **`waldo-brain/.claude/rules/language.md`** — Module / Interface / Implementation / Depth / Seam / Adapter / Leverage / Locality. The vocabulary for design discussion in PR reviews.

## Specific ADRs this repo implements

Read these before touching the related types:

| Type/area | Required ADR |
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

## Skills active for this repo

When working here, the following skills SHOULD activate:

- `/grill-me` — before locking any interface
- `/grill-with-docs` — when extending types based on a new ADR
- `/tdd` — write failing Zod schema + golden test before implementation
- `/diagnose` — when type errors recur in waldo-backend or waldo-app consumers

## Things NOT in scope for this repo

If a Linear ticket asks you to do any of these, push back with `needs-info`:

- Runtime code beyond Zod schemas + type guards
- HTTP clients, network calls
- File I/O, database access
- React / Expo / DOM types (those belong in waldo-app)
- Supabase / CF Worker imports (those belong in waldo-backend)
- Tests that mock external services

This is the leaf of the dependency tree. Pure types only.
