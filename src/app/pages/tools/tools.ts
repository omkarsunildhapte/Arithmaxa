import { Component, inject } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  NavController,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  swapHorizontalOutline, calendarOutline, calculatorOutline, flaskOutline,
  statsChartOutline, shapesOutline, chevronBackOutline,
  flash, bodyOutline, cashOutline
} from 'ionicons/icons';
import { UnitConverter } from './components/unit-converter/unit-converter';
import { PercentageCalc } from './components/percentage-calc/percentage-calc';
import { AgeCalc } from './components/age-calc/age-calc';
import { DiscountCalc } from './components/discount-calc/discount-calc';
import { CurrencyConverter } from './components/currency-converter/currency-converter';
import { BmiCalc } from './components/bmi-calc/bmi-calc';

addIcons({
  swapHorizontalOutline, calendarOutline, calculatorOutline, flaskOutline,
  statsChartOutline, shapesOutline, chevronBackOutline,
  flash, bodyOutline, cashOutline
});

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [
    IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon
  ],
  templateUrl: './tools.html',
  styleUrls: ['./tools.css'],
  providers: [ModalController]
})
export class Tools {
  private navCtrl = inject(NavController);
  private modalCtrl = inject(ModalController);

  protected readonly unitsMap: Record<string, { value: string, label: string }[]> = {
    length: [
      { value: 'm', label: 'Meters (m)' },
      { value: 'km', label: 'Kilometers (km)' },
      { value: 'mile', label: 'Miles (mi)' },
      { value: 'foot', label: 'Feet (ft)' }
    ],
    weight: [
      { value: 'kg', label: 'Kilograms (kg)' },
      { value: 'g', label: 'Grams (g)' },
      { value: 'lb', label: 'Pounds (lb)' }
    ],
    temp: [
      { value: 'C', label: 'Celsius (°C)' },
      { value: 'F', label: 'Fahrenheit (°F)' },
      { value: 'K', label: 'Kelvin (K)' }
    ]
  };

  tools = [
    { id: 'length', name: 'Length', subtitle: 'Distance', icon: 'swap-horizontal-outline', color: '#6366f1' },
    { id: 'weight', name: 'Weight', subtitle: 'Mass Units', icon: 'calculator-outline', color: '#fbbf24' },
    { id: 'temp', name: 'Temp', subtitle: 'Thermal', icon: 'flask-outline', color: '#f43f5e' },
    { id: 'percentage', name: 'Percent', subtitle: 'Ratio Calc', icon: 'stats-chart-outline', color: '#10b981' },
    { id: 'age', name: 'Age', subtitle: 'Date Diff', icon: 'calendar-outline', color: '#8b5cf6' },
    { id: 'discount', name: 'Discount', subtitle: 'Price Cut', icon: 'shapes-outline', color: '#f59e0b' },
    { id: 'currency', name: 'Currency', subtitle: 'Live Rates', icon: 'cash-outline', color: '#10b981' },
    { id: 'bmi', name: 'BMI', subtitle: 'Health', icon: 'body-outline', color: '#f43f5e' },
  ];

  async selectTool(tool: string) {
    let component: any;
    let componentProps: any = {};

    if (['length', 'weight', 'temp'].includes(tool)) {
      component = UnitConverter;
      componentProps = { type: tool, units: this.unitsMap[tool] };
    } else if (tool === 'percentage') {
      component = PercentageCalc;
    } else if (tool === 'age') {
      component = AgeCalc;
    } else if (tool === 'discount') {
      component = DiscountCalc;
    } else if (tool === 'currency') {
      component = CurrencyConverter;
    } else if (tool === 'bmi') {
      component = BmiCalc;
    }

    if (component) {
      const modal = await this.modalCtrl.create({
        component,
        componentProps,
        cssClass: 'premium-modal',
        initialBreakpoint: 0.6,
        breakpoints: [0, 0.6],
        handle: true
      });
      return await modal.present();
    }
  }

  goToCalculator() {
    this.navCtrl.navigateBack(['/arithmaxa']);
  }
}
