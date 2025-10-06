import { ISEEBracket, FlatTariff, CarnetOption, MealType } from '@/types';

// ISEE brackets and meal pricing (following Single Responsibility Principle)
export const ISEE_BRACKETS: ISEEBracket[] = [
  {
    range: { min: 0, max: null, isEligibleForScholarship: true },
    prices: [
      { mealType: MealType.COMPLETE, price: 0 },
      { mealType: MealType.REDUCED_A, price: 0 },
      { mealType: MealType.REDUCED_B, price: 0 },
      { mealType: MealType.REDUCED_C, price: 0 }
    ]
  },
  {
    range: { min: 0, max: 27000 },
    prices: [
      { mealType: MealType.COMPLETE, price: 2.80 },
      { mealType: MealType.REDUCED_A, price: 1.80 },
      { mealType: MealType.REDUCED_B, price: 2.30 },
      { mealType: MealType.REDUCED_C, price: 1.40 }
    ]
  },
  {
    range: { min: 27000, max: 30000 },
    prices: [
      { mealType: MealType.COMPLETE, price: 3.00 },
      { mealType: MealType.REDUCED_A, price: 2.00 },
      { mealType: MealType.REDUCED_B, price: 2.50 },
      { mealType: MealType.REDUCED_C, price: 1.80 }
    ]
  },
  {
    range: { min: 30000, max: 45000 },
    prices: [
      { mealType: MealType.COMPLETE, price: 4.50 },
      { mealType: MealType.REDUCED_A, price: 3.00 },
      { mealType: MealType.REDUCED_B, price: 3.50 },
      { mealType: MealType.REDUCED_C, price: 2.30 }
    ]
  },
  {
    range: { min: 45000, max: 60000 },
    prices: [
      { mealType: MealType.COMPLETE, price: 5.50 },
      { mealType: MealType.REDUCED_A, price: 3.60 },
      { mealType: MealType.REDUCED_B, price: 4.20 },
      { mealType: MealType.REDUCED_C, price: 2.70 }
    ]
  },
  {
    range: { min: 60000, max: 75000 },
    prices: [
      { mealType: MealType.COMPLETE, price: 6.50 },
      { mealType: MealType.REDUCED_A, price: 4.20 },
      { mealType: MealType.REDUCED_B, price: 4.90 },
      { mealType: MealType.REDUCED_C, price: 3.20 }
    ]
  },
  {
    range: { min: 75000, max: 100000 },
    prices: [
      { mealType: MealType.COMPLETE, price: 7.50 },
      { mealType: MealType.REDUCED_A, price: 4.80 },
      { mealType: MealType.REDUCED_B, price: 5.60 },
      { mealType: MealType.REDUCED_C, price: 3.60 }
    ]
  },
  {
    range: { min: 100000, max: null },
    prices: [
      { mealType: MealType.COMPLETE, price: 8.50 },
      { mealType: MealType.REDUCED_A, price: 5.40 },
      { mealType: MealType.REDUCED_B, price: 6.30 },
      { mealType: MealType.REDUCED_C, price: 4.00 }
    ]
  }
];

// Flat tariff options (extensible design)
export const FLAT_TARIFFS: FlatTariff[] = [
  {
    id: 'flat-2meals-3months-under75k',
    name: 'Flat 2 meals/day - 3 months (Under 75k ISEE)',
    mealsPerDay: 2,
    durationMonths: 3,
    price: 400,
    maxISEE: 75000
  },
  {
    id: 'flat-1meal-3months-under75k',
    name: 'Flat 1 meal/day - 3 months (Under 75k ISEE)',
    mealsPerDay: 1,
    durationMonths: 3,
    price: 200,
    maxISEE: 75000
  },
  {
    id: 'flat-2meals-3months-over75k',
    name: 'Flat 2 meals/day - 3 months (Over 75k ISEE)',
    mealsPerDay: 2,
    durationMonths: 3,
    price: 500
  },
  {
    id: 'flat-1meal-3months-over75k',
    name: 'Flat 1 meal/day - 3 months (Over 75k ISEE)',
    mealsPerDay: 1,
    durationMonths: 3,
    price: 280
  }
];

// Carnet options (following Open/Closed Principle)
export const CARNET_OPTIONS: CarnetOption[] = [
  { paidMeals: 5, freeMeals: 1, pricePerMeal: 0 }, // Price will be calculated based on ISEE
  { paidMeals: 10, freeMeals: 2, pricePerMeal: 0 },
  { paidMeals: 20, freeMeals: 5, pricePerMeal: 0 }
];