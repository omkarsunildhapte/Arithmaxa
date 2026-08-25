import { Component, effect, inject, signal } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonButton, IonIcon, NavController, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sparklesOutline, gridOutline, timeOutline, closeOutline, trashOutline, flash, calculatorOutline } from 'ionicons/icons';
import { Display } from '../../shared/display/display';
import { Keypad } from '../../shared/keypad/keypad';
import { History } from '../../shared/history/history';
import { CalculatorService } from '@services/calculator/calculator.service';
import { RatingService } from '@services/rating/rating.service';
import { AnalyticsService } from '@services/analytics/analytics.service';

addIcons({ sparklesOutline, gridOutline, timeOutline, closeOutline, trashOutline, flash, calculatorOutline });

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, IonButton, IonIcon, Display, Keypad],
  templateUrl: './calculator.html',
  styleUrls: ['./calculator.css'],
})
export class Calculator {
  protected readonly calc = inject(CalculatorService);
  private readonly navCtrl = inject(NavController);
  private readonly modalCtrl = inject(ModalController);
  private readonly rating = inject(RatingService);
  private readonly analytics = inject(AnalyticsService);
  protected isHistoryOpen = signal(false);
  private lastHistoryLength = 0;

  constructor() {
    // history() only grows on an actual calculate() call (success or
    // Error result) — a simple, reliable proxy for "the user is actively
    // using the calculator" without CalculatorService needing to know
    // anything about rating prompts itself.
    effect(() => {
      const length = this.calc.history().length;
      if (length > this.lastHistoryLength) {
        this.lastHistoryLength = length;
        void this.rating.recordCalculation();
        this.analytics.logEvent('calculation_performed');
      }
    });
  }

  async toggleHistory(open: boolean): Promise<void> {
    if (open) {
      const modal = await this.modalCtrl.create({
        component: History,
        cssClass: 'full-height-modal',
      });
      await modal.present();
      await modal.onWillDismiss();
      this.isHistoryOpen.set(false);
    } else {
      const top = await this.modalCtrl.getTop();
      if (top) await top.dismiss();
      this.isHistoryOpen.set(false);
    }
  }

  goToTools(): void {
    this.navCtrl.navigateForward(['/tools']);
  }

  goToAi(): void {
    this.navCtrl.navigateForward(['/ai']);
  }
}
