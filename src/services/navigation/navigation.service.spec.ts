import { TestBed } from '@angular/core/testing';
import { Platform, ModalController, AlertController, ActionSheetController, PopoverController, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { NavigationService } from './navigation.service';

describe('NavigationService', () => {
  let service: NavigationService;
  let backButtonHandler: (() => void | Promise<void>) | undefined;
  let subscribeWithPriority: jest.Mock;
  let modalCtrlMock: { getTop: jest.Mock; dismiss: jest.Mock };
  let alertCtrlMock: { getTop: jest.Mock };
  let actionSheetCtrlMock: { getTop: jest.Mock };
  let popoverCtrlMock: { getTop: jest.Mock };
  let toastCtrlMock: { create: jest.Mock };
  let routerMock: { url: string };
  let locationMock: { back: jest.Mock };

  beforeEach(() => {
    backButtonHandler = undefined;
    subscribeWithPriority = jest.fn((_priority: number, handler: () => void | Promise<void>) => {
      backButtonHandler = handler;
    });

    modalCtrlMock = { getTop: jest.fn().mockResolvedValue(undefined), dismiss: jest.fn() };
    alertCtrlMock = { getTop: jest.fn().mockResolvedValue(undefined) };
    actionSheetCtrlMock = { getTop: jest.fn().mockResolvedValue(undefined) };
    popoverCtrlMock = { getTop: jest.fn().mockResolvedValue(undefined) };
    toastCtrlMock = {
      create: jest.fn().mockResolvedValue({ present: jest.fn().mockResolvedValue(undefined) }),
    };
    routerMock = { url: '/' };
    locationMock = { back: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: Platform, useValue: { backButton: { subscribeWithPriority } } },
        { provide: ModalController, useValue: modalCtrlMock },
        { provide: AlertController, useValue: alertCtrlMock },
        { provide: ActionSheetController, useValue: actionSheetCtrlMock },
        { provide: PopoverController, useValue: popoverCtrlMock },
        { provide: ToastController, useValue: toastCtrlMock },
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: locationMock },
      ],
    });
    service = TestBed.inject(NavigationService);
  });

  it('init() registers a single back-button handler at priority 10', () => {
    service.init();
    expect(subscribeWithPriority).toHaveBeenCalledWith(10, expect.any(Function));
  });

  it('dismisses the topmost overlay instead of navigating, when one is open', async () => {
    const overlayDismiss = jest.fn().mockResolvedValue(undefined);
    modalCtrlMock.getTop.mockResolvedValue({ dismiss: overlayDismiss });
    service.init();

    await backButtonHandler!();

    expect(overlayDismiss).toHaveBeenCalled();
    expect(locationMock.back).not.toHaveBeenCalled();
    expect(toastCtrlMock.create).not.toHaveBeenCalled();
  });

  it('checks overlays in order (alert, action sheet, popover, modal) and stops at the first one open', async () => {
    const popoverDismiss = jest.fn().mockResolvedValue(undefined);
    popoverCtrlMock.getTop.mockResolvedValue({ dismiss: popoverDismiss });
    service.init();

    await backButtonHandler!();

    expect(popoverDismiss).toHaveBeenCalled();
    // modalCtrl comes after popoverCtrl in the check order, so it's never reached.
    expect(modalCtrlMock.getTop).not.toHaveBeenCalled();
  });

  it('on the home route with no overlay open, shows an exit toast on the first back press', async () => {
    routerMock.url = '/';
    service.init();

    await backButtonHandler!();

    expect(toastCtrlMock.create).toHaveBeenCalledWith(expect.objectContaining({ message: 'Press back again to exit' }));
    expect(locationMock.back).not.toHaveBeenCalled();
  });

  it('navigates back via Location on a non-home route with no overlay open', async () => {
    routerMock.url = '/settings';
    service.init();

    await backButtonHandler!();

    expect(locationMock.back).toHaveBeenCalled();
    expect(toastCtrlMock.create).not.toHaveBeenCalled();
  });

  it('does not re-show the toast or navigate on a rapid second back press (double-tap-to-exit path)', async () => {
    routerMock.url = '/';
    service.init();

    await backButtonHandler!(); // first press -> shows toast
    toastCtrlMock.create.mockClear();
    await backButtonHandler!(); // second press within the threshold -> exit branch, not toast/back

    expect(toastCtrlMock.create).not.toHaveBeenCalled();
    expect(locationMock.back).not.toHaveBeenCalled();
  });

  describe('goBack()', () => {
    it('dismisses the top modal if one is open', async () => {
      const dismiss = jest.fn().mockResolvedValue(undefined);
      modalCtrlMock.getTop.mockResolvedValue({ dismiss });

      await service.goBack();

      expect(dismiss).toHaveBeenCalled();
      expect(locationMock.back).not.toHaveBeenCalled();
    });

    it('falls back to Location.back() when no modal is open', async () => {
      modalCtrlMock.getTop.mockResolvedValue(undefined);

      await service.goBack();

      expect(locationMock.back).toHaveBeenCalled();
    });
  });
});
