import { TestBed } from '@angular/core/testing';
import { PercentageCalc } from './percentage-calc';
import { provideIonicAngular } from '@ionic/angular/standalone';

describe('PercentageCalc', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PercentageCalc],
      providers: [provideIonicAngular()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(PercentageCalc);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
