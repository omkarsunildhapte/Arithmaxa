import { Component, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { httpResource } from '@angular/common/http';
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonSelect, IonSelectOption, IonSpinner, ModalController, IonFooter, IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, swapVerticalOutline, chevronDownOutline, refreshOutline } from 'ionicons/icons';
import { ExchangeResponse, SelectOption } from '@appTypes/index';

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

  readonly currencies: SelectOption[] = [
    { value: 'USD', label: 'USD — US Dollar' },
    { value: 'EUR', label: 'EUR — Euro' },
    { value: 'GBP', label: 'GBP — British Pound' },
    { value: 'INR', label: 'INR — Indian Rupee' },
    { value: 'JPY', label: 'JPY — Japanese Yen' },
    { value: 'CAD', label: 'CAD — Canadian Dollar' },
    { value: 'AUD', label: 'AUD — Australian Dollar' },
    { value: 'CHF', label: 'CHF — Swiss Franc' },
    { value: 'CNY', label: 'CNY — Chinese Yuan' },
    { value: 'AED', label: 'AED — UAE Dirham' },
    { value: 'SGD', label: 'SGD — Singapore Dollar' },
    { value: 'MXN', label: 'MXN — Mexican Peso' },
    { value: 'BRL', label: 'BRL — Brazilian Real' },
  ];

  amount: number = 1;
  fromCurrency: string = 'USD';
  toCurrency: string = 'INR';

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
    const inUsd = this.amount / r[this.fromCurrency];
    this.result.set(inUsd * r[this.toCurrency]);
  }
}
