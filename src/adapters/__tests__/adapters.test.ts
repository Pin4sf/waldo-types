import { describe, expect, it } from 'vitest';
import type { ChannelAdapter } from '../channel';
import { channelMessageSchema } from '../channel';
import { crsResultSchema } from '../health';
import type { DocAdapter } from '../doc';
import { docHitSchema } from '../doc';
import type { EmailProvider } from '../email';
import { emailDraftSchema } from '../email';
import type { LLMProvider } from '../llm';
import type { SheetProvider } from '../sheet';
import type { TaskProvider } from '../task';
import type { CalendarProvider } from '../calendar';
import { calendarEventSchema, slotSchema } from '../calendar';
import type { TranscriptionProvider } from '../transcription';
import { transcriptResultSchema } from '../transcription';
import { healthSnapshotSchema } from '../health';

// ── schema valid/invalid pairs ─────────────────────────────────────────────

describe('channelMessageSchema', () => {
  it('valid', () => {
    expect(() => channelMessageSchema.parse({
      channel: 'telegram', user_id: 'u', text: 'hi', received_at: '2026-01-01T10:00:00Z',
    })).not.toThrow();
  });
  it('invalid: unknown channel', () => {
    expect(() => channelMessageSchema.parse({
      channel: 'irc', user_id: 'u', text: 'hi', received_at: '2026-01-01T10:00:00Z',
    })).toThrow();
  });
});

describe('docHitSchema', () => {
  it('valid', () => {
    expect(() => docHitSchema.parse({
      provider: 'notion', doc_id: 'pg_01', title: 'Q3 Plan',
      url: 'https://notion.so/q3', snippet: 'Summary of Q3',
      date_modified: '2026-01-01T00:00:00Z', parent: null,
    })).not.toThrow();
  });
  it('invalid: unknown provider', () => {
    expect(() => docHitSchema.parse({
      provider: 'dropbox', doc_id: 'x', title: 'y', url: 'z',
      snippet: 'a', date_modified: '2026-01-01T00:00:00Z', parent: null,
    })).toThrow();
  });
});

describe('emailDraftSchema', () => {
  it('valid', () => {
    expect(() => emailDraftSchema.parse({
      draft_id: 'd_01', subject: 'Hi', to: ['a@b.com'], created_at: '2026-01-01T00:00:00Z',
    })).not.toThrow();
  });
  it('invalid: missing subject', () => {
    expect(() => emailDraftSchema.parse({
      draft_id: 'd_01', to: ['a@b.com'], created_at: '2026-01-01T00:00:00Z',
    })).toThrow();
  });
});

describe('crsResultSchema', () => {
  it('valid', () => {
    expect(() => crsResultSchema.parse({
      score: 72, zone: 'steady', computed_at: '2026-01-01T06:00:00Z', component_count: 4,
    })).not.toThrow();
  });
  it('invalid: score > 100', () => {
    expect(() => crsResultSchema.parse({
      score: 105, zone: 'peak', computed_at: '2026-01-01T06:00:00Z', component_count: 4,
    })).toThrow();
  });
});

describe('healthSnapshotSchema', () => {
  it('valid', () => {
    expect(() => healthSnapshotSchema.parse({
      user_id: 'u', date: '2026-01-01T06:00:00Z',
      crs: { score: 80, zone: 'peak', computed_at: '2026-01-01T06:00:00Z', component_count: 5 },
      recovery_category: 'good', sleep_quality_category: 'optimal',
      strain_level: 'low', has_wearable_data: true, sources: ['whoop'],
    })).not.toThrow();
  });
  it('invalid: unknown recovery_category', () => {
    expect(() => healthSnapshotSchema.parse({
      user_id: 'u', date: '2026-01-01T06:00:00Z',
      crs: { score: 80, zone: 'peak', computed_at: '2026-01-01T06:00:00Z', component_count: 5 },
      recovery_category: 'excellent', sleep_quality_category: 'optimal',
      strain_level: 'low', has_wearable_data: true, sources: [],
    })).toThrow();
  });
});

describe('calendarEventSchema', () => {
  it('valid', () => {
    expect(() => calendarEventSchema.parse({
      event_id: 'ev_01', title: 'Board Review',
      start: '2026-01-01T14:00:00Z', end: '2026-01-01T15:00:00Z',
      attendee_count: 8, is_recurring: false, calendar_id: 'cal_01',
      provider: 'google_calendar',
    })).not.toThrow();
  });
  it('invalid: unknown provider', () => {
    expect(() => calendarEventSchema.parse({
      event_id: 'ev_01', title: 'x',
      start: '2026-01-01T14:00:00Z', end: '2026-01-01T15:00:00Z',
      attendee_count: 2, is_recurring: false, calendar_id: 'c',
      provider: 'outlook_calendar',
    })).toThrow();
  });
});

