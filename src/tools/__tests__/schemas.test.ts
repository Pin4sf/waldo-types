import { describe, expect, it } from 'vitest';
import {
  archiveThreadArgs, callMcpToolArgs, createThreadArgs, deleteMessageArgs,
  draftDocumentArgs, draftEmailArgs, executeActionArgs, executeCodeArgs,
  getCommunicationArgs, getContextArgs, getCrsArgs, getHealthArgs,
  getMasterMetricsArgs, getTasksArgs, proposeActionArgs, proposeScheduleArgs,
  queryCalendarArgs, readDocumentArgs, readMemoryArgs, restoreMessageArgs,
  searchConnectorArgs, searchEpisodesArgs, sendMessageArgs, updateMemoryArgs,
  updateTaskArgs, updateThreadTopicsArgs, webSearchArgs, writeSheetCellArgs,
  writeTaskArgs,
} from '../schemas';

// ── reads ──────────────────────────────────────────────────────────────────

describe('getCrsArgs', () => {
  it('valid: default range', () => expect(() => getCrsArgs.parse({})).not.toThrow());
  it('invalid: range_days > 90', () => expect(() => getCrsArgs.parse({ range_days: 91 })).toThrow());
});

describe('getHealthArgs', () => {
  it('valid: empty', () => expect(() => getHealthArgs.parse({})).not.toThrow());
  it('invalid: unknown metric', () => expect(() => getHealthArgs.parse({ metrics: ['mood'] })).toThrow());
});

describe('queryCalendarArgs', () => {
  it('valid: empty', () => expect(() => queryCalendarArgs.parse({})).not.toThrow());
  it('invalid: limit > 50', () => expect(() => queryCalendarArgs.parse({ limit: 51 })).toThrow());
});

describe('getCommunicationArgs', () => {
  it('valid: empty', () => expect(() => getCommunicationArgs.parse({})).not.toThrow());
  it('invalid: bad date format', () => {
    expect(() => getCommunicationArgs.parse({
      date_range: { from: 'not-a-date', to: '2026-01-01T00:00:00Z' },
    })).toThrow();
  });
});

describe('getTasksArgs', () => {
  it('valid: default', () => expect(() => getTasksArgs.parse({})).not.toThrow());
  it('invalid: unknown status', () => expect(() => getTasksArgs.parse({ status: 'archived' })).toThrow());
});

describe('getMasterMetricsArgs', () => {
  it('valid: empty', () => expect(() => getMasterMetricsArgs.parse({})).not.toThrow());
  it('invalid: non-iso date', () => expect(() => getMasterMetricsArgs.parse({ date: '01/01/2026' })).toThrow());
});

describe('getContextArgs', () => {
  it('valid: with topic', () => expect(() => getContextArgs.parse({ topic: 'recovery' })).not.toThrow());
  it('invalid: topic too long', () => expect(() => getContextArgs.parse({ topic: 'x'.repeat(201) })).toThrow());
});

describe('readMemoryArgs', () => {
  it('valid: default', () => expect(() => readMemoryArgs.parse({})).not.toThrow());
  it('invalid: unknown hall', () => expect(() => readMemoryArgs.parse({ hall: 'goals' })).toThrow());
});

describe('updateMemoryArgs', () => {
  it('valid: events hall', () => {
    expect(() => updateMemoryArgs.parse({ hall: 'events', content: 'Board call went well' })).not.toThrow();
  });
  it('invalid: facts hall (immutable post-onboarding)', () => {
    expect(() => updateMemoryArgs.parse({ hall: 'facts', content: 'x' })).toThrow();
  });
});

describe('searchEpisodesArgs', () => {
  it('valid: query', () => expect(() => searchEpisodesArgs.parse({ query: 'recovery' })).not.toThrow());
  it('invalid: empty query', () => expect(() => searchEpisodesArgs.parse({ query: '' })).toThrow());
});

describe('proposeActionArgs', () => {
  it('valid', () => {
    expect(() => proposeActionArgs.parse({
      action_type: 'move_meeting', description: 'Move 2pm call to 4pm', reasoning: 'HRV low',
    })).not.toThrow();
  });
  it('invalid: missing reasoning', () => {
    expect(() => proposeActionArgs.parse({ action_type: 'x', description: 'y' })).toThrow();
  });
});

