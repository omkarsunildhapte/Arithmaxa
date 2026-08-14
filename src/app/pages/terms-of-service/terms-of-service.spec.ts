import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TermsOfService } from './terms-of-service';

describe('TermsOfService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TermsOfService],
      providers: [provideRouter([])],
    });
  });

  it('creates and exposes a fixed effective date', () => {
    const fixture = TestBed.createComponent(TermsOfService);
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.effectiveDate).toBe('January 1, 2025');
  });

  it('exposes the current year for the footer copyright line', () => {
    const fixture = TestBed.createComponent(TermsOfService);
    expect(fixture.componentInstance.currentYear).toBe(new Date().getFullYear());
  });
});
