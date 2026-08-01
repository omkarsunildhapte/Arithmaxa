import { Service } from '@angular/core';

@Service()
export class ToolsService {

  constructor() { }

  // ── Unit Conversions ──
  convert(value: number, from: string, to: string, type: string): number {
    // Basic conversion logic (simplified for now)
    const rates: { [key: string]: { [unit: string]: number } } = {
      length: { 'm': 1, 'km': 0.001, 'cm': 100, 'mm': 1000, 'mile': 0.000621371, 'yard': 1.09361, 'foot': 3.28084, 'inch': 39.3701 },
      weight: { 'kg': 1, 'g': 1000, 'mg': 1000000, 'lb': 2.20462, 'oz': 35.274 },
      area: { 'sqm': 1, 'sqkm': 0.000001, 'acre': 0.000247105, 'hectare': 0.0001 },
      volume: { 'l': 1, 'ml': 1000, 'cum': 0.001, 'gal': 0.264172 },
      data: { 'B': 1, 'KB': 1/1024, 'MB': 1/(1024*1024), 'GB': 1/(1024*1024*1024), 'TB': 1/(1024*1024*1024*1024) },
      energy: { 'J': 1, 'cal': 0.239006, 'kWh': 2.77778e-7 }
    };

    if (type === 'temp') {
      if (from === 'C') return to === 'F' ? (value * 9/5) + 32 : value + 273.15;
      if (from === 'F') return to === 'C' ? (value - 32) * 5/9 : (value - 32) * 5/9 + 273.15;
      if (from === 'K') return to === 'C' ? value - 273.15 : (value - 273.15) * 9/5 + 32;
      return value;
    }

    if (!rates[type]) return value;
    const baseValue = value / rates[type][from];
    return baseValue * rates[type][to];
  }

  // ── Percentage Tools ──
  percentageOf(percent: number, total: number): number {
    return (percent / 100) * total;
  }

  isWhatPercentage(x: number, y: number): number {
    return (x / y) * 100;
  }

  percentageChange(oldVal: number, newVal: number): number {
    return ((newVal - oldVal) / oldVal) * 100;
  }

  discount(price: number, discountPercent: number): number {
    return price - (price * discountPercent / 100);
  }

  // ── Age Calculator ──
  calculateAge(birthDate: Date): { years: number, months: number, days: number } {
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return { years, months, days };
  }


  // ── BMI Calculator ──
  calculateBmi(weightKg: number, heightM: number): { bmi: number; category: string } {
    const bmi = weightKg / (heightM * heightM);
    let category: string;
    if (bmi < 18.5)      category = 'Underweight';
    else if (bmi < 25)   category = 'Normal';
    else if (bmi < 30)   category = 'Overweight';
    else                 category = 'Obese';
    return { bmi, category };
  }
}
