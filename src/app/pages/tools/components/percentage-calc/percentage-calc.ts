import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonSelect, IonSelectOption, ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, chevronDownOutline } from 'ionicons/icons';
import { ToolsService } from '../../../../../services/tools/tools.service';

addIcons({ closeOutline, chevronDownOutline });

@Component({
  selector: 'app-percentage-calc',
  standalone: true,
  imports: [
    FormsModule, DecimalPipe,
    IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonSelect, IonSelectOption
  ],
  templateUrl: './percentage-calc.html',
  styleUrls: ['./percentage-calc.css']
})
export class PercentageCalc {
  private toolsService = inject(ToolsService);
  private modalCtrl = inject(ModalController);

  percVal1: number = 0;
  percVal2: number = 0;
  percResult = signal<number>(0);
  percType: string = 'of';

  protected readonly percentageTypes = [
    { value: 'of',     label: 'What is X% of Y?' },
    { value: 'is',     label: 'X is what % of Y?' },
    { value: 'change', label: '% Increase/Decrease' }
  ];

  dismiss() { this.modalCtrl.dismiss(); }

  calculate() {
    const { percType: type, percVal1: v1, percVal2: v2 } = this;
    let res = 0;
    if (type === 'of')     res = this.toolsService.percentageOf(v1, v2);
    if (type === 'is')     res = this.toolsService.isWhatPercentage(v1, v2);
    if (type === 'change') res = this.toolsService.percentageChange(v1, v2);
    this.percResult.set(res);
  }
}
