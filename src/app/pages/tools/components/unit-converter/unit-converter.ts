import { Component, effect, inject, input } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonSelect, IonSelectOption, ModalController, IonFooter, IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, swapVerticalOutline, chevronDownOutline } from 'ionicons/icons';
import { ToolsService } from '@services/tools/tools.service';
import { SelectOption } from '@appTypes/index';

addIcons({ closeOutline, swapVerticalOutline, chevronDownOutline });

@Component({
  selector: 'app-unit-converter',
  standalone: true,
  imports: [TitleCasePipe, FormsModule, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonSelect, IonSelectOption, IonFooter, IonInput],
  templateUrl: './unit-converter.html',
  styleUrls: ['./unit-converter.css'],
})
export class UnitConverter {
  private toolsService = inject(ToolsService);
  private modalCtrl = inject(ModalController);

  readonly type = input('length');
  readonly units = input<SelectOption[]>([]);

  convValue: number = 1;
  convResult: number = 0;
  convFrom: string = '';
  convTo: string = '';

  constructor() {
    // Replaces the old ngOnInit + ngOnChanges(['units']) pair — this re-runs
    // whenever the `units` input signal changes (including its initial set),
    // which covers both the "on init" and "on change" cases the lifecycle
    // hooks handled separately.
    effect(() => {
      this.initializeUnits();
    });
  }

  private initializeUnits() {
    const units = this.units();
    if (units.length > 0) {
      if (!this.convFrom) this.convFrom = units[0].value;
      if (!this.convTo) this.convTo = units[1]?.value || units[0].value;
      this.calculate();
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  calculate() {
    this.convResult = this.toolsService.convert(this.convValue, this.convFrom, this.convTo, this.type());
  }

  calculateReverse() {
    this.convValue = this.toolsService.convert(this.convResult, this.convTo, this.convFrom, this.type());
  }
}
