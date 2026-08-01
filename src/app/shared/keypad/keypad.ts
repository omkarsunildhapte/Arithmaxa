import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  backspaceOutline, 
  timeOutline, 
  resizeOutline, 
  calculatorOutline, 
  gridOutline,
  flaskOutline
} from 'ionicons/icons';
import { CalculatorService } from '../../../services/calculator/calculator.service';

addIcons({ 
  backspaceOutline, 
  timeOutline, 
  resizeOutline, 
  calculatorOutline, 
  gridOutline,
  flaskOutline
});

@Component({
  selector: 'app-keypad',
  standalone: true,
  imports: [IonButton, IonIcon],
  templateUrl: './keypad.html',
  styleUrls: ['./keypad.css']
})
export class Keypad {
  readonly calc = inject(CalculatorService);
  private router = inject(Router);

  goToTools() {
    this.router.navigate(['/tools']);
  }
}