describe('transcriptResultSchema', () => {
  it('valid', () => {
    expect(() => transcriptResultSchema.parse({
      transcript: 'Board call went well.',
      duration_seconds: 120,
      provider: 'whisper_api',
      transcribed_at: '2026-01-01T15:30:00Z',
      audio_deleted: true,
    })).not.toThrow();
  });
  it('invalid: audio_deleted false', () => {
    expect(() => transcriptResultSchema.parse({
      transcript: 'x', duration_seconds: 10,
      provider: 'whisper_api', transcribed_at: '2026-01-01T15:30:00Z',
      audio_deleted: false,
    })).toThrow();
  });
});

// ── structural: mock implementations satisfy interfaces ─────────────────────

describe('ChannelAdapter structural', () => {
  it('mock satisfies interface', () => {
    const mock: ChannelAdapter = {
      channel: 'telegram',
      send: async ({ user_id }) => ({ ok: true, message_id: `msg_${user_id}` }),
      receive_webhook: async (_req) => ({
        channel: 'telegram',
        user_id: 'u',
        text: 'hi',
        received_at: '2026-01-01T10:00:00Z' as ReturnType<typeof import('../../core/error').iso8601Schema.parse>,
      }),
    };
    expect(mock.channel).toBe('telegram');
  });
});

describe('DocAdapter structural', () => {
  it('mock satisfies interface', () => {
    const mock: DocAdapter = {
      provider: 'notion',
      search: async () => ({ ok: true, hits: [] }),
      read: async () => ({ ok: false, error: 'not found', code: 'not_found' }),
      write: async () => ({ ok: true, doc_id: 'pg_01', url: 'https://notion.so/pg_01' }),
      list_folders: async () => ({ ok: true, folders: [] }),
    };
    expect(mock.provider).toBe('notion');
  });
});

describe('SheetProvider structural', () => {
  it('mock satisfies interface', () => {
    const mock: SheetProvider = {
      provider: 'google_sheets',
      read_range: async () => ({ ok: true, cells: [] }),
      write_cell: async () => ({ ok: true }),
      append_row: async () => ({ ok: true, row_index: 5 }),
      list_sheets: async () => ({ ok: true, sheets: [] }),
      list_tabs: async () => ({ ok: true, tabs: [] }),
    };
    expect(mock.provider).toBe('google_sheets');
  });
});

describe('EmailProvider structural', () => {
  it('mock satisfies interface', () => {
    const mock: EmailProvider = {
      provider: 'gmail',
      get_metadata: async () => ({
        ok: true,
        summary: { message_count: 5, after_hours_ratio: 0.1, thread_depth_avg: 2.3, sender_domains: [] },
      }),
      create_draft: async () => ({
        ok: true,
        draft: {
          draft_id: 'd_01', subject: 'Hi', to: ['a@b.com'],
          created_at: '2026-01-01T00:00:00Z' as ReturnType<typeof import('../../core/error').iso8601Schema.parse>,
        },
      }),
      list_drafts: async () => ({ ok: true, drafts: [] }),
      delete_draft: async () => ({ ok: true }),
      send_draft: async () => ({ ok: true, message_id: 'msg_01' }),
    };
    expect(mock.provider).toBe('gmail');
  });
});

describe('TaskProvider structural', () => {
  it('mock satisfies interface', () => {
    const mock: TaskProvider = {
      provider: 'todoist',
      list: async () => ({ ok: true, tasks: [] }),
      create: async () => ({ ok: true, task_id: 't_01' }),
      update: async () => ({ ok: true }),
    };
    expect(mock.provider).toBe('todoist');
  });
});

describe('LLMProvider structural', () => {
  it('mock satisfies interface', () => {
    const mock: LLMProvider = {
      complete: async (req) => ({
        ok: true,
        response: {
          model: req.model, text: 'ok',
          input_tokens: 100, output_tokens: 50, latency_ms: 200,
        },
      }),
      classify: async () => ['recovery'],
    };
    expect(typeof mock.complete).toBe('function');
  });
});

describe('CalendarProvider structural (stub)', () => {
  it('mock satisfies interface', () => {
    const mock: CalendarProvider = {
      provider: 'google_calendar',
      query_events: async () => ({ ok: true, events: [] }),
      find_slots: async () => ({ ok: true, slots: [] }),
      propose_event: async () => ({ ok: true, event_id: 'ev_01', decision_id: 'dec_01' }),
    };
    expect(mock.provider).toBe('google_calendar');
  });
});

describe('TranscriptionProvider structural (stub)', () => {
  it('mock satisfies interface', () => {
    const mock: TranscriptionProvider = {
      provider: 'whisper_api',
      transcribe: async () => ({
        ok: true,
        result: {
          transcript: 'hello', duration_seconds: 5,
          provider: 'whisper_api',
          transcribed_at: '2026-01-01T10:00:00Z' as ReturnType<typeof import('../../core/error').iso8601Schema.parse>,
          audio_deleted: true,
        },
      }),
    };
    expect(mock.provider).toBe('whisper_api');
  });
});
