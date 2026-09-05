import { Service, inject, signal, computed } from '@angular/core';
import { Platform } from '@ionic/angular/standalone';
import { ConsentChoices } from '@appTypes/index';

@Service()
export class ConsentService {
  private readonly platform = inject(Platform);
  private readonly KEY = 'arithmaxa_consent_v1';

  readonly hasConsented = signal<boolean>(false);
  readonly choices = signal<ConsentChoices>({
    essential: true,
    functional: false,
    aiProcessing: false,
    analytics: false,
  });
  readonly canUseAI = computed(() => this.choices().aiProcessing);
  readonly canUseAnalytics = computed(() => this.choices().analytics);

  /** Lets the consent sheet be reopened after the first-run decision.
   *  CookieConsent otherwise renders only while `hasConsented()` is false,
   *  so once the user taps Accept All the privacy toggles and the
   *  "Delete My Data" control inside it would be unreachable for the rest
   *  of the install's life. The Tools page's "Privacy Settings" link flips
   *  this instead of routing anywhere — the two legal documents themselves
   *  now live on arithmaxa-website, not in the app. */
  private readonly _settingsOpen = signal(false);
  readonly settingsOpen = this._settingsOpen.asReadonly();

  openSettings(): void {
    this._settingsOpen.set(true);
  }

  closeSettings(): void {
    this._settingsOpen.set(false);
  }

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ConsentChoices>;
        // Older stored consent (from before the `analytics` category
        // existed) won't have that field — default it to false rather
        // than leaving it `undefined`, so an existing user isn't silently
        // opted into a data-sharing category they never saw or agreed to.
        this.choices.set({
          essential: true,
          functional: parsed.functional ?? false,
          aiProcessing: parsed.aiProcessing ?? false,
          analytics: parsed.analytics ?? false,
        });
        this.hasConsented.set(true);
      }
    } catch {
      /* ignore parse errors */
    }
  }

  acceptAll(): void {
    this.save({ essential: true, functional: true, aiProcessing: true, analytics: true });
  }

  acceptEssentialOnly(): void {
    this.save({ essential: true, functional: false, aiProcessing: false, analytics: false });
  }

  save(choices: ConsentChoices): void {
    const safe: ConsentChoices = { ...choices, essential: true };
    localStorage.setItem(this.KEY, JSON.stringify(safe));
    this.choices.set(safe);
    this.hasConsented.set(true);
    void this.syncConsentCookie(safe);
  }

  withdraw(): void {
    localStorage.removeItem(this.KEY);
    this.hasConsented.set(false);
    // Back to a clean slate: the sheet must reappear as the first-run
    // consent gate, not as the reopened settings view it may have been
    // shown as a moment ago.
    this._settingsOpen.set(false);
    this.choices.set({ essential: true, functional: false, aiProcessing: false, analytics: false });
    void this.deleteConsentCookie();
  }

  clearAllData(): void {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('arithmaxa'));
    keys.forEach((k) => localStorage.removeItem(k));
    this.withdraw();
    void this.clearAllConsentCookies();
  }

  // localStorage (above) is the cross-platform source of truth — these
  // just keep a real native cookie in sync with it on hybrid platforms,
  // via CapacitorCookies (bundled with @capacitor/core, enabled in
  // capacitor.config.ts), so a "cookie consent" decision is genuinely
  // backed by a cookie, not only local storage.

  private async syncConsentCookie(choices: ConsentChoices): Promise<void> {
    try {
      if (this.platform.is('hybrid')) {
        const { CapacitorCookies } = await import('@capacitor/core');
        await CapacitorCookies.setCookie({ key: this.KEY, value: JSON.stringify(choices) });
      }
    } catch {
      console.warn('CapacitorCookies plugin not found or failed to sync consent cookie');
    }
  }

  private async deleteConsentCookie(): Promise<void> {
    try {
      if (this.platform.is('hybrid')) {
        const { CapacitorCookies } = await import('@capacitor/core');
        await CapacitorCookies.deleteCookie({ key: this.KEY });
      }
    } catch {
      console.warn('CapacitorCookies plugin not found or failed to delete consent cookie');
    }
  }

  private async clearAllConsentCookies(): Promise<void> {
    try {
      if (this.platform.is('hybrid')) {
        const { CapacitorCookies } = await import('@capacitor/core');
        await CapacitorCookies.clearAllCookies();
      }
    } catch {
      console.warn('CapacitorCookies plugin not found or failed to clear cookies');
    }
  }
}
