import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FeedbackService } from './feedback.service';
import { FEEDBACK_URL } from '@constants/index';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FeedbackService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('posts the rating/category/message to the feedback endpoint', () => {
    const promise = service.submit(5, 'bug', 'Something broke');

    const req = httpMock.expectOne(FEEDBACK_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ rating: 5, category: 'bug', message: 'Something broke' });
    req.flush({ ok: true });

    return expect(promise).resolves.toBe(true);
  });

  it('trims the message and truncates it to 600 characters before sending', () => {
    const promise = service.submit(3, 'general', `  ${'x'.repeat(700)}  `);

    const req = httpMock.expectOne(FEEDBACK_URL);
    expect((req.request.body as { message: string }).message.length).toBe(600);
    req.flush({ ok: true });

    return promise;
  });

  it('resolves false when the server reports failure', () => {
    const promise = service.submit(1, 'general', 'Broken');

    httpMock.expectOne(FEEDBACK_URL).flush({ ok: false, error: 'Email service is not configured yet.' }, { status: 500, statusText: 'Server Error' });

    return expect(promise).resolves.toBe(false);
  });

  it('resolves false on a network error rather than throwing', () => {
    const promise = service.submit(1, 'general', 'Broken');

    httpMock.expectOne(FEEDBACK_URL).error(new ProgressEvent('error'));

    return expect(promise).resolves.toBe(false);
  });
});
