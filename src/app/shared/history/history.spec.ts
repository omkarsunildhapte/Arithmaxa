import { ComponentFixture, TestBed } from '@angular/core/testing';
import { History } from './history';
import { CalculatorService } from '@services/calculator/calculator.service';
import { ModalController } from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, WritableSignal, signal } from '@angular/core';
import { HistoryItem } from '@appTypes/index';

describe('History', () => {
  let component: History;
  let fixture: ComponentFixture<History>;
  let mockCalc: { history: WritableSignal<HistoryItem[]>; clearHistory: jest.Mock };
  let modalCtrl: ModalController;

  beforeEach(async () => {
    mockCalc = {
      history: signal([]),
      clearHistory: jest.fn(),
    };

    const modalSpy = {
      dismiss: jest.fn().mockReturnValue(Promise.resolve()),
    };

    await TestBed.configureTestingModule({
      imports: [History, DatePipe],
      providers: [
        { provide: CalculatorService, useValue: mockCalc },
        { provide: ModalController, useValue: modalSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(History);
    component = fixture.componentInstance;
    modalCtrl = TestBed.inject(ModalController);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should dismiss modal when close is called', async () => {
    await component.close();
    expect(modalCtrl.dismiss).toHaveBeenCalled();
  });

  it('should render empty state when history is empty', () => {
    mockCalc.history.set([]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });

  it('should render list when history has items', async () => {
    const now = Date.now();
    mockCalc.history.set([
      { expression: '2+2', result: '4', timestamp: now },
      { expression: '3*3', result: '9', timestamp: now + 1 },
    ]);

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeFalsy();
    const cards = compiled.querySelectorAll('.history-card');
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('2+2');
    expect(cards[0].textContent).toContain('= 4');
  });

  it('should call clearHistory on service when clear button is clicked', () => {
    mockCalc.history.set([{ expression: '2+2', result: '4', timestamp: Date.now() }]);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('ion-button[color="danger"]') as HTMLElement | null;
    if (button) {
      button.click();
    }
    expect(mockCalc.clearHistory).toHaveBeenCalled();
  });
});
