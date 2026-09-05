import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { IonIcon, IonButton, IonToggle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { shieldCheckmarkOutline, trashOutline } from 'ionicons/icons';
import { ConsentService } from '@services/consent/consent.service';
import { ConsentChoices } from '@appTypes/index';
import { CLEAR_DATA_CONFIRM_MESSAGE, CLEAR_DATA_DONE_MESSAGE, PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL } from '@constants/index';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [IonIcon, IonButton, IonToggle],
  templateUrl: './cookie-consent.html',
  styleUrls: ['./cookie-consent.css'],
})
export class CookieConsent {
  private consent = inject(ConsentService);

  /** Shown either as the first-run consent gate, or on demand once the user
   *  reopens it from Tools › Privacy Settings — this is the only surface in
   *  the app for reviewing consent and deleting local data, since the legal
   *  pages themselves now live on arithmaxa-website. */
  readonly isVisible = computed(() => !this.consent.hasConsented() || this.consent.settingsOpen());
  readonly isSettingsMode = this.consent.settingsOpen;

  readonly showCustomize = signal(false);

  /** Reopened deliberately from Tools, the toggles *are* the content — there
   *  is no "should I customize?" step to walk through first. */
  readonly showToggles = computed(() => this.showCustomize() || this.isSettingsMode());

  readonly privacyPolicyUrl = PRIVACY_POLICY_URL;
  readonly termsOfServiceUrl = TERMS_OF_SERVICE_URL;

  // linkedSignal, not signal: reopening the sheet must show what the user
  // actually saved last time, and re-seed again if those saved choices
  // change underneath (e.g. a Delete My Data that resets them all).
  // Before any consent exists there is nothing to reflect, so the first-run
  // sheet keeps its original pre-checked opt-in defaults.
  readonly functional = linkedSignal(() => (this.consent.hasConsented() ? this.consent.choices().functional : true));
  readonly aiProcessing = linkedSignal(() => (this.consent.hasConsented() ? this.consent.choices().aiProcessing : true));
  readonly analytics = linkedSignal(() => (this.consent.hasConsented() ? this.consent.choices().analytics : true));

  constructor() {
    addIcons({ shieldCheckmarkOutline, trashOutline });
  }

  toggleCustomize(): void {
    this.showCustomize.update((v) => !v);
  }

  setFunctional(checked: boolean): void {
    this.functional.set(checked);
  }

  setAiProcessing(checked: boolean): void {
    this.aiProcessing.set(checked);
  }

  setAnalytics(checked: boolean): void {
    this.analytics.set(checked);
  }

  onFunctionalChange(event: Event): void {
    const custom = event as CustomEvent<{ checked: boolean }>;
    this.setFunctional(custom.detail.checked);
  }

  onAiProcessingChange(event: Event): void {
    const custom = event as CustomEvent<{ checked: boolean }>;
    this.setAiProcessing(custom.detail.checked);
  }

  onAnalyticsChange(event: Event): void {
    const custom = event as CustomEvent<{ checked: boolean }>;
    this.setAnalytics(custom.detail.checked);
  }

  acceptAll(): void {
    this.consent.acceptAll();
  }

  acceptEssentialOnly(): void {
    this.consent.acceptEssentialOnly();
  }

  saveCustom(): void {
    const choices: ConsentChoices = {
      essential: true,
      functional: this.functional(),
      aiProcessing: this.aiProcessing(),
      analytics: this.analytics(),
    };
    this.consent.save(choices);
    this.close();
  }

  /** Dismisses the reopened settings view. No-op during the first-run gate,
   *  where `isVisible()` is driven by `hasConsented()` instead. */
  close(): void {
    this.consent.closeSettings();
  }

  clearAllData(): void {
    if (confirm(CLEAR_DATA_CONFIRM_MESSAGE)) {
      // Wipes storage and withdraws consent, which closes settings mode and
      // drops the sheet back to being the first-run consent gate.
      this.consent.clearAllData();
      alert(CLEAR_DATA_DONE_MESSAGE);
    }
  }
}
