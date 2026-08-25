import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OnboardingService } from '@services/onboarding/onboarding.service';

/**
 * Guards the onboarding route (`''`, the Home page) so it can only ever be
 * seen once. Every later launch — or any manual nav back to `/` — lands
 * straight on the calculator instead.
 *
 * Returns a UrlTree rather than navigating imperatively so the redirect is
 * part of the same navigation, leaving no onboarding entry in history for
 * the Android back button to return to.
 */
export const onboardingGuard: CanActivateFn = () => {
  const onboarding = inject(OnboardingService);
  const router = inject(Router);

  return onboarding.completed() ? router.createUrlTree(['/arithmaxa']) : true;
};
