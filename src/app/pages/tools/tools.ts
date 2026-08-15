import { Component, inject } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, NavController, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { swapHorizontalOutline, calendarOutline, calculatorOutline, flaskOutline, statsChartOutline, shapesOutline, chevronBackOutline, bodyOutline, cashOutline } from 'ionicons/icons';
import { UnitConverter } from './components/unit-converter/unit-converter';
import { PercentageCalc } from './components/percentage-calc/percentage-calc';
import { AgeCalc } from './components/age-calc/age-calc';
import { DiscountCalc } from './components/discount-calc/discount-calc';
import { CurrencyConverter } from './components/currency-converter/currency-converter';
import { BmiCalc } from './components/bmi-calc/bmi-calc';
import { SelectOption, ToolCard, ToolComponent } from '@appTypes/index';
import {
  DEFAULT_TOOL_MODAL_BREAKPOINT,
  PERCENTAGE_CALC_MODAL_BREAKPOINT,
  AGE_CALC_MODAL_BREAKPOINT,
  DISCOUNT_CALC_MODAL_BREAKPOINT,
  CURRENCY_CONVERTER_MODAL_BREAKPOINT,
  BMI_CALC_MODAL_BREAKPOINT,
} from '@constants/index';

addIcons({ swapHorizontalOutline, calendarOutline, calculatorOutline, flaskOutline, statsChartOutline, shapesOutline, chevronBackOutline, bodyOutline, cashOutline });

@Component({
  selector: 'app-tools',
  standalone: true,
  imports: [IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon],
  templateUrl: './tools.html',
  styleUrls: ['./tools.css'],
  providers: [ModalController],
})
export class Tools {
  private navCtrl = inject(NavController);
  private modalCtrl = inject(ModalController);

  protected readonly unitsMap: Record<string, SelectOption[]> = {
    length: [
      { value: 'm', label: 'Meters (m)' },
      { value: 'km', label: 'Kilometers (km)' },
      { value: 'mile', label: 'Miles (mi)' },
      { value: 'foot', label: 'Feet (ft)' },
    ],
    weight: [
      { value: 'kg', label: 'Kilograms (kg)' },
      { value: 'g', label: 'Grams (g)' },
      { value: 'lb', label: 'Pounds (lb)' },
    ],
    temp: [
      { value: 'C', label: 'Celsius (°C)' },
      { value: 'F', label: 'Fahrenheit (°F)' },
      { value: 'K', label: 'Kelvin (K)' },
    ],
  };

  // Tile colors cycle through the brand's cyan/blue family (primary, accent,
  // and their lighter/darker ion-color-primary-tint/shade derivatives from
  // styles.css) instead of an arbitrary rainbow per tool — keeps the grid
  // visually distinguishable row to row while staying on-brand. Plain hex
  // (not var(--x)) is required here: the template appends an alpha suffix
  // to this string directly ('#22ecf3' + '15'), which only works on a
  // literal hex color, not a var() reference.
  tools: ToolCard[] = [
    { id: 'length', name: 'Length', subtitle: 'Distance', icon: 'swap-horizontal-outline', color: '#22ecf3' },
    { id: 'weight', name: 'Weight', subtitle: 'Mass Units', icon: 'calculator-outline', color: '#06a5da' },
    { id: 'temp', name: 'Temp', subtitle: 'Thermal', icon: 'flask-outline', color: '#43eff5' },
    { id: 'percentage', name: 'Percent', subtitle: 'Ratio Calc', icon: 'stats-chart-outline', color: '#1dc9cf' },
    { id: 'age', name: 'Age', subtitle: 'Date Diff', icon: 'calendar-outline', color: '#22ecf3' },
    { id: 'discount', name: 'Discount', subtitle: 'Price Cut', icon: 'shapes-outline', color: '#06a5da' },
    { id: 'currency', name: 'Currency', subtitle: 'Live Rates', icon: 'cash-outline', color: '#43eff5' },
    { id: 'bmi', name: 'BMI', subtitle: 'Health', icon: 'body-outline', color: '#1dc9cf' },
  ];

  async selectTool(tool: string) {
    let component: ToolComponent | undefined;
    let componentProps: Record<string, unknown> = {};
    let breakpoint = DEFAULT_TOOL_MODAL_BREAKPOINT;

    switch (tool) {
      case 'length':
      case 'weight':
      case 'temp':
        component = UnitConverter;
        componentProps = { type: tool, units: this.unitsMap[tool] };
        break;
      case 'percentage':
        component = PercentageCalc;
        breakpoint = PERCENTAGE_CALC_MODAL_BREAKPOINT;
        break;
      case 'age':
        component = AgeCalc;
        breakpoint = AGE_CALC_MODAL_BREAKPOINT;
        break;
      case 'discount':
        component = DiscountCalc;
        breakpoint = DISCOUNT_CALC_MODAL_BREAKPOINT;
        break;
      case 'currency':
        component = CurrencyConverter;
        breakpoint = CURRENCY_CONVERTER_MODAL_BREAKPOINT;
        break;
      case 'bmi':
        component = BmiCalc;
        breakpoint = BMI_CALC_MODAL_BREAKPOINT;
        break;
    }

    if (component) {
      const modal = await this.modalCtrl.create({
        component,
        componentProps,
        cssClass: 'premium-modal',
        initialBreakpoint: breakpoint,
        breakpoints: [0, breakpoint],
        handle: true,
      });
      return await modal.present();
    }
  }

  goToCalculator() {
    this.navCtrl.navigateBack(['/arithmaxa']);
  }
}
