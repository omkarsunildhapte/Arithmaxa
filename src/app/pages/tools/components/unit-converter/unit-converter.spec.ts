import { TestBed } from '@angular/core/testing';
import { UnitConverter } from './unit-converter';
import { provideIonicAngular } from '@ionic/angular/standalone';

describe('UnitConverter', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitConverter],
      providers: [
        provideIonicAngular()
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UnitConverter);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
