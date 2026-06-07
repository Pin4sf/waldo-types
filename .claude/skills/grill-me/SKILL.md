---
name: grill-me
description: Stress-test a proposed @waldo/types interface or schema before it is locked. Use when designing a new type, adapter interface, discriminated union, or Zod contract.
disable-model-invocation: true
---

# Grill Me

Use this before locking a type contract. The goal is to break the interface semantically before downstream repos depend on it.

## Questions to Resolve

1. What grounding ADR or source document defines this contract?
2. Which consumer relies on it first: `waldo-backend`, `waldo-app`, or both?
3. What invariant must the Zod schema enforce at runtime, not only at TypeScript compile time?
4. Which hostile inputs should fail validation: null, over-long strings, negative numbers, NaN, prototype pollution, impossible enum states?
5. Does the shape expose provider-specific details that should stay behind an adapter?
6. What migration cost does a future field rename or union case change impose on consumers?

End with the smallest contract that satisfies the ADR and names its downstream validation command.
