import { KeypadKey } from '@appTypes/index';

/**
 * The ÷,7,8,9,×,4,5,6,−,1,2,3,+,0 keys — one row's worth of behaviour
 * (appendNumber/setOperator) that would otherwise be 14 near-identical
 * <ion-button> blocks in keypad.html.
 *
 * Order is layout: the grid is `repeat(4, ...)` with implicit row wrapping,
 * so this array's sequence *is* the visual row/column order. Reordering it
 * rearranges the keypad — and breaks ROW_START_LABELS below, which names
 * positions in this exact sequence.
 *
 * "." and "=" follow in the template rather than living here: each has a
 * one-off handler (appendDecimal() takes no argument, "=" carries its own
 * .btn-equals styling) that isn't worth generalising this shape for.
 */
export const NUMPAD_KEYS: KeypadKey[] = [
  { label: '÷', value: '/', type: 'operator' },
  { label: '7', value: '7', type: 'number' },
  { label: '8', value: '8', type: 'number' },
  { label: '9', value: '9', type: 'number' },
  { label: '×', value: '*', type: 'operator' },
  { label: '4', value: '4', type: 'number' },
  { label: '5', value: '5', type: 'number' },
  { label: '6', value: '6', type: 'number' },
  { label: '−', value: '-', type: 'operator' },
  { label: '1', value: '1', type: 'number' },
  { label: '2', value: '2', type: 'number' },
  { label: '3', value: '3', type: 'number' },
  { label: '+', value: '+', type: 'operator' },
  { label: '0', value: '0', type: 'number' },
];

/**
 * The four keys that start each of NUMPAD_KEYS' natural 4-per-row groupings
 * (7/8/9/× · 4/5/6/− · 1/2/3/+, plus "0" starting the final 0/./()/= row).
 *
 * In scientific mode the rows above the numpad shift where this array starts
 * in the grid, so the item count no longer lands on a row boundary by itself.
 * These four force a grid row break (.row-break in keypad.css) to keep the
 * 4-per-row grouping that normal mode gets for free — normal mode's fixed row
 * above the numpad already keeps the count aligned.
 *
 * Labels, not values: '−' and '-' differ, and these are matched against
 * KeypadKey.label.
 */
export const ROW_START_LABELS: ReadonlySet<string> = new Set(['7', '4', '1', '0']);
