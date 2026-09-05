/** The three input modes the BMI calculator's segment switches between.
 *  'metric' and 'meters' both weigh in kilograms — only the height unit
 *  differs (centimetres vs. metres). */
export type BmiUnit = 'metric' | 'imperial' | 'meters';

/** One choice in that segment: the value the control reports, and the label
 *  shown on it. Labels are stored already uppercased, which is why the
 *  stylesheet carries no text-transform. */
export interface BmiUnitOption {
  value: BmiUnit;
  label: string;
}
