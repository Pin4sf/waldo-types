import { z } from 'zod';

export const cardActionSchema = z.object({
  label: z.string(),
  handler: z.string(),
  args: z.record(z.unknown()).optional(),
  confirmation_token: z.string().optional(),
});
export type CardAction = z.infer<typeof cardActionSchema>;

const adjustmentProposalCardSchema = z.object({
  kind: z.literal('adjustment_proposal'),
  subtype: z.enum(['meeting_move', 'time_block', 'task_defer', 'connector_write']),
  reasoning: z.string(),
  proposed_change: z.record(z.unknown()),
  actions: z.array(cardActionSchema),
});

const windowProposalCardSchema = z.object({
  kind: z.literal('window_proposal'),
  window_type: z.enum(['focus', 'recovery', 'buffer']),
  start: z.string(),
  duration_min: z.number().int().min(1),
  reasoning: z.string(),
  actions: z.array(cardActionSchema),
});

const interventionCardSchema = z.object({
  kind: z.literal('intervention'),
  subtype: z.enum(['overload', 'depletion', 'momentum']),
  message: z.string(),
  actions: z.array(cardActionSchema),
});

const briefCardSchema = z.object({
  kind: z.literal('brief'),
  variant: z.enum(['morning', 'midday', 'evening', 'event']),
  summary: z.string(),
  actions: z.array(cardActionSchema),
});

const fetchCardSchema = z.object({
  kind: z.literal('fetch'),
  alert_type: z.string(),
  message: z.string(),
  actions: z.array(cardActionSchema),
});

const skillProposalCardSchema = z.object({
  kind: z.literal('skill_proposal'),
  skill_name: z.string(),
  description: z.string(),
  actions: z.array(cardActionSchema),
});

const contextCardSchema = z.object({
  kind: z.literal('context'),
  title: z.string(),
  body: z.string(),
  actions: z.array(cardActionSchema),
});

const draftDocumentCardSchema = z.object({
  kind: z.literal('draft_document'),
  title: z.string(),
  destination: z.enum(['scratch', 'drive', 'notion', 'confluence']),
  doc_id: z.string().optional(),
  url: z.string().optional(),
  actions: z.array(cardActionSchema),
});

const draftEmailCardSchema = z.object({
  kind: z.literal('draft_email'),
  subject: z.string(),
  recipient_count: z.number().int().min(1),
  draft_id: z.string(),
  send_url: z.string().optional(),
  actions: z.array(cardActionSchema),
});

const sheetWriteCardSchema = z.object({
  kind: z.literal('sheet_write'),
  sheet_name: z.string(),
  range: z.string(),
  old_value: z.string(),
  new_value: z.string(),
  reasoning: z.string(),
  actions: z.array(cardActionSchema),
});

export const waldoCardSchema = z.discriminatedUnion('kind', [
  adjustmentProposalCardSchema,
  windowProposalCardSchema,
  interventionCardSchema,
  briefCardSchema,
  fetchCardSchema,
  skillProposalCardSchema,
  contextCardSchema,
  draftDocumentCardSchema,
  draftEmailCardSchema,
  sheetWriteCardSchema,
]);
export type WaldoCard = z.infer<typeof waldoCardSchema>;

export type AdjustmentProposalCard = z.infer<typeof adjustmentProposalCardSchema>;
export type WindowProposalCard = z.infer<typeof windowProposalCardSchema>;
export type InterventionCard = z.infer<typeof interventionCardSchema>;
export type BriefCard = z.infer<typeof briefCardSchema>;
export type FetchCard = z.infer<typeof fetchCardSchema>;
export type SkillProposalCard = z.infer<typeof skillProposalCardSchema>;
export type ContextCard = z.infer<typeof contextCardSchema>;
export type DraftDocumentCard = z.infer<typeof draftDocumentCardSchema>;
export type DraftEmailCard = z.infer<typeof draftEmailCardSchema>;
export type SheetWriteCard = z.infer<typeof sheetWriteCardSchema>;
