---
name: check-contract
description: Verify that a @waldo/types schema or interface matches its grounding ADR and downstream contract. Use before any PR that changes exported types, Zod schemas, adapter interfaces, or state-machine unions.
---

# Check Contract

Verify the changed contract against its source of truth before merge.

## Steps

1. Identify the grounding ADR or source document listed in `.claude/rules/INDEX.md`.
2. Compare every exported field against the ADR: name, nullability, units, enum values, and privacy classification.
3. Confirm each exported type is derived from a Zod schema with `z.infer`.
4. Confirm invalid states are impossible or rejected by schema tests.
5. Check consumers in docs or tests for expected shape changes.
6. Run the repo validation command from `CLAUDE.md`.

## Output

Report:

- contract checked
- source ADR
- fields that match
- mismatches and required fixes
- validation command result
