import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, ModalController, IonFooter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { ToolsService } from '../../../../../services/tools/tools.service';

addIcons({ closeOutline });

@Component({
  selector: 'app-age-calc',
  standalone: true,
  imports: [
    FormsModule,
    IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonFooter
  ],
  templateUrl: './age-calc.html',
  styleUrls: ['./age-calc.css']
})
export class AgeCalc {
  private toolsService = inject(ToolsService);
  private modalCtrl = inject(ModalController);

  birthDate: string = '';
  ageResult = signal<{ years: number, months: number, days: number } | null>(null);

  dismiss() { this.modalCtrl.dismiss(); }

  calculate() {
    if (!this.birthDate) return;
    const res = this.toolsService.calculateAge(new Date(this.birthDate));
    this.ageResult.set(res);
  }
}
