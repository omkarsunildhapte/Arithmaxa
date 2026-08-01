import { Component, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { CalculatorService } from '../../../services/calculator/calculator.service';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent } from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { closeOutline, trashOutline, timeOutline } from 'ionicons/icons';

addIcons({ closeOutline, trashOutline, timeOutline });

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, DatePipe],
  templateUrl: './history.html',
  styleUrls: ['./history.css']
})
export class History {
  protected readonly calc = inject(CalculatorService);
  private readonly modalCtrl = inject(ModalController);

  async close(): Promise<void> {
    await this.modalCtrl.dismiss();
  }

  clearHistory() {
    this.calc.clearHistory();
  }
}
