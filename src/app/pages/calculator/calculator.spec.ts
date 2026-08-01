import { TestBed } from '@angular/core/testing';
import { Calculator } from './calculator';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideRouter } from '@angular/router';

describe('Calculator', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Calculator],
      providers: [
        provideIonicAngular(),
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Calculator);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
