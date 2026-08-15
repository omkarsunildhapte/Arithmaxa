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
    expect(component.birthDate).toBeTruthy();
    expect(component.dateError()).toBeNull();
    expect(component.ageResult()?.years).toBe(10);
  });

  it('rejects a future birth date without producing a result', () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    component.birthDate = future.toLocaleDateString('en-CA');

    component.calculate();

    expect(component.dateError()).toBe('Birth date cannot be in the future.');
    expect(component.ageResult()).toBeNull();
  });

  it('computes a result and clears any previous error for a valid past birth date', () => {
    component.dateError.set('stale error');
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    component.birthDate = tenYearsAgo.toLocaleDateString('en-CA');

    component.calculate();

    expect(component.dateError()).toBeNull();
    expect(component.ageResult()?.years).toBe(10);
  });

  it('clears both result and error when the date is removed', () => {
    component.ageResult.set({ years: 1, months: 0, days: 0, hours: 0, minutes: 0 });
    component.dateError.set('stale error');
    component.birthDate = '';

    component.calculate();

    expect(component.ageResult()).toBeNull();
    expect(component.dateError()).toBeNull();
  });
});
