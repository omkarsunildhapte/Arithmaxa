import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Display } from './display';
import { CalculatorService } from '@services/calculator/calculator.service';
import { signal } from '@angular/core';

describe('Display', () => {
  let component: Display;
  let fixture: ComponentFixture<Display>;

  beforeEach(async () => {
    const calcSpy = {
      display: signal('42'),
      expression: signal('40+2'),
    };

    await TestBed.configureTestingModule({
      imports: [Display],
      providers: [{ provide: CalculatorService, useValue: calcSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(Display);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the current calculation from service', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.main-display')?.textContent).toContain('42');
    expect(compiled.querySelector('.history-display')?.textContent).toContain('40+2');
  });
});
