import { Component, inject, signal } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButton,
  IonIcon,
  NavController,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sparklesOutline, gridOutline, timeOutline, closeOutline, trashOutline, flash } from 'ionicons/icons';
import { Display } from '../../shared/display/display';
import { Keypad } from '../../shared/keypad/keypad';
import { History } from '../../shared/history/history';
import { CalculatorService } from '../../../services/calculator/calculator.service';

addIcons({ sparklesOutline, gridOutline, timeOutline, closeOutline, trashOutline, flash });

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonButton, IonIcon,
    Display, Keypad
  ],
  templateUrl: './calculator.html',
  styleUrls: ['./calculator.css']
})
export class Calculator {
  protected readonly calc = inject(CalculatorService);
  private readonly navCtrl = inject(NavController);
  private readonly modalCtrl = inject(ModalController);
  protected isHistoryOpen = signal(false);

  async toggleHistory(open: boolean): Promise<void> {
    if (open) {
      const modal = await this.modalCtrl.create({
        component: History,
        cssClass: 'full-height-modal'
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
