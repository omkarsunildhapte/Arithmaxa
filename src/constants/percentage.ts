import { PercentageTypeOption } from '@appTypes/index';

/**
 * The three percentage questions offered by the tool, in dropdown order.
 * Labels are phrased as questions ("What is X% of Y?") rather than operation
 * names — the tool is for people who know the question but not the formula.
 */
export const PERCENTAGE_TYPE_OPTIONS: PercentageTypeOption[] = [
  { value: 'of', label: 'What is X% of Y?' },
  { value: 'is', label: 'X is what % of Y?' },
  { value: 'change', label: '% Increase/Decrease' },
];
