import { AgeResult } from './age-result';

/** The `AgeResult` fields the age calculator renders as single-unit totals. */
export type AgeTotalField = 'totalMonths' | 'totalDays' | 'totalHours' | 'totalMinutes' | 'totalSeconds';

/**
 * Static description of one tile in the age calculator's totals grid — the
 * part that never changes between calculations. The live list lives in
 * `AGE_TOTAL_UNITS` (`@constants/tools`) so the labels aren't hardcoded in
 * the component, and `AgeCalc.ageTotals()` pairs each entry with the number
 * from the current `AgeResult`.
 */
export interface AgeTotalUnit {
  /** Stable `@for` track key. */
  id: string;
  label: string;
  field: AgeTotalField;
  /** Seconds is the odd one out in a two-column grid, so it takes a whole row. */
  fullWidth: boolean;
}

/** An `AgeTotalUnit` resolved against a computed `AgeResult`. */
export interface AgeTotal extends AgeTotalUnit {
  value: number;
}
