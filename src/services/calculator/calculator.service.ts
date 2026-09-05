import { Service, signal } from '@angular/core';
import { HistoryItem } from '@appTypes/index';
import { evaluate } from '@utils/expression-parser';
import { CALC } from '@constants/index';

@Service()
export class CalculatorService {
  readonly display = signal<string>('');
  readonly expression = signal<string>('');
  readonly history = signal<HistoryItem[]>([]);
  readonly isScientific = signal<boolean>(false);
  readonly isRadians = signal<boolean>(true);
  readonly isInverse = signal<boolean>(false);
  readonly isHyperbolic = signal<boolean>(false);
  readonly lastResult = signal<string | null>(null);

  private justCalculated = false;

  readonly toggleScientific = (): void => this.isScientific.update((v) => !v);
  readonly toggleUnit = (): void => this.isRadians.update((v) => !v);
  readonly toggleInverse = (): void => this.isInverse.update((v) => !v);
  readonly toggleHyperbolic = (): void => this.isHyperbolic.update((v) => !v);
  readonly abs = (): void => this.applyUnary(Math.abs);
  readonly reciprocal = (): void => this.applyUnary((x) => 1 / x);

  e(): void {
    this.justCalculated = true;
    this.display.set(Math.E.toString());
  }

  readonly exp = (): void => this.applyUnary(Math.exp);

  // ── Number / decimal ───────────────────────────────────────────────────────

  appendNumber(num: string): void {
    if (this.display() === CALC.ERROR || this.justCalculated) {
      this.expression.set('');
      this.display.set(num);
      this.justCalculated = false;
      return;
    }
    // A closing bracket directly followed by a digit (e.g. "(2+3)5") has no
    // operator between them — the parser has no implicit-multiplication
    // grammar, so it would otherwise fail to parse the whole expression the
    // moment calculate() runs. Insert the '*' now so it's never possible to
    // build that broken state from the keypad.
    this.display.update((v: string) => (v.endsWith(')') ? v + '*' : v) + num);
  }

  appendDecimal(): void {
    const val = this.display();
    if (val === CALC.ERROR) return;
    if (this.justCalculated) {
      this.expression.set('');
      this.display.set('0.');
      this.justCalculated = false;
      return;
    }
    const lastSegment = val.split(CALC.OPERAND_SPLIT).pop() ?? '';
    if (lastSegment.includes('.')) return;
    const lastChar = val.slice(-1);
    // Same implicit-multiplication gap as appendNumber() above — "(2+3)."
    // needs to become "(2+3)*0." (a fresh decimal number), not "(2+3)."
    // (an unparseable trailing dot with nothing after the close-paren).
    if (lastChar === ')') {
      this.display.update((v: string) => v + '*0.');
      return;
    }
    const afterOp = !lastChar || CALC.OPERATORS_AND_OPEN_PAREN.includes(lastChar);
    this.display.update((v: string) => v + (afterOp ? '0.' : '.'));
  }

  appendBracket(bracket?: '(' | ')'): void {
    const val = this.display();
    if (val === CALC.ERROR) return;
    this.justCalculated = false;

    if (bracket === ')') {
      this.display.update((v) => v + ')');
      return;
    }
    if (bracket === '(') {
      this.appendOpenParen();
      return;
    }

    // A digit or ')' with something still open closes it; anything else opens.
    const unclosed = this.countOf(val, '(') > this.countOf(val, ')');
    if (CALC.IMPLICIT_MULTIPLY.test(val) && unclosed) {
      this.display.update((v) => v + ')');
    } else {
      this.appendOpenParen();
    }
  }

  /** Appends '(' — inserting an implicit '*' first if it directly follows a
   *  number or a closing bracket (e.g. "5(" or "(2+3)("). Same reasoning as
   *  appendNumber()/appendDecimal() above: the parser has no implicit-
   *  multiplication grammar, so without this the expression would just
   *  fail to parse at calculate() time. */
  private appendOpenParen(): void {
    this.display.update((v) => this.withImplicitMultiply(v) + '(');
  }

  private countOf(val: string, char: string): number {
    return val.split(char).length - 1;
  }

  modulo(): void {
    const val = this.display();
    if (!val || CALC.OPERATORS_AND_OPEN_PAREN.includes(val.slice(-1))) return;
    this.display.update((v) => v + '%');
  }

