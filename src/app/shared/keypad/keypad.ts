import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { backspaceOutline } from 'ionicons/icons';
import { CalculatorService } from '@services/calculator/calculator.service';
import { NUMPAD_KEYS, ROW_START_LABELS } from '@constants/index';
import { KeypadKey } from '@appTypes/index';

addIcons({ backspaceOutline });

@Component({
  selector: 'app-keypad',
  standalone: true,
  imports: [IonButton, IonIcon],
  templateUrl: './keypad.html',
  styleUrls: ['./keypad.css'],
})
export class Keypad {
  readonly calc = inject(CalculatorService);
  private router = inject(Router);

  readonly numpadKeys = NUMPAD_KEYS;

  pressKey(key: KeypadKey): void {
    if (key.type === 'number') {
      this.calc.appendNumber(key.value);
    } else {
      this.calc.setOperator(key.value);
    }
  }

  isRowBreakKey(key: KeypadKey): boolean {
    return ROW_START_LABELS.has(key.label);
  }

  goToTools() {
    this.router.navigate(['/tools']);
  }
}
