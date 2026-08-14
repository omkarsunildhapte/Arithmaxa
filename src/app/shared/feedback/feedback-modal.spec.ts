import { TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular/standalone';
import { FeedbackModal } from './feedback-modal';
import { FeedbackService } from '@services/feedback/feedback.service';

describe('FeedbackModal', () => {
  let modalCtrlMock: { dismiss: jest.Mock };
  let feedbackServiceMock: { submit: jest.Mock };

  beforeEach(() => {
    modalCtrlMock = { dismiss: jest.fn() };
    feedbackServiceMock = { submit: jest.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      imports: [FeedbackModal],
      providers: [
        { provide: ModalController, useValue: modalCtrlMock },
        { provide: FeedbackService, useValue: feedbackServiceMock },
      ],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('setRating()/setHover()/isStarFilled() drive the star display', () => {
    const fixture = TestBed.createComponent(FeedbackModal);
    const c = fixture.componentInstance;

    c.setRating(3);
    expect(c.isStarFilled(1)).toBe(true);
    expect(c.isStarFilled(3)).toBe(true);
    expect(c.isStarFilled(4)).toBe(false);

    c.setHover(5);
    expect(c.isStarFilled(5)).toBe(true); // hover takes priority while active
    c.clearHover();
    expect(c.isStarFilled(5)).toBe(false); // falls back to the committed rating
  });

  it('setCategory() updates the selected category', () => {
    const fixture = TestBed.createComponent(FeedbackModal);
    fixture.componentInstance.setCategory('bug');
    expect(fixture.componentInstance.category()).toBe('bug');
  });

  describe('canSubmit()', () => {
    it('is false with no rating even if the message is long enough', () => {
      const fixture = TestBed.createComponent(FeedbackModal);
      fixture.componentInstance.setMessage('This is plenty long.');
      expect(fixture.componentInstance.canSubmit()).toBe(false);
    });

    it('is false with a rating but too short a message', () => {
      const fixture = TestBed.createComponent(FeedbackModal);
      fixture.componentInstance.setRating(4);
      fixture.componentInstance.setMessage('hi');
      expect(fixture.componentInstance.canSubmit()).toBe(false);
    });

    it('is true with a rating and a message of at least 5 characters', () => {
      const fixture = TestBed.createComponent(FeedbackModal);
      fixture.componentInstance.setRating(4);
      fixture.componentInstance.setMessage('Loved it!');
      expect(fixture.componentInstance.canSubmit()).toBe(true);
    });
  });

  it('onMessageInput() extracts the value from an ion-textarea ionInput CustomEvent and sets it', () => {
    const fixture = TestBed.createComponent(FeedbackModal);
    const event = new CustomEvent('ionInput', { detail: { value: 'typed feedback' } });

    fixture.componentInstance.onMessageInput(event);

    expect(fixture.componentInstance.message()).toBe('typed feedback');
  });

  it('submit() does nothing when canSubmit() is false', async () => {
    const fixture = TestBed.createComponent(FeedbackModal);
    await fixture.componentInstance.submit();
    expect(feedbackServiceMock.submit).not.toHaveBeenCalled();
  });

  it('submit() sends the feedback, then shows a submitted state, then auto-closes', async () => {
    jest.useFakeTimers();
    const fixture = TestBed.createComponent(FeedbackModal);
    const c = fixture.componentInstance;
    c.setRating(5);
    c.setCategory('feature');
    c.setMessage('Add dark mode please');

    const submitPromise = c.submit();
    expect(c.isSubmitting()).toBe(true);

    await submitPromise;

    expect(feedbackServiceMock.submit).toHaveBeenCalledWith(5, 'feature', 'Add dark mode please');
    expect(c.isSubmitting()).toBe(false);
    expect(c.submitted()).toBe(true);
    expect(modalCtrlMock.dismiss).not.toHaveBeenCalled();

    jest.advanceTimersByTime(2200);
    expect(modalCtrlMock.dismiss).toHaveBeenCalled();
  });

  it('submit() shows an error and leaves the form open when the request fails', async () => {
    feedbackServiceMock.submit.mockResolvedValue(false);
    const fixture = TestBed.createComponent(FeedbackModal);
    const c = fixture.componentInstance;
    c.setRating(2);
    c.setMessage('Crashes on startup');

    await c.submit();

    expect(c.isSubmitting()).toBe(false);
    expect(c.submitted()).toBe(false);
    expect(c.submitError()).toBe(true);
    expect(modalCtrlMock.dismiss).not.toHaveBeenCalled();
  });

  it('close() dismisses the modal', () => {
    const fixture = TestBed.createComponent(FeedbackModal);
    fixture.componentInstance.close();
    expect(modalCtrlMock.dismiss).toHaveBeenCalled();
  });
});
