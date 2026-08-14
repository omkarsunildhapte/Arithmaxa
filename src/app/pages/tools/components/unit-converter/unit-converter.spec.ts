import { TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
import { UnitConverter } from './unit-converter';

describe('UnitConverter', () => {
  let modalCtrlMock: { dismiss: jest.Mock; getTop: jest.Mock };

  beforeEach(() => {
    modalCtrlMock = { dismiss: jest.fn(), getTop: jest.fn() };
    TestBed.configureTestingModule({
      imports: [UnitConverter],
      providers: [{ provide: ModalController, useValue: modalCtrlMock }],
    });
  });

  it('initializes convFrom/convTo from the `units` input once it is set (replaces the old ngOnChanges)', () => {
    const fixture = TestBed.createComponent(UnitConverter);
    fixture.componentRef.setInput('type', 'length');
    fixture.componentRef.setInput('units', [
      { value: 'm', label: 'Meters' },
      { value: 'km', label: 'Kilometers' },
    ]);
    fixture.detectChanges();

    expect(fixture.componentInstance.convFrom).toBe('m');
    expect(fixture.componentInstance.convTo).toBe('km');
  });

  it('calculates a result once units are available', () => {
    const fixture = TestBed.createComponent(UnitConverter);
    fixture.componentRef.setInput('type', 'length');
    fixture.componentRef.setInput('units', [
      { value: 'm', label: 'Meters' },
      { value: 'km', label: 'Kilometers' },
    ]);
    fixture.detectChanges();

    // convValue defaults to 1 -> 1m in km
    expect(fixture.componentInstance.convResult).toBeCloseTo(0.001);
  });

  it('recalculates when the from/to units are changed and calculate() is invoked', () => {
    const fixture = TestBed.createComponent(UnitConverter);
    fixture.componentRef.setInput('type', 'weight');
    fixture.componentRef.setInput('units', [
      { value: 'kg', label: 'Kilograms' },
      { value: 'g', label: 'Grams' },
    ]);
    fixture.detectChanges();

    fixture.componentInstance.convValue = 2;
    fixture.componentInstance.calculate();

    expect(fixture.componentInstance.convResult).toBeCloseTo(2000);
  });

  it('dismiss() closes the modal', () => {
    const fixture = TestBed.createComponent(UnitConverter);
    fixture.componentRef.setInput('units', []);
    fixture.detectChanges();

    fixture.componentInstance.dismiss();

    expect(modalCtrlMock.dismiss).toHaveBeenCalled();
  });
});
