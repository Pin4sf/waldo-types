/**
 * @waldo/types — API response shapes
 * EF response envelopes. App reads these. Shapes are the contract.
 */

import type { CrsZone } from './health';
import type { SpotObservation, PatrolEntry, AgentMessage } from './agent';

export interface TodayForm {
  score: number;
  zone: CrsZone;
  confidence: number;
}

export interface TodayLoad {
  score: number;
  max: 21;
  label: 'Low' | 'Medium' | 'High';
}

export interface TodaySlope {
  direction: 'improving' | 'stable' | 'declining';
  delta: number;        // change in Form score over 7 days
}

export interface TodayResponse {
  date: string;
  form: TodayForm;
  recovery: { score: number };
  load: TodayLoad;
  slope: TodaySlope;
  topSpots: SpotObservation[];
  patrolPreview: PatrolEntry[];
  brief?: AgentMessage;
  // Samsung-specific
  formEstimated?: boolean;  // true when hrv_confidence < 0.7
}

export interface HistoryPoint {
  date: string;
  formScore: number;
  recoveryScore: number;
  loadScore: number;
  zone: CrsZone;
}

export interface HistoryResponse {
  userId: string;
  range: { from: string; to: string };
  points: HistoryPoint[];
  nextCursor: string | null;
}

/** Standard envelope for all EF responses */
export interface EFResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}
