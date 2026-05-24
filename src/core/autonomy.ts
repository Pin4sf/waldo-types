import { z } from 'zod';

export const autonomyLevelSchema = z.enum(['L1', 'L2', 'L3']);
export type AutonomyLevel = z.infer<typeof autonomyLevelSchema>;

// AutonomyDecision references WaldoCard — defined after ui/card.ts exists.
// Import is deferred to avoid circular dependency ordering issues at schema write time.
// WaldoCard type is imported here as a type-only import once ui/card.ts is written.
import type { WaldoCard } from '../ui/card';

export type AutonomyDecision =
  | { action: 'observed' }
  | { action: 'proposed'; card: WaldoCard }
  | { action: 'applied'; patrol_entry_id: string };
