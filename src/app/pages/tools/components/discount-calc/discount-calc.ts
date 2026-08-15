import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, ModalController, IonInput, IonFooter } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { ToolsService } from '@services/tools/tools.service';

addIcons({ closeOutline });

@Component({
  selector: 'app-discount-calc',
  standalone: true,
  imports: [FormsModule, DecimalPipe, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonInput, IonFooter],
  templateUrl: './discount-calc.html',
  styleUrls: ['./discount-calc.css'],
})
export class DiscountCalc {
  private toolsService = inject(ToolsService);
  private modalCtrl = inject(ModalController);

  originalPrice: number = 0;
  discountPercent: number = 0;
  discountedPrice = signal<number>(0);

  dismiss() {
    this.modalCtrl.dismiss();
  }

  calculate() {
    const res = this.toolsService.discount(this.originalPrice, this.discountPercent);
    this.discountedPrice.set(res);
  }
}
