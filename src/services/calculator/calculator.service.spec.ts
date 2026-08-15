import { TestBed } from '@angular/core/testing';
import { CalculatorService } from './calculator.service';

describe('CalculatorService', () => {
  let service: CalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalculatorService);
  });

  describe('input building', () => {
    it('appendNumber appends digits to the display', () => {
      service.appendNumber('1');
      service.appendNumber('2');
      expect(service.display()).toBe('12');
    });

    it('appendNumber starts fresh after an error', () => {
      service.display.set('Error');
      service.appendNumber('5');
      expect(service.display()).toBe('5');
    });

    it('appendDecimal adds a leading 0 when the current segment is empty', () => {
      service.appendDecimal();
      expect(service.display()).toBe('0.');
    });

    it('appendDecimal does not add a second decimal point to the same segment', () => {
      service.appendNumber('1.5');
      service.appendDecimal();
      expect(service.display()).toBe('1.5');
    });

    it('appendBracket adds an opening bracket by default', () => {
      service.appendBracket();
      expect(service.display()).toBe('(');
    });

    it('appendBracket closes an open bracket after a number', () => {
      service.appendNumber('2');
      service.appendBracket('(');
      service.appendNumber('3');
      service.appendBracket();
      expect(service.display()).toBe('2(3)');
    });

    it('toggleSign negates a positive number', () => {
      service.appendNumber('5');
      service.toggleSign();
      expect(service.display()).toBe('-5');
    });

    // NOTE: toggling a number that's already negative back to positive
    // (e.g. '-5' -> '5') is currently broken — toggleSign() produces '--5'
    // instead, because the split regex separates the leading '-' from the
    // digits before the `lastNum.startsWith('-')` check ever sees them
    // together. Pre-existing bug, out of scope for this pass — flagged to
    // the user rather than silently fixed or silently asserted as correct.

    it('setOperator replaces a trailing non-minus operator instead of stacking them', () => {
      service.appendNumber('5');
      service.setOperator('*');
      service.setOperator('/');
      expect(service.display()).toBe('5/');
    });

    it('setOperator appends rather than replaces when switching to "-", to support unary-minus entry (e.g. "5+-3")', () => {
      service.appendNumber('5');
      service.setOperator('+');
      service.setOperator('-');
      expect(service.display()).toBe('5+-');
    });
  });

  describe('calculate', () => {
    it('evaluates basic arithmetic with correct precedence', () => {
      service.display.set('2+3*4');
      service.calculate();
      expect(service.display()).toBe('14');
    });

    it('evaluates parenthesized expressions', () => {
      service.display.set('(2+3)*4');
      service.calculate();
      expect(service.display()).toBe('20');
    });

    it('evaluates power (**) expressions', () => {
      service.display.set('2**3');
      service.calculate();
      expect(service.display()).toBe('8');
    });

    it('sets display to Error for an invalid expression', () => {
      service.display.set('2+*');
      service.calculate();
      expect(service.display()).toBe('Error');
    });

    it('sets display to Error for a non-finite result (divide by zero)', () => {
      service.display.set('5/0');
      service.calculate();
      expect(service.display()).toBe('Error');
    });

    it('records a history entry on a successful calculation', () => {
      service.display.set('1+1');
      service.calculate();
      expect(service.history()[0]).toMatchObject({ expression: '1+1', result: '2' });
    });

    it('substitutes "ans" with the previous result on the next calculation', () => {
      service.display.set('4+1');
      service.calculate();
      expect(service.display()).toBe('5');

      service.display.set('ans*2');
      service.calculate();
      expect(service.display()).toBe('10');
    });
  });

  describe('scientific functions', () => {
    it('sqrt computes the square root', () => {
      service.display.set('9');
      service.sqrt();
      expect(service.display()).toBe('3');
    });

    it('sqrt of a negative number is an Error', () => {
      service.display.set('-9');
      service.sqrt();
      expect(service.display()).toBe('Error');
    });

    it('square computes x^2', () => {
      service.display.set('4');
      service.square();
      expect(service.display()).toBe('16');
    });

    it('factorial computes n!', () => {
      service.display.set('5');
      service.factorial();
      expect(service.display()).toBe('120');
    });

    it('factorial of a negative number is an Error', () => {
      service.display.set('-1');
      service.factorial();
      expect(service.display()).toBe('Error');
    });
  });

  describe('clear / backspace / history', () => {
    it('clear resets display and expression', () => {
      service.display.set('123');
      service.expression.set('1+2=');
      service.clear();
      expect(service.display()).toBe('');
      expect(service.expression()).toBe('');
    });

    it('backspace removes the last character', () => {
      service.appendNumber('123');
      service.backspace();
      expect(service.display()).toBe('12');
    });

    it('backspace after a calculation clears the display rather than editing the result', () => {
      service.display.set('4');
      service.calculate();
      service.backspace();
      expect(service.display()).toBe('');
    });

    it('clearHistory empties the history list', () => {
      service.display.set('1+1');
      service.calculate();
      expect(service.history().length).toBeGreaterThan(0);
      service.clearHistory();
      expect(service.history()).toEqual([]);
    });
  });

  describe('toggles', () => {
    it('toggleScientific flips isScientific', () => {
      expect(service.isScientific()).toBe(false);
      service.toggleScientific();
      expect(service.isScientific()).toBe(true);
    });

    it('toggleUnit flips isRadians', () => {
      expect(service.isRadians()).toBe(true);
      service.toggleUnit();
      expect(service.isRadians()).toBe(false);
    });
  });

  // ── Large calculation matrix (200+ cases) ─────────────────────────────────
  // expectedFormat mirrors the service's own private format() exactly, so
  // expected values are computed the same way the service computes them
  // instead of being hand-transcribed (and potentially wrong) decimal
  // strings — the thing under test is the service's wiring (display parsing,
  // operator handling, unary function application), not re-deriving
  // arithmetic or trig by hand.
  function expectedFormat(n: number): string {
    return parseFloat(parseFloat(n.toString()).toPrecision(10)).toString();
  }

  function factorialOf(n: number): number {
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  describe('calculate — binary operator matrix', () => {
    const additionPairs: [number, number][] = [
      [1, 1],
      [2, 3],
      [5, 7],
      [10, 20],
      [-3, 8],
      [-5, -9],
      [0, 0],
      [100, 200],
      [0.5, 0.25],
      [1.1, 2.2],
      [7, -2],
      [15, 15],
      [999, 1],
      [3.5, 6.5],
      [-10, 10],
      [42, 58],
      [123, 456],
      [7.7, 2.3],
    ];
    it.each(additionPairs)('%p + %p', (a, b) => {
      service.display.set(`${a}+${b}`);
      service.calculate();
      expect(service.display()).toBe(expectedFormat(a + b));
    });

    const subtractionPairs: [number, number][] = [
      [10, 3],
      [5, 7],
      [0, 5],
      [-3, -8],
      [100, 45],
      [7.5, 2.5],
      [-10, -10],
      [50, -50],
      [1, 1],
      [999, 999],
      [0, 0],
      [-1, 1],
      [12.25, 4.75],
      [8, 3],
      [200, 199],
      [-45, 45],
      [1000, 1],
      [3.3, 1.1],
    ];
    it.each(subtractionPairs)('%p - %p', (a, b) => {
      service.display.set(`${a}-${b}`);
      service.calculate();
      expect(service.display()).toBe(expectedFormat(a - b));
    });

    const multiplicationPairs: [number, number][] = [
      [2, 3],
      [5, 5],
      [-4, 6],
      [7, -8],
      [0, 99],
      [1, 1],
      [10, 10],
      [2.5, 4],
      [-3, -3],
      [12, 12],
      [9, 9],
      [100, 0.01],
      [6, 7],
      [15, 3],
      [-2, -9],
      [1.5, 1.5],
      [8, 0],
      [11, 11],
    ];
    it.each(multiplicationPairs)('%p * %p', (a, b) => {
      service.display.set(`${a}*${b}`);
      service.calculate();
      expect(service.display()).toBe(expectedFormat(a * b));
    });

    const divisionPairs: [number, number][] = [
      [10, 2],
      [9, 3],
      [100, 4],
      [7, 2],
      [-8, 4],
      [9, -3],
      [0, 5],
      [1, 1],
      [15, 3],
      [25, 5],
      [10, 4],
      [3, 4],
      [100, 10],
      [999, 3],
      [-100, -4],
      [7.5, 2.5],
      [6, 8],
      [1000, 8],
    ];
    it.each(divisionPairs)('%p / %p', (a, b) => {
      service.display.set(`${a}/${b}`);
      service.calculate();
      expect(service.display()).toBe(expectedFormat(a / b));
    });

    const powerPairs: [number, number][] = [
      [2, 3],
      [3, 2],
      [5, 0],
      [2, 10],
      [10, 2],
      [4, 0.5],
      [9, 0.5],
      [2, -1],
      [1, 100],
      [7, 2],
      [3, 3],
      [0, 5],
    ];
    it.each(powerPairs)('%p ** %p', (a, b) => {
      service.display.set(`${a}**${b}`);
      service.calculate();
      expect(service.display()).toBe(expectedFormat(Math.pow(a, b)));
    });
  });

  describe('calculate — precedence, parentheses, and chained expressions', () => {
    const precedenceExpressions: [string, number][] = [
      ['2+3*4', 14],
      ['(2+3)*4', 20],
      ['10-2*3', 4],
      ['(10-2)*3', 24],
      ['2*(3+4)', 14],
      ['(2+3)*(4+5)', 45],
      ['100/(5+5)', 10],
      ['2+3-1*2', 3],
      ['(1+2)*(3+4)/7', 3],
      ['2**2+1', 5],
      ['(2+2)**2', 16],
      ['50-(10+10)', 30],
    ];
    it.each(precedenceExpressions)('%s = %p', (expr, expected) => {
      service.display.set(expr);
      service.calculate();
      expect(service.display()).toBe(expectedFormat(expected));
    });

    const chainedExpressions: [string, number][] = [
      ['1+2+3+4+5', 15],
      ['10-1-1-1', 7],
      ['2*2*2*2', 16],
      ['100/2/5', 10],
      ['1+2*3-4/2', 5],
      ['5+5+5+5+5+5', 30],
      ['3+4*2-6/3', 9],
      ['(1+1)*(2+2)*(3+3)', 48],
      ['9-3+2-1', 7],
      ['6/3+4*2', 10],
      ['100-50+25-10', 65],
      ['2+2+2+2+2+2+2', 14],
    ];
    it.each(chainedExpressions)('%s = %p', (expr, expected) => {
      service.display.set(expr);
      service.calculate();
      expect(service.display()).toBe(expectedFormat(expected));
    });
  });

  describe('calculate — "%" is not actually supported by the expression parser', () => {
    // Pre-existing gap, flagged rather than silently fixed or silently
    // asserted as correct (same policy as the toggleSign note above):
    // modulo() (keypad %) appends a literal '%' to the display, but
    // expression-parser.ts's grammar (expression/term/power/unary/primary)
    // has no case for '%' at all — number() only consumes [\d.], so
    // parse()'s trailing "this.pos !== this.input.length" check always
    // fails on a '%', throwing a SyntaxError that calculate() catches and
    // turns into 'Error'. The percentage *button* (percentage(), x/100 via
    // applyUnary) is unrelated and works fine — see the unary matrix below.
    it.each(['10%3', '7%2', '100%7', '5%5'])('"%s" produces Error, not a modulo result', (expr) => {
      service.display.set(expr);
      service.calculate();
      expect(service.display()).toBe('Error');
    });
  });

  describe('calculate — additional error / edge cases', () => {
    it.each(['1/0', '-1/0', '0/0'])('"%s" is a non-finite result -> Error', (expr) => {
      service.display.set(expr);
      service.calculate();
      expect(service.display()).toBe('Error');
    });

    it.each(['(2+3', '**5', '3//2', '5)'])('"%s" is invalid syntax -> Error', (expr) => {
      service.display.set(expr);
      service.calculate();
      expect(service.display()).toBe('Error');
    });
  });

  describe('unary scientific/utility functions — value matrix', () => {
    it.each([0, 1, 4, 9, 16, 25, 49, 100, 2, 0.25])('sqrt(%p)', (x) => {
      service.display.set(`${x}`);
      service.sqrt();
      expect(service.display()).toBe(expectedFormat(Math.sqrt(x)));
    });

    it.each([0, 1, 2, 3, 4, 5, 10, -3, -7, 1.5])('square(%p)', (x) => {
      service.display.set(`${x}`);
      service.square();
      expect(service.display()).toBe(expectedFormat(Math.pow(x, 2)));
    });

    it.each([0, 1, 2, 3, -2, -3, 4, 5])('cube(%p)', (x) => {
      service.display.set(`${x}`);
      service.cube();
      expect(service.display()).toBe(expectedFormat(Math.pow(x, 3)));
    });

    it.each([0, 1, 8, 27, -8, -27, 64, 125])('cbrt(%p)', (x) => {
      service.display.set(`${x}`);
      service.cbrt();
      expect(service.display()).toBe(expectedFormat(Math.cbrt(x)));
    });

    it.each([0, 1, 2, 3, 4, 5, 6, 7, 8, 10])('factorial(%p)', (x) => {
      service.display.set(`${x}`);
      service.factorial();
      expect(service.display()).toBe(expectedFormat(factorialOf(x)));
    });

    it.each([1, 10, 100, 1000, 2, 5, 50, 0.1])('log10(%p)', (x) => {
      service.display.set(`${x}`);
      service.log10();
      expect(service.display()).toBe(expectedFormat(Math.log10(x)));
    });

    it.each([1, 2, 3, 10, 0.5, 100, Math.E, 50])('naturalLog(%p)', (x) => {
      service.display.set(`${x}`);
      service.naturalLog();
      expect(service.display()).toBe(expectedFormat(Math.log(x)));
    });

    it.each([1, 2, 4, 5, 10, 0.5, -2, 100])('reciprocal(%p)', (x) => {
      service.display.set(`${x}`);
      service.reciprocal();
      expect(service.display()).toBe(expectedFormat(1 / x));
    });

    it.each([5, -5, 0, -100, 3.5, -3.5, -0.001, 1000])('abs(%p)', (x) => {
      service.display.set(`${x}`);
      service.abs();
      expect(service.display()).toBe(expectedFormat(Math.abs(x)));
    });

    it.each([1.1, 1.9, -1.1, -1.9, 5, 0, -0.5, 100.99])('floor(%p)', (x) => {
      service.display.set(`${x}`);
      service.floor();
      expect(service.display()).toBe(expectedFormat(Math.floor(x)));
    });

    it.each([1.1, 1.9, -1.1, -1.9, 5, 0, -0.5, 100.01])('ceil(%p)', (x) => {
      service.display.set(`${x}`);
      service.ceil();
      expect(service.display()).toBe(expectedFormat(Math.ceil(x)));
    });

    it.each([50, 100, 25, 0, 10, 7, -20, 200])('percentage(%p)', (x) => {
      service.display.set(`${x}`);
      service.percentage();
      expect(service.display()).toBe(expectedFormat(x / 100));
    });

    it.each([0, 1, 2, 3, -1, -2])('pow10(%p)', (x) => {
      service.display.set(`${x}`);
      service.pow10();
      expect(service.display()).toBe(expectedFormat(Math.pow(10, x)));
    });
  });

  describe('trig functions — radians and degrees', () => {
    const safeAngles = [0, Math.PI / 6, Math.PI / 4, Math.PI / 3, -Math.PI / 6, -Math.PI / 4];
    const safeDegrees = [0, 30, 45, 60, -30, -45];

    it.each(safeAngles)('sin(%p) in radians', (x) => {
      service.display.set(`${x}`);
      service.sin();
      expect(service.display()).toBe(expectedFormat(Math.sin(x)));
    });
    it.each(safeAngles)('cos(%p) in radians', (x) => {
      service.display.set(`${x}`);
      service.cos();
      expect(service.display()).toBe(expectedFormat(Math.cos(x)));
    });
    it.each(safeAngles)('tan(%p) in radians', (x) => {
      service.display.set(`${x}`);
      service.tan();
      expect(service.display()).toBe(expectedFormat(Math.tan(x)));
    });

    it.each(safeDegrees)('sin(%p°) in degrees', (deg) => {
      service.toggleUnit();
      service.display.set(`${deg}`);
      service.sin();
      expect(service.display()).toBe(expectedFormat(Math.sin((deg * Math.PI) / 180)));
    });
    it.each(safeDegrees)('cos(%p°) in degrees', (deg) => {
      service.toggleUnit();
      service.display.set(`${deg}`);
      service.cos();
      expect(service.display()).toBe(expectedFormat(Math.cos((deg * Math.PI) / 180)));
    });
    it.each(safeDegrees)('tan(%p°) in degrees', (deg) => {
      service.toggleUnit();
      service.display.set(`${deg}`);
      service.tan();
      expect(service.display()).toBe(expectedFormat(Math.tan((deg * Math.PI) / 180)));
    });

    it.each([-1, -0.5, 0, 0.5, 1, 0.25])('asin(%p)', (x) => {
      service.display.set(`${x}`);
      service.asin();
      expect(service.display()).toBe(expectedFormat(Math.asin(x)));
    });
    it.each([-1, -0.5, 0, 0.5, 1, 0.25])('acos(%p)', (x) => {
      service.display.set(`${x}`);
      service.acos();
      expect(service.display()).toBe(expectedFormat(Math.acos(x)));
    });
    it.each([0, 1, -1, 10, -10, 0.5])('atan(%p)', (x) => {
      service.display.set(`${x}`);
      service.atan();
      expect(service.display()).toBe(expectedFormat(Math.atan(x)));
    });

    it.each([0, 1, 2, -1, -2, 0.5])('sinh(%p)', (x) => {
      service.display.set(`${x}`);
      service.sinh();
      expect(service.display()).toBe(expectedFormat(Math.sinh(x)));
    });
    it.each([0, 1, 2, -1, -2, 0.5])('cosh(%p)', (x) => {
      service.display.set(`${x}`);
      service.cosh();
      expect(service.display()).toBe(expectedFormat(Math.cosh(x)));
    });
    it.each([0, 1, 2, -1, -2, 0.5])('tanh(%p)', (x) => {
      service.display.set(`${x}`);
      service.tanh();
      expect(service.display()).toBe(expectedFormat(Math.tanh(x)));
    });

    it.each([0, 1, 2, -1, -2, 10])('asinh(%p)', (x) => {
      service.display.set(`${x}`);
      service.asinh();
      expect(service.display()).toBe(expectedFormat(Math.asinh(x)));
    });
    it.each([1, 2, 5, 10, 1.5, 100])('acosh(%p)', (x) => {
      service.display.set(`${x}`);
      service.acosh();
      expect(service.display()).toBe(expectedFormat(Math.acosh(x)));
    });
    it.each([0, 0.5, -0.5, 0.25, -0.25, 0.9])('atanh(%p)', (x) => {
      service.display.set(`${x}`);
      service.atanh();
      expect(service.display()).toBe(expectedFormat(Math.atanh(x)));
    });
  });
});
