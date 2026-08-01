import { TestBed } from '@angular/core/testing';
import { CurrencyConverter } from './currency-converter';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient } from '@angular/common/http';

describe('CurrencyConverter', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrencyConverter],
      providers: [
        provideIonicAngular(),
        provideHttpClient()
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CurrencyConverter);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
