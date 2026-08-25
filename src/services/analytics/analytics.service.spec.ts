import { TestBed } from '@angular/core/testing';
import { AnalyticsService } from './analytics.service';
import { ConsentService } from '@services/consent/consent.service';
import { Capacitor } from '@capacitor/core';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';

jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: jest.fn(),
  },
}));

jest.mock('@capacitor-firebase/analytics', () => ({
  // Real enums, not pulled via requireActual — the actual module's
  // registerPlugin() call needs a real @capacitor/core, which is mocked
  // above to just { isNativePlatform }.
  ConsentType: { AnalyticsStorage: 'ANALYTICS_STORAGE' },
  ConsentStatus: { Granted: 'GRANTED', Denied: 'DENIED' },
  FirebaseAnalytics: {
    logEvent: jest.fn().mockResolvedValue(undefined),
    setCurrentScreen: jest.fn().mockResolvedValue(undefined),
    setEnabled: jest.fn().mockResolvedValue(undefined),
    setConsent: jest.fn().mockResolvedValue(undefined),
    resetAnalyticsData: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('AnalyticsService', () => {
  let consent: ConsentService;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  function setup(isNative: boolean): AnalyticsService {
    jest.mocked(Capacitor.isNativePlatform).mockReturnValue(isNative);
    TestBed.configureTestingModule({});
    consent = TestBed.inject(ConsentService);
    return TestBed.inject(AnalyticsService);
  }

  it('never calls the plugin on web (unsupported — no Firebase web app registered)', () => {
    const analytics = setup(false);

    analytics.logEvent('calculation_performed');
    analytics.setCurrentScreen('calculator');

    expect(FirebaseAnalytics.logEvent).not.toHaveBeenCalled();
    expect(FirebaseAnalytics.setCurrentScreen).not.toHaveBeenCalled();
    expect(FirebaseAnalytics.setEnabled).not.toHaveBeenCalled();
  });

  it('does not log events when the user has not consented to analytics', () => {
    const analytics = setup(true);

    analytics.logEvent('calculation_performed');

    expect(FirebaseAnalytics.logEvent).not.toHaveBeenCalled();
  });

  it('logs events once the user has consented to analytics', () => {
    const analytics = setup(true);
    consent.acceptAll();

    analytics.logEvent('calculation_performed', { foo: 'bar' });

    expect(FirebaseAnalytics.logEvent).toHaveBeenCalledWith({ name: 'calculation_performed', params: { foo: 'bar' } });
  });

  // syncConsent() chains several `await`s (setEnabled, then setConsent,
  // then optionally resetAnalyticsData) — flushing microtasks via a
  // macrotask boundary (setTimeout) drains all of them regardless of how
  // many awaits deep the chain is, unlike a fixed number of
  // `await Promise.resolve()` calls.
  function flushMicrotasks(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  it('syncs setEnabled/setConsent to true when consent is granted, on native only', async () => {
    setup(true);
    consent.acceptAll();
    TestBed.flushEffects();
    await flushMicrotasks();

    expect(FirebaseAnalytics.setEnabled).toHaveBeenCalledWith({ enabled: true });
    expect(FirebaseAnalytics.setConsent).toHaveBeenCalledWith({ type: 'ANALYTICS_STORAGE', status: 'GRANTED' });
  });

  it('syncs setEnabled/setConsent to false and resets data when consent is withdrawn after being granted', async () => {
    setup(true);
    consent.acceptAll();
    TestBed.flushEffects();
    await flushMicrotasks();
    jest.clearAllMocks();

    consent.acceptEssentialOnly();
    TestBed.flushEffects();
    await flushMicrotasks();

    expect(FirebaseAnalytics.setEnabled).toHaveBeenCalledWith({ enabled: false });
    expect(FirebaseAnalytics.setConsent).toHaveBeenCalledWith({ type: 'ANALYTICS_STORAGE', status: 'DENIED' });
    expect(FirebaseAnalytics.resetAnalyticsData).toHaveBeenCalled();
  });
});
