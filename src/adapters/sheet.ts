import { z } from 'zod';
import { errorCodeSchema, iso8601Schema } from '../core/error';

export const sheetProviderNameSchema = z.enum(['google_sheets', 'excel_graph']);
export type SheetProviderName = z.infer<typeof sheetProviderNameSchema>;

export const cellValueSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('string'), value: z.string() }),
  z.object({ type: z.literal('number'), value: z.number() }),
  z.object({ type: z.literal('boolean'), value: z.boolean() }),
  z.object({ type: z.literal('date'), value: iso8601Schema }),
  z.object({ type: z.literal('formula'), value: z.string() }),
  z.object({ type: z.literal('empty') }),
]);
export type CellValue = z.infer<typeof cellValueSchema>;

export const cellSchema = z.object({
  range: z.string(),
  value: cellValueSchema,
  format: z.object({
    bold: z.boolean().optional(),
    color: z.string().optional(),
    number_format: z.string().optional(),
  }).optional(),
});
export type Cell = z.infer<typeof cellSchema>;

export interface SheetProvider {
  provider: SheetProviderName;

  read_range(args: { sheet_id: string; range: string }): Promise<
    | { ok: true; cells: Cell[] }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;

  write_cell(args: {
    sheet_id: string;
    range: string;
    value: CellValue;
    commit_hash: string;
    expected_current_value?: CellValue;
  }): Promise<{ ok: true } | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }>;

  append_row(args: {
    sheet_id: string;
    sheet_name: string;
    values: CellValue[];
    commit_hash: string;
  }): Promise<
    | { ok: true; row_index: number }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;

  list_sheets(args: Record<string, never>): Promise<
    | { ok: true; sheets: Array<{ id: string; name: string; url: string }> }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;

  list_tabs(args: { sheet_id: string }): Promise<
    | { ok: true; tabs: Array<{ name: string; gid: number }> }
    | { ok: false; error: string; code: z.infer<typeof errorCodeSchema> }
  >;
}
