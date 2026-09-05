import { Component, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonSelect, IonSelectOption, IonSpinner, ModalController, IonFooter, IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, swapVerticalOutline, chevronDownOutline, refreshOutline } from 'ionicons/icons';
import { CURRENCY_OPTIONS } from '@constants/index';
import { ExchangeResponse } from '@appTypes/index';

addIcons({ closeOutline, swapVerticalOutline, chevronDownOutline, refreshOutline });

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [FormsModule, DecimalPipe, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonSelect, IonSelectOption, IonSpinner, IonFooter, IonInput],
  templateUrl: './currency-converter.html',
  styleUrls: ['./currency-converter.css'],
})
export class CurrencyConverter {
  private modalCtrl = inject(ModalController);

  readonly currencies = CURRENCY_OPTIONS;

  readonly amount = signal<number>(1);
  readonly fromCurrency = signal<string>('USD');
  readonly toCurrency = signal<string>('INR');

  private readonly ratesResource = httpResource<ExchangeResponse>(() => 'https://open.er-api.com/v6/latest/USD');

  readonly loading = this.ratesResource.isLoading;
  readonly error = computed(() => (this.ratesResource.error() ? 'Could not fetch live rates. Check your connection and try again.' : null));
  readonly result = signal<number | null>(null);
  readonly lastUpdated = signal<string | null>(null);

  constructor() {
    // Re-stamp "Updated: ..." and recompute the displayed result every time
    // fresh rates land (initial load, or a manual retry() reload) — replaces
    // the old subscribe()'s `next` callback.
    effect(() => {
      // hasValue() is a proper guard here — calling .value() directly while
      // the resource is in an error state throws (it rethrows the
      // underlying HTTP error), it doesn't just return undefined.
      if (this.ratesResource.hasValue()) {
        this.lastUpdated.set(new Date().toLocaleTimeString());
        this.calculate();
      }
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  retry() {
    this.ratesResource.reload();
  }

  calculate() {
    if (!this.ratesResource.hasValue()) return;
    const r = this.ratesResource.value().rates;
    const inUsd = this.amount() / r[this.fromCurrency()];
    this.result.set(inUsd * r[this.toCurrency()]);
  }
}
