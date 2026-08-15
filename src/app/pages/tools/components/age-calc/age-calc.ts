import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, ModalController, IonFooter, IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { ToolsService } from '@services/tools/tools.service';

addIcons({ closeOutline });

@Component({
  selector: 'app-age-calc',
  standalone: true,
  imports: [FormsModule, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonFooter, IonInput],
  templateUrl: './age-calc.html',
  styleUrls: ['./age-calc.css'],
})
export class AgeCalc {
  private toolsService = inject(ToolsService);
  private modalCtrl = inject(ModalController);

  birthDate: string = '';
  ageResult = signal<{ years: number; months: number; days: number; hours: number; minutes: number } | null>(null);
  dateError = signal<string | null>(null);

  // The date input's [max] so the native picker can't offer future dates in
  // the first place; calculate() below re-checks the same rule since a
  // typed/pasted value can still bypass the picker's own max. Local-date
  // (en-CA renders YYYY-MM-DD) rather than toISOString(), which is UTC and
  // would read as "tomorrow" for part of the day in timezones ahead of UTC.
  readonly maxDate = new Date().toLocaleDateString('en-CA');

  constructor() {
    // Default to 10 years ago instead of leaving the picker empty, so the
    // modal opens with a populated result instead of the "select your
    // birth date" placeholder card.
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    this.birthDate = tenYearsAgo.toLocaleDateString('en-CA');
    this.calculate();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  calculate() {
    if (!this.birthDate) {
      this.ageResult.set(null);
      this.dateError.set(null);
      return;
    }
    // String comparison against the same local-date format as maxDate,
    // done before any Date parsing — comparing Date objects/timestamps
    // instead would reintroduce the UTC-vs-local edge case maxDate itself
    // exists to avoid.
    if (this.birthDate > this.maxDate) {
      this.ageResult.set(null);
      this.dateError.set('Birth date cannot be in the future.');
      return;
    }
    const parsed = new Date(this.birthDate);
    if (Number.isNaN(parsed.getTime())) {
      this.ageResult.set(null);
      this.dateError.set('Please enter a valid date.');
      return;
    }
    this.dateError.set(null);
    this.ageResult.set(this.toolsService.calculateAge(parsed));
  }
}
