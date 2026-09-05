/**
 * Output of `ToolsService.calculateAge()`.
 *
 * Two readings of the same elapsed span, because the UI shows both:
 * the calendar breakdown reads as one sentence ("10 years, 3 months,
 * 12 days, 5 hours, 20 minutes" — each field is what's *left over* after
 * the larger ones), while the totals express the whole span in a single
 * unit each ("10 years" is also "120 months" is also "3653 days"). Don't
 * mix the two: `months` is 0-11, `totalMonths` counts every month lived.
 */
export interface AgeResult {
  /** Calendar breakdown — remainders after the next-larger unit. */
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;

  /** The same span expressed wholly in each unit. */
  totalMonths: number;
  totalDays: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
}
