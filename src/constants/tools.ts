import { SelectOption, ToolCard } from '@appTypes/index';

import { AgeTotalUnit } from '@appTypes/index';

/**
 * Modal sheet height (as a fraction of viewport height, matching Ionic's
 * `initialBreakpoint`/`breakpoints` API) that each tool's modal opens to in
 * Tools' selectTool(). Most tools fit comfortably at the default; a tool
 * needing more room overrides it individually rather than the whole app
 * sharing one fixed height regardless of content.
 */
export const DEFAULT_TOOL_MODAL_BREAKPOINT = 0.6;
export const PERCENTAGE_CALC_MODAL_BREAKPOINT = 0.8;
export const AGE_CALC_MODAL_BREAKPOINT = 0.85;
export const DISCOUNT_CALC_MODAL_BREAKPOINT = 0.8;
export const CURRENCY_CONVERTER_MODAL_BREAKPOINT = 0.8;
export const BMI_CALC_MODAL_BREAKPOINT = 0.85;

/**
 * Time-unit conversions for the age calculator. Named constants rather than
 * inline 1000/60/24/12 so both the borrow logic and the "total in one unit"
 * arithmetic in `ToolsService.calculateAge()` read as conversions instead of
 * magic numbers.
 */
export const MS_PER_SECOND = 1000;
export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;
export const MONTHS_PER_YEAR = 12;

export const MS_PER_MINUTE = MS_PER_SECOND * SECONDS_PER_MINUTE;
export const MS_PER_HOUR = MS_PER_MINUTE * MINUTES_PER_HOUR;
export const MS_PER_DAY = MS_PER_HOUR * HOURS_PER_DAY;

/**
 * The tiles under the age calculator's headline "N Years", in render order.
 * Declared here rather than inline in the component so the display labels
 * stay out of the `.ts` (see AGENTS.md § 22) and the grid's shape is
 * data-driven — adding a unit is one entry, not another copy of the tile
 * markup.
 */
export const AGE_TOTAL_UNITS: readonly AgeTotalUnit[] = [
  { id: 'months', label: 'Months', field: 'totalMonths', fullWidth: false },
  { id: 'days', label: 'Days', field: 'totalDays', fullWidth: false },
  { id: 'hours', label: 'Hours', field: 'totalHours', fullWidth: false },
  { id: 'minutes', label: 'Minutes', field: 'totalMinutes', fullWidth: false },
  { id: 'seconds', label: 'Seconds', field: 'totalSeconds', fullWidth: true },
];

/**
 * Units offered by the converter modal, keyed by the tool id that opens it.
 * Keys must match the `case` labels in Tools.selectTool() and the ids in
 * TOOL_CARDS below — an unmatched key means the modal opens with an empty
 * dropdown rather than failing loudly.
 *
 * The values are the unit keys ToolsService.convert() understands; its own
 * rate tables are the authority on what actually converts.
 */
export const UNIT_OPTIONS: Record<string, SelectOption[]> = {
  length: [
    { value: 'm', label: 'Meters (m)' },
    { value: 'km', label: 'Kilometers (km)' },
    { value: 'mile', label: 'Miles (mi)' },
    { value: 'foot', label: 'Feet (ft)' },
  ],
  weight: [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'lb', label: 'Pounds (lb)' },
  ],
  temp: [
    { value: 'C', label: 'Celsius (°C)' },
    { value: 'F', label: 'Fahrenheit (°F)' },
    { value: 'K', label: 'Kelvin (K)' },
  ],
};

/**
 * The Tools grid, in display order. `id` is what Tools.selectTool() switches
 * on, so renaming one here without updating that switch drops the tile's
 * modal silently.
 *
 * Colors cycle through the brand's cyan/blue family (primary, accent, and the
 * ion-color-primary tint/shade derivatives in styles.css) rather than a
 * rainbow per tool — distinguishable row to row while staying on-brand.
 * Plain hex is required, not var(--x): the template appends an alpha suffix
 * to this string directly ('#22ecf3' + '15'), which only works on a literal.
 */
export const TOOL_CARDS: ToolCard[] = [
  { id: 'length', name: 'Length', subtitle: 'Distance', icon: 'swap-horizontal-outline', color: '#22ecf3' },
  { id: 'weight', name: 'Weight', subtitle: 'Mass Units', icon: 'calculator-outline', color: '#06a5da' },
  { id: 'temp', name: 'Temp', subtitle: 'Thermal', icon: 'flask-outline', color: '#43eff5' },
  { id: 'percentage', name: 'Percent', subtitle: 'Ratio Calc', icon: 'stats-chart-outline', color: '#1dc9cf' },
  { id: 'age', name: 'Age', subtitle: 'Date Diff', icon: 'calendar-outline', color: '#22ecf3' },
  { id: 'discount', name: 'Discount', subtitle: 'Price Cut', icon: 'shapes-outline', color: '#06a5da' },
  { id: 'currency', name: 'Currency', subtitle: 'Live Rates', icon: 'cash-outline', color: '#43eff5' },
  { id: 'bmi', name: 'BMI', subtitle: 'Health', icon: 'body-outline', color: '#1dc9cf' },
];
