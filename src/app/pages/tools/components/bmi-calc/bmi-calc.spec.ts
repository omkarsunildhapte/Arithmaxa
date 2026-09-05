import { TestBed } from '@angular/core/testing';
import { BmiCalc } from './bmi-calc';
import { provideIonicAngular } from '@ionic/angular/standalone';

describe('BmiCalc', () => {
  let component: BmiCalc;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BmiCalc],
      providers: [provideIonicAngular()],
    }).compileComponents();

    component = TestBed.createComponent(BmiCalc).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('computes BMI directly from meters when unit is "meters"', () => {
    component.switchUnit('meters');
    component.weightKg.set(70);
    component.heightM.set(1.75);

    component.calculate();

    // 70 / 1.75^2 = 22.857...
    expect(component.bmiResult()?.bmi).toBeCloseTo(22.86, 1);
    expect(component.bmiResult()?.category).toBe('Normal');
  });

  it('does not compute a result for "meters" until both fields are filled', () => {
    component.switchUnit('meters');
    component.weightKg.set(70);
    component.heightM.set(null);

    component.calculate();

    expect(component.bmiResult()).toBeNull();
  });

  it('computes BMI for the default "metric" unit (kg/cm)', () => {
    component.weightKg.set(70);
    component.heightCm.set(175);

    component.calculate();

    // 70 / 1.75^2 = 22.857...
    expect(component.bmiResult()?.bmi).toBeCloseTo(22.86, 1);
    expect(component.bmiResult()?.category).toBe('Normal');
  });

  it('does not compute a result for "metric" until both fields are filled', () => {
    component.weightKg.set(70);
    component.heightCm.set(null);

    component.calculate();

    expect(component.bmiResult()).toBeNull();
  });

  it('computes BMI for "imperial" (lbs/ft+in), converting to metric first', () => {
    component.switchUnit('imperial');
    component.weightLbs.set(154);
    component.heightFt.set(5);
    component.heightIn.set(9);

    component.calculate();

    // 69in -> 1.7526m, 154lbs -> 69.853kg -> bmi ≈ 22.74
    expect(component.bmiResult()?.bmi).toBeCloseTo(22.74, 1);
    expect(component.bmiResult()?.category).toBe('Normal');
  });

  it('treats a missing inches value as 0 for "imperial"', () => {
    component.switchUnit('imperial');
    component.weightLbs.set(154);
    component.heightFt.set(6);
    component.heightIn.set(null);

    component.calculate();

    // 72in -> 1.8288m, 154lbs -> 69.853kg -> bmi ≈ 20.88
    expect(component.bmiResult()?.bmi).toBeCloseTo(20.88, 1);
  });

  it('does not compute a result for "imperial" until weight and feet are filled', () => {
    component.switchUnit('imperial');
    component.weightLbs.set(154);
    component.heightFt.set(null);

    component.calculate();

    expect(component.bmiResult()).toBeNull();
  });

  it('classifies a BMI at each category boundary correctly', () => {
    // calculateBmi's own boundaries are covered in tools.service.spec.ts;
    // this just confirms the component wires weightKg/heightCm through to
    // it unmodified rather than duplicating the boundary math here.
    component.weightKg.set(45);
    component.heightCm.set(180); // bmi ≈ 13.9 -> Underweight
    component.calculate();
    expect(component.bmiResult()?.category).toBe('Underweight');

    component.weightKg.set(100);
    component.heightCm.set(180); // bmi ≈ 30.9 -> Obese
    component.calculate();
    expect(component.bmiResult()?.category).toBe('Obese');
  });

  it('clears the previous result when switching units', () => {
    component.weightKg.set(70);
    component.heightCm.set(175);
    component.calculate();
    expect(component.bmiResult()).not.toBeNull();

    component.switchUnit('imperial');

    expect(component.bmiResult()).toBeNull();
  });
});
