import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import {
  IonHeader, IonToolbar, IonButtons, IonButton, IonIcon,
  IonContent, IonSelect, IonSelectOption, IonSpinner, ModalController, IonFooter
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, swapVerticalOutline, chevronDownOutline, refreshOutline } from 'ionicons/icons';

addIcons({ closeOutline, swapVerticalOutline, chevronDownOutline, refreshOutline });

interface ExchangeResponse {
  result: string;
  base_code: string;
  rates: Record<string, number>;
}

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [
    FormsModule, DecimalPipe,
    IonHeader, IonToolbar, IonButtons, IonButton, IonIcon,
    IonContent, IonSelect, IonSelectOption, IonSpinner, IonFooter
  ],
  templateUrl: './currency-converter.html',
  styleUrls: ['./currency-converter.css']
})
export class CurrencyConverter implements OnInit {
  private http = inject(HttpClient);
  private modalCtrl = inject(ModalController);

  readonly currencies = [
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

  amount = 1;
  fromCurrency = 'USD';
  toCurrency = 'INR';

  rates = signal<Record<string, number> | null>(null);
  result = signal<number | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  lastUpdated = signal<string | null>(null);

  ngOnInit() { this.fetchRates(); }

  dismiss() { this.modalCtrl.dismiss(); }

  fetchRates() {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<ExchangeResponse>('https://open.er-api.com/v6/latest/USD').subscribe({
      next: (data) => {
        this.rates.set(data.rates);
        this.lastUpdated.set(new Date().toLocaleTimeString());
        this.loading.set(false);
        this.calculate();
      },
      error: () => {
        this.error.set('Could not fetch live rates. Check your connection and try again.');
        this.loading.set(false);
      }
    });
  }

  calculate() {
    const r = this.rates();
    if (!r) return;
    const inUsd = this.amount / r[this.fromCurrency];
    this.result.set(inUsd * r[this.toCurrency]);
  }
}
