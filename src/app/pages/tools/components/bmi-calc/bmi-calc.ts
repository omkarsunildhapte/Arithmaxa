import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, ModalController, IonFooter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { ToolsService } from '../../../../../services/tools/tools.service';

addIcons({ closeOutline });

@Component({
  selector: 'app-bmi-calc',
  standalone: true,
  imports: [
    DecimalPipe, FormsModule,
    IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonFooter
  ],
  templateUrl: './bmi-calc.html',
  styleUrls: ['./bmi-calc.css']
})
export class BmiCalc {
  private toolsService = inject(ToolsService);
  private modalCtrl = inject(ModalController);

  unit: 'metric' | 'imperial' = 'metric';

  weightKg: number | null = null;
  heightCm: number | null = null;
  weightLbs: number | null = null;
  heightFt: number | null = null;
  heightIn: number | null = null;

  bmiResult = signal<{ bmi: number; category: string } | null>(null);

  dismiss() { this.modalCtrl.dismiss(); }

  switchUnit(u: 'metric' | 'imperial') {
    this.unit = u;
    this.bmiResult.set(null);
  }

  calculate() {
    if (this.unit === 'metric') {
      if (!this.weightKg || !this.heightCm) return;
      const heightM = this.heightCm / 100;
      this.bmiResult.set(this.toolsService.calculateBmi(this.weightKg, heightM));
    } else {
      if (!this.weightLbs || !this.heightFt) return;
      const totalInches = (this.heightFt * 12) + (this.heightIn ?? 0);
      const heightM = totalInches * 0.0254;
      const weightKg = this.weightLbs * 0.453592;
      this.bmiResult.set(this.toolsService.calculateBmi(weightKg, heightM));
    }
  }
}
