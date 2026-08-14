import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CookieConsent } from './cookie-consent';

describe('CookieConsent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [CookieConsent],
      providers: [provideRouter([])],
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

  it('onFunctionalChange()/onAiProcessingChange() update the corresponding signals from an ion-toggle ionChange CustomEvent', () => {
    const fixture = TestBed.createComponent(CookieConsent);

    fixture.componentInstance.onFunctionalChange(new CustomEvent('ionChange', { detail: { checked: false } }));
    expect(fixture.componentInstance.functional()).toBe(false);

    fixture.componentInstance.onAiProcessingChange(new CustomEvent('ionChange', { detail: { checked: true } }));
    expect(fixture.componentInstance.aiProcessing()).toBe(true);
  });

  it('saveCustom() saves the current functional/aiProcessing toggle state with essential always true', () => {
    const fixture = TestBed.createComponent(CookieConsent);
    fixture.componentInstance.setFunctional(true);
    fixture.componentInstance.setAiProcessing(false);

    fixture.componentInstance.saveCustom();

    const stored = JSON.parse(localStorage.getItem('arithmaxa_consent_v1')!);
    expect(stored).toEqual({ essential: true, functional: true, aiProcessing: false });
  });

  it('acceptEssentialOnly() records consent with only essential enabled', () => {
    const fixture = TestBed.createComponent(CookieConsent);
    fixture.componentInstance.acceptEssentialOnly();

    const stored = JSON.parse(localStorage.getItem('arithmaxa_consent_v1')!);
    expect(stored).toEqual({ essential: true, functional: false, aiProcessing: false });
  });
});
