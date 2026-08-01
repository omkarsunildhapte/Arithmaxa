import { TestBed } from '@angular/core/testing';
import { DiscountCalc } from './discount-calc';
import { provideIonicAngular } from '@ionic/angular/standalone';

describe('DiscountCalc', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiscountCalc],
      providers: [
        provideIonicAngular()
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(DiscountCalc);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
