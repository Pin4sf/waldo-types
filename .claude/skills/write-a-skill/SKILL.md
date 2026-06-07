---
name: write-a-skill
description: Create or update repo-local agent skills for @waldo/types. Use when a repeated types workflow needs durable instructions under .claude/skills/.
---

# Write A Skill

Create a small, repo-local skill only when it removes repeated instructions from future sessions.

## Process

1. Name the workflow and the exact trigger phrase.
2. Confirm the workflow belongs in `waldo-types`, not `waldo-brain`, `waldo-backend`, or `waldo-app`.
3. Create `.claude/skills/<skill-name>/SKILL.md`.
4. Keep the skill focused on one repeatable task.
5. Link only stable local files or accepted ADRs.
6. Add or update the skill reference in `AGENTS.md` or `.claude/rules/INDEX.md` only if agents must discover it at session start.

## Checklist

- Description says when to use the skill.
- No dead pointers to files that do not exist in this repo.
- No references to transient tickets, PRs, dates, or people.
- The skill has a clear output format.
