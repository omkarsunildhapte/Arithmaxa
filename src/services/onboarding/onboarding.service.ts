import { Service, signal } from '@angular/core';

/**
 * Remembers, for the lifetime of the install, that the user has already
 * been through the home page's onboarding carousel — so it's a genuine
 * first-run-only screen instead of the landing page every cold start.
 *
 * localStorage is the store (same choice as ConsentService, and it
 * survives app restarts on both web and the Capacitor WebView). The key is
 * `arithmaxa`-prefixed on purpose: ConsentService.clearAllData() wipes
 * every such key, so a user who explicitly erases their data gets the
 * onboarding again, which is the intended reset path.
 */
@Service()
export class OnboardingService {
  private readonly KEY = 'arithmaxa_onboarding_v1';

  /** True once the user has finished or skipped onboarding. */
  readonly completed = signal<boolean>(false);

  constructor() {
    this.completed.set(this.read());
  }

  /** Marks onboarding as done. Idempotent — safe to call on every exit
   *  path (Skip, Explore Now, or a direct nav away). */
  complete(): void {
    if (this.completed()) return;
    try {
      localStorage.setItem(this.KEY, 'true');
    } catch {
      /* private-mode / quota — the in-memory signal still holds for this run */
    }
    this.completed.set(true);
  }

  /** Clears the flag so onboarding shows again on the next visit. */
  reset(): void {
    try {
      localStorage.removeItem(this.KEY);
    } catch {
      /* ignore */
    }
    this.completed.set(false);
  }

  private read(): boolean {
    try {
      return localStorage.getItem(this.KEY) === 'true';
    } catch {
      return false;
    }
  }
}
