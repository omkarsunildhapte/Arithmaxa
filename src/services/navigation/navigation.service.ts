import { Service, inject } from '@angular/core';
import { 
  Platform, 
  ModalController, 
  AlertController, 
  ActionSheetController, 
  PopoverController,
  ToastController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

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
  private readonly EXIT_TIME_THRESHOLD = 2000; // 2 seconds

  /**
   * Initializes the back button handler.
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

      if (url === '/' || url === '/home' || url === '/arithmaxa') {
        const currentTime = Date.now();
        
        if (currentTime - this.lastBackPress < this.EXIT_TIME_THRESHOLD) {
          // Double tap detected -> Exit app
          const nav = (navigator as any);
          if (nav.app && nav.app.exitApp) {
            nav.app.exitApp();
          }
        } else {
          // First tap -> Show toast
          this.lastBackPress = currentTime;
          this.showExitToast();
        }
      } else {
        this.location.back();
      }
    });
  }

  private async showExitToast() {
    const toast = await this.toastCtrl.create({
      message: 'Press back again to exit',
      duration: 2000,
      position: 'bottom',
      cssClass: 'exit-toast'
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
