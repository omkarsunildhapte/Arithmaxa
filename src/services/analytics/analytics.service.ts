import { Service, inject, effect } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FirebaseAnalytics, ConsentType, ConsentStatus } from '@capacitor-firebase/analytics';
import { ConsentService } from '@services/consent/consent.service';

/**
 * Thin, consent-gated wrapper around Firebase Analytics.
 *
 * Native only (Android/iOS): the plugin bridges straight to the native
 * Firebase SDK, which reads its config from google-services.json — no JS
 * `initializeApp()` needed. On web there's no Firebase *web app* registered
 * yet (google-services.json only has an Android client), so calling the
 * plugin there would throw trying to resolve a default Firebase app; this
 * service simply no-ops on web until that's set up.
 *
 * Gated on ConsentService.canUseAnalytics — off by default, matching the
 * privacy policy's "off by default" promise. Both directions are handled:
 * granting consent enables collection going forward, and withdrawing it
 * disables collection AND clears any analytics data already gathered for
 * this install (resetAnalyticsData), not just stops new events.
 */
@Service()
export class AnalyticsService {
  private readonly consent = inject(ConsentService);
  private readonly isSupported = Capacitor.isNativePlatform();
  private initialized = false;

  constructor() {
    if (!this.isSupported) return;

    effect(() => {
      const granted = this.consent.canUseAnalytics();
      void this.syncConsent(granted);
    });
  }

  /** Logs an event — no-ops silently if unsupported (web) or the user
   *  hasn't opted into analytics. Never throws into caller code; a
   *  failed analytics call should never break app functionality. */
  logEvent(name: string, params?: Record<string, unknown>): void {
    if (!this.isSupported || !this.consent.canUseAnalytics()) return;
    FirebaseAnalytics.logEvent({ name, params }).catch((err) => console.warn('[Analytics] logEvent failed', err));
  }

  setCurrentScreen(screenName: string): void {
    if (!this.isSupported || !this.consent.canUseAnalytics()) return;
    FirebaseAnalytics.setCurrentScreen({ screenName }).catch((err) => console.warn('[Analytics] setCurrentScreen failed', err));
  }

  private async syncConsent(granted: boolean): Promise<void> {
    try {
      await FirebaseAnalytics.setEnabled({ enabled: granted });
      await FirebaseAnalytics.setConsent({
        type: ConsentType.AnalyticsStorage,
        status: granted ? ConsentStatus.Granted : ConsentStatus.Denied,
      });

      if (!granted && this.initialized) {
        // Only clear on an actual grant → revoke transition, not on the
        // very first run where the default is already "denied" — nothing
        // to reset yet, and resetAnalyticsData() also drops the app
        // instance id, which would be pointless churn on first launch.
        await FirebaseAnalytics.resetAnalyticsData();
      }
      this.initialized = true;
    } catch (err) {
      console.warn('[Analytics] consent sync failed', err);
    }
  }
}
