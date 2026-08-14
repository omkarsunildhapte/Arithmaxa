import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ModalController } from '@ionic/angular/standalone';
import { CurrencyConverter } from './currency-converter';

describe('CurrencyConverter', () => {
  let httpMock: HttpTestingController;
  let modalCtrlMock: { dismiss: jest.Mock };

  beforeEach(() => {
    modalCtrlMock = { dismiss: jest.fn() };
    TestBed.configureTestingModule({
      imports: [CurrencyConverter],
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: ModalController, useValue: modalCtrlMock }],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('shows a loading state and fetches rates on creation', () => {
    const fixture = TestBed.createComponent(CurrencyConverter);
    fixture.detectChanges();

    expect(fixture.componentInstance.loading()).toBe(true);
    httpMock.expectOne('https://open.er-api.com/v6/latest/USD').flush({ result: 'success', base_code: 'USD', rates: { USD: 1, INR: 83 } });
  });

  it('computes the converted result once rates arrive', async () => {
    const fixture = TestBed.createComponent(CurrencyConverter);
    fixture.detectChanges();
    httpMock.expectOne('https://open.er-api.com/v6/latest/USD').flush({ result: 'success', base_code: 'USD', rates: { USD: 1, INR: 83 } });
    await fixture.whenStable();

    expect(fixture.componentInstance.loading()).toBe(false);
    expect(fixture.componentInstance.result()).toBeCloseTo(83);
    expect(fixture.componentInstance.lastUpdated()).not.toBeNull();
  });

  it('sets a user-facing error message when the fetch fails, and retry() reloads it', async () => {
    const fixture = TestBed.createComponent(CurrencyConverter);
    fixture.detectChanges();
    httpMock.expectOne('https://open.er-api.com/v6/latest/USD').flush('fail', {
      status: 500,
      statusText: 'Server Error',
    });
    await fixture.whenStable();

    expect(fixture.componentInstance.error()).toBe('Could not fetch live rates. Check your connection and try again.');

    fixture.componentInstance.retry();
    fixture.detectChanges();
    httpMock.expectOne('https://open.er-api.com/v6/latest/USD').flush({ result: 'success', base_code: 'USD', rates: { USD: 1, INR: 83 } });
    await fixture.whenStable();

    expect(fixture.componentInstance.error()).toBeNull();
    expect(fixture.componentInstance.result()).toBeCloseTo(83);
  });

  it('dismiss() closes the modal', async () => {
    const fixture = TestBed.createComponent(CurrencyConverter);
    fixture.detectChanges();
    httpMock.expectOne('https://open.er-api.com/v6/latest/USD').flush({ result: 'success', base_code: 'USD', rates: { USD: 1, INR: 83 } });
    await fixture.whenStable();

    fixture.componentInstance.dismiss();

    expect(modalCtrlMock.dismiss).toHaveBeenCalled();
  });
});
