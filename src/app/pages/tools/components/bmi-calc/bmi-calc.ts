import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, ModalController, IonFooter, IonInput, IonSegment, IonSegmentButton, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { BMI_SCALE_BANDS, BMI_UNIT_OPTIONS } from '@constants/index';
import { BmiUnit } from '@appTypes/index';
import { ToolsService } from '@services/tools/tools.service';

addIcons({ closeOutline });

@Component({
  selector: 'app-bmi-calc',
  standalone: true,
  imports: [DecimalPipe, FormsModule, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonFooter, IonInput, IonSegment, IonSegmentButton, IonLabel],
  templateUrl: './bmi-calc.html',
  styleUrls: ['./bmi-calc.css'],
})
export class BmiCalc {
  private toolsService = inject(ToolsService);
  private modalCtrl = inject(ModalController);

  readonly unit = signal<BmiUnit>('metric');

  readonly units = BMI_UNIT_OPTIONS;

  readonly bmiScale = BMI_SCALE_BANDS;

  readonly weightKg = signal<number | null>(null);
  readonly heightCm = signal<number | null>(null);
  readonly weightLbs = signal<number | null>(null);
  readonly heightFt = signal<number | null>(null);
  readonly heightIn = signal<number | null>(null);
  // 'meters' shares weightKg with 'metric' (both are kg) — only the height
  // unit differs (direct meters, e.g. 1.75, vs centimeters).
  readonly heightM = signal<number | null>(null);

  bmiResult = signal<{ bmi: number; category: string } | null>(null);

  dismiss() {
    this.modalCtrl.dismiss();
  }

  onUnitChange(event: Event): void {
    const custom = event as CustomEvent<{ value: BmiUnit }>;
    this.switchUnit(custom.detail.value);
  }

  switchUnit(u: BmiUnit) {
    this.unit.set(u);
    this.bmiResult.set(null);
  }

  calculate() {
    const unit = this.unit();
    if (unit === 'metric') {
      const kg = this.weightKg();
      const cm = this.heightCm();
      if (!kg || !cm) return;
      this.bmiResult.set(this.toolsService.calculateBmi(kg, cm / 100));
    } else if (unit === 'meters') {
      const kg = this.weightKg();
      const m = this.heightM();
      if (!kg || !m) return;
      this.bmiResult.set(this.toolsService.calculateBmi(kg, m));
    } else {
      const lbs = this.weightLbs();
      const ft = this.heightFt();
      if (!lbs || !ft) return;
      const totalInches = ft * 12 + (this.heightIn() ?? 0);
      this.bmiResult.set(this.toolsService.calculateBmi(lbs * 0.453592, totalInches * 0.0254));
    }
  }
}
