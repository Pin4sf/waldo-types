import { z } from 'zod';
import { triggerTypeSchema } from '../core/trigger';

export const toolNameSchema = z.enum([
  // reads (1–16)
  'get_crs', 'get_health', 'query_calendar', 'get_communication', 'get_tasks',
  'get_master_metrics', 'get_context', 'read_memory', 'update_memory',
  'search_episodes', 'propose_action', 'execute_action', 'send_message',
  'web_search', 'read_document', 'call_mcp_tool',
  // writes (17–24)
  'write_task', 'update_task', 'draft_document', 'draft_email',
  'search_connector', 'propose_schedule', 'write_sheet_cell', 'execute_code',
  // threading (25–29)
  'create_thread', 'delete_message', 'restore_message', 'archive_thread', 'update_thread_topics',
]);
export type ToolName = z.infer<typeof toolNameSchema>;

export type TriggerKey = z.infer<typeof triggerTypeSchema>;

export type ToolPermissions = Record<TriggerKey, ToolName[]>;

export const TOOL_PERMISSIONS: ToolPermissions = {
  brief: [
    'get_crs', 'get_health', 'query_calendar', 'get_communication', 'get_tasks',
    'get_master_metrics', 'get_context', 'read_memory', 'search_episodes',
    'search_connector', 'propose_action', 'send_message',
  ],
  patrol: [
    'get_crs', 'get_health', 'read_memory', 'search_connector', 'propose_action',
  ],
  fetch_alert: [
    'get_crs', 'get_health', 'read_memory', 'propose_action', 'send_message',
  ],
  handoff_explore: [
    'get_crs', 'get_health', 'query_calendar', 'get_communication', 'get_tasks',
    'get_master_metrics', 'get_context', 'read_memory', 'search_episodes',
    'search_connector', 'web_search', 'read_document',
  ],
  handoff_plan: [
    'get_crs', 'get_health', 'query_calendar', 'get_tasks', 'propose_action',
  ],
  handoff_act: [
    'execute_action', 'write_task', 'update_task',
    'draft_document', 'draft_email', 'propose_schedule', 'write_sheet_cell', 'send_message',
  ],
  handoff_replan: [
    'get_crs', 'get_health', 'query_calendar', 'get_tasks', 'update_task', 'propose_action',
  ],
  intervention: [
    'get_crs', 'get_health', 'read_memory', 'update_task', 'propose_action',
  ],
  user_message: [
    'get_crs', 'get_health', 'query_calendar', 'get_communication', 'get_tasks',
    'get_master_metrics', 'get_context', 'read_memory', 'update_memory',
    'search_episodes', 'search_connector', 'web_search', 'read_document', 'call_mcp_tool',
    'write_task', 'update_task', 'draft_document', 'draft_email',
    'propose_schedule', 'write_sheet_cell', 'execute_code',
    'propose_action', 'execute_action', 'send_message',
    'create_thread', 'delete_message', 'restore_message', 'archive_thread', 'update_thread_topics',
  ],
  dreaming_mode: [
    'read_memory', 'update_memory', 'search_episodes', 'execute_code',
  ],
};
