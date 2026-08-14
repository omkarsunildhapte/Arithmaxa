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
});
