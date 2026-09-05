import { BmiScaleBand, BmiUnitOption } from '@appTypes/index';

/**
 * The four bands drawn beneath the BMI score. Deliberately its own four
 * colours rather than brand-accent: the bar maps category ranges, so a single
 * accent would say nothing about which band a score falls in.
 */
export const BMI_SCALE_BANDS: BmiScaleBand[] = [
  { band: 'underweight', class: 'bg-blue-400', width: 20 },
  { band: 'normal', class: 'bg-green-400', width: 30 },
  { band: 'overweight', class: 'bg-yellow-400', width: 20 },
  { band: 'obese', class: 'bg-red-400', width: 30 },
];

/** Choices in the unit segment, in display order. */
export const BMI_UNIT_OPTIONS: BmiUnitOption[] = [
  { value: 'metric', label: 'METRIC' },
  { value: 'meters', label: 'METERS' },
  { value: 'imperial', label: 'IMPERIAL' },
];
