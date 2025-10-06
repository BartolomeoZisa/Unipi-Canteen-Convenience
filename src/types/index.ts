// Core domain types
export interface ISEERange {
  min: number;
  max: number | null; // null means no upper limit
  isEligibleForScholarship?: boolean;
}

export enum MealType {
  COMPLETE = 'complete',
  REDUCED_A = 'reducedA',
  REDUCED_B = 'reducedB',
  REDUCED_C = 'reducedC'
}

export interface MealPrice {
  mealType: MealType;
  price: number;
}

export interface ISEEBracket {
  range: ISEERange;
  prices: MealPrice[];
}

export interface FlatTariff {
  id: string;
  name: string;
  mealsPerDay: number;
  durationMonths: number;
  price: number;
  maxISEE?: number; // undefined means no limit
}

export interface CarnetOption {
  paidMeals: number;
  freeMeals: number;
  pricePerMeal: number;
}

export interface CalculationInput {
  isee: number;
  totalMeals: number;
  isScholarshipEligible: boolean;
  preferredMealType: MealType;
}

export interface TariffOption {
  id: string;
  name: string;
  totalCost: number;
  description: string;
  type: 'per-meal' | 'flat' | 'carnet';
}

export interface CalculationResult {
  input: CalculationInput;
  options: TariffOption[];
  recommendedOption: TariffOption;
}