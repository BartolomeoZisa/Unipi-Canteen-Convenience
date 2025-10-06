import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Globe, Info, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import { CalculationInput, MealType, CalculationResult } from '@/types';
import { TariffCalculator, PriceCalculator } from '@/services/calculationService';
import { ResultsDisplay } from './ResultsDisplay';
import { CostComparisonGraph } from './CostComparisonGraph';

// Factory pattern for creating calculator instances (Dependency Injection)
const createCalculator = () => {
  const priceCalculator = new PriceCalculator();
  return new TariffCalculator(priceCalculator);
};

export const TariffCalculatorForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState<Partial<CalculationInput>>({
    isee: undefined,
    totalMeals: undefined,
    isScholarshipEligible: false,
    preferredMealType: MealType.COMPLETE
  });
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMealInfo, setShowMealInfo] = useState<boolean>(false);
  const [showGraph, setShowGraph] = useState<boolean>(false);

  const calculator = createCalculator();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.isee) {
      newErrors.isee = t('errors.iseeRequired');
    } else if (formData.isee < 0) {
      newErrors.isee = t('errors.iseeInvalid');
    }

    if (!formData.totalMeals) {
      newErrors.totalMeals = t('errors.mealsRequired');
    } else if (formData.totalMeals <= 0) {
      newErrors.totalMeals = t('errors.mealsInvalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const input: CalculationInput = {
      isee: formData.isee!,
      totalMeals: formData.totalMeals!,
      isScholarshipEligible: formData.isScholarshipEligible || false,
      preferredMealType: formData.preferredMealType || MealType.COMPLETE
    };

    const result = calculator.calculate(input);
    setResults(result);
  };

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with language selector */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="w-8 h-8" />
              {t('app.title')}
            </h1>
            <p className="text-gray-600 mt-2">{t('app.subtitle')}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-600" />
            <select 
              value={i18n.language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="en">English</option>
              <option value="it">Italiano</option>
            </select>
          </div>
        </div>

        {/* Meal Types Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <button
            type="button"
            onClick={() => setShowMealInfo(!showMealInfo)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">{t('mealInfo.title')}</h3>
            </div>
            {showMealInfo ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          {showMealInfo && (
            <div className="mt-4 space-y-4">
              <div className="grid gap-4">
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <h4 className="font-semibold text-green-800 mb-2">{t('form.mealType.complete')}</h4>
                  <p className="text-sm text-green-700">{t('form.mealType.descriptions.complete')}</p>
                </div>
                
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <h4 className="font-semibold text-blue-800 mb-2">{t('form.mealType.reducedA')}</h4>
                  <p className="text-sm text-blue-700">{t('form.mealType.descriptions.reducedA')}</p>
                </div>
                
                <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                  <h4 className="font-semibold text-purple-800 mb-2">{t('form.mealType.reducedB')}</h4>
                  <p className="text-sm text-purple-700">{t('form.mealType.descriptions.reducedB')}</p>
                </div>
                
                <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <h4 className="font-semibold text-orange-800 mb-2">{t('form.mealType.reducedC')}</h4>
                  <p className="text-sm text-orange-700">{t('form.mealType.descriptions.reducedC')}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Calculator Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* ISEE Input */}
              <div>
                <label htmlFor="isee" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.isee.label')}
                </label>
                <input
                  type="number"
                  id="isee"
                  min="0"
                  step="0.01"
                  value={formData.isee || ''}
                  onChange={(e) => setFormData({ ...formData, isee: parseFloat(e.target.value) || undefined })}
                  placeholder={t('form.isee.placeholder')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.isee ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.isee && <p className="text-red-500 text-sm mt-1">{errors.isee}</p>}
              </div>

              {/* Meals Input */}
              <div>
                <label htmlFor="meals" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('form.meals.label')}
                </label>
                <input
                  type="number"
                  id="meals"
                  min="1"
                  value={formData.totalMeals || ''}
                  onChange={(e) => setFormData({ ...formData, totalMeals: parseInt(e.target.value) || undefined })}
                  placeholder={t('form.meals.placeholder')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.totalMeals ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.totalMeals && <p className="text-red-500 text-sm mt-1">{errors.totalMeals}</p>}
              </div>
            </div>

            {/* Meal Type Selection */}
            <div>
              <label htmlFor="mealType" className="block text-sm font-medium text-gray-700 mb-2">
                {t('form.mealType.label')}
              </label>
              <select
                id="mealType"
                value={formData.preferredMealType}
                onChange={(e) => setFormData({ ...formData, preferredMealType: e.target.value as MealType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={MealType.COMPLETE}>{t('form.mealType.complete')}</option>
                <option value={MealType.REDUCED_A}>{t('form.mealType.reducedA')}</option>
                <option value={MealType.REDUCED_B}>{t('form.mealType.reducedB')}</option>
                <option value={MealType.REDUCED_C}>{t('form.mealType.reducedC')}</option>
              </select>
              
              {/* Meal Description */}
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>What's included:</strong> {t(`form.mealType.descriptions.${formData.preferredMealType || 'complete'}`)}
                </p>
              </div>
            </div>

            {/* Scholarship Eligibility */}
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="scholarship"
                  checked={formData.isScholarshipEligible || false}
                  onChange={(e) => setFormData({ ...formData, isScholarshipEligible: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="scholarship" className="ml-2 block text-sm text-gray-900">
                  {t('form.scholarship.label')}
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-1">{t('form.scholarship.help')}</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
            >
              {t('form.calculate')}
            </button>
          </form>
        </div>

        {/* Graph Toggle Button - Available after ISEE and meal type are set */}
        {formData.isee && formData.preferredMealType && (
          <div className="text-center mb-6">
            <button
              type="button"
              onClick={() => setShowGraph(!showGraph)}
              className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200"
            >
              <BarChart3 className="w-5 h-5" />
              {showGraph ? t('graph.hideGraph') : t('graph.showGraph')}
            </button>
          </div>
        )}

        {/* Cost Comparison Graph - Independent from results */}
        {showGraph && formData.isee && formData.preferredMealType && (
          <CostComparisonGraph
            baseInput={{
              isee: formData.isee,
              isScholarshipEligible: formData.isScholarshipEligible || false,
              preferredMealType: formData.preferredMealType
            }}
            maxMeals={300}
            stepSize={5}
          />
        )}

        {/* Results Display */}
        {results && <ResultsDisplay results={results} />}
      </div>
    </div>
  );
};