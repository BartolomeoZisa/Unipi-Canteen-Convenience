import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, TrendingDown } from 'lucide-react';
import { CalculationResult, TariffOption } from '@/types';

interface ResultsDisplayProps {
  results: CalculationResult;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const { t } = useTranslation();

  // Helper function to get translated meal type name
  const getMealTypeName = (mealType: string): string => {
    // Map the meal type values to the correct translation keys
    const mealTypeMap: { [key: string]: string } = {
      'complete': t('form.mealType.complete'),
      'reducedA': t('form.mealType.reducedA'), 
      'reducedB': t('form.mealType.reducedB'),
      'reducedC': t('form.mealType.reducedC')
    };
    
    return mealTypeMap[mealType] || mealType;
  };

  // Helper function to translate tariff option names and descriptions
  const translateTariffOption = (option: TariffOption): TariffOption => {
    const translatedOption = { ...option };
    
    // Translate names based on the option type and content
    if (option.name === 'Pay per meal') {
      translatedOption.name = t('tariffOptions.payPerMeal');
    } else if (option.name.includes('Buy') && option.name.includes('meals, get')) {
      // Handle "Buy X meals, get Y free" format in names
      const buyMatch = option.name.match(/Buy (\d+) meals, get (\d+) free/);
      if (buyMatch) {
        translatedOption.name = t('carnet.buyXgetY', { buy: buyMatch[1], free: buyMatch[2] });
      }
    } else if (option.name.includes('Carnet') && option.name.includes('free')) {
      // Handle "Carnet X + Y free" format
      const match = option.name.match(/Carnet (\d+) \+ (\d+) free/);
      if (match) {
        translatedOption.name = `${t('tariffOptions.carnet' + match[1])} + ${match[2]} ${t('carnet.free')}`;
      }
    } else if (option.name === 'Best Carnet Mix') {
      translatedOption.name = t('tariffOptions.carnetMix');
    } else if (option.name.includes('Flat') && option.name.includes('ISEE')) {
      // Handle flat tariff names like "Flat 1 meal/day - 3 months (Under 75k ISEE)"
      const flatMatch = option.name.match(/Flat (\d+) meals?\/day - (\d+) months \((Under|Over) (\d+)k ISEE\)/);
      if (flatMatch) {
        const [, mealsPerDay, months, underOver, iseeThreshold] = flatMatch;
        const iseeKey = underOver.toLowerCase() === 'under' ? 'under' : 'over';
        translatedOption.name = t('tariffOptions.flatTariff', { 
          mealsPerDay, 
          months, 
          iseeThreshold,
          underOver: t(`tariffOptions.${iseeKey}`)
        });
      }
    }
    
    // Translate descriptions
    if (option.description) {
      // Handle "Buy X meals, get Y free" format
      const buyGetMatch = option.description.match(/Buy (\d+) meals, get (\d+) free/);
      if (buyGetMatch) {
        translatedOption.description = t('carnet.buyXgetY', { 
          buy: buyGetMatch[1], 
          free: buyGetMatch[2] 
        });
      }
      
      // Handle "€X per [mealType] meal" format  
      const perMealMatch = option.description.match(/€([\d.]+) per (\w+) meal/);
      if (perMealMatch) {
        const mealType = t(`form.mealType.${perMealMatch[2]}`) || perMealMatch[2];
        translatedOption.description = `€${perMealMatch[1]} ${t('carnet.perMeal', { mealType })}`;
      }
      
      // Handle "Best mix:" format
      if (option.description.includes('Best mix:')) {
        const mixPart = option.description.replace('Best mix:', '').replace('individual meals', t('carnet.individualMeals'));
        translatedOption.description = `${t('carnet.bestMix')}: ${mixPart}`;
      }
    }
    
    return translatedOption;
  };

  if (results.options.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('results.title')}</h2>
        <p className="text-gray-600">{t('results.noOptions')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('results.title')}</h2>
      
      {/* Calculation Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">{t('results.calculationBasedOn')}:</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t('results.meals')}:</span>
            <span className="font-medium">{results.input.totalMeals.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t('results.mealType')}:</span>
            <span className="font-medium text-right max-w-xs">{getMealTypeName(results.input.preferredMealType)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">ISEE:</span>
            <span className="font-medium">€{results.input.isee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t('results.scholarship')}:</span>
            <span className="font-medium">{results.input.isScholarshipEligible ? t('results.yes') : t('results.no')}</span>
          </div>
        </div>
      </div>
      
      {/* Recommended Option */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-green-800">{t('results.recommended')}</h3>
        </div>
        <div className="bg-white rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-900">{translateTariffOption(results.recommendedOption).name}</h4>
              <p className="text-sm text-gray-600">{translateTariffOption(results.recommendedOption).description}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                €{results.recommendedOption.totalCost.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                {results.recommendedOption.type}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* All Options */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          {t('results.allOptions')}
        </h3>
        <div className="space-y-3">
          {results.options.map((option) => (
            <div 
              key={option.id}
              className={`border rounded-lg p-4 transition-colors ${
                option.id === results.recommendedOption.id 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    {translateTariffOption(option).name}
                    {option.id === results.recommendedOption.id && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                        {t('results.best')}
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{translateTariffOption(option).description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className={`text-xl font-bold ${
                    option.id === results.recommendedOption.id 
                      ? 'text-green-600' 
                      : 'text-gray-900'
                  }`}>
                    €{option.totalCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {option.type}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Graph Tip */}
      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-sm text-purple-700">
          {t('results.graphAvailable')}
        </p>
      </div>

      {/* Input Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{t('results.calculationBasedOn')}:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">ISEE:</span>
            <p className="font-medium">€{results.input.isee.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-500">{t('results.meals')}:</span>
            <p className="font-medium">{results.input.totalMeals.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-gray-500">{t('results.mealType')}:</span>
            <p className="font-medium">{getMealTypeName(results.input.preferredMealType)}</p>
          </div>
          <div>
            <span className="text-gray-500">{t('results.scholarship')}:</span>
            <p className="font-medium">{results.input.isScholarshipEligible ? t('results.yes') : t('results.no')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};