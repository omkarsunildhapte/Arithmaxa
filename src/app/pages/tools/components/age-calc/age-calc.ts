import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, ModalController, IonFooter, IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';
import { ToolsService } from '@services/tools/tools.service';
import { AgeResult, AgeTotal } from '@appTypes/index';
import { AGE_TOTAL_UNITS } from '@constants/index';

addIcons({ closeOutline });

@Component({
  selector: 'app-age-calc',
  standalone: true,
  imports: [DecimalPipe, FormsModule, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonFooter, IonInput],
  templateUrl: './age-calc.html',
  styleUrls: ['./age-calc.css'],
})
export class AgeCalc {
  private toolsService = inject(ToolsService);
  private modalCtrl = inject(ModalController);
  readonly birthDate = signal<string>('');
  ageResult = signal<AgeResult | null>(null);
  dateError = signal<string | null>(null);

  // Pairs each tile in AGE_TOTAL_UNITS with its number from the current
  // result, so the template renders one @for over this instead of five
  // near-identical blocks. Empty while there is no result, which the
  // template's @if already guards against rendering.
  readonly ageTotals = computed<AgeTotal[]>(() => {
    const age = this.ageResult();
    if (!age) return [];
    return AGE_TOTAL_UNITS.map((unit) => ({ ...unit, value: age[unit.field] }));
  });

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
    this.birthDate.set(tenYearsAgo.toLocaleDateString('en-CA'));
    this.calculate();
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  calculate() {
    if (!this.birthDate()) {
      this.ageResult.set(null);
      this.dateError.set(null);
      return;
    }
    // String comparison against the same local-date format as maxDate,
    // done before any Date parsing — comparing Date objects/timestamps
    // instead would reintroduce the UTC-vs-local edge case maxDate itself
    // exists to avoid.
    if (this.birthDate() > this.maxDate) {
      this.ageResult.set(null);
      this.dateError.set('Birth date cannot be in the future.');
      return;
    }
    // Built from the parts rather than `new Date(this.birthDate())`: passing a
    // bare 'YYYY-MM-DD' to the Date constructor parses it as UTC midnight,
    // while maxDate above and every reading in calculateAge()
    // (getHours/getDate/...) are local. In a timezone ahead of UTC that gap
    // put the birth instant later in the local day than "now" is during the
    // early hours, cascading a borrow through hours -> days -> months and
    // reporting someone born exactly N years ago as N-1 until the clock
    // passed the UTC offset. Local midnight makes both ends agree.
    const [year, month, day] = this.birthDate().split('-').map(Number);
    const parsed = new Date(year, month - 1, day);
    if (Number.isNaN(parsed.getTime())) {
      this.ageResult.set(null);
      this.dateError.set('Please enter a valid date.');
      return;
    }
    this.dateError.set(null);
    this.ageResult.set(this.toolsService.calculateAge(parsed));
  }
}
