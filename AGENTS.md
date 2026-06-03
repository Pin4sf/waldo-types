# AGENTS.md — `waldo-types`

> Read first by any AI agent (Claude Code, Codex, Cursor, etc.) operating in this repo. Companion to `CLAUDE.md` (the operating manual for this repo).

## Repo cluster

`waldo-types` is in **Claude's cluster** — the cross-repo contract seam (ADR-0001 + ADR-0029). Codex consumes the published `@pin4sf/waldo-types` package but does not write the contracts here. Any change to a public type/schema in this repo follows the cross-review loop in HEY-109.

## Multi-agent workflow (Claude Code × Codex) — HEY-109

Two AI coding agents work on Waldo in parallel — **Claude Code** and **Codex** — coordinated through Linear **HEY-109** (the session bus, ADR-0043). Read HEY-109 at session start; update at session end.

### Cluster split — single writer per cluster

Only the cluster owner edits that cluster's ticket bodies. Cross-review = COMMENT on the ticket / PR (reviewer posts verdict; writer applies). The reviewer never edits the body directly.

- **Claude writes:** `@pin4sf/waldo-types` contracts · memory / Scribe / recall · CRS / body-context · GDPR / consent / privacy · product-gap classification · global dependency graph · HEY-109 itself.
- **Codex writes:** DO loop · run-journal / outbox · hooks · tool dispatcher / ACL · Telegram ChannelAdapter inbound + threading · LLMProvider · eval / observability · internal infra (wrangler, AuditedDB).

### Linear labels

| Label | Meaning |
|---|---|
| `agent:claude` | Claude Code owns the body + grabs to implement |
| `agent:codex` | Codex owns the body + grabs to implement |
| `review:claude` | Cross-review state — waiting on Claude to review (typically state `In Review`) |
| `review:codex` | Cross-review state — waiting on Codex to review |

Composable with existing triage (`ready-for-agent` / `needs-info` / `ready-for-human`). No `agent:human` — `ready-for-human` covers it.

### Lifecycle

1. Owner adds `agent:X` while writing body to the Agent-Ready bar.
2. Bar met → add `ready-for-agent`.
3. Agent grabs → branch → PR. Flip `agent:X` → `review:Y` (the *other* cluster), state → `In Review`.
4. Reviewer posts P0 verdict comments on PR; author iterates fix-pass cycles via subagents + independent verification (re-run validations, confirm tests non-vacuous, grep source for the claimed change). Label stays `review:Y` until reviewer approves.
5. Approved → squash-merge with `--delete-branch` → state `Done`.

**Filters:** `ready-for-agent + agent:me + state:Todo` = my next pickup; `review:me` = my review queue.

### Agent-Ready bar (10 items)

Promote to `ready-for-agent` only if ALL present: SoT links (overview section + ADR(s)) · Module/Interface/Seam · deps · acceptance (golden test) · validation commands · 5-bucket failure paths · reversibility · security/privacy · out-of-scope · zero open founder/legal questions. Missing any → `needs-info` or `ready-for-human`.

## See also

- `CLAUDE.md` (this repo) — full operating manual + repo conventions.
- `waldo-brain/CLAUDE.md` + `waldo-brain/AGENTS.md` — vault operating manual + agent rules.
- HEY-109 (Linear) — session bus + drift report + retro-tag history.
- ADR-0029 — `@pin4sf/waldo-types` package contract.
- ADR-0043 — cross-session bus.
- `waldo-brain/.claude/rules/mental-model.md` — the 5 non-negotiable disciplines (NO AI SLOP is #5).
