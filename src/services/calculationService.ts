import { 
  CalculationInput, 
  CalculationResult, 
  TariffOption, 
  ISEEBracket, 
  FlatTariff, 
  CarnetOption,
  MealType 
} from '@/types';
import { ISEE_BRACKETS, FLAT_TARIFFS, CARNET_OPTIONS } from './tariffConfig';

// Interface Segregation Principle - separate interfaces for different responsibilities
export interface ITariffCalculator {
  calculate(input: CalculationInput): CalculationResult;
}

export interface IPriceCalculator {
  calculatePerMealPrice(isee: number, mealType: MealType, isScholarshipEligible: boolean): number;
  calculateFlatTariffCost(isee: number, tariff: FlatTariff): number | null;
  calculateCarnetCost(isee: number, mealType: MealType, carnet: CarnetOption, totalMeals: number): number | null;
}

// Single Responsibility Principle - each class has one reason to change
export class PriceCalculator implements IPriceCalculator {
  calculatePerMealPrice(isee: number, mealType: MealType, isScholarshipEligible: boolean): number {
    // Scholarship eligible users get free meals
    if (isScholarshipEligible) {
      const scholarshipBracket = ISEE_BRACKETS.find(bracket => 
        bracket.range.isEligibleForScholarship
      );
      if (scholarshipBracket) {
        const mealPrice = scholarshipBracket.prices.find(price => price.mealType === mealType);
        return mealPrice?.price || 0;
      }
    }

    // Find the appropriate ISEE bracket
    const bracket = this.findISEEBracket(isee);
    if (!bracket) return 0;

    const mealPrice = bracket.prices.find(price => price.mealType === mealType);
    return mealPrice?.price || 0;
  }

  calculateFlatTariffCost(isee: number, tariff: FlatTariff): number | null {
    // Check if user is eligible for this tariff
    if (tariff.maxISEE && isee > tariff.maxISEE) {
      return null; // Not eligible
    }
    return tariff.price;
  }

  calculateCarnetCost(isee: number, mealType: MealType, carnet: CarnetOption, totalMeals: number): number | null {
    const pricePerMeal = this.calculatePerMealPrice(isee, mealType, false);
    const totalCarnetMeals = carnet.paidMeals + carnet.freeMeals;
    
    if (totalMeals < totalCarnetMeals) {
      return null; // Not worth buying a carnet for fewer meals
    }

    const carnetsNeeded = Math.ceil(totalMeals / totalCarnetMeals);
    const totalCost = carnetsNeeded * (carnet.paidMeals * pricePerMeal);
    
    return totalCost;
  }

  private findISEEBracket(isee: number): ISEEBracket | null {
    return ISEE_BRACKETS.find(bracket => 
      !bracket.range.isEligibleForScholarship &&
      isee > bracket.range.min && 
      (bracket.range.max === null || isee <= bracket.range.max)
    ) || null;
  }
}

// Dependency Inversion Principle - depend on abstractions, not concretions
export class TariffCalculator implements ITariffCalculator {
  constructor(private priceCalculator: IPriceCalculator) {}

  calculate(input: CalculationInput): CalculationResult {
    const options: TariffOption[] = [];

    // Calculate per-meal option
    const perMealPrice = this.priceCalculator.calculatePerMealPrice(
      input.isee, 
      input.preferredMealType, 
      input.isScholarshipEligible
    );
    
    options.push({
      id: 'per-meal',
      name: 'Pay per meal',
      totalCost: perMealPrice * input.totalMeals,
      description: `€${perMealPrice.toFixed(2)} per ${input.preferredMealType} meal`,
      type: 'per-meal'
    });

    // Calculate flat tariff options
    FLAT_TARIFFS.forEach(tariff => {
      const cost = this.priceCalculator.calculateFlatTariffCost(input.isee, tariff);
      if (cost !== null) {
        const totalMealsInTariff = tariff.mealsPerDay * tariff.durationMonths * 30; // Approximate days per month
        
        // Calculate how many periods are needed and the total cost
        const periodsNeeded = Math.ceil(input.totalMeals / totalMealsInTariff);
        const totalCost = cost * periodsNeeded;
        
        // Always include flat tariffs, but adjust description for multiple periods
        const description = periodsNeeded === 1 
          ? `€${cost} for ${tariff.mealsPerDay} meals/day for ${tariff.durationMonths} months`
          : `€${cost} × ${periodsNeeded} periods (${tariff.mealsPerDay} meals/day for ${tariff.durationMonths} months each)`;
          
        options.push({
          id: tariff.id,
          name: tariff.name,
          totalCost: totalCost,
          description: description,
          type: 'flat'
        });
      }
    });

    // Calculate carnet options
    CARNET_OPTIONS.forEach((carnet, index) => {
      const cost = this.priceCalculator.calculateCarnetCost(
        input.isee, 
        input.preferredMealType, 
        carnet, 
        input.totalMeals
      );
      
      if (cost !== null) {
        options.push({
          id: `carnet-${index}`,
          name: `Carnet ${carnet.paidMeals} + ${carnet.freeMeals} free`,
          totalCost: cost,
          description: `Buy ${carnet.paidMeals} meals, get ${carnet.freeMeals} free`,
          type: 'carnet'
        });
      }
    });

    // Find the most convenient option (lowest cost)
    const recommendedOption = options.reduce((prev, current) => 
      prev.totalCost < current.totalCost ? prev : current
    );

    return {
      input,
      options: options.sort((a, b) => a.totalCost - b.totalCost),
      recommendedOption
    };
  }
}