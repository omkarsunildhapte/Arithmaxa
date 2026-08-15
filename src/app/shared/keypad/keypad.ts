import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { backspaceOutline } from 'ionicons/icons';
import { CalculatorService } from '@services/calculator/calculator.service';
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

  // The ÷,7,8,9,×,4,5,6,−,1,2,3,+,0 keys — one row's worth of behavior
  // (appendNumber/setOperator) repeated 14 times as near-identical
  // <ion-button> markup, so it's driven from data instead. The grid is
  // `grid-template-columns: repeat(4, ...)` with implicit row wrapping, so
  // this array's order *is* the visual row/column order — no explicit
  // row/column data needed. "." and "=" right after it in the template
  // keep the same flow going; they're excluded here since each has a
  // one-off handler (appendDecimal() takes no argument, "=" needs its own
  // .btn-equals class) that isn't worth generalizing this shape for.
  readonly numpadKeys: KeypadKey[] = [
    { label: '÷', value: '/', type: 'operator' },
    { label: '7', value: '7', type: 'number' },
    { label: '8', value: '8', type: 'number' },
    { label: '9', value: '9', type: 'number' },
    { label: '×', value: '*', type: 'operator' },
    { label: '4', value: '4', type: 'number' },
    { label: '5', value: '5', type: 'number' },
    { label: '6', value: '6', type: 'number' },
    { label: '−', value: '-', type: 'operator' },
    { label: '1', value: '1', type: 'number' },
    { label: '2', value: '2', type: 'number' },
    { label: '3', value: '3', type: 'number' },
    { label: '+', value: '+', type: 'operator' },
    { label: '0', value: '0', type: 'number' },
  ];

  pressKey(key: KeypadKey): void {
    if (key.type === 'number') {
      this.calc.appendNumber(key.value);
    } else {
      this.calc.setOperator(key.value);
    }
  }

  goToTools() {
    this.router.navigate(['/tools']);
  }
}
