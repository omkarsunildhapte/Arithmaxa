/** One entry in Keypad's data-driven number/operator row
 *  (src/app/shared/keypad/keypad.ts). */
export interface KeypadKey {
  label: string;
  value: string;
  type: 'number' | 'operator';
}
