import { 
  CalculationInput, 
  CalculationResult, 
  TariffOption, 
  ISEEBracket, 
  FlatTariff, 
  CarnetOption,
  CarnetMixItem,
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
  calculateBestCarnetMix(isee: number, mealType: MealType, totalMeals: number): { mix: CarnetMixItem[], totalCost: number } | null;
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

  calculateBestCarnetMix(isee: number, mealType: MealType, totalMeals: number): { mix: CarnetMixItem[], totalCost: number } | null {
    const pricePerMeal = this.calculatePerMealPrice(isee, mealType, false);
    
    // Calculate efficiency (meals per euro) for each carnet type
    const carnetEfficiencies = CARNET_OPTIONS.map(carnet => {
      const totalCarnetMeals = carnet.paidMeals + carnet.freeMeals;
      const carnetCost = carnet.paidMeals * pricePerMeal;
      const efficiency = totalCarnetMeals / carnetCost; // meals per euro
      
      return {
        carnet,
        efficiency,
        totalCarnetMeals,
        carnetCost
      };
    }).sort((a, b) => b.efficiency - a.efficiency); // Sort by efficiency (best first)

    // Greedy approach: use the most efficient carnets first
    let remainingMeals = totalMeals;
    const mix: CarnetMixItem[] = [];
    let totalCost = 0;

    for (const { carnet, totalCarnetMeals, carnetCost } of carnetEfficiencies) {
      if (remainingMeals <= 0) break;
      
      // Calculate how many of this carnet type we should use
      const maxUseful = Math.floor(remainingMeals / totalCarnetMeals);
      
      if (maxUseful > 0) {
        const quantity = maxUseful;
        const mealsFromThisCarnet = quantity * totalCarnetMeals;
        const costForThisCarnet = quantity * carnetCost;
        
        mix.push({
          carnet,
          quantity,
          totalMeals: mealsFromThisCarnet,
          totalCost: costForThisCarnet
        });
        
        remainingMeals -= mealsFromThisCarnet;
        totalCost += costForThisCarnet;
      }
    }

    // If there are still remaining meals, buy them at per-meal price
    if (remainingMeals > 0) {
      totalCost += remainingMeals * pricePerMeal;
    }

    return mix.length > 0 ? { mix, totalCost } : null;
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

    // Calculate flat tariff options - only show tariffs that match meals per day
    FLAT_TARIFFS.forEach(tariff => {
      const cost = this.priceCalculator.calculateFlatTariffCost(input.isee, tariff);
      
      // Only include flat tariffs that match the user's meals per day pattern
      if (cost !== null && tariff.mealsPerDay === input.mealsPerDay) {
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

    // Calculate best carnet mix option
    const carnetMixResult = this.priceCalculator.calculateBestCarnetMix(
      input.isee,
      input.preferredMealType,
      input.totalMeals
    );

    if (carnetMixResult && carnetMixResult.mix.length > 0) {
      // Create description of the mix
      const mixDescription = carnetMixResult.mix.map(item => 
        `${item.quantity}x Carnet ${item.carnet.paidMeals}+${item.carnet.freeMeals}`
      ).join(', ');
      
      const totalCarnetMeals = carnetMixResult.mix.reduce((sum, item) => sum + item.totalMeals, 0);
      const remainingMeals = input.totalMeals - totalCarnetMeals;
      
      let fullDescription = `Best mix: ${mixDescription}`;
      if (remainingMeals > 0) {
        fullDescription += ` + ${remainingMeals} individual meals`;
      }

      options.push({
        id: 'carnet-mix',
        name: 'Best Carnet Mix',
        totalCost: carnetMixResult.totalCost,
        description: fullDescription,
        type: 'carnet-mix'
      });
    }

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