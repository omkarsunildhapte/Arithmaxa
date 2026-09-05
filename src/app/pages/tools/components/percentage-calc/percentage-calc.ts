import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonSelect, IonSelectOption, ModalController, IonInput, IonFooter } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, chevronDownOutline } from 'ionicons/icons';
import { ToolsService } from '@services/tools/tools.service';
import { PERCENTAGE_TYPE_OPTIONS } from '@constants/index';
import { PercentageType } from '@appTypes/index';

addIcons({ closeOutline, chevronDownOutline });

@Component({
  selector: 'app-percentage-calc',
  standalone: true,
  imports: [FormsModule, DecimalPipe, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonSelect, IonSelectOption, IonInput, IonFooter],
  templateUrl: './percentage-calc.html',
  styleUrls: ['./percentage-calc.css'],
})
export class PercentageCalc {
  private toolsService = inject(ToolsService);
  private modalCtrl = inject(ModalController);

  readonly percVal1 = signal<number>(0);
  readonly percVal2 = signal<number>(0);
  percResult = signal<number>(0);
  readonly percType = signal<PercentageType>('of');

  protected readonly percentageTypes = PERCENTAGE_TYPE_OPTIONS;

  dismiss() {
    this.modalCtrl.dismiss();
  }

  calculate() {
    const type = this.percType();
    const v1 = this.percVal1();
    const v2 = this.percVal2();
    let res = 0;
    if (type === 'of') res = this.toolsService.percentageOf(v1, v2);
    if (type === 'is') res = this.toolsService.isWhatPercentage(v1, v2);
    if (type === 'change') res = this.toolsService.percentageChange(v1, v2);
    this.percResult.set(res);
  }
}