describe('executeActionArgs', () => {
  it('valid', () => {
    expect(() => executeActionArgs.parse({
      action_id: 'act_01', confirmation_token: 'tok_abc', user_id: 'user_01',
    })).not.toThrow();
  });
  it('invalid: missing confirmation_token', () => {
    expect(() => executeActionArgs.parse({ action_id: 'act_01', user_id: 'user_01' })).toThrow();
  });
});

describe('sendMessageArgs', () => {
  it('valid: telegram', () => {
    expect(() => sendMessageArgs.parse({
      channel: 'telegram', user_id: 'user_01', content: 'Hello', idempotency_key: 'k1',
    })).not.toThrow();
  });
  it('invalid: unknown channel', () => {
    expect(() => sendMessageArgs.parse({
      channel: 'sms', user_id: 'user_01', content: 'Hello', idempotency_key: 'k1',
    })).toThrow();
  });
});

describe('webSearchArgs', () => {
  it('valid', () => expect(() => webSearchArgs.parse({ query: 'HRV research 2026' })).not.toThrow());
  it('invalid: empty query', () => expect(() => webSearchArgs.parse({ query: '' })).toThrow());
});

describe('readDocumentArgs', () => {
  it('valid: doc_id only', () => expect(() => readDocumentArgs.parse({ doc_id: 'doc_01' })).not.toThrow());
  it('invalid: unknown provider', () => {
    expect(() => readDocumentArgs.parse({ doc_id: 'doc_01', provider: 'sharepoint' })).toThrow();
  });
});

describe('callMcpToolArgs', () => {
  it('valid', () => {
    expect(() => callMcpToolArgs.parse({ server: 'linear', tool: 'get_issue', args: { id: 'HEY-7' } })).not.toThrow();
  });
  it('invalid: missing tool', () => {
    expect(() => callMcpToolArgs.parse({ server: 'linear', args: {} })).toThrow();
  });
});

// ── writes ─────────────────────────────────────────────────────────────────

describe('writeTaskArgs', () => {
  it('valid', () => {
    expect(() => writeTaskArgs.parse({ title: 'Review PR', reasoning: 'Sprint action' })).not.toThrow();
  });
  it('invalid: empty title', () => {
    expect(() => writeTaskArgs.parse({ title: '', reasoning: 'x' })).toThrow();
  });
});

describe('updateTaskArgs', () => {
  it('valid: status change', () => {
    expect(() => updateTaskArgs.parse({
      task_id: 'task_01', changes: { status: 'done' }, reasoning: 'completed',
    })).not.toThrow();
  });
  it('invalid: unknown status', () => {
    expect(() => updateTaskArgs.parse({
      task_id: 't', changes: { status: 'deferred' }, reasoning: 'x',
    })).toThrow();
  });
});

describe('draftDocumentArgs', () => {
  it('valid: scratch', () => {
    expect(() => draftDocumentArgs.parse({
      title: 'Weekly plan', body_markdown: '# Plan\n- Item', destination: 'scratch',
    })).not.toThrow();
  });
  it('invalid: unknown destination', () => {
    expect(() => draftDocumentArgs.parse({
      title: 'x', body_markdown: 'y', destination: 'dropbox',
    })).toThrow();
  });
});

describe('draftEmailArgs', () => {
  it('valid', () => {
    expect(() => draftEmailArgs.parse({
      to: ['rohan@example.com'], subject: 'Hi', body_markdown: 'Hello',
    })).not.toThrow();
  });
  it('invalid: invalid email in to', () => {
    expect(() => draftEmailArgs.parse({
      to: ['not-an-email'], subject: 'Hi', body_markdown: 'Hello',
    })).toThrow();
  });
});

describe('searchConnectorArgs', () => {
  it('valid: query only', () => expect(() => searchConnectorArgs.parse({ query: 'Q3 plan' })).not.toThrow());
  it('invalid: unknown source', () => {
    expect(() => searchConnectorArgs.parse({ query: 'x', sources: ['github'] })).toThrow();
  });
});

