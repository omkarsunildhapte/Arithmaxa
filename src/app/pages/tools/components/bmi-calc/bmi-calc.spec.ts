import { TestBed } from '@angular/core/testing';
import { BmiCalc } from './bmi-calc';
import { provideIonicAngular } from '@ionic/angular/standalone';

describe('BmiCalc', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BmiCalc],
      providers: [provideIonicAngular()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(BmiCalc);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
