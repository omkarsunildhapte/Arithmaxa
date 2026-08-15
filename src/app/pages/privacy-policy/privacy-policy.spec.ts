import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PrivacyPolicy } from './privacy-policy';
import { ConsentService } from '@services/consent/consent.service';
import { LEGAL_LAST_UPDATED } from '@constants/index';

describe('PrivacyPolicy', () => {
  let consentServiceMock: { clearAllData: jest.Mock };

  beforeEach(() => {
    consentServiceMock = { clearAllData: jest.fn() };
    TestBed.configureTestingModule({
      imports: [PrivacyPolicy],
      providers: [provideRouter([]), { provide: ConsentService, useValue: consentServiceMock }],
    });
  });

  it('creates and exposes a fixed last-updated date', () => {
    const fixture = TestBed.createComponent(PrivacyPolicy);
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.lastUpdated).toBe(LEGAL_LAST_UPDATED);
  });

  it('clearAllData() clears consent data when the user confirms', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    jest.spyOn(window, 'alert').mockImplementation(() => {});
    const fixture = TestBed.createComponent(PrivacyPolicy);

    fixture.componentInstance.clearAllData();

    expect(consentServiceMock.clearAllData).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  it('clearAllData() does nothing when the user cancels the confirmation', () => {
    jest.spyOn(window, 'confirm').mockReturnValue(false);
    const fixture = TestBed.createComponent(PrivacyPolicy);

    fixture.componentInstance.clearAllData();

    expect(consentServiceMock.clearAllData).not.toHaveBeenCalled();
  });
});
