/**
 * Parsing patterns and limits for CalculatorService. Grouped into one object
 * rather than 14 flat exports so the service imports it on a single line
 * (AGENTS.md § 2) instead of a wrapped 16-line block.
 *
 * The regexes encode the keypad's grammar rules and several were written out
 * three or four times across that file; one definition each means a fix lands
 * everywhere the rule applies, not just in whichever copy was noticed.
 */
export const CALC = {
  /** Display value standing in for "that input could not be evaluated". */
  ERROR: 'Error',

  /** A trailing +, -, *, / or ** - stripped before evaluating, replaced when
   *  the user presses a second operator, backspaced two chars at a time. */
  TRAILING_OPERATOR: /(\*\*|[+\-*/])$/,

  /** Display ending in a digit or ')', where the parser needs an inserted '*'
   *  before a '(' or a constant - it has no implicit-multiplication grammar. */
  IMPLICIT_MULTIPLY: /[\d)]$/,

  /** Splits on operators, discarding them - isolates the operand being typed. */
  OPERAND_SPLIT: /[+\-*/%^()]/,

  /** Splits on operators, keeping them, so toggleSign() can rebuild the string. */
  SEGMENT_SPLIT: /([+\-*/%^()])/,

  /** The "Ans" token, swapped for the previous result before evaluating. */
  ANS: /ans/gi,

  /** Stands in for Ans on the first calculation, when there is no result yet. */
  ANS_FALLBACK: '0',

  /** Characters after which a bare "." has no operand and must become "0.". */
  OPERATORS_AND_OPEN_PAREN: ['+', '-', '*', '/', '('] as readonly string[],

  /** Most recent calculations kept; the History panel shows this many. */
  HISTORY_LIMIT: 20,

  /** Significant digits kept when formatting, to hide float noise like
   *  0.30000000000000004. */
  PRECISION: 10,

  PERCENT_DIVISOR: 100,
  DEGREES_PER_HALF_TURN: 180,

  /** 170! is the largest factorial representable as a double; 171! is Infinity. */
  FACTORIAL_MAX: 170,

  /** tan() near an asymptote returns an enormous finite number rather than
   *  Infinity, which reads as a real answer. Past this it is an error. */
  TAN_ASYMPTOTE_LIMIT: 1e10,
};
