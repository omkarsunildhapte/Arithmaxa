import { Component, Input, inject, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonSelect, IonSelectOption, ModalController, IonFooter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, swapVerticalOutline, chevronDownOutline } from 'ionicons/icons';
import { ToolsService } from '../../../../../services/tools/tools.service';

addIcons({ closeOutline, swapVerticalOutline, chevronDownOutline });

@Component({
  selector: 'app-unit-converter',
  standalone: true,
  imports: [
    TitleCasePipe, FormsModule,
    IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonSelect, IonSelectOption, IonFooter
  ],
  templateUrl: './unit-converter.html',
  styleUrls: ['./unit-converter.css']
})
export class UnitConverter implements OnChanges, OnInit {
  private toolsService = inject(ToolsService);
  private modalCtrl = inject(ModalController);

  @Input() type: string = 'length';
  @Input() units: { value: string, label: string }[] = [];

  convValue: number = 1;
  convResult: number = 0;
  convFrom: string = '';
  convTo: string = '';

  ngOnInit() {
    this.initializeUnits();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['units']) {
      this.initializeUnits();
    }
  }

  private initializeUnits() {
    if (this.units && this.units.length > 0) {
      if (!this.convFrom) this.convFrom = this.units[0].value;
      if (!this.convTo) this.convTo = this.units[1]?.value || this.units[0].value;
      this.calculate();
    }
  }

  dismiss() { this.modalCtrl.dismiss(); }

  calculate() {
    this.convResult = this.toolsService.convert(this.convValue, this.convFrom, this.convTo, this.type);
  }

  calculateReverse() {
    this.convValue = this.toolsService.convert(this.convResult, this.convTo, this.convFrom, this.type);
  }
}
