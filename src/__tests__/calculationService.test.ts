import { TariffCalculator, PriceCalculator } from '../services/calculationService';
import { CalculationInput, MealType } from '../types';

describe('TariffCalculator', () => {
  let calculator: TariffCalculator;
  let priceCalculator: PriceCalculator;

  beforeEach(() => {
    priceCalculator = new PriceCalculator();
    calculator = new TariffCalculator(priceCalculator);
  });

  describe('PriceCalculator', () => {
    it('should calculate correct price for low ISEE complete meal', () => {
      const price = priceCalculator.calculatePerMealPrice(25000, MealType.COMPLETE, false);
      expect(price).toBe(2.80);
    });

    it('should return 0 for scholarship eligible users', () => {
      const price = priceCalculator.calculatePerMealPrice(25000, MealType.COMPLETE, true);
      expect(price).toBe(0);
    });

    it('should calculate correct price for high ISEE reduced meal', () => {
      const price = priceCalculator.calculatePerMealPrice(120000, MealType.REDUCED_A, false);
      expect(price).toBe(5.40);
    });
  });

  describe('TariffCalculator Integration', () => {
    it('should recommend cheapest option for low ISEE user', () => {
      const input: CalculationInput = {
        isee: 25000,
        mealsPerDay: 2,
        totalMeals: 60,
        isScholarshipEligible: false,
        preferredMealType: MealType.COMPLETE
      };

      const result = calculator.calculate(input);
      
      expect(result.options.length).toBeGreaterThan(0);
      expect(result.recommendedOption).toBeDefined();
      expect(result.recommendedOption.totalCost).toBe(Math.min(...result.options.map(o => o.totalCost)));
    });

    it('should return free meals for scholarship eligible users', () => {
      const input: CalculationInput = {
        isee: 25000,
        mealsPerDay: 1,
        totalMeals: 30,
        isScholarshipEligible: true,
        preferredMealType: MealType.COMPLETE
      };

      const result = calculator.calculate(input);
      const perMealOption = result.options.find(o => o.type === 'per-meal');
      
      expect(perMealOption?.totalCost).toBe(0);
    });

    it('should include flat tariffs for eligible users', () => {
      const input: CalculationInput = {
        isee: 50000, // Under 75k, eligible for flat tariffs
        mealsPerDay: 1,
        totalMeals: 90, // 1 meal per day for 3 months
        isScholarshipEligible: false,
        preferredMealType: MealType.COMPLETE
      };

      const result = calculator.calculate(input);
      const flatOptions = result.options.filter(o => o.type === 'flat');
      
      expect(flatOptions.length).toBeGreaterThan(0);
      // Should only show under-75k tariffs
      flatOptions.forEach(option => {
        expect(option.name).toContain('Under 75k');
      });
    });

    it('should only show appropriate flat tariffs based on ISEE level', () => {
      // Test user over 75k ISEE
      const highISEEInput: CalculationInput = {
        isee: 90000, // Over 75k
        mealsPerDay: 1,
        totalMeals: 90,
        isScholarshipEligible: false,
        preferredMealType: MealType.COMPLETE
      };

      const highISEEResult = calculator.calculate(highISEEInput);
      const highISEEFlatOptions = highISEEResult.options.filter(o => o.type === 'flat');
      
      // Should only show over-75k tariffs
      highISEEFlatOptions.forEach(option => {
        expect(option.name).toContain('Over 75k');
      });

      // Test user under 75k ISEE
      const lowISEEInput: CalculationInput = {
        isee: 60000, // Under 75k
        mealsPerDay: 1,
        totalMeals: 90,
        isScholarshipEligible: false,
        preferredMealType: MealType.COMPLETE
      };

      const lowISEEResult = calculator.calculate(lowISEEInput);
      const lowISEEFlatOptions = lowISEEResult.options.filter(o => o.type === 'flat');
      
      // Should only show under-75k tariffs
      lowISEEFlatOptions.forEach(option => {
        expect(option.name).toContain('Under 75k');
      });
    });
  });
});