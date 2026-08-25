import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { onboardingGuard } from './onboarding.guard';
import { OnboardingService } from '@services/onboarding/onboarding.service';

describe('onboardingGuard', () => {
  const run = () => TestBed.runInInjectionContext(() => onboardingGuard({} as never, { url: '/' } as never));

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: { createUrlTree: jest.fn(() => ({}) as UrlTree) } }],
    });
  });

  it('allows the onboarding route on a fresh install', () => {
    expect(run()).toBe(true);
  });

  it('redirects to the calculator once onboarding is completed', () => {
    TestBed.inject(OnboardingService).complete();
    const router = TestBed.inject(Router);

    expect(run()).not.toBe(true);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/arithmaxa']);
  });
});
