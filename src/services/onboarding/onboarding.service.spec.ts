import { TestBed } from '@angular/core/testing';
import { OnboardingService } from './onboarding.service';

describe('OnboardingService', () => {
  let service: OnboardingService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnboardingService);
  });

  it('treats a fresh install as not yet onboarded', () => {
    expect(service.completed()).toBe(false);
  });

  it('complete() persists the flag to localStorage', () => {
    service.complete();

    expect(service.completed()).toBe(true);
    expect(localStorage.getItem('arithmaxa_onboarding_v1')).toBe('true');
  });

  it('stays completed across a reload — onboarding is once per install', () => {
    service.complete();

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(OnboardingService);

    expect(reloaded.completed()).toBe(true);
  });

  it('reset() clears the flag so onboarding shows again', () => {
    service.complete();
    service.reset();

    expect(service.completed()).toBe(false);
    expect(localStorage.getItem('arithmaxa_onboarding_v1')).toBeNull();
  });
});
