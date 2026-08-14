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
  });
  readonly canUseAI = computed(() => this.choices().aiProcessing);

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ConsentChoices;
        this.choices.set({ ...parsed, essential: true });
        this.hasConsented.set(true);
      }
    } catch {
      /* ignore parse errors */
    }
  }

  acceptAll(): void {
    this.save({ essential: true, functional: true, aiProcessing: true });
  }

  acceptEssentialOnly(): void {
    this.save({ essential: true, functional: false, aiProcessing: false });
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
    this.choices.set({ essential: true, functional: false, aiProcessing: false });
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