describe('proposeScheduleArgs', () => {
  it('valid', () => {
    expect(() => proposeScheduleArgs.parse({
      attendees: ['alice@example.com'], duration_min: 30, title: 'Sync',
    })).not.toThrow();
  });
  it('invalid: duration_min < 15', () => {
    expect(() => proposeScheduleArgs.parse({
      attendees: ['a@b.com'], duration_min: 5, title: 'x',
    })).toThrow();
  });
  it('valid: prefer_user_form_zone energized (peak → energized, v0.2.0 canonical)', () => {
    expect(() => proposeScheduleArgs.parse({
      attendees: ['a@b.com'], duration_min: 30, title: 'Sync', prefer_user_form_zone: 'energized',
    })).not.toThrow();
  });
  it('valid: prefer_user_form_zone avoid_trough (scheduling intent, not a Zone value)', () => {
    expect(() => proposeScheduleArgs.parse({
      attendees: ['a@b.com'], duration_min: 30, title: 'Sync', prefer_user_form_zone: 'avoid_trough',
    })).not.toThrow();
  });
  it('invalid: prefer_user_form_zone peak (stale, removed v0.2.0)', () => {
    expect(() => proposeScheduleArgs.parse({
      attendees: ['a@b.com'], duration_min: 30, title: 'Sync', prefer_user_form_zone: 'peak',
    })).toThrow();
  });
});

describe('writeSheetCellArgs', () => {
  it('valid: string value', () => {
    expect(() => writeSheetCellArgs.parse({ sheet_id: 'sid', range: 'Sheet1!A1', value: 'hello' })).not.toThrow();
  });
  it('invalid: unknown mode', () => {
    expect(() => writeSheetCellArgs.parse({ sheet_id: 'sid', range: 'A1', value: 1, mode: 'merge' })).toThrow();
  });
});

describe('executeCodeArgs', () => {
  it('valid: python', () => {
    expect(() => executeCodeArgs.parse({ language: 'python', code: 'print("hello")' })).not.toThrow();
  });
  it('invalid: unsupported language', () => {
    expect(() => executeCodeArgs.parse({ language: 'ruby', code: 'puts "hi"' })).toThrow();
  });
});

// ── threading ──────────────────────────────────────────────────────────────

describe('createThreadArgs', () => {
  it('valid: empty', () => expect(() => createThreadArgs.parse({})).not.toThrow());
  it('invalid: too many topic_tags', () => {
    expect(() => createThreadArgs.parse({ topic_tags: ['a', 'b', 'c', 'd', 'e', 'f'] })).toThrow();
  });
});

describe('deleteMessageArgs', () => {
  it('valid', () => {
    expect(() => deleteMessageArgs.parse({ message_id: 'msg_01', thread_id: 'thr_01' })).not.toThrow();
  });
  it('invalid: missing thread_id', () => {
    expect(() => deleteMessageArgs.parse({ message_id: 'msg_01' })).toThrow();
  });
});

describe('restoreMessageArgs', () => {
  it('valid', () => {
    expect(() => restoreMessageArgs.parse({ message_id: 'msg_01', thread_id: 'thr_01' })).not.toThrow();
  });
  it('invalid: empty message_id', () => {
    expect(() => restoreMessageArgs.parse({ message_id: '', thread_id: 'thr_01' })).toThrow();
  });
});

describe('archiveThreadArgs', () => {
  it('valid', () => expect(() => archiveThreadArgs.parse({ thread_id: 'thr_01' })).not.toThrow());
  it('invalid: missing thread_id', () => expect(() => archiveThreadArgs.parse({})).toThrow());
});

describe('updateThreadTopicsArgs', () => {
  it('valid', () => {
    expect(() => updateThreadTopicsArgs.parse({ thread_id: 'thr_01', topic_tags: ['recovery'] })).not.toThrow();
  });
  it('invalid: empty topic_tags array', () => {
    expect(() => updateThreadTopicsArgs.parse({ thread_id: 'thr_01', topic_tags: [] })).toThrow();
  });
});
