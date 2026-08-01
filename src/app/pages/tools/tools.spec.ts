import { TestBed } from '@angular/core/testing';
import { Tools } from './tools';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideRouter } from '@angular/router';

describe('Tools', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tools],
      providers: [
        provideIonicAngular(),
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Tools);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
