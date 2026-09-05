import { Service, inject } from '@angular/core';
import { Platform, ModalController, AlertController, ActionSheetController, PopoverController, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { App } from '@capacitor/app';
import { EXIT_CONFIRM_WINDOW_MS, EXIT_TOAST_CSS_CLASS, EXIT_TOAST_DURATION_MS, EXIT_TOAST_MESSAGE, ROOT_ROUTES } from '@constants/index';

@Service()
export class NavigationService {
  private platform = inject(Platform);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);
  private actionSheetCtrl = inject(ActionSheetController);
  private popoverCtrl = inject(PopoverController);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);
  private location = inject(Location);

  private lastBackPress = 0;

  /**
   * Registers the hardware back-button handler.
   *
   * Requires `@capacitor/app`: Ionic feeds `Platform.backButton` from the
   * Cordova-style `backbutton` document event, which on Capacitor is only
   * dispatched when that plugin is installed. Without it this handler never
   * fires and Android closes the app on the first press.
   */
  init(): void {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      // 1. Dismiss overlays first
      const overlays = [this.alertCtrl, this.actionSheetCtrl, this.popoverCtrl, this.modalCtrl];
      for (const ctrl of overlays) {
        const top = await ctrl.getTop();
        if (top) {
          await top.dismiss();
          return;
        }
      }

      // 2. Handle Routing
      const url = this.router.url;

      if (ROOT_ROUTES.includes(url)) {
        const currentTime = Date.now();

        if (currentTime - this.lastBackPress < EXIT_CONFIRM_WINDOW_MS) {
          // Second press inside the window — leave the app. App.exitApp() is
          // the Capacitor API; the old navigator.app.exitApp() was Cordova's
          // and does not exist here, so this step silently did nothing.
          void App.exitApp();
        } else {
          this.lastBackPress = currentTime;
          void this.showExitToast();
        }
      } else {
        this.location.back();
      }
    });
  }

  private async showExitToast(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: EXIT_TOAST_MESSAGE,
      duration: EXIT_TOAST_DURATION_MS,
      position: 'bottom',
      cssClass: EXIT_TOAST_CSS_CLASS,
    });
    await toast.present();
  }

  /**
   * Helper to perform a smart "Go Back" from UI buttons
   */
  async goBack(): Promise<void> {
    const modal = await this.modalCtrl.getTop();
    if (modal) {
      await modal.dismiss();
    } else {
      this.location.back();
    }
  }
}
