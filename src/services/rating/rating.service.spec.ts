import { TestBed } from '@angular/core/testing';
import { AlertController } from '@ionic/angular/standalone';
import { RatingService } from './rating.service';
import { PLAY_STORE_URL, RATING_PROMPT_CALC_THRESHOLD } from '@constants/index';

describe('RatingService', () => {
  let service: RatingService;
  let alertButtons: { text: string; role?: string; handler?: () => void }[];
  let alertCreate: jest.Mock;
  let alertPresent: jest.Mock;
  let alertGetTop: jest.Mock;
  let windowOpenSpy: jest.SpyInstance;

  beforeEach(() => {
    localStorage.clear();
    alertButtons = [];
    alertPresent = jest.fn().mockResolvedValue(undefined);
    alertGetTop = jest.fn().mockResolvedValue(undefined);
    alertCreate = jest.fn().mockImplementation((opts) => {
      alertButtons = opts.buttons;
      return Promise.resolve({ present: alertPresent });
    });
    windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);

    TestBed.configureTestingModule({
      providers: [{ provide: AlertController, useValue: { create: alertCreate, getTop: alertGetTop } }],
    });
    service = TestBed.inject(RatingService);
  });

  afterEach(() => {
    windowOpenSpy.mockRestore();
  });

  it('does not prompt before the threshold is reached', async () => {
    for (let i = 0; i < RATING_PROMPT_CALC_THRESHOLD - 1; i++) {
      await service.recordCalculation();
    }
    expect(alertCreate).not.toHaveBeenCalled();
  });

  it('prompts once the threshold is reached', async () => {
    for (let i = 0; i < RATING_PROMPT_CALC_THRESHOLD; i++) {
      await service.recordCalculation();
    }
    expect(alertCreate).toHaveBeenCalledTimes(1);
    expect(alertPresent).toHaveBeenCalledTimes(1);
  });

  it('does not stack a second alert if one is already showing', async () => {
    alertGetTop.mockResolvedValue({} as never);
    for (let i = 0; i < RATING_PROMPT_CALC_THRESHOLD; i++) {
      await service.recordCalculation();
    }
    expect(alertCreate).not.toHaveBeenCalled();
  });

  it('"No Thanks" stops the service from ever prompting again', async () => {
    for (let i = 0; i < RATING_PROMPT_CALC_THRESHOLD; i++) {
      await service.recordCalculation();
    }
    alertButtons.find((b) => b.role === 'cancel')?.handler?.();

    for (let i = 0; i < RATING_PROMPT_CALC_THRESHOLD * 3; i++) {
      await service.recordCalculation();
    }
    expect(alertCreate).toHaveBeenCalledTimes(1);
  });

  it('"Remind Me Later" prompts again after another full threshold of calculations', async () => {
    for (let i = 0; i < RATING_PROMPT_CALC_THRESHOLD; i++) {
      await service.recordCalculation();
    }
    alertButtons.find((b) => b.text === 'Remind Me Later')?.handler?.();

    for (let i = 0; i < RATING_PROMPT_CALC_THRESHOLD - 1; i++) {
      await service.recordCalculation();
    }
    expect(alertCreate).toHaveBeenCalledTimes(1);

    await service.recordCalculation();
    expect(alertCreate).toHaveBeenCalledTimes(2);
  });

  it('"Rate Now" opens the Play Store listing and stops future prompts', async () => {
    for (let i = 0; i < RATING_PROMPT_CALC_THRESHOLD; i++) {
      await service.recordCalculation();
    }
    alertButtons.find((b) => b.text === 'Rate Now')?.handler?.();

    expect(windowOpenSpy).toHaveBeenCalledWith(PLAY_STORE_URL, '_system');

    for (let i = 0; i < RATING_PROMPT_CALC_THRESHOLD * 3; i++) {
      await service.recordCalculation();
    }
    expect(alertCreate).toHaveBeenCalledTimes(1);
  });
});
