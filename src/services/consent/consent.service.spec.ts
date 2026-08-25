import { TestBed } from '@angular/core/testing';
import { ConsentService } from './consent.service';

describe('ConsentService', () => {
  let service: ConsentService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsentService);
  });

  it('has no consent recorded by default', () => {
    expect(service.hasConsented()).toBe(false);
    expect(service.choices()).toEqual({ essential: true, functional: false, aiProcessing: false, analytics: false });
  });

  it('acceptAll() records consent for every category', () => {
    service.acceptAll();

    expect(service.hasConsented()).toBe(true);
    expect(service.choices()).toEqual({ essential: true, functional: true, aiProcessing: true, analytics: true });
    expect(service.canUseAI()).toBe(true);
    expect(service.canUseAnalytics()).toBe(true);
  });

  it('acceptEssentialOnly() records consent with only essential enabled', () => {
    service.acceptEssentialOnly();

    expect(service.hasConsented()).toBe(true);
    expect(service.choices()).toEqual({ essential: true, functional: false, aiProcessing: false, analytics: false });
    expect(service.canUseAI()).toBe(false);
    expect(service.canUseAnalytics()).toBe(false);
  });

  it('save() forces essential to true even if passed false', () => {
    service.save({ essential: false, functional: true, aiProcessing: false, analytics: false });

    expect(service.choices().essential).toBe(true);
  });

  it('save() persists the choices to localStorage', () => {
    service.save({ essential: true, functional: true, aiProcessing: false, analytics: true });

    const stored = JSON.parse(localStorage.getItem('arithmaxa_consent_v1')!);
    expect(stored).toEqual({ essential: true, functional: true, aiProcessing: false, analytics: true });
  });

  it('reads a previously saved consent from localStorage on construction', () => {
    localStorage.setItem('arithmaxa_consent_v1', JSON.stringify({ essential: true, functional: true, aiProcessing: true, analytics: true }));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(ConsentService);

    expect(reloaded.hasConsented()).toBe(true);
    expect(reloaded.choices()).toEqual({ essential: true, functional: true, aiProcessing: true, analytics: true });
  });

  it('defaults analytics to false when loading consent saved before that category existed', () => {
    localStorage.setItem('arithmaxa_consent_v1', JSON.stringify({ essential: true, functional: true, aiProcessing: true }));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reloaded = TestBed.inject(ConsentService);

    expect(reloaded.choices()).toEqual({ essential: true, functional: true, aiProcessing: true, analytics: false });
    expect(reloaded.canUseAnalytics()).toBe(false);
  });

  it('withdraw() clears consent and resets choices to defaults', () => {
    service.acceptAll();
    service.withdraw();

    expect(service.hasConsented()).toBe(false);
    expect(service.choices()).toEqual({ essential: true, functional: false, aiProcessing: false, analytics: false });
    expect(localStorage.getItem('arithmaxa_consent_v1')).toBeNull();
  });

  it('clearAllData() removes every arithmaxa-prefixed localStorage key and withdraws consent', () => {
    service.acceptAll();
    localStorage.setItem('arithmaxa_feedback_v1', '[]');
    localStorage.setItem('unrelated_key', 'keep-me');

    service.clearAllData();

    expect(localStorage.getItem('arithmaxa_consent_v1')).toBeNull();
    expect(localStorage.getItem('arithmaxa_feedback_v1')).toBeNull();
    expect(localStorage.getItem('unrelated_key')).toBe('keep-me');
    expect(service.hasConsented()).toBe(false);
  });
});
