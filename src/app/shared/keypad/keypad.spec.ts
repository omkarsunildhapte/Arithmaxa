import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Keypad } from './keypad';
import { CalculatorService } from '../../../services/calculator/calculator.service';
import { CUSTOM_ELEMENTS_SCHEMA, signal } from '@angular/core';
import { Router } from '@angular/router';

describe('Keypad', () => {
  let component: Keypad;
  let fixture: ComponentFixture<Keypad>;
  let calcService: any;

  beforeEach(async () => {
    const calcSpy = {
      appendNumber: jest.fn(),
      appendDecimal: jest.fn(),
      setOperator: jest.fn(),
      calculate: jest.fn(),
      backspace: jest.fn(),
      clear: jest.fn(),
      appendBracket: jest.fn(),
      percentage: jest.fn(),
      toggleScientific: jest.fn(),
      toggleUnit: jest.fn(),
      toggleSign: jest.fn(),
      abs: jest.fn(),
      reciprocal: jest.fn(),
      e: jest.fn(),
      exp: jest.fn(),
      toggleInverse: jest.fn(),
      isScientific: signal(false),
      isRadians: signal(true),
      isInverse: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [Keypad],
      providers: [
        { provide: CalculatorService, useValue: calcSpy }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(Keypad);
    component = fixture.componentInstance;
    calcService = TestBed.inject(CalculatorService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call appendNumber via service', () => {
    component.calc.appendNumber('5');
    expect(calcService.appendNumber).toHaveBeenCalledWith('5');
  });

  it('should call toggleInverse via service', () => {
    component.calc.toggleInverse();
    expect(calcService.toggleInverse).toHaveBeenCalled();
  });

  it('should navigate to tools', () => {
    const router = TestBed.inject(Router);
    const routerSpy = jest.spyOn(router, 'navigate');
    component.goToTools();
    expect(routerSpy).toHaveBeenCalledWith(['/tools']);
  });
});
