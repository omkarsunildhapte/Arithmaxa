import { Component, inject } from '@angular/core';
import { CalculatorService } from '@services/calculator/calculator.service';

@Component({
  selector: 'app-display',
  standalone: true,
  imports: [],
  templateUrl: './display.html',
  styleUrls: ['./display.css'],
})
export class Display {
  readonly calc = inject(CalculatorService);
}
