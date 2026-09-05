import { Service, inject } from '@angular/core';
import { AlertController } from '@ionic/angular/standalone';
import { PLAY_STORE_URL, RATING_COUNT_KEY, RATING_DISMISSED_KEY, RATING_NEXT_THRESHOLD_KEY, RATING_PROMPT_CALC_THRESHOLD } from '@constants/index';

/**
 * Prompts for a Play Store rating after the user has done enough
 * calculations to plausibly be a real, engaged user — not a native
 * in-app-review widget, but a custom 3-option alert ("Rate Now" /
 * "Remind Me Later" / "No Thanks") that deep-links out to the store
 * listing, per what was actually asked for over the native API.
 */
@Service()
export class RatingService {
  private readonly alertCtrl = inject(AlertController);

  /** Call after every successful calculation. Bumps the local counter and
   *  shows the prompt once the threshold is reached — no-ops entirely once
   *  the user has picked "No Thanks" or already gone to the store. */
  async recordCalculation(): Promise<void> {
    if (this.isDismissedForever()) return;

    const count = this.getCount() + 1;
    localStorage.setItem(RATING_COUNT_KEY, String(count));

    if (count >= this.getNextThreshold()) {
      await this.presentPrompt();
    }
  }

  private isDismissedForever(): boolean {
    return localStorage.getItem(RATING_DISMISSED_KEY) === 'true';
  }

  private getCount(): number {
    return Number(localStorage.getItem(RATING_COUNT_KEY) ?? '0');
  }

  private getNextThreshold(): number {
    return Number(localStorage.getItem(RATING_NEXT_THRESHOLD_KEY) ?? String(RATING_PROMPT_CALC_THRESHOLD));
  }

  private async presentPrompt(): Promise<void> {
    // Don't stack a second alert if one's already showing for any reason.
    if (await this.alertCtrl.getTop()) return;

    const alert = await this.alertCtrl.create({
      header: 'Enjoying Arithmaxa?',
      message: "If it's been useful, a quick rating on the Play Store helps a lot.",
      backdropDismiss: false,
      buttons: [
        { text: 'No Thanks', role: 'cancel', handler: () => this.dismissForever() },
        { text: 'Remind Me Later', handler: () => this.remindLater() },
        { text: 'Rate Now', handler: () => this.openStoreListing() },
      ],
    });
    await alert.present();
  }

  private dismissForever(): void {
    localStorage.setItem(RATING_DISMISSED_KEY, 'true');
  }

  private remindLater(): void {
    localStorage.setItem(RATING_NEXT_THRESHOLD_KEY, String(this.getCount() + RATING_PROMPT_CALC_THRESHOLD));
  }

  private openStoreListing(): void {
    // '_system' is what routes this through Capacitor's native external-URL
    // handling instead of trying to navigate the app's own WebView to it —
    // no extra plugin needed for that.
    window.open(PLAY_STORE_URL, '_system');
    // They've been sent to the store — no reason to keep asking after this.
    this.dismissForever();
  }
}
