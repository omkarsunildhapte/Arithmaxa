import { TestBed } from '@angular/core/testing';
import { CookieConsent } from './cookie-consent';
import { ConsentService } from '@services/consent/consent.service';

describe('CookieConsent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [CookieConsent],
    });
  });

  it('is visible by default (no consent recorded yet)', () => {
    const fixture = TestBed.createComponent(CookieConsent);
    expect(fixture.componentInstance.isVisible()).toBe(true);
  });

  it('becomes hidden once consent is accepted', () => {
    const fixture = TestBed.createComponent(CookieConsent);
    fixture.componentInstance.acceptAll();
    expect(fixture.componentInstance.isVisible()).toBe(false);
  });

  it('toggleCustomize() flips the showCustomize signal', () => {
    const fixture = TestBed.createComponent(CookieConsent);
    expect(fixture.componentInstance.showCustomize()).toBe(false);
    fixture.componentInstance.toggleCustomize();
    expect(fixture.componentInstance.showCustomize()).toBe(true);
  });

  it('onFunctionalChange()/onAiProcessingChange()/onAnalyticsChange() update the corresponding signals from an ion-toggle ionChange CustomEvent', () => {
    const fixture = TestBed.createComponent(CookieConsent);

    fixture.componentInstance.onFunctionalChange(new CustomEvent('ionChange', { detail: { checked: false } }));
    expect(fixture.componentInstance.functional()).toBe(false);

    fixture.componentInstance.onAiProcessingChange(new CustomEvent('ionChange', { detail: { checked: true } }));
    expect(fixture.componentInstance.aiProcessing()).toBe(true);

    fixture.componentInstance.onAnalyticsChange(new CustomEvent('ionChange', { detail: { checked: false } }));
    expect(fixture.componentInstance.analytics()).toBe(false);
  });

  it('saveCustom() saves the current functional/aiProcessing/analytics toggle state with essential always true', () => {
    const fixture = TestBed.createComponent(CookieConsent);
    fixture.componentInstance.setFunctional(true);
    fixture.componentInstance.setAiProcessing(false);
    fixture.componentInstance.setAnalytics(false);

    fixture.componentInstance.saveCustom();

    const stored = JSON.parse(localStorage.getItem('arithmaxa_consent_v1')!);
    expect(stored).toEqual({ essential: true, functional: true, aiProcessing: false, analytics: false });
  });

  it('acceptEssentialOnly() records consent with only essential enabled', () => {
    const fixture = TestBed.createComponent(CookieConsent);
    fixture.componentInstance.acceptEssentialOnly();

    const stored = JSON.parse(localStorage.getItem('arithmaxa_consent_v1')!);
    expect(stored).toEqual({ essential: true, functional: false, aiProcessing: false, analytics: false });
  });

  // ── Reopened settings mode (Tools › Privacy Settings) ──
  // This is the only path back to the toggles and to Delete My Data after
  // the first-run gate is answered, so it carries the coverage that used to
  // sit on the in-app privacy-policy page.

  it('is shown again after consent when the sheet is reopened as settings', () => {
    const fixture = TestBed.createComponent(CookieConsent);
    const consent = TestBed.inject(ConsentService);

    fixture.componentInstance.acceptAll();
    expect(fixture.componentInstance.isVisible()).toBe(false);

    consent.openSettings();
    expect(fixture.componentInstance.isVisible()).toBe(true);
    expect(fixture.componentInstance.isSettingsMode()).toBe(true);
  });

  it('expands the toggles without a Customize tap when opened as settings', () => {
    const fixture = TestBed.createComponent(CookieConsent);
    const consent = TestBed.inject(ConsentService);

    expect(fixture.componentInstance.showToggles()).toBe(false);
    consent.openSettings();
    expect(fixture.componentInstance.showToggles()).toBe(true);
  });

  it('seeds the toggles from the saved choices when reopened, not from the first-run defaults', () => {
    const fixture = TestBed.createComponent(CookieConsent);
    const consent = TestBed.inject(ConsentService);

    // First run pre-checks everything as an opt-in default.
    expect(fixture.componentInstance.analytics()).toBe(true);

    consent.save({ essential: true, functional: true, aiProcessing: false, analytics: false });
    consent.openSettings();

    expect(fixture.componentInstance.functional()).toBe(true);
    expect(fixture.componentInstance.aiProcessing()).toBe(false);
    expect(fixture.componentInstance.analytics()).toBe(false);
  });

  it('close() dismisses the reopened settings view', () => {
    const fixture = TestBed.createComponent(CookieConsent);
    const consent = TestBed.inject(ConsentService);

    consent.save({ essential: true, functional: true, aiProcessing: true, analytics: true });
    consent.openSettings();
    fixture.componentInstance.close();

    expect(fixture.componentInstance.isSettingsMode()).toBe(false);
    expect(fixture.componentInstance.isVisible()).toBe(false);
  });

  it('saveCustom() also closes the sheet when it was opened as settings', () => {
    const fixture = TestBed.createComponent(CookieConsent);
    const consent = TestBed.inject(ConsentService);

    consent.acceptAll();
    consent.openSettings();
    fixture.componentInstance.setAnalytics(false);
    fixture.componentInstance.saveCustom();

    expect(fixture.componentInstance.isSettingsMode()).toBe(false);
    expect(JSON.parse(localStorage.getItem('arithmaxa_consent_v1')!).analytics).toBe(false);
  });

  it('clearAllData() wipes arithmaxa storage and drops back to the first-run gate once confirmed', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => undefined);

    const fixture = TestBed.createComponent(CookieConsent);
    const consent = TestBed.inject(ConsentService);

    consent.acceptAll();
    localStorage.setItem('arithmaxa_history', '[]');
    consent.openSettings();

    fixture.componentInstance.clearAllData();

    expect(localStorage.getItem('arithmaxa_consent_v1')).toBeNull();
    expect(localStorage.getItem('arithmaxa_history')).toBeNull();
    // withdraw() closed settings mode, so the sheet is back to being the
    // first-run consent gate rather than the settings view.
    expect(fixture.componentInstance.isSettingsMode()).toBe(false);
    expect(fixture.componentInstance.isVisible()).toBe(true);

    confirmSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it('clearAllData() leaves storage untouched when the confirm is dismissed', () => {
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

    const fixture = TestBed.createComponent(CookieConsent);
    TestBed.inject(ConsentService).acceptAll();

    fixture.componentInstance.clearAllData();

    expect(localStorage.getItem('arithmaxa_consent_v1')).not.toBeNull();
    confirmSpy.mockRestore();
  });
});
