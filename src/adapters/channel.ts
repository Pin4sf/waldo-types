import { z } from 'zod';
import { errorCodeSchema, iso8601Schema } from '../core/error';
import type { WaldoCard } from '../ui/card';

export const channelNameSchema = z.enum([
  'telegram', 'apns', 'whatsapp', 'discord', 'slack', 'in_app',
]);
export type ChannelName = z.infer<typeof channelNameSchema>;

export const channelMessageSchema = z.object({
  channel: channelNameSchema,
  user_id: z.string(),
  text: z.string(),
  attachments: z.array(z.unknown()).optional(),
  received_at: iso8601Schema,
});
export type ChannelMessage = z.infer<typeof channelMessageSchema>;

export interface ChannelAdapter {
  channel: ChannelName;

  send(args: {
    user_id: string;
    content: string;
    card?: WaldoCard;
    idempotency_key: string;
  }): Promise<
    | { ok: true; message_id: string }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;

  receive_webhook(req: Request): Promise<ChannelMessage>;
}