  toggleSign(): void {
    const current = this.display();
    if (current === '0' || !current || current === CALC.ERROR) return;

    // Split into segments to find the last number
    const segments = current.split(CALC.SEGMENT_SPLIT);
    let lastNum = segments.pop() || '';

    if (lastNum.startsWith('-')) {
      lastNum = lastNum.substring(1);
    } else if (lastNum) {
      lastNum = '-' + lastNum;
    }

    this.display.set(segments.join('') + lastNum);
  }

  // ── Operators ──────────────────────────────────────────────────────────────

  setOperator(op: string): void {
    const val = this.display();
    if (val === CALC.ERROR) return;

    if (this.justCalculated) {
      this.expression.set('');
      this.justCalculated = false;
    }

    if (!val) {
      if (op === '-') this.display.set('-');
      return;
    }

    if (!CALC.TRAILING_OPERATOR.test(val)) {
      this.display.update((v: string) => v + op);
    } else if (op === '-' && !val.endsWith('-')) {
      // "5*" + "-" is a negative operand, not a replacement.
      this.display.update((v: string) => v + op);
    } else {
      this.display.update((v: string) => v.replace(CALC.TRAILING_OPERATOR, op));
    }
  }

  // ── Calculate ──────────────────────────────────────────────────────────────

  calculate(): void {
    const val = this.display();
    if (!val || val === CALC.ERROR) return;

    const stripped = val.replace(CALC.TRAILING_OPERATOR, '');
    if (!stripped) return;

    // "Ans" stands for the previous result, or 0 on the first calculation.
    const cleaned = stripped.replace(CALC.ANS, this.lastResult() ?? CALC.ANS_FALLBACK);

    try {
      const result = evaluate(cleaned);
      if (!isFinite(result)) {
        this.pushHistory(cleaned, CALC.ERROR);
        this.expression.set(cleaned + ' =');
        this.display.set(CALC.ERROR);
      } else {
        this.lastResult.set(this.commit(cleaned, result));
      }
    } catch {
      this.display.set(CALC.ERROR);
    }
  }

  // ── Special ────────────────────────────────────────────────────────────────

  clear(): void {
    this.display.set('');
    this.expression.set('');
    this.justCalculated = false;
  }

  readonly clearHistory = (): void => this.history.set([]);

  backspace(): void {
    const val = this.display();
    if (val === CALC.ERROR || this.justCalculated) {
      this.display.set('');
      this.expression.set('');
      this.justCalculated = false;
      return;
    }
    if (val.endsWith('**')) {
      this.display.update((v: string) => v.slice(0, -2));
    } else {
      this.display.update((v: string) => v.slice(0, -1));
    }
  }

  readonly percentage = (): void => this.applyUnary((x) => x / CALC.PERCENT_DIVISOR);

  // ── Scientific ─────────────────────────────────────────────────────────────

  readonly sqrt = (): void => this.applyUnary((x) => (x < 0 ? NaN : Math.sqrt(x)));
  readonly square = (): void => this.applyUnary((x) => Math.pow(x, 2));
  readonly power = (): void => this.setOperator('**');
  readonly rootY = (): void => this.setOperator('**(1/');
  readonly pow10 = (): void => this.applyUnary((x) => Math.pow(10, x));
  readonly cube = (): void => this.applyUnary((x) => Math.pow(x, 3));
  readonly cbrt = (): void => this.applyUnary((x) => Math.cbrt(x));
  readonly log10 = (): void => this.applyUnary((x) => (x <= 0 ? NaN : Math.log10(x)));
  readonly naturalLog = (): void => this.applyUnary((x) => (x <= 0 ? NaN : Math.log(x)));
  readonly sinh = (): void => this.applyUnary(Math.sinh);
  readonly cosh = (): void => this.applyUnary(Math.cosh);
  readonly tanh = (): void => this.applyUnary(Math.tanh);
  readonly sin = (): void => this.trig(Math.sin);
  readonly cos = (): void => this.trig(Math.cos);
  readonly tan = (): void => this.trig(Math.tan, (r) => (Math.abs(r) > CALC.TAN_ASYMPTOTE_LIMIT ? NaN : r));
  readonly asin = (): void => this.invTrig(Math.asin, (x) => x >= -1 && x <= 1);
  readonly acos = (): void => this.invTrig(Math.acos, (x) => x >= -1 && x <= 1);
  readonly atan = (): void => this.invTrig(Math.atan);
  readonly asinh = (): void => this.applyUnary(Math.asinh);
  readonly acosh = (): void => this.applyUnary((x) => (x < 1 ? NaN : Math.acosh(x)));
  readonly atanh = (): void => this.applyUnary((x) => (x <= -1 || x >= 1 ? NaN : Math.atanh(x)));
  readonly pi = (): void => this.insertConstant(Math.PI);
  readonly tau = (): void => this.insertConstant(2 * Math.PI);
  readonly eSquared = (): void => this.insertConstant(Math.E * Math.E);

