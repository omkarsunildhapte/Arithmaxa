import { TestBed } from '@angular/core/testing';
import { Tools } from './tools';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { provideRouter } from '@angular/router';
import { ConsentService } from '@services/consent/consent.service';

describe('Tools', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tools],
      providers: [provideIonicAngular(), provideRouter([])],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(Tools);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('openPrivacySettings() reopens the consent sheet — the footer link is the only way back to the privacy toggles and Delete My Data once onboarding is done', () => {
    const fixture = TestBed.createComponent(Tools);
    const consent = TestBed.inject(ConsentService);

    expect(consent.settingsOpen()).toBe(false);
    fixture.componentInstance.openPrivacySettings();
    expect(consent.settingsOpen()).toBe(true);
  });
});
