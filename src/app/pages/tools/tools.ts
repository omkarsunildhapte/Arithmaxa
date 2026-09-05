import { Component, inject, signal } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, NavController, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { swapHorizontalOutline, calendarOutline, calculatorOutline, flaskOutline, statsChartOutline, shapesOutline, chevronBackOutline, bodyOutline, cashOutline } from 'ionicons/icons';
import { UnitConverter } from './components/unit-converter/unit-converter';
import { PercentageCalc } from './components/percentage-calc/percentage-calc';
import { AgeCalc } from './components/age-calc/age-calc';
import { DiscountCalc } from './components/discount-calc/discount-calc';
import { CurrencyConverter } from './components/currency-converter/currency-converter';
import { BmiCalc } from './components/bmi-calc/bmi-calc';
import { ToolComponent } from '@appTypes/index';
import { ConsentService } from '@services/consent/consent.service';
// prettier-ignore
import { DEFAULT_TOOL_MODAL_BREAKPOINT, PERCENTAGE_CALC_MODAL_BREAKPOINT, AGE_CALC_MODAL_BREAKPOINT, DISCOUNT_CALC_MODAL_BREAKPOINT, CURRENCY_CONVERTER_MODAL_BREAKPOINT, BMI_CALC_MODAL_BREAKPOINT, PRIVACY_POLICY_URL, TERMS_OF_SERVICE_URL, UNIT_OPTIONS, TOOL_CARDS } from '@constants/index';

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
  private consent = inject(ConsentService);

  // Tools is the app's only screen reachable at any time that has room for
  // a legal footer — Home is behind onboardingGuard (first run only) and
  // the calculator header is already full. Both documents open on
  // arithmaxa-website; "Privacy Settings" reopens the consent sheet, which
  // is where the toggles and Delete My Data now live.
  protected readonly privacyPolicyUrl = PRIVACY_POLICY_URL;
  protected readonly termsOfServiceUrl = TERMS_OF_SERVICE_URL;

  protected readonly unitsMap = UNIT_OPTIONS;

  /** The grid, in signal form per AGENTS.md §6. The data itself is static —
   *  TOOL_CARDS never changes at runtime — but reading it as tools() keeps the
   *  template's access uniform with the rest of the app's state, and means a
   *  later filter or search can be added without touching the markup. */
  readonly tools = signal(TOOL_CARDS);

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

  openPrivacySettings(): void {
    this.consent.openSettings();
  }
}
