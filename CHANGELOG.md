# @pin4sf/waldo-types

## 0.2.0

### Minor Changes

- Runtime spine: 14 barrels per ADR-0029 v0.2.0 amendment.

  **New barrels (12):** `runtime/routing.ts` (RoutingPolicy · ModelRoute · EscalationConfig · GatewayStep — ADR-0004/0003), `runtime/run.ts` (RunState · RunRecord · OutboxEntry — ADR-0054), `runtime/session.ts` (SessionState — ADR-0033), `runtime/working-memory.ts` (CarryoverBucket · CompactAttachment · CARRYOVER_BUCKET_CAPS — ADR-0057), `core/hooks.ts` (HookEvent×9 · HookPayload · HookResult · HookHandler — ADR-0032), `core/sanitise.ts` (SanitiseDestination×10 · Redaction · SanitiseResult — ADR-0024), `adapters/workspace.ts` (WorkspaceMount/R2Mount · WorkspaceFile — ADR-0007/0022), `memory/recall.ts` (RecallResult · RetrieveArgs · RetrieveResult · HALL_WRITE_ACL — ADR-0031/0007), `telemetry/eval.ts` (TraceEval · WisComponents · KeepRateEvent · MedicalGateResult — ADR-0030), `health/crs.ts` (CrsResult · Zone · PillarBreakdown — ADR-0011), `prompt/narrative.ts` (NarrativeContext — second-brain/harness L1). New folder barrels: `runtime/index.ts`, `health/index.ts`, `prompt/index.ts`.

  **Extended barrels (2):** `memory/hall.ts` MemoryBlock += `pattern_id` (12-char, nullable), `rejection_count`, `decision_log`, `rolled_back_from` (ADR-0037); `core/trigger.ts` adds `pre_activity_spot` trigger (ADR-0042) + `activeSandbox?` on InvocationContext (ADR-0033).

  **Edited:** `tools/permissions.ts` removes `execute_code` from `TOOL_PERMISSIONS.user_message` and `.dreaming_mode` (ADR-0050); the type stays in the `ToolName` union (typed-but-disabled, Phase 3).

  ### ⚠ BREAKING
  - **`zone` value `'peak'` removed.** `Zone` is now `energized | steady | flagging | depleted` (ADR-0011 canonical). `Zone`/`zoneSchema` and `CrsResult`/`crsResultSchema` now live solely in `health/crs.ts`; `core/trigger.ts` and `adapters/health.ts` import from there (no duplicate exports). Form-zone preference fields reconciled too: `proposeScheduleArgs.prefer_user_form_zone` and `CalendarProvider.find_slots(...).prefer_zone` now use `energized` (was `peak`); `avoid_trough` stays (scheduling intent, not a Zone value).
  - **`HookPayload` reshaped to the ADR-0029 pinned union** (snake_case `trace_id`/`tokens_in`/`tokens_out`/`latency_ms`; per-event fields only — `traceId`/`trigger` dropped since they already arrive via `InvocationContext`). `HookResult` now carries `payload?` (full replacement, ADR-0032 runner) + machine-readable `code: ErrorCode` on halt; `HookHandler` gains `name` + optional `timeout_ms` (ADR-0032). Casing note: payload fields use ADR-0029 snake_case while `InvocationContext.traceId` keeps its v0.1.0 camelCase — a package-wide casing reconcile is deferred (out of scope for this change).

## 0.1.0

### Minor Changes

- Publish @pin4sf/waldo-types v0.1.0 — full type contract per ADR-0029.

  7 module barrels: core (TriggerType×10, BriefVariant, InvocationContext, AutonomyLevel, User, ErrorCode, ISO8601 branded), ui (WaldoCard discriminated union×10, PushPayload), tools (ToolHandler, ToolResult, 29 Zod schemas for all tool args, TOOL_PERMISSIONS map), adapters (9 interfaces: channel, doc, sheet, email, calendar[stub], task, health, llm, transcription[stub]), memory (HallType×5, MemoryBlock, Episode, Skill), telemetry (AgentLog, OutcomeSignal, EffectivenessSignal).

  Breaking-change policy: v0.x pre-stable. v1.0.0 frozen at V1 launch.

  Note: 9 adapter files shipped vs 8 in ADR-0029 layout — CalendarProvider and TranscriptionProvider interface stubs added per ADR-0040 and ADR-0041 so downstream repos can typecheck against the contract before Sprint 2/3 implementations land.

  get_schedule renamed to query_calendar throughout (ADR-0040 naming wins).
