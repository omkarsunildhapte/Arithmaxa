import type { UnitConverter } from '@pages/tools/components/unit-converter/unit-converter';
import type { PercentageCalc } from '@pages/tools/components/percentage-calc/percentage-calc';
import type { AgeCalc } from '@pages/tools/components/age-calc/age-calc';
import type { DiscountCalc } from '@pages/tools/components/discount-calc/discount-calc';
import type { CurrencyConverter } from '@pages/tools/components/currency-converter/currency-converter';
import type { BmiCalc } from '@pages/tools/components/bmi-calc/bmi-calc';

/** Any of the modal components Tools.selectTool() can open. */
export type ToolComponent = typeof UnitConverter | typeof PercentageCalc | typeof AgeCalc | typeof DiscountCalc | typeof CurrencyConverter | typeof BmiCalc;
