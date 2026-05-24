import { describe, expect, it } from 'vitest';
import { connectorStatusSchema, userSchema } from '../user';

const validUser = {
  id: 'user_01',
  name: 'Shivansh',
  timezone: 'Asia/Kolkata',
  chronotype: 'morning',
  wake_time: '06:30',
  evening_time: '22:00',
  day_type: 'deep_work',
  autonomy_level: 'L2',
  voice_sensitivity: 'normal',
  response_depth: 'default',
  protect_morning_focus: true,
  block_deep_work_windows: false,
  defer_low_urgency_notifications: true,
  focus_window_default: 50,
  connectors: { google_calendar: 'connected', slack: 'degraded' },
  pricing_tier: 'pro',
  daily_push_budget_remaining: 3,
} as const;

describe('connectorStatusSchema', () => {
  it('accepts connected', () => expect(connectorStatusSchema.parse('connected')).toBe('connected'));
  it('accepts degraded', () => expect(connectorStatusSchema.parse('degraded')).toBe('degraded'));
  it('accepts disconnected', () => expect(connectorStatusSchema.parse('disconnected')).toBe('disconnected'));
  it('rejects unknown status', () => {
    expect(() => connectorStatusSchema.parse('unknown')).toThrow();
  });
});

describe('userSchema', () => {
  it('accepts valid user', () => {
    expect(() => userSchema.parse(validUser)).not.toThrow();
  });
  it('rejects invalid chronotype', () => {
    expect(() => userSchema.parse({ ...validUser, chronotype: 'night_owl' })).toThrow();
  });
  it('rejects invalid focus_window_default', () => {
    expect(() => userSchema.parse({ ...validUser, focus_window_default: 45 })).toThrow();
  });
  it('rejects invalid autonomy_level', () => {
    expect(() => userSchema.parse({ ...validUser, autonomy_level: 'L5' })).toThrow();
  });
  it('accepts optional morning_focus_window', () => {
    expect(() => userSchema.parse({ ...validUser, morning_focus_window: '07:00-09:30' })).not.toThrow();
  });
});
