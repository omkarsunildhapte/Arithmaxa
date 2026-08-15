import { Service, signal } from '@angular/core';
import { HistoryItem } from '@appTypes/index';
import { evaluate } from '@utils/expression-parser';

// ── Service ───────────────────────────────────────────────────────────────────

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

  toggleScientific(): void {
    this.isScientific.update((v) => !v);
  }

  toggleUnit(): void {
    this.isRadians.update((v) => !v);
  }

  toggleInverse(): void {
    this.isInverse.update((v) => !v);
  }

  toggleHyperbolic(): void {
    this.isHyperbolic.update((v) => !v);
  }

  abs(): void {
    this.applyUnary(Math.abs);
  }

  reciprocal(): void {
    this.applyUnary((x) => 1 / x);
  }

  e(): void {
    this.justCalculated = true;
    this.display.set(Math.E.toString());
  }

  exp(): void {
    this.applyUnary(Math.exp);
  }

  // ── Number / decimal ───────────────────────────────────────────────────────

  appendNumber(num: string): void {
    if (this.display() === 'Error' || this.justCalculated) {
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
    if (val === 'Error') return;
    if (this.justCalculated) {
      this.expression.set('');
      this.display.set('0.');
      this.justCalculated = false;
      return;
    }
    const lastSegment = val.split(/[+\-*/%^()]/).pop() ?? '';
    if (lastSegment.includes('.')) return;
    const lastChar = val.slice(-1);
    // Same implicit-multiplication gap as appendNumber() above — "(2+3)."
    // needs to become "(2+3)*0." (a fresh decimal number), not "(2+3)."
    // (an unparseable trailing dot with nothing after the close-paren).
    if (lastChar === ')') {
      this.display.update((v: string) => v + '*0.');
      return;
    }
    const afterOp = !lastChar || ['+', '-', '*', '/', '('].includes(lastChar);
    this.display.update((v: string) => v + (afterOp ? '0.' : '.'));
  }

  appendBracket(bracket?: '(' | ')'): void {
    const val = this.display();
    if (val === 'Error') return;
    this.justCalculated = false;

    if (bracket === ')') {
      this.display.update((v) => v + ')');
      return;
    }
    if (bracket === '(') {
      this.appendOpenParen();
      return;
    }

    const openCount = (val.match(/\(/g) || []).length;
    const closeCount = (val.match(/\)/g) || []).length;
    const lastChar = val.slice(-1);

    // If last char is a number or a closing bracket, and we have open brackets to close, add ')'
    if (/[\d)]/.test(lastChar) && openCount > closeCount) {
      this.display.update((v) => v + ')');
    } else {
      // Otherwise, add '('
      this.appendOpenParen();
    }
  }

  /** Appends '(' — inserting an implicit '*' first if it directly follows a
   *  number or a closing bracket (e.g. "5(" or "(2+3)("). Same reasoning as
   *  appendNumber()/appendDecimal() above: the parser has no implicit-
   *  multiplication grammar, so without this the expression would just
   *  fail to parse at calculate() time. */
  private appendOpenParen(): void {
    this.display.update((v) => (/[\d)]/.test(v.slice(-1)) ? v + '*' : v) + '(');
  }

  modulo(): void {
    const val = this.display();
    if (!val || ['+', '-', '*', '/', '('].includes(val.slice(-1))) return;
    this.display.update((v) => v + '%');
  }

  toggleSign(): void {
    const current = this.display();
    if (current === '0' || !current || current === 'Error') return;

    // Split into segments to find the last number
    const segments = current.split(/([+\-*/%^()])/);
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
    if (val === 'Error') return;

    if (this.justCalculated) {
      this.expression.set('');
      this.justCalculated = false;
    }

    if (!val) {
      if (op === '-') this.display.set('-');
      return;
    }

    const endsWithOp = /(\*\*|[+\-*/])$/.test(val);
    if (endsWithOp) {
      if (op === '-' && !val.endsWith('-')) {
        this.display.update((v: string) => v + op);
      } else {
        this.display.update((v: string) => v.replace(/(\*\*|[+\-*/])$/, op));
      }
    } else {
      this.display.update((v: string) => v + op);
    }
  }

  // ── Calculate ──────────────────────────────────────────────────────────────

  calculate(): void {
    const val = this.display();
    if (!val || val === 'Error') return;

    let cleaned = val.replace(/(\*\*|[+\-*/])$/, '');
    if (!cleaned) return;

    // Handle Ans replacement
    const lastRes = this.lastResult();
    if (lastRes) {
      // Replace case-insensitive 'ans' with last result
      cleaned = cleaned.replace(/ans/gi, lastRes);
    } else {
      // If no last result, replace 'ans' with 0 or handle error
      cleaned = cleaned.replace(/ans/gi, '0');
    }

    try {
      const result = evaluate(cleaned);
      if (!isFinite(result)) {
        this.pushHistory(cleaned, 'Error');
        this.expression.set(cleaned + ' =');
        this.display.set('Error');
      } else {
        const resultStr = this.format(result);
        this.lastResult.set(resultStr);
        this.pushHistory(cleaned, resultStr);
        this.expression.set(cleaned + ' =');
        this.display.set(resultStr);
        this.justCalculated = true;
      }
    } catch {
      this.display.set('Error');
    }
  }

  // ── Special ────────────────────────────────────────────────────────────────

  clear(): void {
    this.display.set('');
    this.expression.set('');
    this.justCalculated = false;
  }

  clearHistory(): void {
    this.history.set([]);
  }

  backspace(): void {
    const val = this.display();
    if (val === 'Error' || this.justCalculated) {
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

  percentage(): void {
    this.applyUnary((x) => x / 100);
  }

  // ── Scientific ─────────────────────────────────────────────────────────────

  sqrt(): void {
    this.applyUnary((x) => (x < 0 ? NaN : Math.sqrt(x)));
  }
  square(): void {
    this.applyUnary((x) => Math.pow(x, 2));
  }
  power(): void {
    this.setOperator('**');
  }
  rootY(): void {
    this.setOperator('**(1/');
  }
  pow10(): void {
    this.applyUnary((x) => Math.pow(10, x));
  }
  cube(): void {
    this.applyUnary((x) => Math.pow(x, 3));
  }
  cbrt(): void {
    this.applyUnary((x) => Math.cbrt(x));
  }
  log10(): void {
    this.applyUnary((x) => (x <= 0 ? NaN : Math.log10(x)));
  }
  naturalLog(): void {
    this.applyUnary((x) => (x <= 0 ? NaN : Math.log(x)));
  }

  sinh(): void {
    this.applyUnary(Math.sinh);
  }
  cosh(): void {
    this.applyUnary(Math.cosh);
  }
  tanh(): void {
    this.applyUnary(Math.tanh);
  }
  sin(): void {
    this.trig(Math.sin);
  }
  cos(): void {
    this.trig(Math.cos);
  }
  tan(): void {
    this.trig(Math.tan, (r) => (Math.abs(r) > 1e10 ? NaN : r));
  }

  asin(): void {
    this.invTrig(Math.asin, (x) => x >= -1 && x <= 1);
  }
  acos(): void {
    this.invTrig(Math.acos, (x) => x >= -1 && x <= 1);
  }
  atan(): void {
    this.invTrig(Math.atan);
  }

  asinh(): void {
    this.applyUnary(Math.asinh);
  }

  acosh(): void {
    this.applyUnary((x) => (x < 1 ? NaN : Math.acosh(x)));
  }

  atanh(): void {
    this.applyUnary((x) => (x <= -1 || x >= 1 ? NaN : Math.atanh(x)));
  }
  pi(): void {
    this.insertConstant(Math.PI);
  }
  tau(): void {
    this.insertConstant(2 * Math.PI);
  }
  eSquared(): void {
    this.insertConstant(Math.E * Math.E);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private applyUnary(fn: (x: number) => number): void {
    const val = this.display();
    if (!val || val === 'Error') return;

    let num: number;
    try {
      num = evaluate(val);
    } catch {
      this.display.set('Error');
      return;
    }

    if (!isFinite(num)) {
      this.display.set('Error');
      return;
    }

    const result = fn(num);
    if (!isFinite(result) || isNaN(result)) {
      this.display.set('Error');
    } else {
      const resultStr = this.format(result);
      this.pushHistory(val, resultStr);
      this.expression.set(val + ' =');
      this.display.set(resultStr);
      this.justCalculated = true;
    }
  }

  private format(n: number): string {
    return parseFloat(parseFloat(n.toString()).toPrecision(10)).toString();
  }

  /** Applies a Math.* trig fn, converting the operand from degrees when isRadians() is off. */
  private trig(fn: (x: number) => number, postProcess?: (r: number) => number): void {
    this.applyUnary((x) => {
      const angle = this.isRadians() ? x : (x * Math.PI) / 180;
      const r = fn(angle);
      return postProcess ? postProcess(r) : r;
    });
  }

  /** Applies a Math.* inverse trig fn, converting the result back to degrees when isRadians() is off. */
  private invTrig(fn: (x: number) => number, domainCheck?: (x: number) => boolean): void {
    this.applyUnary((x) => {
      if (domainCheck && !domainCheck(x)) return NaN;
      const r = fn(x);
      return this.isRadians() ? r : (r * 180) / Math.PI;
    });
  }

  /** Inserts a constant (π, τ, e², …): replaces the display fresh after an error/calculation, else appends. */
  private insertConstant(value: number): void {
    const str = value.toString();
    if (this.display() === 'Error' || this.justCalculated) {
      this.display.set(str);
      this.justCalculated = false;
      return;
    }
    // Same implicit-multiplication gap as appendNumber()/appendOpenParen()
    // — "(2+3)π" needs a '*' between the close-paren and the constant.
    this.display.update((v) => (/[\d)]/.test(v.slice(-1)) ? v + '*' : v) + str);
  }

  floor(): void {
    this.applyUnary(Math.floor);
  }
  ceil(): void {
    this.applyUnary(Math.ceil);
  }

  factorial(): void {
    this.applyUnary((n) => {
      if (n < 0 || n > 170) return NaN;
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
    this.history.update((h) => [{ expression, result, timestamp }, ...h].slice(0, 20));
  }
}
