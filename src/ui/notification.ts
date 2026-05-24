import { z } from 'zod';
import { waldoCardSchema } from './card';
// channelNameSchema canonical source: adapters/channel.ts — import via root after barrel is wired.
// Inline z.enum here to avoid circular barrel import at this layer.
const _channelNameSchema = z.enum([
  'telegram', 'apns', 'whatsapp', 'discord', 'slack', 'in_app',
]);

export const pushPayloadSchema = z.object({
  title: z.string(),
  body: z.string(),
  channel: _channelNameSchema,
  user_id: z.string(),
  idempotency_key: z.string(),
  card: waldoCardSchema.optional(),
});
export type PushPayload = z.infer<typeof pushPayloadSchema>;
