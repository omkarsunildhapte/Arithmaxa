import { TestBed } from '@angular/core/testing';
import { AgeCalc } from './age-calc';
import { provideIonicAngular } from '@ionic/angular/standalone';

describe('AgeCalc', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgeCalc],
      providers: [
        provideIonicAngular()
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AgeCalc);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
