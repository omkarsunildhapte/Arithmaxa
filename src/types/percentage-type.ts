/** Which percentage question the tool is answering. Each value maps to one
 *  ToolsService method in PercentageCalc.calculate(). */
export type PercentageType = 'of' | 'is' | 'change';

/** One choice in the percentage-type dropdown. Narrower than SelectOption on
 *  purpose: `value` drives a branch in calculate(), so a plain string here
 *  would let a typo compile and silently return 0. */
export interface PercentageTypeOption {
  value: PercentageType;
  label: string;
}
