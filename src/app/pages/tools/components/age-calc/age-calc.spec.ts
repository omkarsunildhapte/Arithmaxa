import { TestBed } from '@angular/core/testing';
import { AgeCalc } from './age-calc';
import { provideIonicAngular } from '@ionic/angular/standalone';

describe('AgeCalc', () => {
  let component: AgeCalc;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgeCalc],
      providers: [provideIonicAngular()],
    }).compileComponents();

    component = TestBed.createComponent(AgeCalc).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to a birth date 10 years ago with a result already computed', () => {
    expect(component.birthDate()).toBeTruthy();
    expect(component.dateError()).toBeNull();
    expect(component.ageResult()?.years).toBe(10);
  });

  it('exposes the single-unit totals the result card renders, consistent with the years figure', () => {
    const age = component.ageResult();

    expect(age).not.toBeNull();
    expect(age!.totalMonths).toBe(age!.years * 12);
    expect(age!.totalDays).toBeGreaterThan(age!.years * 365);
    // Each total floors independently, so totalSeconds keeps the 0-59
    // seconds that totalMinutes drops rather than being an exact multiple.
    expect(Math.floor(age!.totalSeconds / 60)).toBe(age!.totalMinutes);
  });

  it('builds one totals tile per configured unit, in order, with seconds taking the full row', () => {
    const totals = component.ageTotals();

    expect(totals.map((t) => t.id)).toEqual(['months', 'days', 'hours', 'minutes', 'seconds']);
    expect(totals.map((t) => t.fullWidth)).toEqual([false, false, false, false, true]);

    const age = component.ageResult()!;
    expect(totals.map((t) => t.value)).toEqual([age.totalMonths, age.totalDays, age.totalHours, age.totalMinutes, age.totalSeconds]);
  });

  it('empties the totals tiles when there is no result to render', () => {
    component.birthDate.set('');
    component.calculate();

    expect(component.ageResult()).toBeNull();
    expect(component.ageTotals()).toEqual([]);
  });

  it('reports a whole-year age in the early hours, not one year short', () => {
    // Regression: 00:05 local is before the UTC offset in any timezone ahead
    // of UTC, which is exactly when the old UTC-midnight parse read the birth
    // instant as later in the day than "now" and borrowed a year away.
    jest.useFakeTimers().setSystemTime(new Date(2026, 8, 6, 0, 5));

    component.birthDate.set('2016-09-06');
    component.calculate();

    expect(component.ageResult()?.years).toBe(10);
    expect(component.ageResult()?.months).toBe(0);
    expect(component.ageResult()?.days).toBe(0);

    jest.useRealTimers();
  });

  it('rejects a future birth date without producing a result', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    component.birthDate.set(future.toLocaleDateString('en-CA'));

    component.calculate();

    expect(component.dateError()).toBe('Birth date cannot be in the future.');
    expect(component.ageResult()).toBeNull();
  });

  it('computes a result and clears any previous error for a valid past birth date', () => {
    component.dateError.set('stale error');
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    component.birthDate.set(tenYearsAgo.toLocaleDateString('en-CA'));

    component.calculate();

    expect(component.dateError()).toBeNull();
    expect(component.ageResult()?.years).toBe(10);
  });

  it('clears both result and error when the date is removed', () => {
    component.ageResult.set({ years: 1, months: 0, days: 0, hours: 0, minutes: 0 });
    component.dateError.set('stale error');
    component.birthDate.set('');

    component.calculate();

    expect(component.ageResult()).toBeNull();
    expect(component.dateError()).toBeNull();
  });
});