  // ── Helpers ────────────────────────────────────────────────────────────────

  private applyUnary(fn: (x: number) => number): void {
    const val = this.display();
    if (!val || val === CALC.ERROR) return;

    let num: number;
    try {
      num = evaluate(val);
    } catch {
      this.display.set(CALC.ERROR);
      return;
    }

    const result = isFinite(num) ? fn(num) : NaN;
    if (!isFinite(result) || isNaN(result)) {
      this.display.set(CALC.ERROR);
    } else {
      this.commit(val, result);
    }
  }

  /** Records a successful evaluation: history entry, "<source> =" caption,
   *  formatted display, and the flag that makes the next keypress start over.
   *  Shared by calculate() and applyUnary(), which had this five-line tail
   *  duplicated; returns the formatted string so calculate() can also store
   *  it as Ans. applyUnary deliberately does not — Ans tracks '=' only. */
  private commit(source: string, result: number): string {
    const resultStr = this.format(result);
    this.pushHistory(source, resultStr);
    this.expression.set(source + ' =');
    this.display.set(resultStr);
    this.justCalculated = true;
    return resultStr;
  }

  private format(n: number): string {
    return parseFloat(parseFloat(n.toString()).toPrecision(CALC.PRECISION)).toString();
  }

  /** Applies a Math.* trig fn, converting the operand from degrees when isRadians() is off. */
  private trig(fn: (x: number) => number, postProcess?: (r: number) => number): void {
    this.applyUnary((x) => {
      const angle = this.isRadians() ? x : (x * Math.PI) / CALC.DEGREES_PER_HALF_TURN;
      const r = fn(angle);
      return postProcess ? postProcess(r) : r;
    });
  }

  /** Applies a Math.* inverse trig fn, converting the result back to degrees when isRadians() is off. */
  private invTrig(fn: (x: number) => number, domainCheck?: (x: number) => boolean): void {
    this.applyUnary((x) => {
      if (domainCheck && !domainCheck(x)) return NaN;
      const r = fn(x);
      return this.isRadians() ? r : (r * CALC.DEGREES_PER_HALF_TURN) / Math.PI;
    });
  }

  /** Inserts a constant (π, τ, e², …): replaces the display fresh after an error/calculation, else appends. */
  private insertConstant(value: number): void {
    const str = value.toString();
    if (this.display() === CALC.ERROR || this.justCalculated) {
      this.display.set(str);
      this.justCalculated = false;
      return;
    }
    this.display.update((v) => this.withImplicitMultiply(v) + str);
  }

  /** The parser has no implicit-multiplication grammar, so a '(' or a constant
   *  landing straight after a digit or ')' ("5(", "(2+3)π") would fail to parse
   *  at calculate() time. Inserting the '*' at keypress makes that state
   *  unreachable from the keypad. appendNumber() has its own narrower check:
   *  a digit after a digit is just a longer number, not a product. */
  private withImplicitMultiply(val: string): string {
    return CALC.IMPLICIT_MULTIPLY.test(val) ? val + '*' : val;
  }

  readonly floor = (): void => this.applyUnary(Math.floor);
  readonly ceil = (): void => this.applyUnary(Math.ceil);
  readonly round = (): void => this.applyUnary(Math.round);

  factorial(): void {
    this.applyUnary((n) => {
      if (n < 0 || n > CALC.FACTORIAL_MAX) return NaN;
      if (n === 0) return 1;
      let res = 1;
      for (let i = 2; i <= Math.floor(n); i++) res *= i;
      return res;
    });
  }

  random(): void {
    const r = Math.random();
    const resultStr = this.format(r);
    this.display.set(resultStr);
    this.justCalculated = true;
  }

  private pushHistory(expression: string, result: string): void {
    const timestamp = Date.now();
    this.history.update((h) => [{ expression, result, timestamp }, ...h].slice(0, CALC.HISTORY_LIMIT));
  }
}
