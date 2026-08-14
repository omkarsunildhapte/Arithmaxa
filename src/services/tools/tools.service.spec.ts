import { TestBed } from '@angular/core/testing';
import { ToolsService } from './tools.service';

describe('ToolsService', () => {
  let service: ToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToolsService);
  });

  describe('convert', () => {
    it('converts length units (meters to kilometers)', () => {
      expect(service.convert(1000, 'm', 'km', 'length')).toBeCloseTo(1);
    });

    it('converts weight units (kilograms to grams)', () => {
      expect(service.convert(1, 'kg', 'g', 'weight')).toBeCloseTo(1000);
    });

    it('converts Celsius to Fahrenheit', () => {
      expect(service.convert(0, 'C', 'F', 'temp')).toBeCloseTo(32);
      expect(service.convert(100, 'C', 'F', 'temp')).toBeCloseTo(212);
    });

    it('converts Fahrenheit to Celsius', () => {
      expect(service.convert(32, 'F', 'C', 'temp')).toBeCloseTo(0);
    });

    it('converts Celsius to Kelvin when target is neither C nor F', () => {
      expect(service.convert(0, 'C', 'K', 'temp')).toBeCloseTo(273.15);
    });

    it('returns the input unchanged for an unknown conversion type', () => {
      expect(service.convert(42, 'x', 'y', 'unknown-type')).toBe(42);
    });
  });

  describe('percentage tools', () => {
    it('percentageOf computes percent of a total', () => {
      expect(service.percentageOf(25, 200)).toBe(50);
    });

    it('isWhatPercentage computes what percent x is of y', () => {
      expect(service.isWhatPercentage(50, 200)).toBe(25);
    });

    it('percentageChange computes signed percentage change', () => {
      expect(service.percentageChange(100, 150)).toBe(50);
      expect(service.percentageChange(150, 100)).toBeCloseTo(-33.333, 2);
    });

    it('discount subtracts the discount percent from the price', () => {
      expect(service.discount(200, 10)).toBe(180);
    });
  });

  describe('calculateAge', () => {
    it('computes years/months/days between a fixed past date and today', () => {
      const tenYearsAgo = new Date();
      tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

      const { years, months, days } = service.calculateAge(tenYearsAgo);

      expect(years).toBe(10);
      expect(months).toBe(0);
      expect(days).toBe(0);
    });
  });

  describe('calculateBmi', () => {
    it('categorizes a BMI under 18.5 as Underweight', () => {
      expect(service.calculateBmi(45, 1.8).category).toBe('Underweight');
    });

    it('categorizes a BMI between 18.5 and 25 as Normal', () => {
      expect(service.calculateBmi(70, 1.8).category).toBe('Normal');
    });

    it('categorizes a BMI between 25 and 30 as Overweight', () => {
      expect(service.calculateBmi(85, 1.8).category).toBe('Overweight');
    });

    it('categorizes a BMI of 30 or above as Obese', () => {
      expect(service.calculateBmi(100, 1.8).category).toBe('Obese');
    });
  });
});
