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

    it('borrows across days/hours/minutes when the birth time-of-day is later than now', () => {
      // "Now" is earlier in the day (10:15) than the birth time (14:45), so
      // both the hours and days columns must borrow — exercises the
      // cascading borrow logic, not just the years/months/days case above
      // where time-of-day never comes into play.
      jest.useFakeTimers().setSystemTime(new Date(2024, 5, 15, 10, 15));
      const birthDate = new Date(2014, 5, 10, 14, 45);

      const { years, months, days, hours, minutes } = service.calculateAge(birthDate);

      expect(years).toBe(10);
      expect(months).toBe(0);
      expect(days).toBe(4);
      expect(hours).toBe(19);
      expect(minutes).toBe(30);

      jest.useRealTimers();
    });

    it('also expresses the span wholly in each unit — 4 years is 48 months is 1461 days', () => {
      // Anniversary-exact so the calendar breakdown is all zeros below the
      // years and the totals are the only interesting output. Both dates sit
      // in June, so a DST-observing timezone is on the same offset at each
      // end and the day count stays exact.
      jest.useFakeTimers().setSystemTime(new Date(2024, 5, 15, 10, 15));
      const birthDate = new Date(2020, 5, 15, 10, 15);

      const age = service.calculateAge(birthDate);

      expect(age.years).toBe(4);
      expect(age.totalMonths).toBe(48);
      // 3 common years + 2024's leap day.
      expect(age.totalDays).toBe(1461);
      expect(age.totalHours).toBe(1461 * 24);
      expect(age.totalMinutes).toBe(1461 * 24 * 60);
      expect(age.totalSeconds).toBe(1461 * 24 * 60 * 60);

      jest.useRealTimers();
    });

    it('counts every month lived in totalMonths, unlike the 0-11 months remainder', () => {
      jest.useFakeTimers().setSystemTime(new Date(2024, 5, 15, 10, 15));
      const birthDate = new Date(2022, 0, 15, 10, 15);

      const age = service.calculateAge(birthDate);

      expect(age.years).toBe(2);
      expect(age.months).toBe(5);
      expect(age.totalMonths).toBe(29);

      jest.useRealTimers();
    });

    it('counts real elapsed days across a leap day rather than assuming 365-day years', () => {
      // 2024-02-28 -> 2024-03-01 is 2 days because 2024-02-29 exists.
      jest.useFakeTimers().setSystemTime(new Date(2024, 2, 1, 12, 0));
      const birthDate = new Date(2024, 1, 28, 12, 0);

      expect(service.calculateAge(birthDate).totalDays).toBe(2);

      jest.useRealTimers();
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
