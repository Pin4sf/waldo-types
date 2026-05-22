/**
 * @waldo/types — Health data contracts
 * Raw device readings only. Never contains computed intelligence.
 */

export type PrimarySource = 'apple_watch' | 'whoop' | 'oura' | 'samsung' | 'garmin' | 'manual';
export type CrsZone = 'energized' | 'steady' | 'flagging' | 'depleted';
export type HrvMethod = 'rmssd' | 'sdnn' | 'hr_proxy';
export type DataQualityFlag = 'ok' | 'anomaly_rejected' | 'estimated' | null;

/**
 * One row per user per day. Source-agnostic.
 * Raw device readings — NEVER computed scores.
 * Samsung: hrv = null, dataQualityFlag = 'estimated'
 */
export interface HealthDaily {
  userId: string;
  date: string;                        // YYYY-MM-DD
  primarySource: PrimarySource;
  sourcesActive: string[];
  // HRV — with confidence weighting
  hrvOvernightMs: number | null;       // NEVER in DO SQLite or agent context
  hrvMethod: HrvMethod;
  hrvConfidence: number;               // HealthKit=1.0 | Oura=0.85 | WHOOP=0.80 | Samsung=0.60
  // Sleep
  sleepDurationMin: number | null;     // NEVER in DO SQLite or agent context
  sleepEfficiency: number | null;
  sleepDeepMin: number | null;
  sleepRemMin: number | null;
  sleepOnsetTime: string | null;       // HH:MM
  // Heart rate
  rhrBpm: number | null;              // NEVER in DO SQLite or agent context
  // Activity
  steps: number | null;
  activeEnergyKcal: number | null;
  strainScore: number | null;          // 0-21
  strainSource: 'native' | 'computed';
  exerciseMin: number | null;
  vo2max: number | null;
  // Additional biometrics
  spo2Avg: number | null;
  respRateAvg: number | null;
  skinTempDeviation: number | null;
  daylightMinutes: number | null;
  // Metadata
  dataQualityFlag: DataQualityFlag;
  syncedAt: string;
}

export interface CrsResult {
  date: string;
  score: number;                       // Form 0-100
  zone: CrsZone;
  confidence: number;
  recoveryScore: number;
  weightScore: number;
  loadScore: number;                   // 0-21 (Load, user-facing name)
  pillarDragPrimary: string | null;
  // Sub-scores for Tier 2 cards
  sleepScore: number;
  hrvScore: number;                    // CASS
  circadianScore: number;
  motionScore: number;
  stressScore: number;
  rhrtsScore: number;
  rrsScore: number;
  // Agent-facing (derived, no raw values)
  summary: string;                     // Waldo-voice, NO raw values ever
  contributingSources: string[];
}

export interface UserBaselines {
  userId: string;
  computedAt: string;
  hrvBaseline: number | null;
  rhrBaseline: number | null;
  sleepBaseline: number | null;
  formBaseline: number | null;
}

export interface HealthSnapshot {
  userId: string;
  deviceType: PrimarySource;
  capturedAt: string;
  rawData: Record<string, unknown>;    // device-specific raw payload
}
