import { describe, expect, it } from 'vitest';
import { toolNameSchema, TOOL_PERMISSIONS } from '../permissions';

describe('toolNameSchema', () => {
  it('keeps execute_code typed in the union (ADR-0050: typed-but-disabled)', () => {
    expect(toolNameSchema.options).toContain('execute_code');
    expect(() => toolNameSchema.parse('execute_code')).not.toThrow();
  });
});

describe('TOOL_PERMISSIONS (ADR-0050: execute_code removed from V1 ACLs)', () => {
  it('user_message does NOT contain execute_code', () => {
    expect(TOOL_PERMISSIONS.user_message).not.toContain('execute_code');
  });
  it('dreaming_mode does NOT contain execute_code', () => {
    expect(TOOL_PERMISSIONS.dreaming_mode).not.toContain('execute_code');
  });
  it('no V1 trigger ACL contains execute_code', () => {
    for (const tools of Object.values(TOOL_PERMISSIONS)) {
      expect(tools).not.toContain('execute_code');
    }
  });
});

describe('TOOL_PERMISSIONS.pre_activity_spot (ADR-0042: read + propose only)', () => {
  it('has the ADR-0042 ACL', () => {
    expect(TOOL_PERMISSIONS.pre_activity_spot).toEqual([
      'get_crs', 'query_calendar', 'read_memory', 'propose_schedule', 'propose_action', 'send_message',
    ]);
  });
  it('never silent — no mutating write tools', () => {
    for (const banned of ['update_memory', 'write_task', 'draft_email', 'execute_code'] as const) {
      expect(TOOL_PERMISSIONS.pre_activity_spot).not.toContain(banned);
    }
  });
});
